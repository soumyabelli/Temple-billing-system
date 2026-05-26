const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    date: { type: Date, required: true },
    location: { type: String, trim: true, required: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
