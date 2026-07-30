const mongoose = require("mongoose");

const poojaMaterialRequirementSchema = new mongoose.Schema(
  {
    poojaName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    requiredMaterials: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "InventoryItem",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 0.01,
        },
        charge: {
          type: Number,
          default: 0,
        },
        mandatory: {
          type: Boolean,
          default: false,
        },
        templeArrangeAvailable: {
          type: Boolean,
          default: true,
        },
        templeCharge: {
          type: Number,
          default: 0,
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("PoojaMaterialRequirement", poojaMaterialRequirementSchema);
