const Booking = require("../models/Booking");
const Donation = require("../models/Donation");
const Notification = require("../models/Notification");
const Event = require("../models/Event");
const SupportRequest = require("../models/SupportRequest");
const User = require("../models/User");
const PrasadamOrder = require("../models/PrasadamOrder");
const PRASADAM_MENU = {
  "Laddu Prasadam": 151,
  "Panchamrit Prasadam": 101,
  "Pulihora Prasadam": 121,
  "Sweet Pongal Prasadam": 131,
  "Curd Rice Prasadam": 111,
};

const getBookings = async (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    const bookings = email
      ? await Booking.find({ devoteeEmail: email }).sort({ createdAt: -1 })
      : await Booking.find().sort({ createdAt: -1 });
    return res.status(200).json({ bookings });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load bookings." });
  }
};

const createBooking = async (req, res) => {
  try {
    const { devoteeName, devoteeEmail, service, datetime, amount, status, contactNumber, notes } = req.body;

    if (!devoteeName || !service || !datetime || amount == null) {
      return res.status(400).json({ error: "Missing required booking fields." });
    }

    const booking = await Booking.create({
      devoteeName,
      devoteeEmail: devoteeEmail ? String(devoteeEmail).toLowerCase() : undefined,
      service,
      datetime,
      amount,
      status: status || "Pending",
      contactNumber,
      notes,
    });
    await Notification.create({
      title: "Booking Submitted",
      message: `Your ${service} booking is pending approval.`,
      audienceEmail: devoteeEmail ? String(devoteeEmail).toLowerCase() : undefined,
    });

    return res.status(201).json({ booking });
  } catch (error) {
    return res.status(500).json({ error: "Unable to create booking." });
  }
};

const getDonations = async (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    const donations = email
      ? await Donation.find({ donorEmail: email }).sort({ createdAt: -1 })
      : await Donation.find().sort({ createdAt: -1 });
    return res.status(200).json({ donations });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load donations." });
  }
};

const createDonation = async (req, res) => {
  try {
    const {
      donorName,
      donorEmail,
      amount,
      category = "General",
      paymentMethod = "UPI",
      contactNumber,
      
      transactionId,
      notes,
    } = req.body;

    if (!donorName || amount == null) {
      return res.status(400).json({ error: "donorName and amount are required." });
    }

    const numericAmount = Number(String(amount).replace(/[^0-9.-]+/g, ""));
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: "Donation amount must be a positive number." });
    }

    if (contactNumber && !/^\+?[0-9\s-]{7,15}$/.test(contactNumber.trim())) {
      return res.status(400).json({ error: "Please provide a valid contact number." });
    }

    const donation = await Donation.create({
      donorName: donorName.trim(),
      donorEmail: donorEmail ? String(donorEmail).trim().toLowerCase() : undefined,
      amount: numericAmount,
      category,
      paymentMethod,
      contactNumber,
      transactionId,
      notes,
      status: "Completed",
    });

    await Notification.create({
      title: "Donation Received",
      message: `${donorName.trim()} donated INR ${numericAmount} for ${category}.`,
      audienceEmail: donorEmail ? String(donorEmail).toLowerCase() : undefined,
    });

    return res.status(201).json({ donation });
  } catch (error) {
    return res.status(500).json({ error: "Unable to create donation." });
  }
};

const getNotifications = async (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    const notifications = email
      ? await Notification.find({ $or: [{ audienceEmail: email }, { audienceEmail: { $exists: false } }, { audienceEmail: null }] }).sort({ date: -1, createdAt: -1 })
      : await Notification.find().sort({ date: -1, createdAt: -1 });
    return res.status(200).json({ notifications });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load notifications." });
  }
};

const getProfile = async (req, res) => {
  try {
    if (req.query.email) {
      const user = await User.findOne({ email: req.query.email }).select("-password");
      if (user) {
        return res.status(200).json({ profile: { name: user.name, email: user.email, role: user.role || "devotee", memberSince: user.createdAt?.getFullYear?.() || "2025" } });
      }
    }

    return res.status(200).json({
      profile: {
        name: "Devotee User",
        email: "devotee@example.com",
        role: "devotee",
        memberSince: "2025",
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load profile." });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    return res.status(200).json({ events });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load events." });
  }
};

const submitSupportRequest = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: "Please provide a subject and message." });
    }

    const supportRequest = await SupportRequest.create({
      name: name || "Anonymous Devotee",
      email: email || "support@devotee.com",
      subject,
      message,
    });

    await Notification.create({
      title: "New Support Request",
      message: `${supportRequest.name} raised: ${supportRequest.subject}`,
    });

    return res.status(201).json({ status: "success", message: "Support request received.", request: supportRequest });
  } catch (error) {
    return res.status(500).json({ error: "Failed to submit support request." });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { currentEmail, name, email } = req.body;
    if (!currentEmail) {
      return res.status(400).json({ error: "currentEmail is required." });
    }

    const user = await User.findOne({ email: currentEmail.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: "Profile not found." });
    }

    if (name && String(name).trim()) user.name = String(name).trim();
    if (email && String(email).trim()) user.email = String(email).trim().toLowerCase();
    await user.save();

    await Notification.create({
      title: "Profile Updated",
      message: `${user.name} updated devotee profile details.`,
    });

    return res.status(200).json({
      profile: {
        name: user.name,
        email: user.email,
        role: user.role || "devotee",
        memberSince: user.createdAt?.getFullYear?.() || "2025",
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: "Email already exists. Please use a different email." });
    }
    return res.status(500).json({ error: "Failed to update profile." });
  }
};

const getSupportRequests = async (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    const filter = email ? { email } : {};
    const requests = await SupportRequest.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ requests });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load support requests." });
  }
};

const replySupportRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply, status } = req.body;
    if (!reply) {
      return res.status(400).json({ error: "Reply text is required." });
    }

    const supportRequest = await SupportRequest.findById(id);
    if (!supportRequest) {
      return res.status(404).json({ error: "Support request not found." });
    }

    supportRequest.reply = String(reply).trim();
    if (status && ["Open", "In Progress", "Closed"].includes(status)) {
      supportRequest.status = status;
    } else {
      supportRequest.status = "Closed";
    }
    await supportRequest.save();

    await Notification.create({
      title: "Feedback Response",
      message: `Your feedback on '${supportRequest.subject}' has been replied to.`,
      audienceEmail: supportRequest.email,
    });

    return res.status(200).json({ request: supportRequest });
  } catch (error) {
    return res.status(500).json({ error: "Failed to reply to support request." });
  }
};

const createNotification = async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) return res.status(400).json({ error: "title and message are required." });
    const notification = await Notification.create({ title, message });
    return res.status(201).json({ notification });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create notification." });
  }
};

const getPrasadamOrders = async (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    const orders = email
      ? await PrasadamOrder.find({ email }).sort({ createdAt: -1 })
      : await PrasadamOrder.find().sort({ createdAt: -1 });
    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load prasadam orders." });
  }
};

const createPrasadamOrder = async (req, res) => {
  try {
    const { devoteeName, email, itemName, quantity, paymentMethod } = req.body;
    if (!devoteeName || !itemName) {
      return res.status(400).json({ error: "devoteeName and itemName are required." });
    }

    const normalizedQty = Number(quantity || 1);
    if (Number.isNaN(normalizedQty) || normalizedQty < 1) {
      return res.status(400).json({ error: "Quantity must be at least 1." });
    }
    const unitPrice = PRASADAM_MENU[itemName];
    if (!unitPrice) {
      return res.status(400).json({ error: "Selected prasadam item is not available in temple menu." });
    }
    const totalAmount = unitPrice * normalizedQty;

    const order = await PrasadamOrder.create({
      devoteeName,
      email,
      itemName,
      quantity: normalizedQty,
      unitPrice,
      amount: totalAmount,
      paymentMethod: paymentMethod || "UPI",
      status: "Placed",
    });

    await Notification.create({
      title: "New Prasadam Order",
      message: `${devoteeName} ordered ${itemName} x${normalizedQty}.`,
      audienceEmail: email ? String(email).toLowerCase() : undefined,
    });

    return res.status(201).json({ order });
  } catch (error) {
    return res.status(500).json({ error: "Failed to place prasadam order." });
  }
};

const cancelPrasadamOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await PrasadamOrder.findById(id);
    if (!order) return res.status(404).json({ error: "Prasadam order not found." });
    if (order.status === "Cancelled") return res.status(200).json({ order });
    order.status = "Cancelled";
    await order.save();
    await Notification.create({
      title: "Prasadam Order Cancelled",
      message: `${order.devoteeName} cancelled ${order.itemName} order.`,
      audienceEmail: order.email || undefined,
    });
    return res.status(200).json({ order });
  } catch (error) {
    return res.status(500).json({ error: "Failed to cancel prasadam order." });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["Confirmed", "Rejected", "Cancelled", "Pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid booking status." });
    }
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: "Booking not found." });
    booking.status = status;
    await booking.save();
    await Notification.create({
      title: "Booking Status Updated",
      message: `Your ${booking.service} booking is now ${status}.`,
      audienceEmail: booking.devoteeEmail || undefined,
    });
    return res.status(200).json({ booking });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update booking status." });
  }
};

module.exports = {
  getBookings,
  createBooking,
  getDonations,
  createDonation,
  getNotifications,
  getProfile,
  getEvents,
  submitSupportRequest,
  updateProfile,
  getSupportRequests,
  replySupportRequest,
  createNotification,
  getPrasadamOrders,
  createPrasadamOrder,
  cancelPrasadamOrder,
  updateBookingStatus,
};
