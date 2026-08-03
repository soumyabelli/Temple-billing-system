const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    assetId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Electrical", "Furniture", "Electronics", "Utensils", "Machinery", "Other"],
      default: "Other",
    },
    qrCode: {
      type: String, // String representation or actual QR URL
      default: "",
    },
    purchaseDate: {
      type: Date,
      default: null,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
    invoiceNumber: {
      type: String,
      default: "",
    },
    warranty: {
      type: String, // e.g. "1 Year", "Ends 2025"
      default: "",
    },
    assignedLocation: {
      type: String,
      default: "Main Temple",
    },
    status: {
      type: String,
      enum: ["Active", "Under Repair", "Retired"],
      default: "Active",
    },
    purchaseCost: {
      type: Number,
      default: 0,
    },
    serialNumber: {
      type: String,
      default: "",
    },
    maintenanceHistory: [
      {
        repairDate: Date,
        description: String,
        cost: Number,
        vendor: String,
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Asset", assetSchema);
