const mongoose = require("mongoose");

const priestSettingSchema = new mongoose.Schema(
  {
    priestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      unique: true,
    },
    smsNotifications: {
      type: Boolean,
      default: true,
    },
    dutyReminders: {
      type: Boolean,
      default: true,
    },
    calendarWidget: {
      type: Boolean,
      default: true,
    },
    agamaReferenceModule: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PriestSetting", priestSettingSchema);
