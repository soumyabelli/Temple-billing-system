const mongoose = require("mongoose");

const payrollRecordSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    employeeName: { type: String, required: true, trim: true },
    department: { type: String, trim: true, default: "" },
    role: { type: String, trim: true, default: "" },
    monthKey: { type: String, required: true, trim: true, index: true },
    baseSalary: { type: Number, required: true, min: 0 },
    presentDays: { type: Number, default: 0, min: 0 },
    absentDays: { type: Number, default: 0, min: 0 },
    leaveDays: { type: Number, default: 0, min: 0 },
    halfDays: { type: Number, default: 0, min: 0 },
    lateDays: { type: Number, default: 0, min: 0 },
    extraDutyDays: { type: Number, default: 0, min: 0 },
    overtimeHours: { type: Number, default: 0, min: 0 },
    deduction: { type: Number, default: 0, min: 0 },
    extraDutyPay: { type: Number, default: 0, min: 0 },
    bonus: { type: Number, default: 0, min: 0 },
    netSalary: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Bank Transfer", "UPI", "Cash", "Cheque", "Card", "Net Banking"],
      default: "Bank Transfer",
    },
    transactionId: { type: String, trim: true, default: "" },
    paidAt: { type: Date, default: null },
    paidBy: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

payrollRecordSchema.index({ employeeId: 1, monthKey: 1 }, { unique: true });

module.exports = mongoose.model("PayrollRecord", payrollRecordSchema);
