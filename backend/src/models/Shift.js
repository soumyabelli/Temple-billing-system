const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    shiftName: { type: String, required: true, trim: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    category: { type: String, default: "General", trim: true },
    requiredStaff: { type: Number, default: 1 },
    active: { type: Boolean, default: true },
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shift", shiftSchema);