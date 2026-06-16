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

  gender: {
    type: String,
  },

  dob: {
    type: String,
  },

  bloodGroup: {
    type: String,
  },

  aadhaar: {
  type: String,
  unique: true,
  sparse: true,
},

  phone: {
    type: String,
  },

  address: {
    type: String,
  },

  emergencyContact: {
    type: String,
  },

  shift: {
    type: String,
  },

  department: {
    type: String,
  },

  salary: {
  type: Number,
  required: true,
},

  joiningDate: {
  type: Date,
  required: true,
},

  employmentType: {
  type: String,
  enum: ["Full Time", "Part Time", "Contract"],
  default: "Full Time",
},

  defaultShift: {
    type: String,
  },

  defaultDuty: {
    type: String,
  },

  dutyLocation: {
    type: String,
  },

  permissions: {
    type: String,
  },

  photo: {
    type: String,
  },

  documentUrl: {
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