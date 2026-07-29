const express = require("express");
const router = express.Router();
const auditLogController = require("../controllers/auditLogController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

// Only admins can view audit logs
router.get("/", authenticate, authorizeRoles("admin"), auditLogController.getAuditLogs);

module.exports = router;
