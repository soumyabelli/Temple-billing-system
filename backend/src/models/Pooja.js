const mongoose = require("mongoose");

const poojaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: String,
      trim: true,
      default: "",
    },
    requiredMaterials: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "InventoryItem",
          required: true,
        },
        itemName: {
          type: String,
          required: true,
        },
        qty: {
          type: String, // Allow string (like "2 Kg") or number as string
          required: true,
        },
        canTempleArrange: {
          type: Boolean,
          default: true,
        },
        mandatory: {
          type: Boolean,
          default: false,
        },
        templeCharge: {
          type: Number,
          default: 0,
        },
      },
    ],
    rules: {
      type: [String],
      default: [],
    },
    instructions: {
      type: [String],
      default: [],
    },
    dressCode: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pooja", poojaSchema);
