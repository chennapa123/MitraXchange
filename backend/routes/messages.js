const express = require('express');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/messages/:userId — get conversation with a user
router.get('/:userId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: req.params.userId },
        { senderId: req.params.userId, receiverId: req.user._id },
      ],
    })
      .populate('senderId', 'name profileImage')
      .populate('receiverId', 'name profileImage')
      .sort({ createdAt: 1 });

    // Mark as read
    await Message.updateMany(
      { senderId: req.params.userId, receiverId: req.user._id, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/messages — get all conversations
router.get('/', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
    })
      .populate('senderId', 'name profileImage')
      .populate('receiverId', 'name profileImage')
      .sort({ createdAt: -1 });

    // Get unique conversations
    const conversationMap = new Map();
    messages.forEach((msg) => {
      const otherId =
        msg.senderId._id.toString() === req.user._id.toString()
          ? msg.receiverId._id.toString()
          : msg.senderId._id.toString();
      if (!conversationMap.has(otherId)) {
        conversationMap.set(otherId, {
          user:
            msg.senderId._id.toString() === req.user._id.toString()
              ? msg.receiverId
              : msg.senderId,
          lastMessage: msg,
        });
      }
    });

    res.json(Array.from(conversationMap.values()));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/messages — send message
router.post('/', protect, async (req, res) => {
  try {
    const { receiverId, message, requestId } = req.body;
    const newMessage = await Message.create({
      senderId: req.user._id,
      receiverId,
      message,
      requestId,
    });
    const populated = await newMessage.populate([
      { path: 'senderId', select: 'name profileImage' },
      { path: 'receiverId', select: 'name profileImage' },
    ]);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
