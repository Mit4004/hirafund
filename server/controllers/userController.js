const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Expense = require('../models/Expense');
const bcrypt = require('bcrypt');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add a new user (friend)
// @route   POST /api/users
// @access  Private/Admin
const addUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: 'user',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user details
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.status = req.body.status || user.status;
      if (req.body.password) {
        user.password = req.body.password;
      }
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        status: updatedUser.status,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      // Avoid deleting user if they have active balance? Let's just delete for now as per requirements
      await User.deleteOne({ _id: user._id });
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get Admin Dashboard Stats
// @route   GET /api/users/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const friends = await User.find({ role: 'user' });
    const totalFriends = friends.length;
    const totalMoneyAvailable = friends.reduce((acc, user) => acc + user.balance, 0);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Use Deduction transactions as source of truth so deleted transactions
    // are automatically excluded (Expense documents may still exist even after
    // their transactions are deleted/reversed).
    const expensesToday = await Transaction.aggregate([
      { $match: { type: 'Deduction', createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const todayExpense = expensesToday.length > 0 ? expensesToday[0].total : 0;

    const expensesMonth = await Transaction.aggregate([
      { $match: { type: 'Deduction', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthExpense = expensesMonth.length > 0 ? expensesMonth[0].total : 0;

    const highestBalanceFriend = friends.length > 0 ? friends.reduce((prev, current) => (prev.balance > current.balance) ? prev : current) : null;
    const lowestBalanceFriend = friends.length > 0 ? friends.reduce((prev, current) => (prev.balance < current.balance) ? prev : current) : null;

    const recentTransactions = await Transaction.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'name');

    const walletDistribution = friends.map(f => ({ name: f.name, balance: f.balance }));

    // Monthly expense graph — also from Deduction transactions
    const monthlyGraph = await Transaction.aggregate([
      { $match: { type: 'Deduction' } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalFriends,
      totalMoneyAvailable,
      todayExpense,
      monthExpense,
      highestBalanceFriend: highestBalanceFriend ? { name: highestBalanceFriend.name, balance: highestBalanceFriend.balance } : null,
      lowestBalanceFriend: lowestBalanceFriend ? { name: lowestBalanceFriend.name, balance: lowestBalanceFriend.balance } : null,
      recentTransactions,
      walletDistribution,
      monthlyGraph
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getUsers, addUser, updateUser, deleteUser, getDashboardStats };
