const express = require("express");
const router = express.Router();
const { getAllRequirements, getRequirementByName, saveRequirement } = require("../controllers/poojaSettingsController");
const { authenticate } = require("../middleware/authMiddleware");

router.use(authenticate);

router.get("/", getAllRequirements);
router.get("/:poojaName", getRequirementByName);
router.post("/", saveRequirement);

module.exports = router;
