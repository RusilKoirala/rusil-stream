// User model with profiles
import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  avatarUrl: { type: String, default: '' },
  preferences: { type: Object, default: {} }
}, { _id: true });

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  profiles: { type: [ProfileSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  isAdmin: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpiry: { type: Date }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
