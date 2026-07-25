const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    outputItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem", // The finished good (e.g., "Laddu Prasad", "Pooja Kit")
    },
    outputQuantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    ingredients: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "InventoryItem",
          required: true,
        },
        quantityRequired: {
          type: Number,
          required: true,
          min: 0,
        },
        unit: {
          type: String,
        },
        notes: {
          type: String,
        }
      }
    ],
    type: {
      type: String,
      enum: ["Prasadam", "Pooja Kit", "Annadanam", "Other"],
      default: "Prasadam",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    instructions: {
      type: String,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", recipeSchema);
