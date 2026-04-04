/**
 * Database Seeder
 * Creates initial admin user and test data
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { User, Account } = require('./models');
const { generateAccountNumber } = require('./utils/helpers');

const seedAdmin = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@onlinebanking.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user (password is hashed automatically by User model pre-save hook)
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@onlinebanking.com',
      password: 'Admin@123',
      role: 'admin',
      isActive: true
    });

    console.log('✅ Admin user created:');
    console.log('   Email: admin@onlinebanking.com');
    console.log('   Password: Admin@123');

    // Create test user (password is hashed automatically by User model pre-save hook)
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test@123',
      role: 'user',
      isActive: true
    });

    // Create account for test user
    const accountNumber = await generateAccountNumber();
    await Account.create({
      userId: testUser._id,
      accountNumber,
      accountType: 'savings',
      balance: 10000, // Starting balance
      status: 'active'
    });

    console.log('✅ Test user created:');
    console.log('   Email: test@example.com');
    console.log('   Password: Test@123');
    console.log('   Account Number:', accountNumber);
    console.log('   Balance: 10,000');

    // Create second test user for transfers (password is hashed automatically)
    const testUser2 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Test@123',
      role: 'user',
      isActive: true
    });

    const accountNumber2 = await generateAccountNumber();
    await Account.create({
      userId: testUser2._id,
      accountNumber: accountNumber2,
      accountType: 'savings',
      balance: 5000,
      status: 'active'
    });

    console.log('✅ Second test user created:');
    console.log('   Email: john@example.com');
    console.log('   Password: Test@123');
    console.log('   Account Number:', accountNumber2);
    console.log('   Balance: 5,000');

    console.log('\n✅ Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

// Run seeder
seedAdmin();
