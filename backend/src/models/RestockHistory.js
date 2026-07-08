const mongoose = require("mongoose");

const restockHistorySchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unit: {
      type: String,
      required: true,
    },
    supplier: {
      type: String,
      default: "",
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    cost: {
      type: Number,
      default: 0,
    },
    invoiceUrl: {
      type: String,
      default: "",
    },
    restockedBy: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RestockHistory", restockHistorySchema);
