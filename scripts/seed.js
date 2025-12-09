// Seed script to create demo user and fetch TMDB data
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  profiles: [{
    name: String,
    avatarUrl: String,
    preferences: Object
  }],
  createdAt: { type: Date, default: Date.now },
  isAdmin: { type: Boolean, default: false }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    // Create demo user
    const demoEmail = 'demo@rusilstream.com';
    const existingUser = await User.findOne({ email: demoEmail });

    if (existingUser) {
      console.log('Demo user already exists');
    } else {
      const passwordHash = await bcrypt.hash('password123', 10);
      const user = await User.create({
        email: demoEmail,
        passwordHash,
        profiles: [
          {
            name: 'Demo User',
            avatarUrl: '',
            preferences: {}
          },
          {
            name: 'Kids',
            avatarUrl: '',
            preferences: { kidsMode: true }
          }
        ]
      });
      console.log('Demo user created:', user.email);
      console.log('Login with: demo@rusilstream.com / password123');
    }

    console.log('\nSeed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
