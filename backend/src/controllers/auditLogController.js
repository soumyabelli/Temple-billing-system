const AuditLog = require("../models/AuditLog");

exports.getAuditLogs = async (req, res) => {
  try {
    const { startDate, endDate, user, action, module } = req.query;
    let query = {};
    
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (user && user !== "All Users") {
      // Typically we'd expect a User ID, but if the frontend sends name/role, we might need to populate or filter differently.
      // Let's assume frontend sends User ID for now, or we skip user filtering if it's "All Users".
      // Wait, if it's name/role, we can populate and then filter, but let's keep it simple.
      // If we pass an ID, we use it directly:
      if (user.length === 24) query.user = user; 
    }
    if (action && action !== "All Actions") {
      query.action = { $regex: action, $options: "i" };
    }
    if (module && module !== "All Modules") {
      query.module = module;
    }

    const logs = await AuditLog.find(query)
      .sort({ date: -1 })
      .populate("user", "name role");

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch audit logs", error: error.message });
  }
};

exports.logAudit = async (userId, action, moduleName, details, ipAddress = "127.0.0.1") => {
  try {
    await AuditLog.create({
      user: userId,
      action,
      module: moduleName,
      details,
      ipAddress,
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
};
