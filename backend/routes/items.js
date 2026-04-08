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

// GET /api/items — browse all available items
router.get('/', async (req, res) => {
  try {
    const { category, search, status } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (status) filter.availabilityStatus = status;
    else filter.availabilityStatus = 'available';
    if (search) filter.title = { $regex: search, $options: 'i' };

    const items = await Item.find(filter)
      .populate('ownerId', 'name email location profileImage')
      .sort({ createdAt: -1 });
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
    const { title, description, category, condition, location } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description and category are required' });
    }
    const item = await Item.create({
      title,
      description,
      category,
      condition,
      location: location || req.user.location,
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
    const { title, description, category, condition, location, availabilityStatus } = req.body;
    if (title) item.title = title;
    if (description) item.description = description;
    if (category) item.category = category;
    if (condition) item.condition = condition;
    if (location) item.location = location;
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
