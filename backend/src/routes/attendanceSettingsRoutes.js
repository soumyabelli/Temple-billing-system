const express = require("express");
const router = express.Router();
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const { getSettings, updateSettings } = require("../controllers/attendanceSettingsController");

router.get("/", authenticate, getSettings);
router.post("/", authenticate, authorizeRoles("admin"), updateSettings);

module.exports = router;
