const mongoose = require("mongoose");

const INVENTORY_UNITS = ["Kg", "Liter", "Pack", "Pieces","Box"];

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
    currentStock: {
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
    category: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Virtual: compute stock status
inventoryItemSchema.virtual("status").get(function () {
  return this.currentStock <= this.minimumStock ? "Low Stock" : "Available";
});

inventoryItemSchema.set("toJSON", { virtuals: true });
inventoryItemSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("InventoryItem", inventoryItemSchema);
