const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Make user admin by email
async function makeAdmin(email) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find and update user
    const user = await User.findOneAndUpdate(
      { email: email },
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      console.log(`User with email ${email} not found`);
      process.exit(1);
    }

    console.log(`✅ ${user.firstName} ${user.lastName} is now an admin!`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

// Get email from command line
const email = process.argv[2];

if (!email) {
  console.log('Usage: node make-admin.js <email>');
  console.log('Example: node make-admin.js user@example.com');
  process.exit(1);
}

makeAdmin(email);
