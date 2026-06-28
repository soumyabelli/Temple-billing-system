const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { canLoginForStatus } = require("../utils/employeeAccess");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    const user = await User.findById(decoded.id).select("role status accountEnabled");
    if (user && (!user.accountEnabled || !canLoginForStatus(user.status))) {
      return res.status(403).json({ message: `Account access is disabled (${user.status || "Inactive"}).` });
    }
    req.user = { ...decoded, role: user?.role || decoded.role };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  return next();
};

module.exports = {
  authenticate,
  authorizeRoles,
};
