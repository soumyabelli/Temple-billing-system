const mongoose = require("mongoose");

const accountTransactionSchema = new mongoose.Schema(
  {
    transactionType: {
      type: String,
      enum: ["Credit", "Debit"],
      required: true,
    },
    source: {
      type: String,
      enum: [
        "Pooja Booking",
        "Donation",
        "Room Booking",
        "Prasadam",
        "Payroll",
        "Manual Entry",
        "Bank Interest",
        "Inventory",
        "Asset",
        "Repair"
      ],
      required: true,
    },
    category: {
      type: String,
      required: true,
      // For dynamic expenses, this will store the category name.
      // For income sources, it can be the source name or sub-category.
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    financialYear: {
      type: String,
      required: true,
      // Format: "2026-2027"
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Card", "Bank Transfer", "Cheque", "System"],
      default: "System",
    },
    status: {
      type: String,
      enum: ["Pending Approval", "Approved", "Completed", "Cancelled", "Rejected"],
      default: "Completed",
    },
    description: {
      type: String,
      trim: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      // Links back to the original Pooja, Donation, Payroll record etc.
    },
    referenceModel: {
      type: String,
      enum: ["PoojaBooking", "Donation", "Room", "PrasadamOrder", "PayrollRecord", "BankInterest", "RestockHistory", "Asset", "RepairRequest", "InventoryItem", "InventoryIssue"],
    },
    bankName: {
      type: String,
      // Specific to Bank Interest or Bank Transfers
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AccountTransaction", accountTransactionSchema);
