// Seeds the initial super admin from env vars. Run: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

(async () => {
  await connectDB();
  const email = (process.env.SUPER_ADMIN_EMAIL || 'admin@nayepankh.com').toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Super admin already exists:', email);
    process.exit(0);
  }
  await User.create({
    name: 'NayePankh Super Admin',
    email,
    password: process.env.SUPER_ADMIN_PASSWORD || 'ChangeMe123!',
    role: 'super_admin',
    isEmailVerified: true,
    isActive: true,
  });
  console.log('Super admin created:', email);
  console.log('Password:', process.env.SUPER_ADMIN_PASSWORD || 'ChangeMe123!');
  await mongoose.disconnect();
  process.exit(0);
})();
