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
        { receiptNo: /2001/i },
        { referenceNo: /2001/i },
        { bookingNumber: /2001/i },
        { orderNumber: /2001/i },
        { receiptId: /2001/i }
      ]
    }).toArray();
    if (docs.length > 0) {
      console.log(`Found in collection ${name}:`, docs);
    }
  }
  await mongoose.disconnect();
}
run().catch(console.error);
