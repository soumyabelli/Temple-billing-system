const Task = require("../models/Task");

exports.getTasks = async (req, res) => {
  try {
    const { staffId } = req.params;
    const tasks = await Task.find({ staffId }).sort({ createdAt: -1 });

    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["Pending", "In Progress", "Completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
    }

    const updated = await Task.findByIdAndUpdate(id, { status }, { new: true });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.json({
      success: true,
      task: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
