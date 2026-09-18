const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Booking = require('../src/models/Booking');
const Bill = require('../src/models/Bill');
const AccountTransaction = require('../src/models/AccountTransaction');

async function run() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const bills = await Bill.find({ devoteeName: 'Ashwitha', amount: 2278 });
  console.log('Bills matching Ashwitha 2278:', bills.length);
  for (const bill of bills) {
    console.log('Bill:', {
      id: bill._id,
      ref: bill.referenceNo,
      sourceId: bill.sourceId,
      sevaType: bill.sevaType,
      items: bill.items
    });
    if (bill.sourceId) {
      const b = await Booking.findById(bill.sourceId);
      console.log('  Matching Booking:', b ? {
        id: b._id,
        service: b.service,
        isCombined: b.isCombined,
        items: b.items
      } : 'No booking');
    }
  }

  const txs = await AccountTransaction.find({}).sort({ date: -1 }).limit(10);
  console.log('Recent 10 AccountTransactions:');
  for (const t of txs) {
    console.log({
      date: t.date,
      type: t.transactionType,
      source: t.source,
      category: t.category,
      amount: t.amount,
      description: t.description,
      status: t.status,
      paymentMethod: t.paymentMethod
    });
  }

  await mongoose.disconnect();
}
run().catch(console.error);
