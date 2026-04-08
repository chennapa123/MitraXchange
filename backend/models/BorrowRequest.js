const mongoose = require('mongoose');

const borrowRequestSchema = new mongoose.Schema(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'returned'],
      default: 'pending',
    },
    requestDate: { type: Date, default: Date.now },
    returnDate: { type: Date },
    message: { type: String, default: '' },
    expectedReturnDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BorrowRequest', borrowRequestSchema);
