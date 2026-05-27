const mongoose = require("mongoose");

const TASK_STATUSES = ["Pending", "In Progress", "Completed"];

const taskSchema = new mongoose.Schema(
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
    time: {
      type: String,
      required: true,
      trim: true,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
