const Transaction = require('../models/Transaction');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Add money to friend's wallet
// @route   POST /api/transactions/add-money
// @access  Private/Admin
const addMoney = async (req, res) => {
  try {
    const { userId, reason } = req.body;
    const amount = Number(req.body.amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Friend Not Found' });
    }

    const balanceBefore = user.balance;
    const balanceAfter = Math.round((balanceBefore + amount) * 100) / 100;

    user.balance = balanceAfter;
    user.totalDeposited = Math.round((user.totalDeposited + amount) * 100) / 100;
    await user.save();

    const transaction = await Transaction.create({
      userId: user._id,
      type: 'Deposit',
      amount,
      reason,
      balanceBefore,
      balanceAfter,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: 'Money Added Successfully', transaction });
  } catch (error) {
    console.error('addMoney Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private/Admin
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('userId', 'name').sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get my transactions
// @route   GET /api/transactions/my
// @access  Private
const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Bulk add money to multiple wallets
// @route   POST /api/transactions/bulk-add-money
// @access  Private/Admin
const bulkAddMoney = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { deposits, reason } = req.body;

    if (!deposits || deposits.length === 0) {
      return res.status(400).json({ message: 'No deposits provided' });
    }

    for (const deposit of deposits) {
      const { userId } = deposit;
      const amount = Number(deposit.amount);

      if (!amount || amount <= 0) {
        throw new Error(`Invalid amount for user ID ${userId}`);
      }

      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      const balanceBefore = user.balance;
      const balanceAfter = Math.round((balanceBefore + amount) * 100) / 100;

      user.balance = balanceAfter;
      user.totalDeposited = Math.round((user.totalDeposited + amount) * 100) / 100;
      await user.save({ session });

      await Transaction.create([{
        userId: user._id,
        type: 'Deposit',
        amount,
        reason: reason || 'Bulk Deposit',
        balanceBefore,
        balanceAfter,
        createdBy: req.user._id,
      }], { session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: 'Bulk Money Added Successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('bulkAddMoney Error:', error);
    res.status(400).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete a transaction and reverse its balance effect
// @route   DELETE /api/transactions/:id
// @access  Private/Admin
const deleteTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transaction = await Transaction.findById(req.params.id).session(session);
    if (!transaction) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const user = await User.findById(transaction.userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'User not found' });
    }

    // Reverse the balance effect
    if (transaction.type === 'Deposit') {
      user.balance = Math.round((user.balance - transaction.amount) * 100) / 100;
      user.totalDeposited = Math.max(0, Math.round((user.totalDeposited - transaction.amount) * 100) / 100);
    } else if (transaction.type === 'Deduction') {
      user.balance = Math.round((user.balance + transaction.amount) * 100) / 100;
      user.totalSpent = Math.max(0, Math.round((user.totalSpent - transaction.amount) * 100) / 100);
    }

    await user.save({ session });
    await Transaction.findByIdAndDelete(req.params.id).session(session);

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Transaction deleted and balance reversed successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('deleteTransaction Error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = { addMoney, bulkAddMoney, getAllTransactions, getMyTransactions, deleteTransaction };
