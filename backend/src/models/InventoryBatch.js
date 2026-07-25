const mongoose = require("mongoose");

const inventoryBatchSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      required: true,
    },
    batchNumber: {
      type: String,
      required: true,
      trim: true,
    },
    grn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GoodsReceivedNote",
    },
    purchasePrice: {
      type: Number,
      default: 0,
    },
    manufacturingDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    originalQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    currentQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Quarantine", "Expired", "Consumed", "Returned", "Disposed"],
      default: "Active",
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventorySupplier",
    }
  },
  { timestamps: true }
);

inventoryBatchSchema.index({ item: 1, batchNumber: 1 }, { unique: true });

// Auto-update status based on current quantity
inventoryBatchSchema.pre("save", function(next) {
  if (this.currentQuantity === 0 && this.status === "Active") {
    this.status = "Consumed";
  }
  // Optional: check expiry if expiryDate is set and past today.
  if (this.expiryDate && new Date() > this.expiryDate && this.status === "Active") {
    this.status = "Expired";
  }
  next();
});

module.exports = mongoose.model("InventoryBatch", inventoryBatchSchema);
