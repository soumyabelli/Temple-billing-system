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
    availableDays: {
      type: [String], // e.g. ["Everyday"], ["Monday", "Tuesday"]
      default: ["Everyday"],
    },
    availableDates: {
      type: [String], // e.g. ["2026-08-15"] for special poojas
      default: [],
    },
    availableStartTime: {
      type: String, // e.g. "06:00"
      default: "",
    },
    availableEndTime: {
      type: String, // e.g. "08:00"
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
          type: Number, 
          required: true,
        },
        unit: {
          type: String,
          required: true,
        },
        mustBringByDevotee: {
          type: Boolean,
          default: false,
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
