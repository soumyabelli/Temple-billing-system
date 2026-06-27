const PrasadamOrder = require("../models/PrasadamOrder");
const Prasadam = require("../models/Prasadam");
const { createStaffNotification } = require("../utils/notificationService");

const clean = (v) => String(v || "").trim();

const ALLOWED_ORDER_STATUSES = [
  "Pending",
  "Approved",
  "Processing",
  "Ready for Pickup",
  "Completed",
  "Cancelled",
];

const mapToModelStatus = (incoming) => {
  switch (incoming) {
    case "Pending":
      return "Placed";
    case "Approved":
      return "Placed";
    case "Processing":
      return "Preparing";
    case "Ready for Pickup":
      return "Ready";
    case "Completed":
      return "Delivered";
    case "Cancelled":
      return "Cancelled";
    default:
      return null;
  }
};

const mapFromModelStatus = (modelStatus) => {
  switch (modelStatus) {
    case "Placed":
      return "Pending";
    case "Preparing":
      return "Processing";
    case "Ready":
      return "Ready for Pickup";
    case "Delivered":
      return "Completed";
    case "Cancelled":
      return "Cancelled";
    default:
      return modelStatus || "Pending";
  }
};

const buildOrderList = (orders) => {
  return orders.map((o) => ({
    ...(o.toObject?.() || o),
    orderStatusDisplay: mapFromModelStatus(o.status),
  }));
};

// GET /api/admin/prasadam-orders
exports.getAdminPrasadamOrders = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      startDate = "",
      endDate = "",
      page = "1",
      limit = "10",
    } = req.query;

    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (p - 1) * l;

    const q = clean(search).toLowerCase();

    let modelStatusFilter = null;
    const normalizedStatus = clean(status);
    if (normalizedStatus) {
      const mapped = mapToModelStatus(normalizedStatus);
      if (mapped) modelStatusFilter = mapped;
    }

    const dateFilter = {};
    const sd = startDate ? new Date(startDate) : null;
    const ed = endDate ? new Date(endDate) : null;
    if (sd && !Number.isNaN(sd.getTime())) dateFilter.$gte = sd;
    if (ed && !Number.isNaN(ed.getTime())) {
      ed.setHours(23, 59, 59, 999);
      dateFilter.$lte = ed;
    }

    const mongoQuery = {};
    if (modelStatusFilter) mongoQuery.status = modelStatusFilter;
    if (Object.keys(dateFilter).length) mongoQuery.createdAt = dateFilter;

    if (q) {
      mongoQuery.$or = [
        { devoteeName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { itemName: { $regex: q, $options: "i" } },
        { amount: { $regex: q } },
        { cashierName: { $regex: q, $options: "i" } },
      ];
    }

    const [total, orders] = await Promise.all([
      PrasadamOrder.countDocuments(mongoQuery),
      PrasadamOrder.find(mongoQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(l),
    ]);

    return res.json({
      orders: buildOrderList(orders),
      total,
      page: p,
      limit: l,
      totalPages: Math.max(1, Math.ceil(total / l)),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/prasadam-orders/:id
exports.getAdminPrasadamOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await PrasadamOrder.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const obj = order.toObject?.() || order;
    obj.orderStatusDisplay = mapFromModelStatus(order.status);
    return res.json({ success: true, order: obj });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/prasadam-orders/:id/status
exports.updateAdminPrasadamOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminReason = "" } = req.body;

    const incoming = clean(status);
    if (!incoming || !ALLOWED_ORDER_STATUSES.includes(incoming)) {
      return res.status(400).json({ success: false, message: "Invalid order status" });
    }

    const order = await PrasadamOrder.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const modelStatus = mapToModelStatus(incoming);
    if (!modelStatus) {
      return res.status(400).json({ success: false, message: "Invalid status mapping" });
    }

    const prevModelStatus = order.status;
    order.status = modelStatus;
    await order.save();

    await createStaffNotification({
      title: `🔔 Prasadam Order Updated`,
      message: `${order.devoteeName || order.customerName || "Guest"} - ${order.itemName} status changed: ${prevModelStatus} → ${modelStatus}$${adminReason ? `\\nReason: ${adminReason}` : ""}`.replace("$${", "${"),
      audienceRole: "admin",
      category: "prasadam",
    }).catch(() => {});

    const obj = order.toObject?.() || order;
    obj.orderStatusDisplay = mapFromModelStatus(order.status);

    return res.json({ success: true, order: obj });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

