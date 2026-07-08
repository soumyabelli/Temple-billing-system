require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const bookings = await db.collection('bookings').find({ assignedPriest: { $exists: true, $ne: null } }).limit(5).toArray();
  console.log('Bookings with assignedPriest:', bookings.map(b => b.assignedPriest));
  process.exit();
});
