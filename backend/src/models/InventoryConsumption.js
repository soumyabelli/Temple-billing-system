const mongoose = require("mongoose");

const inventoryConsumptionSchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryIssue",
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    issuedQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    usedQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    returnedQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      default: "",
    },
    remarks: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InventoryConsumption", inventoryConsumptionSchema);
