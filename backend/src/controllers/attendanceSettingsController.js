const AttendanceSetting = require("../models/AttendanceSetting");

exports.getSettings = async (req, res) => {
  try {
    let settings = await AttendanceSetting.findOne();
    if (!settings) {
      settings = await AttendanceSetting.create({});
    }
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { templeLatitude, templeLongitude, allowedRadius, lateThreshold, earlyCheckInWindow } = req.body;
    let settings = await AttendanceSetting.findOne();
    
    if (settings) {
      settings.templeLatitude = templeLatitude ?? settings.templeLatitude;
      settings.templeLongitude = templeLongitude ?? settings.templeLongitude;
      settings.allowedRadius = allowedRadius ?? settings.allowedRadius;
      settings.lateThreshold = lateThreshold ?? settings.lateThreshold;
      settings.earlyCheckInWindow = earlyCheckInWindow ?? settings.earlyCheckInWindow;
      await settings.save();
    } else {
      settings = await AttendanceSetting.create(req.body);
    }
    
    res.status(200).json({ success: true, message: "Attendance settings updated", settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
