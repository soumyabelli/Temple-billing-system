const InventoryRequest = require("../models/InventoryRequest");
const InventoryItem = require("../models/InventoryItem");
const InventoryLog = require("../models/InventoryLog");
const { createStaffNotification } = require("../utils/notificationService");
const { seedDefaultItems } = require("./inventoryItemController");

const INVENTORY_REQUEST_STATUSES = ["Pending", "Approved", "Rejected"];

const clean = (value) => String(value || "").trim();

const buildInventorySummary = (requests) => {
  return requests.reduce(
    (summary, request) => {
      summary.total += 1;
      if (request.status === "Pending") summary.pending += 1;
      if (request.status === "Approved") summary.approved += 1;
      if (request.status === "Rejected") summary.rejected += 1;
      return summary;
    },
    { total: 0, pending: 0, approved: 0, rejected: 0 }
  );
};

// GET /api/staff/inventory/catalog — live stock from DB
exports.getInventoryCatalog = async (req, res) => {
  try {
    await seedDefaultItems();
    const dbItems = await InventoryItem.find().sort({ name: 1 });
    const items = dbItems.map((item) => ({
      _id: item._id,
      name: item.name,
      unit: item.unit,
      stock: item.currentStock,
      minimumStock: item.minimumStock,
      status: item.currentStock === 0 ? "Out Of Stock" : item.currentStock <= item.minimumStock ? "Low Stock" : "Available",
    }));
    return res.json({ success: true, items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/staff/inventory-requests (and /api/priest/inventory-requests)
exports.createInventoryRequest = async (req, res) => {
  try {
    const { userId, staffId, userName, staffName, role, itemName, quantity, unit, reason, requestedBy } = req.body;
    const trimmedItemName = clean(itemName);
    const trimmedQuantity = clean(quantity);
    const trimmedUnit = clean(unit);
    const trimmedReason = clean(reason);
    const trimmedUserId = clean(userId || staffId);
    const trimmedUserName = clean(userName || staffName || requestedBy);
    const requestRole = clean(role) || "Staff";

    if (!trimmedUserId || !trimmedUserName || !trimmedItemName || !trimmedQuantity || !trimmedUnit || !trimmedReason) {
      return res.status(400).json({
        success: false,
        message: "userId, userName, itemName, quantity, unit and reason are required",
      });
    }

    // Validate quantity is a positive number
    const parsedQty = parseFloat(trimmedQuantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive number.",
      });
    }

    // Duplicate check: same staffId + itemName + Pending request today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const duplicate = await InventoryRequest.findOne({
      userId: trimmedUserId,
      itemName: trimmedItemName,
      status: "Pending",
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: `Request already submitted for ${trimmedItemName} today. Please wait for the pending request to be reviewed.`,
      });
    }

    const request = await InventoryRequest.create({
      userId: trimmedUserId,
      userName: trimmedUserName,
      role: requestRole,
      requestedBy: trimmedUserName,
      itemName: trimmedItemName,
      quantity: parsedQty,
      unit: trimmedUnit,
      reason: trimmedReason,
      status: "Pending",
      adminReason: "",
      reviewedBy: "",
      reviewedAt: null,
    });

    // Notify admin
    await createStaffNotification({
      title: "🔔 New Inventory Request",
      message: `${trimmedUserName} (${requestRole}) requested ${parsedQty} ${trimmedUnit} of ${trimmedItemName}.\nReason: ${trimmedReason}`,
      audienceRole: "admin",
      category: "inventory",
    });

    return res.status(201).json({ success: true, request });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/staff/inventory-requests or /api/staff/inventory-requests/:userId
exports.getInventoryRequests = async (req, res) => {
  try {
    const { staffId, userId } = req.params;
    const id = clean(userId || staffId);
    const query = id ? { userId: id } : {};
    const requests = await InventoryRequest.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/staff/inventory-requests/:userId/summary
exports.getInventorySummary = async (req, res) => {
  try {
    const { staffId, userId } = req.params;
    const id = clean(userId || staffId);
    const requests = await InventoryRequest.find({ userId: id });
    const summary = buildInventorySummary(requests);
    return res.json({ success: true, summary });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/inventory-requests/:id/status
exports.updateInventoryRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminReason, rejectionReason, reviewedBy } = req.body;
    const normalizedStatus = clean(status);

    if (!INVENTORY_REQUEST_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({ success: false, message: "Invalid inventory request status" });
    }

    if (normalizedStatus === "Rejected" && !clean(adminReason) && !clean(rejectionReason)) {
      return res.status(400).json({
        success: false,
        message: "Reason is required when rejecting inventory requests",
      });
    }

    const request = await InventoryRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Inventory request not found" });
    }

    if (normalizedStatus === "Approved") {
      if (request.status === "Approved") {
        return res.status(400).json({ success: false, message: "This request has already been approved." });
      }
      if (request.status === "Rejected") {
        return res.status(400).json({ success: false, message: "Cannot approve a rejected request." });
      }

      const inventoryItem = await InventoryItem.findOne({
        name: { $regex: new RegExp(`^${request.itemName}$`, "i") },
      });

      if (!inventoryItem) {
        return res.status(404).json({ success: false, message: "Inventory item not found." });
      }

      const parsedQty = parseFloat(request.quantity);
      if (inventoryItem.currentStock < parsedQty) {
        return res.status(400).json({ success: false, message: "Insufficient inventory stock." });
      }

      const stockBefore = inventoryItem.currentStock;
      inventoryItem.currentStock -= parsedQty;
      const stockAfter = inventoryItem.currentStock;

      await inventoryItem.save();

      console.log(`[Inventory Approval Success]
- Request ID: ${request._id}
- Item Name: ${request.itemName}
- Quantity Approved: ${parsedQty}
- Stock Before: ${stockBefore}
- Stock After: ${stockAfter}
- Employee Name: ${request.userName}
- Approval Time: ${new Date().toISOString()}`);

      request.status = "Approved";
      request.adminReason = clean(adminReason);
      request.reviewedBy = clean(reviewedBy) || (req.user ? req.user.name : "Admin");
      request.reviewedAt = new Date();
      request.approvedBy = clean(reviewedBy) || (req.user ? req.user.name : "Admin");
      request.approvedAt = new Date();
      await request.save();

      await InventoryLog.create({
        item: inventoryItem._id,
        action: "Consumed",
        quantity: parsedQty,
        oldStock: stockBefore,
        newStock: stockAfter,
        user: req.user ? req.user.id : null,
      });

      await createStaffNotification({
        title: "🔔 Request Approved",
        message: `✅ Your request for ${request.itemName} (${request.quantity} ${request.unit}) has been approved.`,
        audienceId: request.userId,
        category: "inventory",
      });

      // Check for low stock alert
      if (inventoryItem.currentStock <= inventoryItem.minimumStock) {
        await createStaffNotification({
          title: "⚠️ Low Stock Alert",
          message: `${inventoryItem.name} stock is now at or below minimum level. Current: ${inventoryItem.currentStock} ${inventoryItem.unit}, Minimum: ${inventoryItem.minimumStock} ${inventoryItem.unit}. Please reorder soon.`,
          audienceRole: "admin",
          category: "inventory",
        });
      }
    } else if (normalizedStatus === "Rejected") {
      if (request.status === "Approved") {
        return res.status(400).json({ success: false, message: "Cannot reject an already approved request." });
      }
      if (request.status === "Rejected") {
        return res.status(400).json({ success: false, message: "This request has already been rejected." });
      }

      request.status = "Rejected";
      request.adminReason = clean(adminReason) || clean(rejectionReason);
      request.rejectionReason = clean(rejectionReason) || clean(adminReason);
      request.reviewedBy = clean(reviewedBy) || (req.user ? req.user.name : "Admin");
      request.reviewedAt = new Date();
      request.rejectedAt = new Date();
      await request.save();

      await createStaffNotification({
        title: "🔔 Request Rejected",
        message: `Your request for ${request.itemName} (${request.quantity} ${request.unit}) has been rejected.\nReason: ${request.adminReason}`,
        audienceId: request.userId,
        category: "inventory",
      });
    }

    return res.json({ success: true, request });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
