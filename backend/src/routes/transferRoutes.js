const express = require("express");
const {
  getAllTransferRequests,
  resolveTransferRequest,
  directAdminTransfer,
} = require("../controllers/transferController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Apply authentication and admin role authorization
router.use(authenticate);
router.use(authorizeRoles("admin", "manager"));

router.get("/requests", getAllTransferRequests);
router.put("/requests/:id/resolve", resolveTransferRequest);
router.post("/direct-transfer", directAdminTransfer);

module.exports = router;
