const express = require('express');
const User = require('../models/User');
const Item = require('../models/Item');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/:id — public profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const items = await Item.find({ ownerId: req.params.id, availabilityStatus: 'available' });
    res.json({ user, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/users/profile — update profile
router.put('/profile/update', protect, async (req, res) => {
  try {
    const { name, location, bio } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (location) user.location = location;
    if (bio) user.bio = bio;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
