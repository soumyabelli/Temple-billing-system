const mongoose = require("mongoose");

const damageNoteSchema = new mongoose.Schema(
  {
    damageNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      required: true,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryBatch",
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
      required: true,
      enum: ["Expired", "Broken/Damaged", "Lost/Stolen", "Spoiled", "Quality Issue", "Other"],
    },
    description: {
      type: String,
      required: true,
    },
    photoUrl: {
      type: String,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending Approval", "Approved", "Rejected"],
      default: "Pending Approval",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    writeOffAmount: {
      type: Number,
      default: 0,
    },
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountTransaction", // Link to the posted loss in accounts
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("DamageNote", damageNoteSchema);
