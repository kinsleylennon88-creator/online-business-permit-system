const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.argv[2] || process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/janiuay';
const sanitized = uri.replace(/\/\/.*@/, '//<credentials>@');

console.log(`\n🔍 Testing connection to MongoDB: ${sanitized} ...`);

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000
})
.then(async () => {
  console.log('✅ Connection SUCCESSFUL!');
  console.log(`📊 Database Name: ${mongoose.connection.name}`);
  console.log(`🌐 Host: ${mongoose.connection.host}`);
  console.log(`🔌 ReadyState: Connected (${mongoose.connection.readyState})`);
  
  const User = require('./models/User');
  const userCount = await User.countDocuments();
  console.log(`👥 Existing Users in Database: ${userCount}`);
  
  await mongoose.disconnect();
  console.log('🏁 Test completed successfully.\n');
  process.exit(0);
})
.catch(err => {
  console.error('\n❌ Connection FAILED!');
  console.error(`Error: ${err.message}`);
  console.log('\n💡 Tips:');
  console.log('1. If connecting to MongoDB Atlas (Cloud):');
  console.log('   - Make sure your IP is whitelisted (0.0.0.0/0) in MongoDB Atlas -> Network Access.');
  console.log('   - Verify your database username and password in the connection string.');
  console.log('2. If connecting to Local MongoDB:');
  console.log('   - Ensure MongoDB Windows Service is running (or launch MongoDB Compass).\n');
  process.exit(1);
});
