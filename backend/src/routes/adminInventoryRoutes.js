const express = require("express");
const router = express.Router();
const {
  getAllInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  restockItem,
  getInventoryLogs,
} = require("../controllers/inventoryItemController");
const { updateInventoryRequestStatus } = require("../controllers/inventoryRequestController");

// GET /api/admin/inventory-items
router.get("/inventory-items", getAllInventoryItems);

// POST /api/admin/inventory-items
router.post("/inventory-items", createInventoryItem);

// PUT /api/admin/inventory-items/:id
router.put("/inventory-items/:id", updateInventoryItem);

// DELETE /api/admin/inventory-items/:id
router.delete("/inventory-items/:id", deleteInventoryItem);

// POST /api/admin/inventory/restock/:id
router.post("/inventory/restock/:id", restockItem);

// GET /api/admin/inventory-logs
router.get("/inventory-logs", getInventoryLogs);

// PUT /api/admin/inventory-requests/:id/status
router.put("/inventory-requests/:id/status", updateInventoryRequestStatus);

module.exports = router;
