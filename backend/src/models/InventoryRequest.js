const mongoose = require("mongoose");

const INVENTORY_REQUEST_STATUSES = ["Pending", "Approved", "Rejected"];

const inventoryRequestSchema = new mongoose.Schema(
  {
    staffId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    staffName: {
      type: String,
      required: true,
      trim: true,
    },
<<<<<<< HEAD
=======
    requestedBy: {
      type: String,
      required: true,
      trim: true,
    },
>>>>>>> 1a512012f6af945a370c9e9129f3773ce078e50c
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
<<<<<<< HEAD
      type: String,
      required: true,
      trim: true,
=======
      type: Number,
      required: true,
      min: 0,
>>>>>>> 1a512012f6af945a370c9e9129f3773ce078e50c
    },
    unit: {
      type: String,
      required: true,
      trim: true,
<<<<<<< HEAD
      enum: ["Kg", "Liter", "Pack", "Pieces"],
=======
      enum: ["Kg", "Liter", "Pack", "Pieces", "Box"],
>>>>>>> 1a512012f6af945a370c9e9129f3773ce078e50c
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: INVENTORY_REQUEST_STATUSES,
      default: "Pending",
    },
    adminReason: {
      type: String,
      default: "",
      trim: true,
    },
    reviewedBy: {
      type: String,
      default: "",
      trim: true,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InventoryRequest", inventoryRequestSchema);
