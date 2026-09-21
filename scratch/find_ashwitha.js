const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

async function run() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  for (const coll of collections) {
    const name = coll.name;
    const docs = await db.collection(name).find({
      $or: [
        { devoteeEmail: 'naikashwitha08@gmail.com' },
        { email: 'naikashwitha08@gmail.com' },
        { devoteePhone: '8095146883' },
        { phone: '8095146883' }
      ]
    }).toArray();
    if (docs.length > 0) {
      console.log(`Found in collection ${name}:`, docs.map(d => ({
        _id: d._id,
        receiptNo: d.receiptNo,
        referenceNo: d.referenceNo,
        bookingNumber: d.bookingNumber,
        service: d.service || d.sevaType,
        amount: d.amount,
        items: d.items
      })));
    }
  }
  await mongoose.disconnect();
}
run().catch(console.error);
