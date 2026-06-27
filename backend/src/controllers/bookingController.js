const Booking = require("../models/Booking");

// ─── Status transition rules ─────────────────────────────────────────────────
// Maps each status to the set of statuses it is allowed to transition TO.
const ALLOWED_TRANSITIONS = {
  Booked:       ["Approved", "Rejected", "Cancelled"],
  Pending:      ["Approved", "Rejected", "Cancelled"],
  Approved:     ["Confirmed", "Cancelled"],
  Confirmed:    ["Assigned", "Cancelled"],
  Assigned:     ["In Progress", "Cancelled"],
  "In Progress": ["Completed"],
  Completed:    [],  // terminal
  Rejected:     [],  // terminal
  Cancelled:    [],  // terminal
  Upcoming:     ["Approved", "Rejected", "Cancelled"],
};

// ─── Helper: is the pooja date in the past? ──────────────────────────────────
const isPastDate = (booking) => {
  if (!booking.datetime) return false;
  const poojaDate = new Date(booking.datetime);
  return !isNaN(poojaDate.getTime()) && poojaDate < new Date();
};

// ─── getDashboardBookings ─────────────────────────────────────────────────────
const getDashboardBookings = async (req, res) => {
  try {
    const latestBookings = await Booking.find().sort({ createdAt: -1 }).limit(10);

    const statsAgg = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          completed:     { $sum: { $cond: [{ $eq: ["$status", "Completed"] },    1, 0] } },
          pending:       { $sum: { $cond: [{ $in:  ["$status", ["Pending", "Booked"]] }, 1, 0] } },
          confirmed:     { $sum: { $cond: [{ $eq: ["$status", "Confirmed"] },    1, 0] } },
          approved:      { $sum: { $cond: [{ $eq: ["$status", "Approved"] },     1, 0] } },
          assigned:      { $sum: { $cond: [{ $eq: ["$status", "Assigned"] },     1, 0] } },
          inProgress:    { $sum: { $cond: [{ $eq: ["$status", "In Progress"] },  1, 0] } },
          rejected:      { $sum: { $cond: [{ $eq: ["$status", "Rejected"] },     1, 0] } },
          cancelled:     { $sum: { $cond: [{ $eq: ["$status", "Cancelled"] },    1, 0] } },
          totalRevenue:  { $sum: "$amount" },
          todays: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", new Date(new Date().setHours(0, 0, 0, 0))] },
                    { $lt:  ["$createdAt", new Date(new Date().setHours(23, 59, 59, 999))] },
                  ],
                },
                1, 0,
              ],
            },
          },
          upcoming: {
            $sum: {
              $cond: [
                { $in: ["$status", ["Confirmed", "Approved", "Pending", "Booked", "Assigned"]] },
                1, 0,
              ],
            },
          },
        },
      },
    ]);

    const stats = statsAgg[0] || {
      totalBookings: 0, completed: 0, pending: 0, confirmed: 0,
      approved: 0, assigned: 0, inProgress: 0, rejected: 0, cancelled: 0,
      totalRevenue: 0, todays: 0, upcoming: 0,
    };

    res.status(200).json({ latestBookings, stats });
  } catch (error) {
    console.error("getDashboardBookings error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard bookings" });
  }
};

// ─── getAllBookings ────────────────────────────────────────────────────────────
const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, dateRange, dateFrom, dateTo } = req.query;
    const query = {};

    if (search) {
      const conditions = [
        { devoteeName: { $regex: search, $options: "i" } },
        { service: { $regex: search, $options: "i" } },
        { devoteePhone: { $regex: search, $options: "i" } },
        { bookingNumber: { $regex: search, $options: "i" } },
      ];
      const idSearchStr = search.replace(/^BK-?/i, "");
      if (/^[a-f0-9]{1,24}$/i.test(idSearchStr)) {
        conditions.push({
          $expr: {
            $regexMatch: { input: { $toString: "$_id" }, regex: idSearchStr, options: "i" },
          },
        });
      }
      query.$or = conditions;
    }

    if (status) {
      query.status = status;
    }

    // Named date range presets
    if (dateRange) {
      const now = new Date();
      if (dateRange === "Today") {
        query.createdAt = {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          $lt:  new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        };
      } else if (dateRange === "Upcoming") {
        query.status = { $in: ["Booked", "Pending", "Approved", "Confirmed", "Assigned"] };
      } else if (dateRange === "Last 7 Days") {
        const start = new Date();
        start.setDate(start.getDate() - 7);
        query.createdAt = { $gte: start };
      } else if (dateRange === "This Month") {
        query.createdAt = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
      }
    }

    // Custom date range
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        query.createdAt.$lte = to;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const bookings = await Booking.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await Booking.countDocuments(query);

    res.status(200).json({
      bookings,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      totalRecords: total,
    });
  } catch (error) {
    console.error("getAllBookings error:", error);
    res.status(500).json({ error: "Failed to fetch all bookings" });
  }
};

// ─── updateBookingStatus ──────────────────────────────────────────────────────
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, updatedBy } = req.body;

    if (!status) {
      return res.status(400).json({ message: "New status is required." });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    const currentStatus = booking.status;

    // Validate the transition
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Cannot transition from "${currentStatus}" to "${status}". Invalid status transition.`,
        currentStatus,
        requestedStatus: status,
        allowedTransitions: allowed,
      });
    }

    // Block approve/reject if pooja date has already passed
    if (["Approved"].includes(status) && isPastDate(booking)) {
      return res.status(400).json({
        message: "Booking date has already passed. Cannot approve this booking.",
      });
    }
    if (["Rejected"].includes(status) && isPastDate(booking) && !["Booked", "Pending", "Upcoming"].includes(currentStatus)) {
      return res.status(400).json({
        message: "Booking date has already passed. Cannot reject at this stage.",
      });
    }

    // Record history entry
    const historyEntry = {
      previousStatus: currentStatus,
      newStatus: status,
      updatedBy: updatedBy || "Admin",
      note: note || "",
      updatedAt: new Date(),
    };

    // Apply status-specific timestamps
    if (status === "Approved")      booking.approvedAt = new Date();
    if (status === "Rejected")      booking.rejectedAt = new Date();
    if (status === "In Progress")   booking.startedAt  = new Date();
    if (status === "Completed")     booking.completedAt = new Date();

    booking.status = status;
    booking.bookingHistory.push(historyEntry);
    await booking.save();

    res.status(200).json({
      message: `Booking status updated to "${status}" successfully.`,
      booking,
    });
  } catch (error) {
    console.error("updateBookingStatus error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ─── getBookingReceipt ────────────────────────────────────────────────────────
const getBookingReceipt = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    const gst = booking.gst || 0;
    const baseAmount = booking.amount || 0;
    const totalAmount = baseAmount + gst;

    const receipt = {
      receiptNumber: `RC-${booking.bookingNumber || String(booking._id).slice(-6).toUpperCase()}`,
      bookingId: `BK${String(booking._id).slice(-6).toUpperCase()}`,
      bookingNumber: booking.bookingNumber,
      transactionId: booking.transactionId || "N/A",
      devotee: {
        name:   booking.devoteeName,
        mobile: booking.devoteePhone || booking.contactNumber || "N/A",
        email:  booking.devoteeEmail || "N/A",
      },
      pooja: {
        name:   booking.service,
        date:   booking.datetime,
        slot:   booking.datetime ? new Date(booking.datetime).toLocaleTimeString("en-IN") : "N/A",
        priest: booking.priestName || "Not Assigned",
      },
      payment: {
        baseAmount,
        gst,
        totalAmount,
        method: booking.paymentMethod || "UPI",
        status: booking.paymentStatus || "Pending",
      },
      status:    booking.status,
      createdAt: booking.createdAt,
      history:   booking.bookingHistory || [],
    };

    res.status(200).json({ receipt, booking });
  } catch (error) {
    console.error("getBookingReceipt error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ─── getBookingById ───────────────────────────────────────────────────────────
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }
    res.status(200).json({ booking });
  } catch (error) {
    console.error("getBookingById error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getDashboardBookings,
  getAllBookings,
  updateBookingStatus,
  getBookingReceipt,
  getBookingById,
};
