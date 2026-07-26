const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  }
}, { _id: false });

const expenseSchema = new mongoose.Schema(
  {
    restaurantName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    totalBill: {
      type: Number,
      required: true,
    },
    members: [memberSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
