const mongoose = require("mongoose");

const prasadamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    availableQuantity: {
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
  },
  { timestamps: true }
);

// Virtual: compute stock status
prasadamSchema.virtual("status").get(function () {
  if (this.availableQuantity === 0) return "Out Of Stock";
  return this.availableQuantity <= this.minimumStock ? "Low Stock" : "Available";
});

prasadamSchema.set("toJSON", { virtuals: true });
prasadamSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Prasadam", prasadamSchema);
