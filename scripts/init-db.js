const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dream-task-agent";

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if demo user already exists
    const existingUser = await User.findOne({ email: 'demo@example.com' });
    if (existingUser) {
      console.log('✅ Demo user already exists');
      return;
    }

    // Create demo user
    const passwordHash = await bcrypt.hash('demo123', 12);
    const demoUser = new User({
      email: 'demo@example.com',
      name: 'Demo User',
      passwordHash: passwordHash,
    });

    await demoUser.save();
    console.log('✅ Demo user created successfully');
    console.log('📧 Email: demo@example.com');
    console.log('🔑 Password: demo123');

  } catch (error) {
    console.error('❌ Database initialization error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run initialization
initializeDatabase();
