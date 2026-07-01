const mongoose = require("mongoose");

const attendanceSettingSchema = new mongoose.Schema(
  {
    templeLatitude: {
      type: Number,
      required: true,
      default: 0,
    },
    templeLongitude: {
      type: Number,
      required: true,
      default: 0,
    },
    allowedRadius: {
      type: Number,
      required: true,
      default: 100, // meters
    },
    lateThreshold: {
      type: Number,
      required: true,
      default: 15, // minutes
    },
    earlyCheckInWindow: {
      type: Number,
      required: true,
      default: 30, // minutes
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AttendanceSetting", attendanceSettingSchema);
