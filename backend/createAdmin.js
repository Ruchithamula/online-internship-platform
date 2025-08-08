const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/onlyinternship', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Username: admin');
      console.log('Password: admin123');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      password: hashedPassword,
      email: 'admin@onlyinternship.in',
      name: 'Administrator',
      role: 'admin',
      profileComplete: true
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Email: admin@onlyinternship.in');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
}

createAdminUser(); 