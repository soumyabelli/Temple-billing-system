const Booking = require("../models/Booking");
const Donation = require("../models/Donation");
const Notification = require("../models/Notification");
const Event = require("../models/Event");
const SupportRequest = require("../models/SupportRequest");
const User = require("../models/User");
const PrasadamOrder = require("../models/PrasadamOrder");
const { isDbConnected } = require("../config/db");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { createStaffBroadcastNotifications, createBroadcastNotifications } = require("../utils/notificationService");
const { sendBookingConfirmation, sendDonationReceipt, sendPrasadamOrderConfirmation } = require("../utils/communicationService");
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
    const { devoteeName, devoteeEmail, devoteePhone, service, datetime, amount, status, contactNumber, notes, devoteeId, eventId, paymentMethod } = req.body;

    if (!devoteeName || !service || !datetime || amount == null) {
      return res.status(400).json({ error: "Missing required booking fields." });
    }

    // Validate amount
    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: "Booking amount must be a positive number." });
    }

    // Validate datetime is a future time
    const parsed = new Date(datetime);
    if (Number.isNaN(parsed.getTime()) || parsed.getTime() <= Date.now()) {
      return res.status(400).json({ error: "Booking datetime must be a future date/time." });
    }

    const allowedPaymentMethods = ["UPI", "Cash", "Card", "Bank Transfer", "Net Banking"];
    const pm = paymentMethod && String(paymentMethod).trim() ? String(paymentMethod).trim() : undefined;
    if (pm && !allowedPaymentMethods.includes(pm)) {
      return res.status(400).json({ error: "Invalid payment method." });
    }

    const booking = await Booking.create({
      devoteeId: devoteeId || undefined,
      eventId: eventId || undefined,
      devoteeName,
      devoteeEmail: devoteeEmail ? String(devoteeEmail).toLowerCase() : undefined,
      devoteePhone: devoteePhone || contactNumber,
      service,
      datetime,
      amount: numericAmount,
      paymentMethod: pm || undefined,
      status: status || "Pending",
      contactNumber,
      notes,
    });

    // Send notification to database
    await Notification.create({
      title: "Booking Submitted",
      message: `Your ${service} booking is pending approval.`,
      audienceEmail: devoteeEmail ? String(devoteeEmail).toLowerCase() : undefined,
    });

    // Send multi-channel notifications (Email & SMS) if devotee info is available
    if (devoteeEmail || devoteePhone || contactNumber) {
      const devotee = { name: devoteeName, email: devoteeEmail, phone: devoteePhone || contactNumber };
      await sendBookingConfirmation(devotee, {
        service,
        datetime,
        amount,
        status: status || "Pending",
      });
    }

    // If this booking is linked to an event and already confirmed, update event aggregates
    if (eventId && (booking.status === "Confirmed" || (status && status === "Confirmed"))) {
      try {
        await Event.findByIdAndUpdate(String(eventId), {
          $inc: { registrations: 1, collection: Number(amount) || 0 },
        });
        booking.counted = true;
        await booking.save();
      } catch (err) {
        console.error("Failed to update event aggregates for booking:", err);
      }
    }

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
      donorPhone,
      amount,
      category = "General",
      paymentMethod = "UPI",
      contactNumber,
      transactionId,
      notes,
      donatedBy,
      eventId,
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
      donorPhone: donorPhone || contactNumber,
      amount: numericAmount,
      category,
      paymentMethod,
      contactNumber,
      transactionId,
      notes,
      status: "Completed",
      eventId: eventId || undefined,
      donatedBy: donatedBy || undefined,
    });

    await Notification.create({
      title: "Donation Received",
      message: `${donorName.trim()} donated INR ${numericAmount} for ${category}.`,
      audienceEmail: donorEmail ? String(donorEmail).toLowerCase() : undefined,
    });

    // Send multi-channel notifications (Email & SMS) if donor info is available
    if (donorEmail || donorPhone || contactNumber) {
      const donor = { name: donorName.trim(), email: donorEmail, phone: donorPhone || contactNumber };
      await sendDonationReceipt(donor, {
        amount: numericAmount,
        category,
        transactionId: transactionId || "N/A",
      });
    }

    // If donation is linked to an event, increment the event's collection
    if (eventId) {
      try {
        await Event.findByIdAndUpdate(String(eventId), { $inc: { collection: numericAmount } });
      } catch (err) {
        console.error("Failed to update event collection for donation:", err);
      }
    }

    return res.status(201).json({ donation });
  } catch (error) {
    return res.status(500).json({ error: "Unable to create donation." });
  }
};

const getNotifications = async (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    // If email provided, return user-specific notifications and broadcasts
    if (email) {
      const user = await User.findOne({ email }).select("role");
      const role = user?.role || null;

      const orFilters = [{ audienceEmail: email }, { audienceEmail: { $exists: false } }];
      if (role) orFilters.push({ audienceRole: role });

      const notifications = await Notification.find({ $or: orFilters }).sort({ createdAt: -1 });
      return res.status(200).json({ notifications });
    }

    // No email: return all notifications for admin/staff views
    const notifications = await Notification.find().sort({ createdAt: -1 });
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
        return res.status(200).json({
          profile: {
            id: user._id?.toString?.() || user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || "",
            address: user.address || "",
            place: user.place || "",
            role: user.role || "devotee",
            memberSince: user.createdAt?.getFullYear?.() || "2025",
          },
        });
      }
    }

    return res.status(200).json({
      profile: {
        name: "Devotee User",
        email: "devotee@example.com",
        phone: "",
        address: "",
        place: "",
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
    if (!isDbConnected()) {
      console.warn("getEvents: DB not connected, returning empty list");
      return res.status(200).json({ events: [] });
    }
    const events = await Event.find().sort({ date: 1 });
    return res.status(200).json({ events });
  } catch (error) {
    console.error("getEvents error:", error);
    // fallback to empty list so frontend doesn't break
    return res.status(200).json({ events: [] });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, date, location, description, imageUrl, slots, registrations, collection, status } = req.body;

    if (!title || !date || !location) {
      return res.status(400).json({ error: "title, date and location are required." });
    }

    const eventData = {
      title,
      date,
      location,
      description,
      image: imageUrl || undefined,
    };

    if (slots != null) eventData.slots = Number(slots) || 0;
    if (registrations != null) eventData.registrations = Number(registrations) || 0;
    if (collection != null) eventData.collection = Number(collection) || 0;
    if (status) eventData.status = status;

    const event = await Event.create(eventData);

    await createStaffBroadcastNotifications({
      title: "Festival Announcement",
      message: `${title} has been scheduled at ${location}.`,
      category: "festival",
    });

    return res.status(201).json({ event });
  } catch (error) {
    console.error("createEvent error:", error);
    return res.status(500).json({ error: "Failed to create event." });
  }
};

const getFestivalOverview = async (req, res) => {
  try {
    if (!isDbConnected()) {
      console.warn("getFestivalOverview: DB not connected, returning defaults");
      return res.status(200).json({
        upcomingFestivals: 0,
        todaysEvents: 0,
        currentMonthFestivals: 0,
        totalRegistrations: 0,
        festivalRevenue: 0,
        monthlyRegistrations: 0,
        monthlyRevenue: 0,
        dbConnected: false,
      });
    }
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const upcomingFestivals = await Event.countDocuments({ date: { $gte: todayStart }, status: { $in: ["Upcoming", "Active"] } });
    const todaysEvents = await Event.countDocuments({ date: { $gte: todayStart, $lt: tomorrowStart } });

    // Current month range
    const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
    const nextMonthStart = new Date(todayStart.getFullYear(), todayStart.getMonth() + 1, 1);

    const currentMonthFestivals = await Event.countDocuments({ date: { $gte: monthStart, $lt: nextMonthStart } });

    // Aggregate totals overall
    const agg = await Event.aggregate([
      { $group: { _id: null, totalRegistrations: { $sum: "$registrations" }, totalCollection: { $sum: "$collection" } } },
    ]);

    let totalRegistrations = (agg[0] && agg[0].totalRegistrations) || 0;
    // Only use Event.collection for festival revenue — do not fall back to global bookings
    let festivalRevenue = (agg[0] && agg[0].totalCollection) || 0;

    // Monthly aggregates (prefer event collection/registrations if present)
    const monthAgg = await Event.aggregate([
      { $match: { date: { $gte: monthStart, $lt: nextMonthStart } } },
      { $group: { _id: null, monthRegistrations: { $sum: "$registrations" }, monthCollection: { $sum: "$collection" } } },
    ]);

    const monthlyRegistrations = (monthAgg[0] && monthAgg[0].monthRegistrations) || 0;
    const monthlyRevenue = (monthAgg[0] && monthAgg[0].monthCollection) || 0;

    // Fallback only for registrations (keep overall booking counts if events don't record registrations)
    if (!totalRegistrations) {
      totalRegistrations = await Booking.countDocuments();
    }

    return res.status(200).json({
      upcomingFestivals,
      todaysEvents,
      currentMonthFestivals,
      totalRegistrations,
      festivalRevenue,
      monthlyRegistrations,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("getFestivalOverview error:", error);
    return res.status(200).json({
      upcomingFestivals: 0,
      todaysEvents: 0,
      currentMonthFestivals: 0,
      totalRegistrations: 0,
      festivalRevenue: 0,
      monthlyRegistrations: 0,
      monthlyRevenue: 0,
      dbConnected: false,
      error: "Failed to load festival overview",
    });
  }
};

const updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ["Upcoming", "Active", "Completed", "Cancelled"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status provided." });
    }

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ error: "Event not found." });

    event.status = status;
    await event.save();

    await Notification.create({
      title: "Event Status Updated",
      message: `${event.title} status changed to ${status}.`,
    });

    return res.status(200).json({ event });
  } catch (error) {
    console.error("updateEventStatus error:", error);
    return res.status(500).json({ error: "Failed to update event status." });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      date,
      location,
      description,
      imageUrl,
      slots,
      registrations,
      collection,
      status,
    } = req.body;

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ error: "Event not found." });

    if (title && String(title).trim()) event.title = String(title).trim();
    if (date) event.date = new Date(date);
    if (location && String(location).trim()) event.location = String(location).trim();
    if (description != null) event.description = String(description || "").trim();
    if (imageUrl != null) event.image = imageUrl || undefined;
    if (slots != null) event.slots = Number(slots) || 0;
    if (registrations != null) event.registrations = Number(registrations) || 0;
    if (collection != null) event.collection = Number(collection) || 0;
    if (status && ["Upcoming", "Active", "Completed", "Cancelled"].includes(status)) event.status = status;

    await event.save();

    await Notification.create({
      title: "Event Updated",
      message: `${event.title} has been updated.`,
    });

    return res.status(200).json({ event });
  } catch (error) {
    console.error("updateEvent error:", error);
    return res.status(500).json({ error: "Failed to update event." });
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
    const { currentEmail, name, email, phone, address, place } = req.body;
    if (!currentEmail) {
      return res.status(400).json({ error: "currentEmail is required." });
    }

    const user = await User.findOne({ email: currentEmail.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: "Profile not found." });
    }

    if (name && String(name).trim()) user.name = String(name).trim();
    if (email && String(email).trim()) user.email = String(email).trim().toLowerCase();
    if (phone && String(phone).trim()) user.phone = String(phone).trim();
    if (address && String(address).trim()) user.address = String(address).trim();
    if (place && String(place).trim()) user.place = String(place).trim();
    await user.save();

    await Notification.create({
      title: "Profile Updated",
      message: `${user.name} updated devotee profile details.`,
    });

    return res.status(200).json({
      profile: {
        id: user._id?.toString?.() || user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        place: user.place || "",
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
    const { title, message, audienceRole, broadcast, category } = req.body;
    if (!title || !message) return res.status(400).json({ error: "title and message are required." });

    // If admin wants to broadcast to a role or all, create per-user notifications
    if (broadcast || audienceRole) {
      try {
        if (String(audienceRole || "").toLowerCase() === "staff") {
          const docs = await createStaffBroadcastNotifications({ title, message, category });
          return res.status(201).json({ notifications: docs });
        }

        // default: broadcast to devotees or to specified role
        const docs = await createBroadcastNotifications({ title, message, category, role: audienceRole });
        return res.status(201).json({ notifications: docs });
      } catch (err) {
        console.error("broadcast create error:", err);
        return res.status(500).json({ error: "Failed to broadcast notification." });
      }
    }

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
    const { devoteeName, email, phone, itemName, quantity, paymentMethod, devoteeId } = req.body;
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
      devoteeId: devoteeId || undefined,
      devoteeName,
      email,
      phone: phone || undefined,
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

    // Send multi-channel notifications (Email & SMS) if devotee info is available
    if (email || phone) {
      const devotee = { name: devoteeName, email, phone };
      await sendPrasadamOrderConfirmation(devotee, {
        item: itemName,
        quantity: normalizedQty,
        amount: totalAmount,
        status: "Placed",
      });
    }

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

// Create a Razorpay order and a pending Donation record
const createRazorpayOrder = async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(500).json({ error: "Database not connected." });

    const { amount, donorName, donorEmail, donorPhone, category = "General", paymentMethod = "UPI", notes, eventId } = req.body;
    const numericAmount = Number(amount);
    if (!numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: "Invalid amount provided." });
    }

    // If Razorpay keys are not present, simulate an order for local/dev testing
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn("Razorpay keys missing — creating simulated order for development.", { body: req.body });
      const order = {
        id: `sim_order_${Date.now()}`,
        amount: Math.round(numericAmount * 100),
        currency: "INR",
        receipt: `donation_${Date.now()}`,
      };

      const donation = await Donation.create({
        donorName: donorName || "Anonymous",
        donorEmail: donorEmail ? String(donorEmail).toLowerCase() : undefined,
        donorPhone: donorPhone || undefined,
        amount: numericAmount,
        category,
        paymentMethod,
        notes,
        status: "Completed",
        eventId: eventId || undefined,
        razorpayOrderId: order.id,
        transactionId: `SIM_TXN_${Date.now()}`,
      });

      // Update event collection immediately for simulated donations
      if (eventId) {
        try {
          await Event.findByIdAndUpdate(String(eventId), { $inc: { collection: numericAmount } });
        } catch (err) {
          console.error("Failed to update event collection for simulated donation:", err);
        }
      }

      // Create notification and send receipt where possible
      try {
        await Notification.create({
          title: "Donation Received",
          message: `${donorName || "Anonymous"} donated INR ${numericAmount} (simulated).`,
          audienceEmail: donorEmail ? String(donorEmail).toLowerCase() : undefined,
        });
        if (donorEmail || donorPhone) {
          const donor = { name: donorName, email: donorEmail, phone: donorPhone };
          await sendDonationReceipt(donor, { amount: numericAmount, category, transactionId: donation.transactionId });
        }
      } catch (notifErr) {
        console.warn("Notification for simulated donation failed:", notifErr);
      }

      return res.status(201).json({ order, donation, key: "", simulated: true });
    }

    const razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const orderOptions = {
      amount: Math.round(numericAmount * 100),
      currency: "INR",
      receipt: `donation_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpayClient.orders.create(orderOptions);

    const donation = await Donation.create({
      donorName: donorName || "Anonymous",
      donorEmail: donorEmail ? String(donorEmail).toLowerCase() : undefined,
      donorPhone: donorPhone || undefined,
      amount: numericAmount,
      category,
      paymentMethod,
      notes,
      status: "Pending",
      eventId: eventId || undefined,
      razorpayOrderId: order.id,
    });

    return res.status(201).json({ order, donation, key: process.env.RAZORPAY_KEY_ID || "" });
  } catch (error) {
    console.error("createRazorpayOrder error:", error);
    const message = error?.message || (error?.error && JSON.stringify(error.error)) || "Failed to create Razorpay order.";
    return res.status(500).json({ error: message });
  }
};

// Verify Razorpay payment signature (called by frontend after checkout)
const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, donationId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing Razorpay verification fields." });
    }

    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "").update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid signature." });
    }

    let donation = null;
    if (donationId) donation = await Donation.findById(donationId);
    if (!donation) donation = await Donation.findOne({ razorpayOrderId: razorpay_order_id });
    if (!donation) return res.status(404).json({ error: "Donation not found for this order." });

    donation.status = "Completed";
    donation.transactionId = razorpay_payment_id;
    donation.razorpayPaymentId = razorpay_payment_id;
    donation.razorpaySignature = razorpay_signature;
    await donation.save();

    // If donation linked to an event, increment its collection
    if (donation.eventId) {
      try {
        await Event.findByIdAndUpdate(String(donation.eventId), { $inc: { collection: Number(donation.amount) || 0 } });
      } catch (err) {
        console.error("Failed to update event collection from verifyRazorpayPayment:", err);
      }
    }

    // Send receipt / notification
    try {
      await Notification.create({
        title: "Donation Received",
        message: `${donation.donorName || "A donor"} donated INR ${donation.amount}.`,
        audienceEmail: donation.donorEmail || undefined,
      });
      if (donation.donorEmail || donation.donorPhone) {
        const donor = { name: donation.donorName, email: donation.donorEmail, phone: donation.donorPhone };
        await sendDonationReceipt(donor, { amount: donation.amount, category: donation.category, transactionId: donation.transactionId });
      }
    } catch (notifErr) {
      console.warn("Notification after verify failed:", notifErr);
    }

    return res.status(200).json({ success: true, donation });
  } catch (error) {
    console.error("verifyRazorpayPayment error:", error);
    return res.status(500).json({ error: "Failed to verify Razorpay payment." });
  }
};

// Webhook handler for Razorpay events (use express.raw middleware on route)
const handleRazorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || "";
    const signature = req.headers["x-razorpay-signature"];
    const bodyBuffer = req.body;
    const expected = crypto.createHmac("sha256", secret).update(bodyBuffer).digest("hex");
    if (expected !== signature) {
      console.warn("Razorpay webhook signature mismatch");
      return res.status(400).json({ error: "Invalid webhook signature." });
    }

    const payload = JSON.parse(bodyBuffer.toString());
    const evt = payload.event;

    if (evt === "payment.captured" || evt === "payment.authorized") {
      const entity = payload.payload.payment.entity;
      const orderId = entity.order_id;
      const paymentId = entity.id;
      const amount = (entity.amount || 0) / 100;

      const donation = await Donation.findOne({ razorpayOrderId: orderId });
      if (donation) {
        donation.status = "Completed";
        donation.transactionId = paymentId;
        donation.razorpayPaymentId = paymentId;
        donation.razorpaySignature = signature;
        await donation.save();

        if (donation.eventId) {
          try {
            await Event.findByIdAndUpdate(String(donation.eventId), { $inc: { collection: Number(donation.amount) || amount } });
          } catch (err) {
            console.error("Failed to update event collection from webhook:", err);
          }
        }
      }
    }

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("handleRazorpayWebhook error:", error);
    return res.status(500).json({ error: "Webhook processing failed." });
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

    const previousStatus = booking.status;
    booking.status = status;

    // If changing to Confirmed and linked to an event, increment event aggregates once
    if (booking.eventId && status === "Confirmed" && !booking.counted) {
      try {
        await Event.findByIdAndUpdate(String(booking.eventId), {
          $inc: { registrations: 1, collection: Number(booking.amount) || 0 },
        });
        booking.counted = true;
      } catch (err) {
        console.error("Failed to update event aggregates on booking confirm:", err);
      }
    }

    await booking.save();

    await Notification.create({
      title: "Booking Status Updated",
      message: `Your ${booking.service} booking is now ${status}.`,
      audienceEmail: booking.devoteeEmail || undefined,
    });

    return res.status(200).json({ booking, previousStatus });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update booking status." });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Notification ID is required." });
    }
    
    const notification = await Notification.findByIdAndUpdate(
      id,
      {
        read: true,
        readAt: new Date(),
      },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: "Notification not found." });
    }
    
    return res.status(200).json({ notification });
  } catch (error) {
    return res.status(500).json({ error: "Failed to mark notification as read." });
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
  createEvent,
  getFestivalOverview,
  updateEventStatus,
  updateEvent,
  submitSupportRequest,
  updateProfile,
  getSupportRequests,
  replySupportRequest,
  createNotification,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
  getPrasadamOrders,
  createPrasadamOrder,
  cancelPrasadamOrder,
  updateBookingStatus,
  markNotificationAsRead,
};
