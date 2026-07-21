const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      default: "",
    },
    gst: {
      type: String,
      trim: true,
      default: "",
    },
    itemsSupplied: [
      {
        type: String,
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema);
