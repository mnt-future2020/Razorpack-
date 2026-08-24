// One-off bootstrap script: creates the initial admin account.
//
// createInitialAdmin() is deliberately never called on DB connect (see the
// comment in config/utils/admin/login/loginSchema.js) so a deleted admin is
// never silently recreated. This script is the intended way to invoke it.
//
//   npm run seed:admin
//
// Reads INITIAL_ADMIN_EMAIL / INITIAL_ADMIN_PASSWORD (and the optional
// INITIAL_ADMIN_FIRST_NAME / INITIAL_ADMIN_LAST_NAME) from .env.local.
// Re-running is safe: an existing admin with that email is left untouched.

import mongoose from 'mongoose';
import connectDB from '../config/models/connectDB.js';
import Admin from '../config/utils/admin/login/loginSchema.js';

try {
  await connectDB();
  const admin = await Admin.createInitialAdmin();
  console.log('---');
  console.log('email :', admin.email);
  console.log('name  :', admin.firstName, admin.lastName);
  console.log('role  :', admin.role);
  console.log('active:', admin.isActive);
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.connection.close();
}
