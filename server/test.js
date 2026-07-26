const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

dotenv.config();

const testBug = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(uri);
    
    // find admin
    const admin = await User.findOne({ role: 'admin' });
    
    // find another user
    const user = await User.findOne({ role: 'user' });
    if (!user) {
      console.log('No user found to test on');
      process.exit();
    }

    const amount = 500;
    const reason = 'bas';
    
    const balanceBefore = user.balance;
    const balanceAfter = balanceBefore + amount;

    user.balance = balanceAfter;
    user.totalDeposited += amount;
    
    console.log('Saving user...');
    await user.save();
    console.log('User saved successfully');

    console.log('Creating transaction...');
    const transaction = await Transaction.create({
      userId: user._id,
      type: 'Deposit',
      amount,
      reason,
      balanceBefore,
      balanceAfter,
      createdBy: admin._id,
    });
    console.log('Transaction created successfully');
    
    process.exit();
  } catch (error) {
    console.error('Test Bug Error:', error);
    process.exit(1);
  }
};

testBug();
