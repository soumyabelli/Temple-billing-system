const mongoose = require("mongoose");

const INVENTORY_UNITS = [
  "Piece (Pc)", "Number (Nos)", "Unit", "Pair", "Set", "Bundle", "Packet", "Pack", "Box", "Carton", "Roll", "Dozen", "Tray", "Sack", "Bag", "Pieces",
  "Gram (g)", "Kilogram (kg)", "Kg", "Quintal", "Ton",
  "Millilitre (ml)", "Litre (L)", "Liter", "Can", "Drum", "Barrel",
  "Bottle", "Jar", "Tin", "Container", "Bucket", "Cylinder",
  "Meter", "Feet",
  "Square Feet", "Square Meter"
];

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    itemCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    barcode: {
      type: String,
      trim: true,
    },
    qrCode: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["Raw Material", "Finished Good", "Asset", "Consumable", "Other"],
      default: "Consumable",
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
    maximumStock: {
      type: Number,
      min: 0,
      default: 0,
    },
    batchRequired: {
      type: Boolean,
      default: false,
    },
    expiryRequired: {
      type: Boolean,
      default: false,
    },
    shelfLifeDays: {
      type: Number,
      default: 0,
    },
    purchasePrice: {
      type: Number,
      default: 0,
    },
    sellingPrice: {
      type: Number,
      default: 0,
    },
    gstRate: {
      type: Number,
      default: 0,
    },
    preferredSupplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventorySupplier",
    },
    expenseHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountHead",
    },
    incomeHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountHead",
    },
    inventoryAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountHead",
    },
    category: {
      type: String,
      enum: ["Pooja Items", "Prasadam Ingredients", "Cleaning Materials", "Office & Stationery", "Electrical & Maintenance", "Festival Materials", "Miscellaneous Items", "Cooking / Annaprasada"],
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
    lastPurchaseDate: {
      type: Date,
    },
    lastPurchasePrice: {
      type: Number,
      default: 0,
    },
    lastSupplier: {
      type: String,
      trim: true,
    }
  },
  { timestamps: true }
);

inventoryItemSchema.index({ name: 1, category: 1 }, { unique: true });

// Virtual: compute stock status
inventoryItemSchema.virtual("status").get(function () {
  if (this.availableStock === 0) return "Out Of Stock";
  return this.availableStock <= this.minimumStock ? "Low Stock" : "Healthy";
});

inventoryItemSchema.set("toJSON", { virtuals: true });
inventoryItemSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("InventoryItem", inventoryItemSchema);
