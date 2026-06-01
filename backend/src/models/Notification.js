const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    message: { type: String, trim: true, required: true },
    audienceId: { type: String, trim: true, index: true },
    audienceEmail: { type: String, trim: true, lowercase: true },
    audienceRole: { type: String, trim: true, lowercase: true },
    category: { type: String, trim: true },
    date: { type: Date, default: Date.now },
    viewed: { type: Boolean, default: false },
    viewedAt: { type: Date, default: null },
    read: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
