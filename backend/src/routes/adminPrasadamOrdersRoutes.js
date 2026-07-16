const express = require("express");
const {
  getAdminPrasadamOrders,
  getAdminPrasadamOrderById,
  updateAdminPrasadamOrderStatus,
  deleteAdminPrasadamOrder,
} = require("../controllers/prasadamAdminController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("admin", "superadmin"));

// GET /api/admin/prasadam-orders
router.get("/prasadam-orders", getAdminPrasadamOrders);

// GET /api/admin/prasadam-orders/:id
router.get("/prasadam-orders/:id", getAdminPrasadamOrderById);

// PUT /api/admin/prasadam-orders/:id/status
router.put("/prasadam-orders/:id/status", updateAdminPrasadamOrderStatus);

router.delete("/prasadam-orders/:id", deleteAdminPrasadamOrder);

module.exports = router;
