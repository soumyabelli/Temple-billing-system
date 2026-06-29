const mongoose = require("mongoose");

const prasadamOrderSchema = new mongoose.Schema(
  {
    channel: {
      type: String,
      enum: ["devotee", "cashier"],
      default: "devotee",
      index: true,
    },
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
      enum: ["UPI", "Cash", "Card", "Bank Transfer", "Net Banking", "Debit Card", "Credit Card"],
      default: "UPI",
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
        "Processing",
        "Ready for Pickup",
        "Completed",
        "Cancelled",
        "Placed",
        "Preparing",
        "Ready",
        "Delivered",
      ],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PrasadamOrder", prasadamOrderSchema);
