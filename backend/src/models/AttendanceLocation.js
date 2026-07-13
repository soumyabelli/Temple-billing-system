const mongoose = require("mongoose");

const attendanceLocationSchema = new mongoose.Schema(
  {
    locationName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    allowedRadius: {
      type: Number,
      required: true,
      default: 100, // in meters
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AttendanceLocation", attendanceLocationSchema);
