const mongoose = require("mongoose");

const ATTENDANCE_STATUSES = ["Present", "Absent", "Late", "Half Day", "Leave"];

const attendanceSchema = new mongoose.Schema(
  {
    staffId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    staffName: {
      type: String,
      required: true,
      trim: true,
    },
    employeeId: {
      type: String,
      trim: true,
      index: true,
    },
    staffEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    dateKey: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    checkIn: {
      type: String,
      default: "--",
      trim: true,
    },
    checkOut: {
      type: String,
      default: "--",
      trim: true,
    },
    checkInAt: {
      type: Date,
      default: null,
    },
    checkOutAt: {
      type: Date,
      default: null,
    },
    shift: {
      type: String,
      default: "Morning",
      trim: true,
    },
    status: {
      type: String,
      enum: ATTENDANCE_STATUSES,
      default: "Absent",
    },
    workingMinutes: {
      type: Number,
      default: 0,
    },
    workingHours: {
      type: String,
      default: "--",
      trim: true,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    source: {
      type: String,
      default: "manual",
      trim: true,
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ staffId: 1, dateKey: 1 }, { unique: true });
attendanceSchema.index({ employeeId: 1, dateKey: 1 });
attendanceSchema.index({ staffEmail: 1, dateKey: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
