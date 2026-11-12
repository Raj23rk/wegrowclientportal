import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wegrow_portal';

async function seed() {
  console.log(`Connecting to MongoDB at: ${mongoUri}...`);
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB successfully.');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection failed');
  }

  // Clear all mock and seed data collections
  const collectionsToClear = [
    'clients',
    'actionitems',
    'sessions',
    'reports',
    'businessupdates',
    'clientevents',
    'clientphotos',
    'documentitems',
    'notificationitems',
    'sessionfeedbacks',
    'attendances',
    'attendees'
  ];

  for (const name of collectionsToClear) {
    try {
      await db.collection(name).deleteMany({});
      console.log(`Cleared collection: ${name}`);
    } catch (err: any) {
      console.log(`Skip ${name}: ${err.message}`);
    }
  }

  // Preserve only the primary admin account in users
  const usersCollection = db.collection('users');
  await usersCollection.deleteMany({ role: { $ne: 'admin' } });

  const adminExists = await usersCollection.findOne({ email: 'admin@wegrow.in' });
  if (!adminExists) {
    await usersCollection.insertOne({
      email: 'admin@wegrow.in',
      passwordHash: 'admin123',
      clientId: null,
      role: 'admin',
      name: 'Dr. Thavabalan',
      title: 'Lead Consultant, WeGrow',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Created primary admin account (admin@wegrow.in).');
  } else {
    console.log('Admin account (admin@wegrow.in) preserved.');
  }

  console.log('All mock seed data removed. Database is clean.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding cleanup failed:', err);
  process.exit(1);
});
