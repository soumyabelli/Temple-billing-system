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
    minimumAdvanceBookingDays: {
      type: Number,
      default: 0,
    },
    strictAdvancePreparation: {
      type: Boolean,
      default: false,
    },
    requiredMaterials: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "InventoryItem",
          // Not required for EXTERNAL_OR_DEVOTEE
        },
        materialSource: {
          type: String,
          enum: ["TEMPLE_INVENTORY", "EXTERNAL_OR_DEVOTEE"],
          default: "TEMPLE_INVENTORY"
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
        responsibilityType: {
          type: String,
          enum: ["TEMPLE_PROVIDES", "DEVOTEE_MUST_BRING", "DEVOTEE_PREPARATION_REQUIRED", "DEVOTEE_OR_TEMPLE"],
          required: true,
          default: "TEMPLE_PROVIDES",
        },
        preparationDaysBeforePooja: {
          type: Number,
          default: 0,
        },
        preparationInstructions: {
          type: String,
          default: "",
        },
        requiresAdvanceCollection: {
          type: Boolean,
          default: false,
        },
        collectionInstructions: {
          type: String,
          default: "",
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
