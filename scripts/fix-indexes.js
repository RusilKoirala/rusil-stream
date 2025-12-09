// Fix MongoDB indexes - drop old username index
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

async function fixIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Get all indexes
    const indexes = await usersCollection.indexes();
    console.log('\nCurrent indexes:', indexes.map(i => i.name));

    // Drop the old username index if it exists
    try {
      await usersCollection.dropIndex('username_1');
      console.log('✓ Dropped old username_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('✓ username_1 index does not exist (already removed)');
      } else {
        throw error;
      }
    }

    // Ensure email index exists
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    console.log('✓ Email index ensured');

    // Show final indexes
    const finalIndexes = await usersCollection.indexes();
    console.log('\nFinal indexes:', finalIndexes.map(i => i.name));

    console.log('\n✅ Index fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
    process.exit(1);
  }
}

fixIndexes();
