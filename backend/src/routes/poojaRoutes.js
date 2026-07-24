const express = require("express");
const router = express.Router();
const poojaController = require("../controllers/poojaController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

// Allowed for all authenticated users (including devotees) to view
router.get("/", authenticate, poojaController.getAllPoojas);
router.get("/:id", authenticate, poojaController.getPoojaById);

// Only admins can create, update, delete pooja settings
router.post("/", authenticate, authorizeRoles("admin"), poojaController.createPooja);
router.put("/:id", authenticate, authorizeRoles("admin"), poojaController.updatePooja);
router.delete("/:id", authenticate, authorizeRoles("admin"), poojaController.deletePooja);

module.exports = router;
