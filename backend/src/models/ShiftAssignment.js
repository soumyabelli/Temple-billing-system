const mongoose = require("mongoose");

const shiftAssignmentSchema = new mongoose.Schema(
  {
    shiftId: { type: String, required: true, trim: true, index: true },
    shiftName: { type: String, required: true, trim: true },
    employeeId: { type: String, required: true, trim: true, index: true },
    staffId: { type: String, trim: true, index: true },
    employeeName: { type: String, required: true, trim: true },
    employeeEmail: { type: String, trim: true, lowercase: true },
    dateKey: { type: String, required: true, trim: true, index: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    category: { type: String, default: "General", trim: true },
    requiredStaff: { type: Number, default: 1 },
    attendanceStatus: { type: String, default: "Pending", trim: true },
    conflict: { type: Boolean, default: false },
    notes: { type: String, default: "", trim: true },
    assignedBy: { type: String, default: "Admin", trim: true },
    durationMinutes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

shiftAssignmentSchema.index({ employeeId: 1, dateKey: 1 });
shiftAssignmentSchema.index({ shiftId: 1, dateKey: 1 });

module.exports = mongoose.model("ShiftAssignment", shiftAssignmentSchema);