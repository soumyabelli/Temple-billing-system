const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to DB');
  const db = mongoose.connection.db;
  
  // Find bookings related to room 111 or PB1003
  let result = await db.collection('bookings').deleteOne({ bookingNumber: 'PB1003' });
  console.log('Deleted PB1003 by bookingNumber:', result.deletedCount);
  
  if(result.deletedCount === 0) {
      // Find by devoteeName if needed
      result = await db.collection('bookings').deleteMany({ service: { $regex: /Room Allotment/i }, devoteeName: 'devo' });
      console.log('Deleted by regex and name:', result.deletedCount);
  }

  // Set the room back to available if it's currently occupied
  const roomRes = await db.collection('rooms').updateOne({ number: '111' }, { $set: { status: 'Available', isOccupied: false, currentOccupant: null } });
  console.log('Updated room 111 status:', roomRes.modifiedCount);

  process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
