const mongoose = require("mongoose");

const allowedRoles = ["admin", "accountant", "cashier", "priest", "staff", "devotee"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    place: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: allowedRoles,
      default: "devotee",
    },
    photo: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "On Leave", "Inactive", "Suspended", "Resigned", "Retired"],
      default: "Active",
    },
    accountEnabled: {
      type: Boolean,
      default: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    menuAccess: {
      type: [String],
      default: [],
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
