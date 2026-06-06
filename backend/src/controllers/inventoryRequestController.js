const InventoryRequest = require("../models/InventoryRequest");
const { createStaffNotification } = require("../utils/notificationService");

const INVENTORY_REQUEST_STATUSES = ["Pending", "Approved", "Rejected"];
const INVENTORY_REQUEST_UNITS = ["Kg", "Liter", "Pack", "Pieces"];

const inventoryCatalog = [
  { name: "Camphor", stock: 4, status: "Low Stock" },
  { name: "Flowers", stock: 18, status: "Available" },
  { name: "Ghee", stock: 12, status: "Available" },
  { name: "Agarbathi", stock: 6, status: "Low Stock" },
];

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

exports.getInventoryCatalog = async (req, res) => {
  return res.json({
    success: true,
    items: inventoryCatalog,
  });
};

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

    if (!INVENTORY_REQUEST_UNITS.includes(trimmedUnit)) {
      return res.status(400).json({
        success: false,
        message: `unit must be one of ${INVENTORY_REQUEST_UNITS.join(", ")}`,
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

    await createStaffNotification({
      title: "New Inventory Request",
      message: `${trimmedStaffName} requested: ${trimmedItemName} - ${trimmedQuantity} ${trimmedUnit}`,
      audienceRole: "admin",
      category: "inventory",
    });

    return res.status(201).json({
      success: true,
      request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getInventoryRequests = async (req, res) => {
  try {
    const { staffId } = req.params;
    const query = staffId ? { staffId: clean(staffId) } : {};
    const requests = await InventoryRequest.find(query).sort({ createdAt: -1 });

    return res.json({
      success: true,
      requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getInventorySummary = async (req, res) => {
  try {
    const { staffId } = req.params;
    const requests = await InventoryRequest.find({ staffId: clean(staffId) });
    const summary = buildInventorySummary(requests);

    return res.json({
      success: true,
      summary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateInventoryRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminReason, reviewedBy } = req.body;
    const normalizedStatus = clean(status);

    if (!INVENTORY_REQUEST_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory request status",
      });
    }

    if (normalizedStatus === "Rejected" && !clean(adminReason)) {
      return res.status(400).json({
        success: false,
        message: "Reason is required when rejecting inventory requests",
      });
    }

    const updatePayload = {
      status: normalizedStatus,
      adminReason: clean(adminReason),
      reviewedBy: clean(reviewedBy),
      reviewedAt: normalizedStatus === "Pending" ? null : new Date(),
    };

    if (normalizedStatus === "Pending") {
      updatePayload.adminReason = "";
      updatePayload.reviewedBy = "";
    }

    const updatedRequest = await InventoryRequest.findByIdAndUpdate(id, updatePayload, { new: true });

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: "Inventory request not found",
      });
    }

    if (normalizedStatus === "Approved" || normalizedStatus === "Rejected") {
      const message =
        normalizedStatus === "Rejected"
          ? `Your request for ${updatedRequest.itemName} (${updatedRequest.quantity}) has been rejected. Reason: ${updatePayload.adminReason}`
          : `Your request for ${updatedRequest.itemName} (${updatedRequest.quantity} ${updatedRequest.unit}) has been approved.`;

      await createStaffNotification({
        title: `Inventory Request ${normalizedStatus}`,
        message,
        audienceId: updatedRequest.staffId,
        category: "inventory",
      });
    }

    return res.json({
      success: true,
      request: updatedRequest,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
