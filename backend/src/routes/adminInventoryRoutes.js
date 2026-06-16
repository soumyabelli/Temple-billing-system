const express = require("express");
const router = express.Router();
const {
  getAllInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} = require("../controllers/inventoryItemController");

// GET /api/admin/inventory-items
router.get("/inventory-items", getAllInventoryItems);

// POST /api/admin/inventory-items
router.post("/inventory-items", createInventoryItem);

// PUT /api/admin/inventory-items/:id
router.put("/inventory-items/:id", updateInventoryItem);

// DELETE /api/admin/inventory-items/:id
router.delete("/inventory-items/:id", deleteInventoryItem);

module.exports = router;
