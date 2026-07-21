const mongoose = require("mongoose");

const repairRequestSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    vendor: {
      type: String,
      default: "",
    },
    cost: {
      type: Number,
      default: 0,
    },
    invoiceNumber: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Cancelled"],
      default: "Pending",
    },
    completionDate: {
      type: Date,
    },
    createdBy: {
      type: String,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("RepairRequest", repairRequestSchema);
