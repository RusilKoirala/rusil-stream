// Reset email verification for a specific user
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

async function resetVerification() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const email = 'rusilkoirala21@gmail.com';

    // Find the user
    const user = await usersCollection.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    console.log(`\nFound user: ${user.email}`);
    console.log(`Current emailVerified status: ${user.emailVerified}`);

    // Reset verification status
    const result = await usersCollection.updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          emailVerified: false,
          verificationToken: null,
          verificationTokenExpiry: null
        }
      }
    );

    console.log(`\n✅ Reset verification for ${email}`);
    console.log(`Modified ${result.modifiedCount} document(s)`);
    console.log('\nYou can now sign up again with this email to test verification.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetVerification();
