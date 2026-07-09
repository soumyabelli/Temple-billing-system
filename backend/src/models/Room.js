const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    number: { type: String, required: true, unique: true, trim: true },
    type: { type: String, required: true, trim: true },
    block: { type: String, trim: true },
    floor: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    capacity: { type: Number, default: 2 },
    bedType: { type: String, trim: true, default: "Double" },
    amenities: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["Available", "Occupied", "Maintenance"],
      default: "Available",
    },
    devotee: { type: String, trim: true },
    phone: { type: String, trim: true },
    days: { type: Number },
    payMode: { type: String, trim: true },
    checkinDate: { type: Date },
    checkoutDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
