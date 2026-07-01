const mongoose = require("mongoose");

const ATTENDANCE_STATUSES = ["Present", "Absent", "Half Day", "Leave", "Pending", "Working", "Holiday", "Late"];

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
    shiftStartTime: {
      type: String,
      default: "",
      trim: true,
    },
    shiftEndTime: {
      type: String,
      default: "",
      trim: true,
    },
    assignmentType: {
      type: String,
      default: "",
      trim: true,
    },
    dutyName: {
      type: String,
      default: "",
      trim: true,
    },
    dutyArea: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ATTENDANCE_STATUSES,
      default: "Absent",
    },
    isLateCheckIn: {
      type: Boolean,
      default: false,
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
    overtimeMinutes: {
      type: Number,
      default: 0,
    },
    overtimeHours: {
      type: String,
      default: "--",
      trim: true,
    },
    isOvertime: {
      type: Boolean,
      default: false,
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
    correctedBy: {
      type: String,
      default: "",
      trim: true,
    },
    correctionDate: {
      type: Date,
      default: null,
    },
    correctionReason: {
      type: String,
      default: "",
      trim: true,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    locationVerified: {
      type: Boolean,
      default: false,
    },
    faceVerified: {
      type: Boolean,
      default: false,
    },
    distanceFromTemple: {
      type: Number,
      default: null,
    },
    deviceInfo: {
      type: String,
      default: "",
    },
    browser: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "",
    },
    checkInPhoto: {
      type: String,
      default: "",
    },
    checkOutPhoto: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ staffId: 1, dateKey: 1 }, { unique: true });
attendanceSchema.index({ employeeId: 1, dateKey: 1 });
attendanceSchema.index({ staffEmail: 1, dateKey: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
