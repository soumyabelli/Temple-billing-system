const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

async function run() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const booking = await db.collection('bookings').findOne({ _id: new mongoose.Types.ObjectId('6aacc6c0a6f6f803d88f9aa4') });
  console.log('Booking 6aacc6c0a6f6f803d88f9aa4:', booking);

  await mongoose.disconnect();
}
run().catch(console.error);
