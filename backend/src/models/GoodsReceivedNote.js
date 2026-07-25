const mongoose = require("mongoose");

const goodsReceivedNoteSchema = new mongoose.Schema(
  {
    grnNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    purchaseOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventorySupplier",
      required: true,
    },
    supplierInvoiceNumber: {
      type: String,
      trim: true,
    },
    supplierInvoiceDate: {
      type: Date,
    },
    receivedItems: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "InventoryItem",
          required: true,
        },
        poQuantity: {
          type: Number,
          default: 0,
        },
        receivedQuantity: {
          type: Number,
          required: true,
          min: 0,
        },
        acceptedQuantity: {
          type: Number,
          required: true,
          min: 0,
        },
        rejectedQuantity: {
          type: Number,
          default: 0,
          min: 0,
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        batchNumber: {
          type: String,
        },
        expiryDate: {
          type: Date,
        },
        remarks: {
          type: String,
        }
      }
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Draft", "Pending Quality Check", "Pending Approval", "Approved", "Rejected"],
      default: "Draft",
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    notes: {
      type: String,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("GoodsReceivedNote", goodsReceivedNoteSchema);
