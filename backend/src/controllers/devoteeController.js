const Booking = require("../models/Booking");
const Donation = require("../models/Donation");
const Notification = require("../models/Notification");
const Event = require("../models/Event");
const SupportRequest = require("../models/SupportRequest");
const User = require("../models/User");

const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    return res.status(200).json({ bookings });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load bookings." });
  }
};

const createBooking = async (req, res) => {
  try {
    const { devoteeName, service, datetime, amount, status, contactNumber, notes } = req.body;

    if (!devoteeName || !service || !datetime || amount == null) {
      return res.status(400).json({ error: "Missing required booking fields." });
    }

    const booking = await Booking.create({
      devoteeName,
      service,
      datetime,
      amount,
      status: status || "Pending",
      contactNumber,
      notes,
    });

    return res.status(201).json({ booking });
  } catch (error) {
    return res.status(500).json({ error: "Unable to create booking." });
  }
};

const getDonations = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    return res.status(200).json({ donations });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load donations." });
  }
};

const createDonation = async (req, res) => {
  try {
    const {
      donorName,
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
      amount: numericAmount,
      category,
      paymentMethod,
      contactNumber,
      transactionId,
      notes,
      status: "Completed",
    });

    return res.status(201).json({ donation });
  } catch (error) {
    return res.status(500).json({ error: "Unable to create donation." });
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ date: -1, createdAt: -1 });
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

    return res.status(201).json({ status: "success", message: "Support request received.", request: supportRequest });
  } catch (error) {
    return res.status(500).json({ error: "Failed to submit support request." });
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
};
