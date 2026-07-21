const mongoose = require("mongoose");

const INVENTORY_UNITS = ["Kg", "Liter", "Pack", "Pieces", "Box"];

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    unit: {
      type: String,
      required: true,
      enum: INVENTORY_UNITS,
      default: "Pack",
    },
    availableStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    reservedStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    issuedStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    consumedStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    damagedStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    expiredStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    returnedStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    minimumStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    reorderLevel: {
      type: Number,
      min: 0,
      default: 0,
    },
    category: {
      type: String,
      enum: ["Pooja Items", "Prasadam Ingredients", "Cleaning Materials", "Office & Stationery", "Electrical & Maintenance", "Festival Materials", "Miscellaneous Items"],
      default: "Miscellaneous Items",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiryDate: {
      type: Date,
    },
    lastSupplier: {
      type: String,
    },
    lastPurchasePrice: {
      type: Number,
    },
    lastInvoiceNumber: {
      type: String,
    },
    lastPurchaseDate: {
      type: Date,
    }
  },
  { timestamps: true }
);

// Virtual: compute stock status
inventoryItemSchema.virtual("status").get(function () {
  if (this.availableStock === 0) return "Out Of Stock";
  return this.availableStock <= this.minimumStock ? "Low Stock" : "Healthy";
});

inventoryItemSchema.set("toJSON", { virtuals: true });
inventoryItemSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("InventoryItem", inventoryItemSchema);
