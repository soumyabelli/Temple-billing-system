const mongoose = require("mongoose");

const prasadamOrderSchema = new mongoose.Schema(
  {
    devoteeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
    devoteeName: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    itemName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["UPI", "Cash", "Card", "Net Banking"],
      default: "UPI",
    },
    status: { type: String, enum: ["Placed", "Preparing", "Ready", "Delivered", "Cancelled"], default: "Placed" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PrasadamOrder", prasadamOrderSchema);
