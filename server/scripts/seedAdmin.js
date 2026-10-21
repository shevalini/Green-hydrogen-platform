/**
 * @file seedAdmin.js
 * @description One-time script to create the initial ADMIN user.
 * Reads credentials from environment variables (INIT_ADMIN_EMAIL, INIT_ADMIN_PASSWORD, INIT_ADMIN_NAME).
 * Safe to re-run: exits without modification if admin already exists.
 *
 * Usage:
 *   node scripts/seedAdmin.js
 *
 * Required env vars (in .env or set in shell):
 *   MONGO_URI, INIT_ADMIN_EMAIL, INIT_ADMIN_PASSWORD, INIT_ADMIN_NAME
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function seedAdmin() {
  const { MONGO_URI, INIT_ADMIN_EMAIL, INIT_ADMIN_PASSWORD, INIT_ADMIN_NAME } = process.env;

  if (!MONGO_URI || MONGO_URI.includes('YOUR_')) {
    console.error('ERROR: MONGO_URI is not configured in .env');
    process.exit(1);
  }
  if (!INIT_ADMIN_EMAIL || !INIT_ADMIN_PASSWORD || !INIT_ADMIN_NAME) {
    console.error('ERROR: INIT_ADMIN_EMAIL, INIT_ADMIN_PASSWORD, and INIT_ADMIN_NAME must be set in .env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('Connected.');

  const existing = await User.findOne({ email: INIT_ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    console.log(`Admin user already exists: ${existing.email} (role: ${existing.role})`);
    console.log('No changes made. Delete the user from Atlas first if you want to recreate it.');
    await mongoose.disconnect();
    return;
  }

  const admin = new User({
    name: INIT_ADMIN_NAME,
    email: INIT_ADMIN_EMAIL,
    role: 'ADMIN',
    isActive: true,
  });
  admin.password = INIT_ADMIN_PASSWORD; // virtual setter hashes via bcrypt

  await admin.save();
  console.log('SUCCESS: Admin user created.');
  console.log('  Email :', admin.email);
  console.log('  Role  :', admin.role);
  console.log('  IMPORTANT: Change INIT_ADMIN_PASSWORD in .env after first login!');

  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
