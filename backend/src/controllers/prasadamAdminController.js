const PrasadamOrder = require("../models/PrasadamOrder");
const Prasadam = require("../models/Prasadam");
const Booking = require("../models/Booking");
const Bill = require("../models/Bill");
const { createStaffNotification } = require("../utils/notificationService");

const clean = (v) => String(v || "").trim();

const ALLOWED_ORDER_STATUSES = [
  "Collected",
  "Not Collected",
  "Pending",
  "Approved",
  "Rejected",
  "Processing",
  "Ready for Pickup",
  "Completed",
  "Cancelled",
];

const mapToModelStatuses = (incoming) => {
  if (incoming === "Collected") return ["Collected"];
  if (incoming === "Not Collected") return ["Not Collected"];
  switch (incoming) {
    case "Pending":
      return ["Pending", "Placed", "Not Collected"];
    case "Approved":
      return ["Approved"];
    case "Rejected":
      return ["Rejected"];
    case "Processing":
      return ["Processing", "Preparing"];
    case "Ready for Pickup":
      return ["Ready for Pickup", "Ready"];
    case "Completed":
      return ["Completed", "Delivered", "Collected"];
    case "Cancelled":
      return ["Cancelled"];
    default:
      return [incoming];
  }
};

const mapFromModelStatus = (modelStatus) => {
  if (modelStatus === "Collected") return "Collected";
  if (modelStatus === "Not Collected") return "Not Collected";
  switch (modelStatus) {
    case "Pending":
      return "Not Collected";
    case "Approved":
      return "Collected";
    case "Rejected":
      return "Not Collected";
    case "Processing":
      return "Not Collected";
    case "Ready for Pickup":
      return "Collected";
    case "Completed":
      return "Collected";
    case "Placed":
      return "Not Collected";
    case "Preparing":
      return "Not Collected";
    case "Ready":
      return "Collected";
    case "Delivered":
      return "Collected";
    case "Cancelled":
      return "Not Collected";
    default:
      return modelStatus || "Not Collected";
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
      bookingMode = "",
      startDate = "",
      endDate = "",
      page = "1",
      limit = "50",
    } = req.query;

    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(500, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (p - 1) * l;

    const q = clean(search).toLowerCase();
    const normalizedStatus = clean(status);
    const normalizedMode = clean(bookingMode).toLowerCase();

    const sd = startDate ? new Date(startDate) : null;
    const ed = endDate ? new Date(endDate) : null;
    if (ed && !Number.isNaN(ed.getTime())) {
      ed.setHours(23, 59, 59, 999);
    }

    // 1. Standalone Prasadam Orders (from PrasadamOrder collection)
    const rawOrders = await PrasadamOrder.find().sort({ createdAt: -1 });
    const standalone = rawOrders.map((o) => {
      const obj = o.toObject ? o.toObject() : { ...o };
      const isCash = obj.paymentMethod === "Cash" || obj.paymentMethod === "Offline Payment";
      const isCashier = obj.channel === "cashier";
      const mode = (isCash || isCashier) ? "Offline" : "Online";
      const display = mapFromModelStatus(obj.status);
      return {
        ...obj,
        _id: String(obj._id),
        orderId: `PR-${String(obj._id).slice(-6).toUpperCase()}`,
        orderStatusDisplay: display,
        status: display,
        bookingSource: "Prasada Only",
        bookingMode: mode,
        channel: isCashier ? "cashier" : "devotee",
        isCombinedOrder: false,
      };
    });

    // 2. Bookings with Prasadam (from Booking collection: Pooja + Prasada or Cart Bookings)
    const rawBookings = await Booking.find({
      $or: [
        { isCombined: true },
        { "items.0": { $exists: true } },
        { service: /prasada/i },
      ],
    }).sort({ createdAt: -1 });

    const combined = [];
    rawBookings.forEach((b) => {
      const pItems = (b.items || []).filter(
        (i) => (i.type && i.type.toLowerCase() === "prasadam") || (i.name && /prasada/i.test(i.name))
      );
      const poojaNames = (b.items || [])
        .filter((i) => i.type && i.type.toLowerCase() === "pooja")
        .map((i) => i.name)
        .join(", ");
      const hasPooja = poojaNames.length > 0;
      const isCash = b.paymentMethod === "Cash" || b.paymentMethod === "Offline Payment";
      const mode = isCash ? "Offline" : "Online";
      const orderStatus = (b.paymentStatus === "Paid" || b.status === "Completed" || b.status === "Confirmed")
        ? "Collected"
        : "Not Collected";

      if (pItems.length > 0) {
        pItems.forEach((pi, idx) => {
          combined.push({
            _id: `${b._id}_${idx}`,
            bookingId: b._id,
            orderId: b.bookingNumber || `CB-${String(b._id).slice(-6).toUpperCase()}`,
            bookingNumber: b.bookingNumber,
            devoteeName: b.devoteeName || "Devotee",
            email: b.devoteeEmail || "",
            phone: b.devoteePhone || b.contactNumber || "",
            itemName: pi.name || "Prasadam",
            quantity: pi.quantity || pi.qty || 1,
            unitPrice: pi.price || (pi.amount ? Math.round(pi.amount / (pi.quantity || pi.qty || 1)) : 0),
            amount: pi.amount || Number(pi.price || 0) * (pi.quantity || pi.qty || 1),
            paymentMethod: b.paymentMethod || "UPI",
            status: orderStatus,
            orderStatusDisplay: orderStatus,
            bookingSource: hasPooja ? (poojaNames ? `With Pooja (${poojaNames})` : "Along with Pooja") : "Prasada Only",
            bookingMode: mode,
            channel: isCash ? "cashier" : "devotee",
            createdAt: b.createdAt || b.date,
            isCombinedOrder: true,
            poojaName: poojaNames,
          });
        });
      } else if (/prasada/i.test(b.service)) {
        combined.push({
          _id: String(b._id),
          bookingId: b._id,
          orderId: b.bookingNumber || `PB-${String(b._id).slice(-6).toUpperCase()}`,
          bookingNumber: b.bookingNumber,
          devoteeName: b.devoteeName || "Devotee",
          email: b.devoteeEmail || "",
          phone: b.devoteePhone || b.contactNumber || "",
          itemName: b.service,
          quantity: 1,
          unitPrice: b.amount,
          amount: b.amount,
          paymentMethod: b.paymentMethod || "UPI",
          status: orderStatus,
          orderStatusDisplay: orderStatus,
          bookingSource: "Prasada Only",
          bookingMode: mode,
          channel: isCash ? "cashier" : "devotee",
          createdAt: b.createdAt || b.date,
          isCombinedOrder: false,
        });
      }
    });

    let merged = [...standalone, ...combined].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    // Apply date filter
    if (sd && !Number.isNaN(sd.getTime())) {
      merged = merged.filter((o) => new Date(o.createdAt) >= sd);
    }
    if (ed && !Number.isNaN(ed.getTime())) {
      merged = merged.filter((o) => new Date(o.createdAt) <= ed);
    }

    // Apply status filter
    if (normalizedStatus) {
      merged = merged.filter(
        (o) => o.orderStatusDisplay === normalizedStatus || o.status === normalizedStatus
      );
    }

    // Apply booking mode filter (Online / Offline)
    if (normalizedMode) {
      merged = merged.filter((o) => (o.bookingMode || "").toLowerCase() === normalizedMode);
    }

    // Apply search query
    if (q) {
      merged = merged.filter(
        (o) =>
          String(o.devoteeName || "").toLowerCase().includes(q) ||
          String(o.email || "").toLowerCase().includes(q) ||
          String(o.phone || "").includes(q) ||
          String(o.itemName || "").toLowerCase().includes(q) ||
          String(o.orderId || "").toLowerCase().includes(q) ||
          String(o.bookingSource || "").toLowerCase().includes(q) ||
          String(o.paymentMethod || "").toLowerCase().includes(q) ||
          String(o.bookingMode || "").toLowerCase().includes(q)
      );
    }

    const total = merged.length;
    const paginated = merged.slice(skip, skip + l);

    return res.json({
      orders: paginated,
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

    const mappedStatuses = mapToModelStatuses(incoming);
    const modelStatus = mappedStatuses[0];
    if (!modelStatus) {
      return res.status(400).json({ success: false, message: "Invalid status mapping" });
    }

    const prevModelStatus = order.status;
    order.status = modelStatus;
    await order.save();

    // Sync bill ledger status as well
    await Bill.updateMany(
      { sourceId: order._id.toString() },
      { $set: { status: modelStatus === "Collected" || modelStatus === "Completed" || modelStatus === "Delivered" || modelStatus === "Ready" ? "Paid" : "Pending" } }
    );

    const isPaidStatus = ["Collected", "Completed", "Delivered", "Ready"].includes(modelStatus);
    const wasPaidStatus = ["Collected", "Completed", "Delivered", "Ready"].includes(prevModelStatus);

    if (!wasPaidStatus && isPaidStatus) {
      const { recordTransaction } = require("../services/accountingService");
      await recordTransaction({
        transactionType: "Credit",
        source: "Prasadam",
        category: "Prasadam Sales",
        amount: order.amount,
        paymentMethod: order.paymentMethod || "System",
        description: `Prasadam Order: ${order.orderNumber || order._id}`,
        referenceId: order._id,
        referenceModel: "PrasadamOrder",
        recordedBy: req.user ? req.user.id : null,
        status: "Completed"
      });
    } else if (wasPaidStatus && modelStatus === "Cancelled") {
      const { recordTransaction } = require("../services/accountingService");
      await recordTransaction({
        transactionType: "Debit",
        source: "Prasadam",
        category: "Refund Account",
        amount: order.amount,
        paymentMethod: order.paymentMethod || "System",
        description: `Refund for Cancelled Prasadam Order: ${order.orderNumber || order._id}`,
        referenceId: order._id,
        referenceModel: "PrasadamOrder",
        recordedBy: req.user ? req.user.id : null,
        status: "Completed"
      });
    }

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

exports.deleteAdminPrasadamOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await PrasadamOrder.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    await Promise.all([
      PrasadamOrder.deleteOne({ _id: id }),
      Bill.deleteMany({ sourceId: String(id) }),
    ]);

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
