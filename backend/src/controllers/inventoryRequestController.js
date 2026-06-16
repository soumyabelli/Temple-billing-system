const InventoryRequest = require("../models/InventoryRequest");
const InventoryItem = require("../models/InventoryItem");
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
      status: item.currentStock < item.minimumStock ? "Low Stock" : "Available",
    }));
    return res.json({ success: true, items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/staff/inventory-requests
exports.createInventoryRequest = async (req, res) => {
  try {
    const { staffId, staffName, itemName, quantity, unit, reason } = req.body;
    const trimmedItemName = clean(itemName);
    const trimmedQuantity = clean(quantity);
    const trimmedUnit = clean(unit);
    const trimmedReason = clean(reason);
    const trimmedStaffId = clean(staffId);
    const trimmedStaffName = clean(staffName);

    if (!trimmedStaffId || !trimmedStaffName || !trimmedItemName || !trimmedQuantity || !trimmedUnit || !trimmedReason) {
      return res.status(400).json({
        success: false,
        message: "staffId, staffName, itemName, quantity, unit and reason are required",
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
      staffId: trimmedStaffId,
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
      staffId: trimmedStaffId,
      staffName: trimmedStaffName,
      itemName: trimmedItemName,
      quantity: trimmedQuantity,
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
      message: `${trimmedStaffName} requested ${trimmedQuantity} ${trimmedUnit} of ${trimmedItemName}.\nReason: ${trimmedReason}`,
      audienceRole: "admin",
      category: "inventory",
    });

    return res.status(201).json({ success: true, request });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/staff/inventory-requests or /api/staff/inventory-requests/:staffId
exports.getInventoryRequests = async (req, res) => {
  try {
    const { staffId } = req.params;
    const query = staffId ? { staffId: clean(staffId) } : {};
    const requests = await InventoryRequest.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/staff/inventory-requests/:staffId/summary
exports.getInventorySummary = async (req, res) => {
  try {
    const { staffId } = req.params;
    const requests = await InventoryRequest.find({ staffId: clean(staffId) });
    const summary = buildInventorySummary(requests);
    return res.json({ success: true, summary });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/staff/inventory-requests/:id/status
exports.updateInventoryRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminReason, reviewedBy } = req.body;
    const normalizedStatus = clean(status);

    if (!INVENTORY_REQUEST_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({ success: false, message: "Invalid inventory request status" });
    }

    if (normalizedStatus === "Rejected" && !clean(adminReason)) {
      return res.status(400).json({
        success: false,
        message: "Reason is required when rejecting inventory requests",
      });
    }

    const updatePayload = {
      status: normalizedStatus,
      adminReason: normalizedStatus === "Pending" ? "" : clean(adminReason),
      reviewedBy: normalizedStatus === "Pending" ? "" : clean(reviewedBy),
      reviewedAt: normalizedStatus === "Pending" ? null : new Date(),
    };

    const updatedRequest = await InventoryRequest.findByIdAndUpdate(id, updatePayload, { new: true });

    if (!updatedRequest) {
      return res.status(404).json({ success: false, message: "Inventory request not found" });
    }

    // If approved: deduct stock from InventoryItem
    if (normalizedStatus === "Approved") {
      const parsedQty = parseFloat(updatedRequest.quantity);
      if (!isNaN(parsedQty) && parsedQty > 0) {
        const inventoryItem = await InventoryItem.findOne({
          name: { $regex: new RegExp(`^${updatedRequest.itemName}$`, "i") },
        });

        if (inventoryItem) {
          inventoryItem.currentStock = Math.max(0, inventoryItem.currentStock - parsedQty);
          await inventoryItem.save();

          // Check if stock fell below minimum after deduction
          if (inventoryItem.currentStock < inventoryItem.minimumStock) {
            await createStaffNotification({
              title: "⚠️ Low Stock Alert",
              message: `${inventoryItem.name} stock is now below minimum level. Current: ${inventoryItem.currentStock} ${inventoryItem.unit}, Minimum: ${inventoryItem.minimumStock} ${inventoryItem.unit}. Please reorder soon.`,
              audienceRole: "admin",
              category: "inventory",
            });
          }
        }
      }
    }

    // Send notification to staff
    if (normalizedStatus === "Approved" || normalizedStatus === "Rejected") {
      const message =
        normalizedStatus === "Rejected"
          ? `Your request for ${updatedRequest.itemName} (${updatedRequest.quantity} ${updatedRequest.unit}) has been rejected.\nReason: ${updatePayload.adminReason}`
          : `✅ Your request for ${updatedRequest.itemName} (${updatedRequest.quantity} ${updatedRequest.unit}) has been approved.`;

      await createStaffNotification({
        title: `🔔 Request ${normalizedStatus}`,
        message,
        audienceId: updatedRequest.staffId,
        category: "inventory",
      });
    }

    return res.json({ success: true, request: updatedRequest });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
