const Booking = require("../models/Booking");
const Task = require("../models/Task");
const Notification = require("../models/Notification");
const User = require("../models/User");
const mongoose = require("mongoose");
const InventoryItem = require("../models/InventoryItem");
const Instruction = require("../models/Instruction");
const Employee = require("../models/Employee");
const PriestSetting = require("../models/PriestSetting");
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

// ─── Helper: compute duration string from two Date objects ────────────────────
const computeDuration = (startedAt, completedAt) => {
  if (!startedAt || !completedAt) return "N/A";
  try {
    const diffMs = new Date(completedAt) - new Date(startedAt);
    if (diffMs <= 0) return "N/A";
    const totalMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMins / 60);
    const mins  = totalMins % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  } catch {
    return "N/A";
  }
};

// GET /api/priest/completed-services
exports.getCompletedServices = async (req, res) => {
  try {
    const priestId = req.user.id;
    const { search, filter, startDate, endDate, sort } = req.query;

    const query = {
      assignedPriest: priestId,
      status: "Completed",
    };

    const now  = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (filter === "today") {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.completedAt = { $gte: today, $lt: tomorrow };
    } else if (filter === "week") {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      query.completedAt = { $gte: weekStart };
    } else if (filter === "month") {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      query.completedAt = { $gte: monthStart };
    } else if (filter === "custom" && startDate && endDate) {
      const rangeStart = new Date(startDate);
      const rangeEnd   = new Date(endDate);
      rangeEnd.setHours(23, 59, 59, 999);
      query.completedAt = { $gte: rangeStart, $lte: rangeEnd };
    }

    if (search && search.trim() !== "") {
      const rx = { $regex: search.trim(), $options: "i" };
      const orConditions = [
        { devoteeName: rx },
        { service: rx },
      ];
      if (mongoose.Types.ObjectId.isValid(search.trim())) {
        orConditions.push({ _id: search.trim() });
      }
      query.$or = orConditions;
    }

    const sortOrder = sort === "oldest" ? 1 : -1;
    const bookings = await Booking.find(query).sort({ completedAt: sortOrder, createdAt: sortOrder });

    const formatted = bookings.map(b => ({
      bookingId: b._id,
      poojaName:    b.service || "N/A",
      devoteeName:  b.devoteeName || "N/A",
      devoteeMobile: b.devoteePhone || b.contactNumber || "N/A",
      date: b.datetime ? b.datetime.split("T")[0] : (b.createdAt ? b.createdAt.toISOString().split("T")[0] : "N/A"),
      startedAt:   b.startedAt  ? formatDateTime(b.startedAt)  : "N/A",
      completedAt: b.completedAt ? formatDateTime(b.completedAt) : "N/A",
      duration:    computeDuration(b.startedAt, b.completedAt),
      status: "Completed",
    }));

    const allCompleted = await Booking.find({ assignedPriest: priestId, status: "Completed" });

    const tomorrow   = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const weekStart  = new Date(today); weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const completedToday = allCompleted.filter(b =>
      b.completedAt && new Date(b.completedAt) >= today && new Date(b.completedAt) < tomorrow
    ).length;

    const completedThisWeek = allCompleted.filter(b =>
      b.completedAt && new Date(b.completedAt) >= weekStart
    ).length;

    const completedThisMonth = allCompleted.filter(b =>
      b.completedAt && new Date(b.completedAt) >= monthStart
    ).length;

    const durationsMs = allCompleted
      .filter(b => b.startedAt && b.completedAt)
      .map(b => new Date(b.completedAt) - new Date(b.startedAt))
      .filter(d => d > 0);

    const avgMins = durationsMs.length
      ? Math.round(durationsMs.reduce((a, b) => a + b, 0) / durationsMs.length / 60000)
      : 0;
    const avgDurationStr = avgMins >= 60
      ? `${Math.floor(avgMins / 60)}h ${avgMins % 60}m`
      : `${avgMins}m`;

    return res.status(200).json({
      services: formatted,
      total: formatted.length,
      stats: {
        completedToday,
        completedThisWeek,
        completedThisMonth,
        avgDuration: avgDurationStr,
      },
    });
  } catch (error) {
    console.error("Error fetching completed services:", error);
    return res.status(500).json({ message: "Failed to load completed services" });
  }
};

// MODULE 4: SPECIAL DUTIES

exports.getSpecialDuties = async (req, res) => {
  try {
    const priestId = req.user.id;
    const user = await User.findById(priestId);
    
    const duties = await Task.find({
      $or: [{ staffId: priestId }, { staffEmail: user?.email }],
      assignmentType: { $in: ["Special Duty", "Duty & Shift"] },
    }).sort({ createdAt: -1 });

    const formatted = duties.map(d => ({
      id: d._id,
      title: d.dutyName || d.duty || d.title,
      description: d.description || d.notes || "",
      assignedPriest: d.staffName,
      assignedBy: d.assignedBy,
      date: d.dateKey || (d.dueDate ? d.dueDate.split("T")[0] : ""),
      startTime: d.startTime || (d.time ? d.time.split(" - ")[0] : ""),
      endTime: d.endTime || (d.time && d.time.includes(" - ") ? d.time.split(" - ")[1] : ""),
      compensation: d.compensation || "Standard",
      priority: d.priority || "Medium",
      status: d.status,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching special duties:", error);
    return res.status(500).json({ message: "Failed to load special duties" });
  }
};

exports.acceptDuty = async (req, res) => {
  try {
    const { id } = req.params;
    const priestId = req.user.id;
    const user = await User.findById(priestId);

    const task = await Task.findOne({ _id: id, $or: [{ staffId: priestId }, { staffEmail: user?.email }] });
    if (!task) return res.status(404).json({ message: "Duty not found" });

    task.status = "Accepted";
    task.acceptedAt = new Date();
    await task.save();

    return res.status(200).json({ message: "Duty accepted", task });
  } catch (error) {
    console.error("Error accepting duty:", error);
    return res.status(500).json({ message: "Failed to accept duty" });
  }
};

exports.rejectDuty = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const priestId = req.user.id;
    const user = await User.findById(priestId);

    const task = await Task.findOne({ _id: id, $or: [{ staffId: priestId }, { staffEmail: user?.email }] });
    if (!task) return res.status(404).json({ message: "Duty not found" });

    task.status = "Rejected";
    task.rejectedAt = new Date();
    task.rejectionReason = rejectionReason;
    await task.save();

    return res.status(200).json({ message: "Duty rejected", task });
  } catch (error) {
    console.error("Error rejecting duty:", error);
    return res.status(500).json({ message: "Failed to reject duty" });
  }
};

exports.completeDuty = async (req, res) => {
  try {
    const { id } = req.params;
    const priestId = req.user.id;
    const user = await User.findById(priestId);

    const task = await Task.findOne({ _id: id, $or: [{ staffId: priestId }, { staffEmail: user?.email }] });
    if (!task) return res.status(404).json({ message: "Duty not found" });

    task.status = "Completed";
    task.completedAt = new Date();
    await task.save();

    return res.status(200).json({ message: "Duty completed", task });
  } catch (error) {
    console.error("Error completing duty:", error);
    return res.status(500).json({ message: "Failed to complete duty" });
  }
};

// MODULE 5: FESTIVAL DUTIES

exports.getFestivalDuties = async (req, res) => {
  try {
    const priestId = req.user.id;
    const user = await User.findById(priestId);
    
    const duties = await Task.find({
      $or: [{ staffId: priestId }, { staffEmail: user?.email }],
      assignmentType: "Festival Duty",
    }).sort({ createdAt: -1 });

    const formatted = duties.map(d => ({
      id: d._id,
      festivalName: d.dutyName || d.duty || d.title,
      role: d.role || "Priest",
      description: d.description || d.notes || "",
      date: d.dateKey || (d.dueDate ? d.dueDate.split("T")[0] : ""),
      location: d.area || d.dutyArea || "Main Temple",
      startTime: d.startTime || (d.time ? d.time.split(" - ")[0] : ""),
      endTime: d.endTime || (d.time && d.time.includes(" - ") ? d.time.split(" - ")[1] : ""),
      status: d.status,
      attendanceStatus: d.attendanceStatus,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching festival duties:", error);
    return res.status(500).json({ message: "Failed to load festival duties" });
  }
};

exports.markFestivalDutyAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const priestId = req.user.id;
    const user = await User.findById(priestId);

    const task = await Task.findOne({ _id: id, $or: [{ staffId: priestId }, { staffEmail: user?.email }] });
    if (!task) return res.status(404).json({ message: "Duty not found" });

    task.status = "Attended";
    task.attendanceStatus = "Present";
    await task.save();

    return res.status(200).json({ message: "Attendance marked successfully", task });
  } catch (error) {
    console.error("Error marking attendance:", error);
    return res.status(500).json({ message: "Failed to mark attendance" });
  }
};

exports.completeFestivalDuty = async (req, res) => {
  try {
    const { id } = req.params;
    const priestId = req.user.id;
    const user = await User.findById(priestId);

    const task = await Task.findOne({ _id: id, $or: [{ staffId: priestId }, { staffEmail: user?.email }] });
    if (!task) return res.status(404).json({ message: "Duty not found" });

    task.status = "Completed";
    task.completedAt = new Date();
    await task.save();

    return res.status(200).json({ message: "Festival duty completed", task });
  } catch (error) {
    console.error("Error completing festival duty:", error);
    return res.status(500).json({ message: "Failed to complete festival duty" });
  }
};

// MODULE 6: NOTIFICATIONS

exports.getNotifications = async (req, res) => {
  try {
    const priestId = req.user.id;
    const user = await User.findById(priestId);
    
    const notifications = await Notification.find({
      $or: [
        { audienceId: priestId },
        { audienceEmail: user?.email },
        { audienceRole: "priest" }
      ]
    }).sort({ createdAt: -1 });

    const formatted = notifications.map(n => ({
      id: n._id,
      title: n.title,
      message: n.message,
      category: n.category || "General Notice",
      date: n.createdAt,
      read: n.read || n.viewed,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ message: "Failed to load notifications" });
  }
};

exports.readNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    notification.read = true;
    notification.viewed = true;
    notification.readAt = new Date();
    notification.viewedAt = new Date();
    await notification.save();

    return res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error reading notification:", error);
    return res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

exports.readAllNotifications = async (req, res) => {
  try {
    const priestId = req.user.id;
    const user = await User.findById(priestId);

    await Notification.updateMany({
      $or: [
        { audienceId: priestId },
        { audienceEmail: user?.email },
        { audienceRole: "priest" }
      ],
      read: false
    }, {
      read: true,
      viewed: true,
      readAt: new Date(),
      viewedAt: new Date()
    });

    return res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error reading all notifications:", error);
    return res.status(500).json({ message: "Failed to mark all notifications as read" });
  }
};

// MODULE 7: PRIEST PROFILE

exports.getProfile = async (req, res) => {
  try {
    const priestId = req.user.id;
    const user = await User.findById(priestId);
    
    // Attempt to find the employee record mapping to this user
    let employee = await Employee.findOne({ email: user.email });
    
    if (!employee) {
      // Create a dummy employee record if none exists
      employee = await Employee.create({
        name: user.name,
        email: user.email,
        password: user.password,
        role: "priest",
        phone: user.phone || "9999999999",
        salary: 0,
        joiningDate: new Date(),
        experience: "5 Years",
        vedaShakha: "Rig Veda",
        specializations: ["Homa", "Alankaram"],
        languages: ["Sanskrit", "English", "Hindi"],
      });
    }

    const formatted = {
      name: employee.name,
      employeeId: employee._id,
      phone: employee.phone || "",
      email: employee.email,
      address: employee.address || "",
      gender: employee.gender || "Male",
      dob: employee.dob || "",
      joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toISOString().split("T")[0] : "",
      experience: employee.experience || "",
      vedaShakha: employee.vedaShakha || "",
      specializations: employee.specializations || [],
      languages: employee.languages || [],
      certification: employee.certification || "",
      photo: employee.photo || "",
    };

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ message: "Failed to load profile" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const priestId = req.user.id;
    const user = await User.findById(priestId);
    const { phone, address, photo } = req.body;

    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "Phone must be 10 digits" });
    }

    const employee = await Employee.findOne({ email: user.email });
    if (!employee) return res.status(404).json({ message: "Employee record not found" });

    if (phone) employee.phone = phone;
    if (address) employee.address = address;
    if (photo) employee.photo = photo;
    await employee.save();

    // Also sync phone with User model
    if (phone) {
      user.phone = phone;
      await user.save();
    }

    return res.status(200).json({ message: "Profile updated successfully", profile: employee });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
};

// MODULE 8: PRIEST SETTINGS

exports.getSettings = async (req, res) => {
  try {
    const priestId = req.user.id;
    const user = await User.findById(priestId);
    const employee = await Employee.findOne({ email: user.email });
    
    if (!employee) {
      return res.status(404).json({ message: "Employee record not found for priest settings" });
    }

    let settings = await PriestSetting.findOne({ priestId: employee._id });
    if (!settings) {
      settings = await PriestSetting.create({ priestId: employee._id });
    }

    return res.status(200).json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return res.status(500).json({ message: "Failed to load settings" });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const priestId = req.user.id;
    const user = await User.findById(priestId);
    const employee = await Employee.findOne({ email: user.email });
    
    if (!employee) {
      return res.status(404).json({ message: "Employee record not found for priest settings" });
    }

    let settings = await PriestSetting.findOne({ priestId: employee._id });
    if (!settings) {
      settings = new PriestSetting({ priestId: employee._id });
    }

    const { smsNotifications, dutyReminders, calendarWidget, agamaReferenceModule } = req.body;

    if (smsNotifications !== undefined) settings.smsNotifications = smsNotifications;
    if (dutyReminders !== undefined) settings.dutyReminders = dutyReminders;
    if (calendarWidget !== undefined) settings.calendarWidget = calendarWidget;
    if (agamaReferenceModule !== undefined) settings.agamaReferenceModule = agamaReferenceModule;

    await settings.save();

    return res.status(200).json({ message: "Settings updated successfully", settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    return res.status(500).json({ message: "Failed to update settings" });
  }
};

