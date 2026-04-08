const express = require('express');
const BorrowRequest = require('../models/BorrowRequest');
const Item = require('../models/Item');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/requests — send borrow request
router.post('/', protect, async (req, res) => {
  try {
    const { itemId, message, expectedReturnDate } = req.body;
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.ownerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot borrow your own item' });
    }
    if (item.availabilityStatus !== 'available') {
      return res.status(400).json({ message: 'Item is not available for borrowing' });
    }
    const existing = await BorrowRequest.findOne({
      itemId,
      borrowerId: req.user._id,
      status: 'pending',
    });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending request for this item' });
    }
    const request = await BorrowRequest.create({
      itemId,
      borrowerId: req.user._id,
      ownerId: item.ownerId,
      message,
      expectedReturnDate,
    });
    const populated = await request.populate([
      { path: 'itemId', select: 'title image category' },
      { path: 'borrowerId', select: 'name email location' },
      { path: 'ownerId', select: 'name email' },
    ]);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/requests/received — requests received by owner
router.get('/received', protect, async (req, res) => {
  try {
    const requests = await BorrowRequest.find({ ownerId: req.user._id })
      .populate('itemId', 'title image category availabilityStatus')
      .populate('borrowerId', 'name email location profileImage')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/requests/sent — requests sent by borrower
router.get('/sent', protect, async (req, res) => {
  try {
    const requests = await BorrowRequest.find({ borrowerId: req.user._id })
      .populate('itemId', 'title image category')
      .populate('ownerId', 'name email location profileImage')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/requests/:id/status — approve/reject/return
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await BorrowRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Only owner can approve/reject; owner marks as returned
    if (
      request.ownerId.toString() !== req.user._id.toString() &&
      request.borrowerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = status;
    if (status === 'returned') {
      request.returnDate = new Date();
      await Item.findByIdAndUpdate(request.itemId, { availabilityStatus: 'available' });
    } else if (status === 'approved') {
      await Item.findByIdAndUpdate(request.itemId, { availabilityStatus: 'borrowed' });
      // Reject other pending requests for same item
      await BorrowRequest.updateMany(
        { itemId: request.itemId, status: 'pending', _id: { $ne: request._id } },
        { status: 'rejected' }
      );
    } else if (status === 'rejected') {
      // If was approved and now rejected, free the item
      if (request.status === 'approved') {
        await Item.findByIdAndUpdate(request.itemId, { availabilityStatus: 'available' });
      }
    }
    await request.save();
    const populated = await request.populate([
      { path: 'itemId', select: 'title image category availabilityStatus' },
      { path: 'borrowerId', select: 'name email' },
      { path: 'ownerId', select: 'name email' },
    ]);
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
