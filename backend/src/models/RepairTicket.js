const mongoose = require("mongoose");

const repairTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryAsset",
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    issueDescription: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Reported", "Pending Approval", "Approved", "In Progress", "Completed", "Rejected", "Closed"],
      default: "Reported",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    sparePartsUsed: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "InventoryItem",
        },
        quantity: {
          type: Number,
          default: 1,
        }
      }
    ],
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventorySupplier",
    },
    vendorBillAmount: {
      type: Number,
      default: 0,
    },
    vendorBillPhoto: {
      type: String, // URL
    },
    repairExpenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountTransaction", // link to accounts if expense created
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    resolutionNotes: {
      type: String,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("RepairTicket", repairTicketSchema);
