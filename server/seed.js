const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(uri);

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@hirafund.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      adminExists.password = adminPassword;
      await adminExists.save();
      console.log(`Admin user (${adminEmail}) password updated to: ${adminPassword}`);
      process.exit();
    }

    await User.create({
      name: 'Admin',
      email: adminEmail,
      phone: '1234567890',
      password: adminPassword, // Will be hashed by pre-save hook
      role: 'admin',
    });

    console.log(`Admin user created: ${adminEmail} / ${adminPassword}`);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
