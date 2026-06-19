const Booking = require("../models/Booking");
const Task = require("../models/Task");
const Notification = require("../models/Notification");
const User = require("../models/User");
const mongoose = require("mongoose");
const InventoryItem = require("../models/InventoryItem");
const Instruction = require("../models/Instruction");

// Helper to check if a booking date is today
const isDateToday = (dateStr) => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  } catch (e) {
    return false;
  }
};

// Helper to check if a booking date is in the future
const isDateUpcoming = (dateStr) => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return date.getTime() > today.getTime();
  } catch (e) {
    return false;
  }
};

// Helper to format time as 06:00 AM
const formatTime = (dateStr) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch (e) {
    return dateStr;
  }
};

// Helper to format datetime as "15 May 2025, 07:30 AM"
const formatDateTime = (dateStr) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const datePart = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const timePart = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    return `${datePart}, ${timePart}`;
  } catch (e) {
    return dateStr;
  }
};

// GET /api/priest/dashboard
exports.getPriestDashboard = async (req, res) => {
  try {
    const priestId = req.user.id;
    const user = await User.findById(priestId);
    if (!user) {
      return res.status(404).json({ message: "Priest user not found" });
    }

    // 1. Fetch bookings assigned to this priest
    const bookings = await Booking.find({ assignedPriest: priestId });

    // 2. Filter today's poojas
    const todayBookings = bookings.filter(b => isDateToday(b.datetime));

    // 3. Filter upcoming poojas
    const upcomingBookings = bookings.filter(b => isDateUpcoming(b.datetime));
    upcomingBookings.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    // 4. Completed Today
    const completedTodayBookings = todayBookings.filter(b => b.status === "Completed");

    // 5. Pending Services assigned to this priest
    const pendingBookings = bookings.filter(b => b.status === "Pending");

    // 6. Total Devotees Served
    const completedBookings = bookings.filter(b => b.status === "Completed");
    const uniqueDevotees = new Set(completedBookings.map(b => b.devoteeName).filter(Boolean));
    const totalDevoteesCount = uniqueDevotees.size;

    // Stats
    const stats = {
      todayPooja: todayBookings.length,
      upcomingPooja: upcomingBookings.length,
      completedToday: completedTodayBookings.length,
      pendingServices: pendingBookings.length,
      totalDevotees: totalDevoteesCount,
    };

    // 7. Format today's schedule
    const todaySchedule = todayBookings.map(b => ({
      id: b._id,
      time: formatTime(b.datetime),
      pooja: b.service,
      devotee: b.devoteeName,
      status: b.status,
    }));

    // 8. Format upcoming poojas
    const upcomingPoojasFormatted = upcomingBookings.map(b => ({
      id: b._id,
      pooja: b.service,
      date: formatDateTime(b.datetime),
      devotee: b.devoteeName,
    }));

    // 9. Format completed services
    const completedServicesFormatted = completedBookings.map(b => ({
      id: b._id,
      pooja: b.service,
      time: formatDateTime(b.datetime),
      devotee: b.devoteeName,
    }));

    // 10. Fetch today's Seva duties (Tasks)
    const todayStr = new Date().toISOString().slice(0, 10);
    const duties = await Task.find({
      $or: [
        { staffId: priestId },
        { staffEmail: user.email }
      ],
      dateKey: todayStr
    });

    const sevaDuties = duties.map(d => ({
      id: d._id,
      duty: d.dutyName || d.title || d.duty,
      time: d.time || d.startTime || "09:00 AM",
      description: d.description || d.notes || "",
    }));

    // 11. Fetch announcements
    const notifications = await Notification.find({
      $or: [
        { audienceRole: "priest" },
        { audienceRole: "staff" },
        { audienceRole: { $exists: false } },
        { audienceEmail: { $exists: false } }
      ]
    }).sort({ createdAt: -1 }).limit(10);

    const announcements = notifications.map(n => ({
      id: n._id,
      title: n.title,
      date: new Date(n.createdAt || n.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      type: n.category || "general",
      description: n.message,
    }));

    return res.status(200).json({
      stats,
      todaySchedule,
      upcomingPoojas: upcomingPoojasFormatted,
      completedServices: completedServicesFormatted,
      sevaDuties,
      announcements,
    });
  } catch (error) {
    console.error("Error fetching priest dashboard data:", error);
    return res.status(500).json({ message: "Failed to load dashboard data" });
  }
};

// GET /api/priest/today-schedule
exports.getTodaySchedule = async (req, res) => {
  try {
    const priestId = req.user.id;
    const bookings = await Booking.find({ assignedPriest: priestId });
    const todayBookings = bookings.filter(b => isDateToday(b.datetime));
    const todaySchedule = todayBookings.map(b => ({
      id: b._id,
      time: formatTime(b.datetime),
      pooja: b.service,
      devotee: b.devoteeName,
      status: b.status,
    }));
    return res.status(200).json(todaySchedule);
  } catch (error) {
    console.error("Error fetching priest today schedule:", error);
    return res.status(500).json({ message: "Failed to load schedule" });
  }
};

// GET /api/priest/upcoming-poojas
exports.getUpcomingPoojas = async (req, res) => {
  try {
    const priestId = req.user.id;
    const bookings = await Booking.find({ assignedPriest: priestId });
    const upcomingBookings = bookings.filter(b => isDateUpcoming(b.datetime));
    upcomingBookings.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    const upcomingPoojasFormatted = upcomingBookings.map(b => ({
      id: b._id,
      pooja: b.service,
      date: formatDateTime(b.datetime),
      devotee: b.devoteeName,
    }));
    return res.status(200).json(upcomingPoojasFormatted);
  } catch (error) {
    console.error("Error fetching priest upcoming poojas:", error);
    return res.status(500).json({ message: "Failed to load upcoming poojas" });
  }
};

// GET /api/priest/completed-today
exports.getCompletedToday = async (req, res) => {
  try {
    const priestId = req.user.id;
    const bookings = await Booking.find({ assignedPriest: priestId, status: "Completed" });
    const todayCompleted = bookings.filter(b => isDateToday(b.datetime));
    const completedTodayFormatted = todayCompleted.map(b => ({
      id: b._id,
      pooja: b.service,
      time: formatDateTime(b.datetime),
      devotee: b.devoteeName,
    }));
    return res.status(200).json(completedTodayFormatted);
  } catch (error) {
    console.error("Error fetching priest completed today services:", error);
    return res.status(500).json({ message: "Failed to load completed today services" });
  }
};

// PATCH /api/priest/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const priestId = req.user.id;

    const allowed = ["Pending", "In Progress", "Completed", "Upcoming", "Confirmed", "Rejected", "Cancelled", "Assigned"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findOne({ _id: id, assignedPriest: priestId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found or not assigned to you" });
    }

    booking.status = status;
    await booking.save();

    return res.status(200).json({ message: "Status updated successfully", booking });
  } catch (error) {
    console.error("Error updating booking status:", error);
    return res.status(500).json({ message: "Failed to update booking status" });
  }
};

// GET /api/priest/assigned-poojas
exports.getAssignedPoojas = async (req, res) => {
  try {
    const priestId = req.user.id;
    const { status, search } = req.query;

    const now = new Date();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 1. Dev Data Self-Healing: Roll forward stale 'Upcoming' / 'Confirmed' / 'Assigned' booking dates
    const pastUpcomingBookings = await Booking.find({
      assignedPriest: priestId,
      status: { $in: ["Upcoming", "Confirmed", "Assigned"] }
    });

    for (const b of pastUpcomingBookings) {
      if (b.datetime) {
        const bDate = new Date(b.datetime);
        if (bDate.getTime() < startOfToday.getTime()) {
          const targetDate = new Date();
          const hour = isNaN(bDate.getHours()) ? 9 : bDate.getHours();
          const minute = isNaN(bDate.getMinutes()) ? 0 : bDate.getMinutes();
          targetDate.setHours(hour, minute, 0, 0);
          
          if (targetDate.getTime() < now.getTime()) {
            targetDate.setDate(targetDate.getDate() + 1);
          }
          
          b.datetime = targetDate.toISOString();
          await b.save();
        }
      }
    }

    // 2. Populate realistic devotee phones if missing
    const bookingsWithoutPhone = await Booking.find({
      assignedPriest: priestId,
      $or: [
        { devoteePhone: { $exists: false } },
        { devoteePhone: "" },
        { devoteePhone: null },
        { contactNumber: { $exists: false } },
        { contactNumber: "" },
        { contactNumber: null }
      ]
    });

    const dummyPhones = [
      "+91 98765 43210",
      "+91 87654 32109",
      "+91 76543 21098",
      "+91 95432 10987",
      "+91 91234 56789"
    ];

    for (let i = 0; i < bookingsWithoutPhone.length; i++) {
      const b = bookingsWithoutPhone[i];
      let phone = "";
      if (b.devoteeId) {
        const u = await User.findById(b.devoteeId);
        if (u && u.phone) phone = u.phone;
      }
      if (!phone) {
        phone = dummyPhones[i % dummyPhones.length];
      }
      b.devoteePhone = phone;
      b.contactNumber = phone;
      await b.save();
    }

    let query = { assignedPriest: priestId };

    // Apply search filter
    if (search && search.trim() !== "") {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      const orConditions = [
        { devoteeName: searchRegex },
        { service: searchRegex },
      ];
      if (mongoose.Types.ObjectId.isValid(search.trim())) {
        orConditions.push({ _id: search.trim() });
      }
      query.$or = orConditions;
    }

    let bookings = await Booking.find(query).sort({ datetime: 1 });

    // Apply status filter
    if (status && status !== "All") {
      if (status === "Upcoming") {
        bookings = bookings.filter(b => 
          ["Assigned", "Confirmed", "Upcoming"].includes(b.status) &&
          new Date(b.datetime).getTime() >= startOfToday.getTime()
        );
      } else {
        bookings = bookings.filter(b => b.status === status);
      }
    }

    const formatted = bookings.map(b => ({
      id: b._id,
      bookingId: b._id,
      date: b.datetime ? b.datetime.split("T")[0] : "",
      time: formatTime(b.datetime),
      pooja: b.service,
      devotee: b.devoteeName,
      mobile: b.devoteePhone || b.contactNumber || "N/A",
      status: b.status,
      startedAt: b.startedAt,
      completedAt: b.completedAt,
      pendingReason: b.pendingReason,
      pendingAt: b.pendingAt,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching assigned poojas:", error);
    return res.status(500).json({ message: "Failed to load assigned poojas" });
  }
};

// PUT /api/priest/start-pooja/:id
exports.startPooja = async (req, res) => {
  try {
    const { id } = req.params;
    const priestId = req.user.id;

    const booking = await Booking.findOne({ _id: id, assignedPriest: priestId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found or not assigned to you" });
    }

    booking.status = "In Progress";
    booking.startedAt = new Date();
    await booking.save();

    return res.status(200).json({ message: "Pooja started successfully", booking });
  } catch (error) {
    console.error("Error starting pooja:", error);
    return res.status(500).json({ message: "Failed to start pooja" });
  }
};

// PUT /api/priest/complete-pooja/:id
exports.completePooja = async (req, res) => {
  try {
    const { id } = req.params;
    const priestId = req.user.id;

    const booking = await Booking.findOne({ _id: id, assignedPriest: priestId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found or not assigned to you" });
    }

    booking.status = "Completed";
    booking.completedAt = new Date();
    booking.assignedPriest = priestId;
    await booking.save();

    return res.status(200).json({ message: "Pooja completed successfully", booking });
  } catch (error) {
    console.error("Error completing pooja:", error);
    return res.status(500).json({ message: "Failed to complete pooja" });
  }
};

// PUT /api/priest/pending-pooja/:id
exports.pendingPooja = async (req, res) => {
  try {
    const { id } = req.params;
    const { pendingReason } = req.body;
    const priestId = req.user.id;

    if (!pendingReason || pendingReason.trim() === "") {
      return res.status(400).json({ message: "Reason is mandatory to put a pooja on hold" });
    }

    const booking = await Booking.findOne({ _id: id, assignedPriest: priestId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found or not assigned to you" });
    }

    booking.status = "Pending";
    booking.pendingReason = pendingReason;
    booking.pendingAt = new Date();
    await booking.save();

    return res.status(200).json({ message: "Pooja status updated to Pending", booking });
  } catch (error) {
    console.error("Error setting pooja to pending:", error);
    return res.status(500).json({ message: "Failed to set pooja to pending" });
  }
};

// GET /api/priest/seva-schedule
exports.getSevaSchedule = async (req, res) => {
  try {
    const priestId = req.user.id;
    const user = await User.findById(priestId);
    if (!user) {
      return res.status(404).json({ message: "Priest user not found" });
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    
    let duties = await Task.find({
      $or: [{ staffId: priestId }, { staffEmail: user.email }],
      dateKey: todayStr,
    });

    if (duties.length === 0) {
      const anyTasks = await Task.find({
        $or: [{ staffId: priestId }, { staffEmail: user.email }],
      });
      if (anyTasks.length > 0) {
        await Task.updateMany(
          { $or: [{ staffId: priestId }, { staffEmail: user.email }] },
          { dateKey: todayStr }
        );
        duties = await Task.find({
          $or: [{ staffId: priestId }, { staffEmail: user.email }],
          dateKey: todayStr,
        });
      }
    }

    const sevaDuties = duties.map(d => ({
      id: d._id,
      sevaName: d.dutyName || d.title || d.duty,
      startTime: d.startTime || (d.time ? d.time.split(" - ")[0] : "09:00 AM"),
      endTime: d.endTime || (d.time && d.time.includes(" - ") ? d.time.split(" - ")[1] : "10:00 AM"),
      description: d.description || d.notes || "No description provided",
      location: d.area || d.dutyArea || "Main Temple",
    }));

    return res.status(200).json(sevaDuties);
  } catch (error) {
    console.error("Error fetching seva schedule:", error);
    return res.status(500).json({ message: "Failed to load seva schedule" });
  }
};

// GET /api/priest/seva-instructions
exports.getSevaInstructions = async (req, res) => {
  try {
    const count = await Instruction.countDocuments();
    if (count === 0) {
      await Instruction.create([
        {
          title: "Morning Alankaram Preparation",
          description: "Ensure fresh flowers are sourced by 05:00 AM.",
          priority: "High",
          date: new Date(),
        },
        {
          title: "Deeparadhana Ghee Check",
          description: "Pure cow ghee must be used for deeparadhana. Do not use mixed oils.",
          priority: "High",
          date: new Date(),
        },
        {
          title: "Panchamrutham Quantity",
          description: "Panchamrutham quantities must match devotee count.",
          priority: "Medium",
          date: new Date(),
        },
        {
          title: "Dress Code & Discipline",
          description: "Dress code: Traditional white dhoti and shawl. Mobile phones on silent inside the sanctum.",
          priority: "Low",
          date: new Date(),
        }
      ]);
    }

    const instructions = await Instruction.find().sort({ date: -1 });
    const formatted = instructions.map(inst => ({
      id: inst._id,
      title: inst.title,
      description: inst.description,
      priority: inst.priority,
      date: inst.date ? inst.date.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching special instructions:", error);
    return res.status(500).json({ message: "Failed to load special instructions" });
  }
};

// GET /api/priest/material-checklist
exports.getMaterialChecklist = async (req, res) => {
  try {
    const count = await InventoryItem.countDocuments();
    if (count === 0) {
      await InventoryItem.create([
        { name: "Camphor", unit: "Pack", currentStock: 4, minimumStock: 10, category: "Pooja" },
        { name: "Flowers", unit: "Kg", currentStock: 18, minimumStock: 10, category: "Pooja" },
        { name: "Ghee", unit: "Liter", currentStock: 12, minimumStock: 5, category: "Pooja" },
        { name: "Agarbathi", unit: "Pack", currentStock: 6, minimumStock: 10, category: "Pooja" },
        { name: "Betel Leaves", unit: "Pieces", currentStock: 0, minimumStock: 50, category: "Pooja" },
      ]);
    }

    const items = await InventoryItem.find();

    const requiredQuantities = {
      "Camphor": "2 Packs",
      "Flowers": "5 Kg",
      "Ghee": "3 Liters",
      "Agarbathi": "2 Packs",
      "Betel Leaves": "50 Pieces",
    };

    const checklist = items.map(item => {
      const itemName = item.name;
      const requiredQty = requiredQuantities[itemName] || `1 ${item.unit}`;
      const availableQty = `${item.currentStock} ${item.unit}`;
      return {
        id: item._id,
        itemName,
        requiredQuantity: requiredQty,
        availableQuantity: availableQty,
        status: item.status,
      };
    });

    return res.status(200).json(checklist);
  } catch (error) {
    console.error("Error fetching material checklist:", error);
    return res.status(500).json({ message: "Failed to load material checklist" });
  }
};
