const express = require("express");
const {
  getAdminPrasadamOrders,
  getAdminPrasadamOrderById,
  updateAdminPrasadamOrderStatus,
} = require("../controllers/prasadamAdminController");

const router = express.Router();

// GET /api/admin/prasadam-orders
router.get("/prasadam-orders", getAdminPrasadamOrders);

// GET /api/admin/prasadam-orders/:id
router.get("/prasadam-orders/:id", getAdminPrasadamOrderById);

// PUT /api/admin/prasadam-orders/:id/status
router.put("/prasadam-orders/:id/status", updateAdminPrasadamOrderStatus);

module.exports = router;

