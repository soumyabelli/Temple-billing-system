const express = require("express");
const router = express.Router();
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} = require("../controllers/attendanceLocationController");

router.route("/")
  .get(authenticate, getLocations)
  .post(authenticate, authorizeRoles("admin"), createLocation);

router.route("/:id")
  .put(authenticate, authorizeRoles("admin"), updateLocation)
  .delete(authenticate, authorizeRoles("admin"), deleteLocation);

module.exports = router;
