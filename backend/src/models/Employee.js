const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: [
      "admin",
      "priest",
      "accountant",
      "cashier",
      "staff",
    ],
    default: "staff",
  },

  shift: {
    type: String,
  },

  department: {
    type: String,
  },

  status: {
    type: String,
    default: "Active",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "Employee",
  employeeSchema
);