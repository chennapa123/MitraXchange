const express = require('express');
const multer = require('multer');
const path = require('path');
const Item = require('../models/Item');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, `item-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

// Haversine distance formula - calculates distance in km
function getDistance(lat1, lng1, lat2, lng2) {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// GET /api/items — browse all available items
router.get('/', async (req, res) => {
  try {
    const { category, search, status, lat, lng, radius } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (status) filter.availabilityStatus = status;
    else filter.availabilityStatus = 'available';
    if (search) filter.title = { $regex: search, $options: 'i' };

    let items = await Item.find(filter)
      .populate('ownerId', 'name email location profileImage')
      .sort({ createdAt: -1 });

    // Apply location-based filtering if coordinates provided
    if (lat && lng && radius) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const searchRadius = parseFloat(radius);

      items = items.filter(item => {
        const itemLat = item.lat || 20;
        const itemLng = item.lng || 78;
        const distance = getDistance(userLat, userLng, itemLat, itemLng);
        item.distance = distance;
        return distance <= searchRadius;
      });

      // Sort by distance
      items.sort((a, b) => a.distance - b.distance);
    }

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/items/my — my listed items
router.get('/my', protect, async (req, res) => {
  try {
    const items = await Item.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      'ownerId',
      'name email location profileImage bio rating'
    );
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/items — create item
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, condition, lat, lng } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description and category are required' });
    }
    const item = await Item.create({
      title,
      description,
      category,
      condition,
      lat: lat ? parseFloat(lat) : 20,
      lng: lng ? parseFloat(lng) : 78,
      ownerId: req.user._id,
      image: req.file ? `/uploads/${req.file.filename}` : '',
    });
    const populated = await item.populate('ownerId', 'name email location');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/items/:id — update item
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const { title, description, category, condition, lat, lng, availabilityStatus } = req.body;
    if (title) item.title = title;
    if (description) item.description = description;
    if (category) item.category = category;
    if (condition) item.condition = condition;
    if (lat) item.lat = parseFloat(lat);
    if (lng) item.lng = parseFloat(lng);
    if (availabilityStatus) item.availabilityStatus = availabilityStatus;
    if (req.file) item.image = `/uploads/${req.file.filename}`;
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/items/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await item.deleteOne();
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
