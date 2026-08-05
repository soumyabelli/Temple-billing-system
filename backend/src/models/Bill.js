const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    devoteeName: { type: String, required: true, trim: true },
    devoteeEmail: { type: String, trim: true },
    devoteePhone: { type: String, trim: true },
    devoteeAddress: { type: String, trim: true },
    sevaType: { type: String, required: false, trim: true }, // Optional for consolidated
    items: [{
      itemType: { type: String, enum: ["Pooja", "Donation", "Prasadam", "Room", "Other"] },
      itemName: { type: String },
      amount: { type: Number }
    }],
    amount: { type: Number, required: true, min: 1 },
    paymentMode: {
      type: String,
      enum: ["Cash", "UPI", "Card", "Bank Transfer", "Net Banking", "Debit Card", "Credit Card"],
      default: "Cash"
    },
    billType: {
      type: String,
      trim: true,
      default: "Other",
    },
    referenceNo: {
      type: String,
      trim: true,
    },
    sourceId: {
      type: String,
      trim: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Paid", "Pending", "Cancelled"],
      default: "Paid",
    },
    razorpayOrderId: { type: String, trim: true },
    razorpayPaymentId: { type: String, trim: true },
    razorpaySignature: { type: String, trim: true },
    billDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bill", billSchema);
