const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'KerzieCandelon@gmail.com' });
    
    if (existingUser) {
      // Update to admin if exists
      existingUser.role = 'admin';
      await existingUser.save();
      console.log('✅ User already exists, promoted to admin!');
      console.log(`Name: ${existingUser.firstName} ${existingUser.lastName}`);
      console.log(`Email: ${existingUser.email}`);
      console.log(`Role: ${existingUser.role}`);
    } else {
      // Create new admin user
      const user = await User.create({
        firstName: 'Kerzie',
        lastName: 'Candelon',
        email: 'KerzieCandelon@gmail.com',
        password: 'admin123',
        phone: '09123456789',
        role: 'admin',
        address: {
          street: 'Municipal Hall',
          barangay: 'Poblacion',
          municipality: 'Janiuay',
          province: 'Iloilo'
        }
      });

      console.log('✅ Admin user created successfully!');
      console.log(`Name: ${user.firstName} ${user.lastName}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Password: admin123`);
    }

    console.log('\n🎉 You can now log in at: http://localhost:5000/login.html');
    console.log('   Email: KerzieCandelon@gmail.com');
    console.log('   Password: admin123');
    console.log('\n🚀 Access admin dashboard at: http://localhost:5000/admin-demo.html');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

createAdminUser();
