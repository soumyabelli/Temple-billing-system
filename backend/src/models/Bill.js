const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    devoteeName: {
      type: String,
      required: true,
      trim: true,
    },
    sevaType: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    paymentMode: {
      type: String,
      enum: ["Cash", "UPI", "Card", "Bank Transfer"],
      default: "Cash",
    },
    billDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bill", billSchema);

