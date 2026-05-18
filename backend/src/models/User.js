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
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
