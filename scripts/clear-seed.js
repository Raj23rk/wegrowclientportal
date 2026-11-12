const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function clearSeedData() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found in .env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

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

  console.log('\n--- Removing all mock and seed collections ---');
  for (const name of collectionsToClear) {
    try {
      const res = await db.collection(name).deleteMany({});
      console.log(`✓ Cleared ${name}: deleted ${res.deletedCount} documents`);
    } catch (err) {
      console.log(`- ${name}: ${err.message}`);
    }
  }

  // Remove demo client users (Arjun Mehta, Lakshmi Sundar), keep only admin account
  try {
    const usersCol = db.collection('users');
    const res = await usersCol.deleteMany({ role: { $ne: 'admin' } });
    console.log(`✓ Cleared mock users: deleted ${res.deletedCount} demo client accounts (preserved admin)`);
  } catch (err) {
    console.log(`- users: ${err.message}`);
  }

  // Display remaining collections
  const cols = await db.listCollections().toArray();
  console.log('\n--- Remaining document counts in MongoDB ---');
  for (const c of cols) {
    const n = await db.collection(c.name).countDocuments();
    console.log(`- ${c.name}: ${n}`);
  }

  await mongoose.disconnect();
  console.log('\nAll seed data successfully removed from database.');
}

clearSeedData().catch((err) => {
  console.error('Error clearing seed data:', err);
  process.exit(1);
});
