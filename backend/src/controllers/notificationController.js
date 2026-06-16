const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
  try {
    const { role, userId } = req.params;

    const notifications = await Notification.find({
      $or: [
        { audienceRole: role.toLowerCase() },
        { audienceId: userId }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(
      req.params.id,
      {
        read: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  getNotifications,
  markNotificationRead
};