const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
    trim: true,
  },

  username: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
    lowercase: true,
    trim: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

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

  currentDuty: {
    dutyName: { type: String, default: "", trim: true },
    shift: { type: String, default: "", trim: true },
    dutyLocation: { type: String, default: "", trim: true },
    reportingTime: { type: String, default: "", trim: true },
    workingHours: { type: String, default: "", trim: true },
    supervisor: { type: String, default: "", trim: true },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
  },

  photo: {
    type: String,
    default: "",
  },

  profilePhoto: {
    type: String,
    default: "",
  },

  faceRegistered: {
    type: Boolean,
    default: false,
  },

  faceDescriptor: {
    type: [Number],
    default: [],
  },

  status: {
    type: String,
    enum: ["Active", "On Leave", "Inactive", "Suspended", "Resigned", "Retired"],
    default: "Active",
  },

  attendanceStatus: {
    type: String,
    default: "Not Marked",
    trim: true,
  },

  leaveBalance: {
    type: Number,
    default: 0,
    min: 0,
  },

  experience: {
    type: String,
  },

  vedaShakha: {
    type: String,
  },

  specializations: {
    type: [String],
    default: [],
  },

  languages: {
    type: [String],
    default: [],
  },

  certification: {
    type: String,
  },

  createdBy: {
    type: String,
    default: "Admin",
    trim: true,
  },

  updatedBy: {
    type: String,
    default: "Admin",
    trim: true,
  },

  deletedAt: {
    type: Date,
    default: null,
  },

  deletedBy: {
    type: String,
    default: "",
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.model(
  "Employee",
  employeeSchema
);
