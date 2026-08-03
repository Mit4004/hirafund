const Expense = require('../models/Expense');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private/Admin
const createExpense = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { restaurantName, description, totalBill, members } = req.body;

    // Validate members amount sum
    const totalConsumed = members.reduce((acc, curr) => acc + Number(curr.amount), 0);
    if (Math.abs(totalConsumed - Number(totalBill)) > 0.01) {
      return res.status(400).json({ message: 'The entered amounts do not match the total bill.' });
    }

    const expense = await Expense.create([{
      restaurantName,
      description,
      totalBill,
      members,
      createdBy: req.user._id,
    }], { session });

    const expenseId = expense[0]._id;

    // Process deductions
    for (const member of members) {
      const user = await User.findById(member.userId).session(session);
      if (!user) {
        throw new Error(`User with ID ${member.userId} not found`);
      }

      const amount = Number(member.amount);
      if (!amount || amount <= 0) {
        throw new Error(`Invalid amount for user ${user.name}`);
      }

      const balanceBefore = user.balance;
      const balanceAfter = Math.round((balanceBefore - amount) * 100) / 100;

      user.balance = balanceAfter;
      user.totalSpent = Math.round((user.totalSpent + amount) * 100) / 100;
      await user.save({ session });

      await Transaction.create([{
        userId: user._id,
        type: 'Deduction',
        amount,
        reason: description || 'Expense Deduction',
        balanceBefore,
        balanceAfter,
        expenseId,
        restaurantName,
        createdBy: req.user._id,
      }], { session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: 'Expense Added Successfully', expense: expense[0] });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message || 'Server error' });
  }
};

module.exports = { createExpense };
