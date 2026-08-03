const express = require("express");
const router = express.Router();
const {
  getAllInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  restockItem,
  adjustStock,
  getInventoryLogs,
} = require("../controllers/inventoryItemController");
const { updateInventoryRequestStatus, issueInventoryRequest } = require("../controllers/inventoryRequestController");
const { getAllSuppliers, createSupplier, updateSupplier, deleteSupplier } = require("../controllers/inventorySupplierController");
const { getAllAssets, createAsset, updateAsset, deleteAsset, getAllRepairs, createRepair, completeRepair } = require("../controllers/inventoryAssetController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

// All routes require authentication and admin/superadmin role
router.use(authenticate);
router.use(authorizeRoles("admin", "superadmin"));

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

// POST /api/admin/inventory-items/:id/adjust
router.post("/inventory-items/:id/adjust", adjustStock);

// GET /api/admin/inventory-logs
router.get("/inventory-logs", getInventoryLogs);

// PUT /api/admin/inventory-requests/:id/status
router.put("/inventory-requests/:id/status", updateInventoryRequestStatus);

// POST /api/admin/inventory-requests/:id/issue
router.post("/inventory-requests/:id/issue", issueInventoryRequest);
const { getConsumptionReports } = require("../controllers/inventoryIssueController");
const { getDashboardMetrics, getInventoryReports, getItemDetails } = require("../controllers/inventoryReportController");

// GET /api/admin/inventory/reports/consumption
router.get("/inventory/reports/consumption", getConsumptionReports);

// Dashboard & Reports
router.get("/inventory-metrics", getDashboardMetrics);
router.get("/inventory/detailed-reports", getInventoryReports);
router.get("/inventory-items/:id/details", getItemDetails);

// --- Supplier Routes ---
router.get("/inventory-suppliers", getAllSuppliers);
router.post("/inventory-suppliers", createSupplier);
router.put("/inventory-suppliers/:id", updateSupplier);
router.delete("/inventory-suppliers/:id", deleteSupplier);

// --- Asset Routes ---
router.get("/inventory-assets", getAllAssets);
router.post("/inventory-assets", createAsset);
router.put("/inventory-assets/:id", updateAsset);
router.delete("/inventory-assets/:id", deleteAsset);

const { getPublicAssetDetails } = require("../controllers/publicAssetController");
// Protected QR Scan Route
router.get("/assets/scan/:assetId", getPublicAssetDetails);

// --- Repair Routes ---
router.get("/inventory-repairs", getAllRepairs);
router.post("/inventory-repairs", createRepair);
router.put("/inventory-repairs/:id/complete", completeRepair);

module.exports = router;
