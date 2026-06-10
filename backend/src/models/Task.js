const mongoose = require("mongoose");

const TASK_STATUSES = ["Pending", "In Progress", "Completed"];

const taskSchema = new mongoose.Schema(
  {
    assignmentType: {
      type: String,
      default: "Duty & Shift",
      trim: true,
    },
    shiftId: {
      type: String,
      trim: true,
      index: true,
    },
    shiftName: {
      type: String,
      trim: true,
      default: "",
    },
    shiftStartTime: {
      type: String,
      trim: true,
      default: "",
    },
    shiftEndTime: {
      type: String,
      trim: true,
      default: "",
    },
    dateKey: {
      type: String,
      trim: true,
      index: true,
      default: "",
    },
    startTime: {
      type: String,
      trim: true,
      default: "",
    },
    endTime: {
      type: String,
      trim: true,
      default: "",
    },
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
    dutyName: {
      type: String,
      trim: true,
      default: "",
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: String,
      trim: true,
    },
    duty: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      type: String,
      required: true,
      trim: true,
    },
    dutyArea: {
      type: String,
      trim: true,
      default: "",
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    reportingTime: {
      type: String,
      trim: true,
      default: "",
    },
    assignedBy: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: "Pending",
    },
    attendanceStatus: {
      type: String,
      default: "Pending",
      trim: true,
    },
    conflict: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    requiredStaff: {
      type: Number,
      default: 1,
    },
    durationMinutes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

taskSchema.index({ staffId: 1, dateKey: 1 });
taskSchema.index({ staffId: 1, dueDate: 1 });

module.exports = mongoose.model("Task", taskSchema);
