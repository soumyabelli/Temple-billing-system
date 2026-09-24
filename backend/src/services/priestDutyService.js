const mongoose = require("mongoose");
const User = require("../models/User");
const Employee = require("../models/Employee");
const Shift = require("../models/Shift");
const Task = require("../models/Task");
const ShiftAssignment = require("../models/ShiftAssignment");
const Leave = require("../models/Leave");
const Notification = require("../models/Notification");
const { createNotification } = require("../utils/notificationService");

const clean = (val) => String(val || "").trim();

/**
 * Convert time string (e.g., "06:00 AM", "2:30 PM", "14:00") into minutes from midnight (0 - 1439).
 */
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const match = String(timeStr).trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const meridiem = (match[3] || "").toUpperCase();
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

/**
 * Extract start and end minutes from a range string (e.g. "Morning (06:00 AM - 02:00 PM)", "10:00 AM - 5:00 PM").
 */
const parseTimeRange = (str) => {
  if (!str) return null;
  const regex = /(\d{1,2}(?::\d{2})?\s*(?:AM|PM))\s*(?:-|to)\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM))/i;
  const match = str.match(regex);
  if (!match) return null;
  const start = parseTimeToMinutes(match[1]);
  const end = parseTimeToMinutes(match[2]);
  if (start === null || end === null) return null;
  return { start, end, raw: match[0] };
};

/**
 * Check if target minutes fall within a duty/shift range, supporting overnight shifts.
 */
const isTimeInDutyRange = (targetMinutes, startMinutes, endMinutes) => {
  if (targetMinutes === null || targetMinutes === undefined) return true;
  if (endMinutes < startMinutes) {
    // Overnight shift (e.g., 10:00 PM - 04:00 AM)
    return targetMinutes >= startMinutes || targetMinutes <= endMinutes;
  }
  return targetMinutes >= startMinutes && targetMinutes <= endMinutes;
};

/**
 * Parse a datetime string/Date into dateKey, targetMinutes, and formatted human-readable timings.
 */
const getDutyDateKeyAndMinutes = (datetime) => {
  const parsedDate = datetime instanceof Date ? datetime : new Date(datetime);
  if (isNaN(parsedDate.getTime())) {
    const now = new Date();
    return {
      parsedDate: now,
      dateKey: now.toISOString().slice(0, 10),
      targetMinutes: now.getHours() * 60 + now.getMinutes(),
      isDateOnly: false,
      formattedTimings: now.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");
  const dateKey = `${year}-${month}-${day}`;

  const hasExplicitTime = !(parsedDate.getHours() === 0 && parsedDate.getMinutes() === 0 && parsedDate.getSeconds() === 0);
  const targetMinutes = hasExplicitTime ? parsedDate.getHours() * 60 + parsedDate.getMinutes() : null;

  const datePart = parsedDate.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timePart = hasExplicitTime
    ? parsedDate.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  const formattedTimings = hasExplicitTime ? `${datePart} at ${timePart}` : `${datePart} (Full Day)`;

  return {
    parsedDate,
    dateKey,
    targetMinutes,
    isDateOnly: !hasExplicitTime,
    formattedTimings,
  };
};

/**
 * Find all active priests on duty for a given pooja booking datetime.
 */
const findOnDutyPriests = async (datetime, bookingContext = {}) => {
  try {
    const { dateKey, targetMinutes, isDateOnly } = getDutyDateKeyAndMinutes(datetime);

    // 1. Fetch active priest accounts from Employee and User collections
    const [employees, users, shifts] = await Promise.all([
      Employee.find({
        role: { $regex: /^priest$/i },
        status: { $ne: "Inactive" },
        deletedAt: null,
      }).lean(),
      User.find({
        role: { $regex: /^priest$/i },
        status: { $ne: "Inactive" },
        accountEnabled: { $ne: false },
      }).lean(),
      Shift.find({ active: true }).lean(),
    ]);

    // Build Shift name lookup map
    const shiftMap = new Map();
    shifts.forEach((s) => {
      const start = parseTimeToMinutes(s.startTime);
      const end = parseTimeToMinutes(s.endTime);
      if (start !== null && end !== null) {
        shiftMap.set(s.shiftName.toLowerCase().trim(), {
          start,
          end,
          raw: `${s.startTime} - ${s.endTime}`,
        });
      }
    });

    // Merge Unique Priests
    const priestMap = new Map();
    users.forEach((u) => {
      const key = u.email ? u.email.toLowerCase() : u._id.toString();
      priestMap.set(key, {
        userId: u._id.toString(),
        name: u.name,
        email: u.email,
        phone: u.phone,
        employeeId: null,
        employeeRecord: null,
        userRecord: u,
      });
    });

    employees.forEach((e) => {
      const key = e.email ? e.email.toLowerCase() : (e.userId ? e.userId.toString() : e._id.toString());
      const existing = priestMap.get(key) || {
        userId: e.userId ? e.userId.toString() : null,
        name: e.name,
        email: e.email,
        phone: e.phone,
        employeeId: e._id.toString(),
        employeeRecord: e,
        userRecord: null,
      };
      existing.employeeId = e._id.toString();
      existing.employeeRecord = e;
      if (!existing.userId && e.userId) existing.userId = e.userId.toString();
      priestMap.set(key, existing);
    });

    const allPriests = Array.from(priestMap.values());
    if (allPriests.length === 0) return [];

    // 2. Filter out priests on Approved Leave for this date
    const leaves = await Leave.find({
      status: "Approved",
      fromDate: { $lte: dateKey },
      toDate: { $gte: dateKey },
    }).lean();

    const onLeavePriestSet = new Set();
    leaves.forEach((l) => {
      if (l.staffId) onLeavePriestSet.add(l.staffId.toString());
      if (l.staffEmail) onLeavePriestSet.add(l.staffEmail.toLowerCase());
      if (l.employeeId) onLeavePriestSet.add(l.employeeId.toString());
    });

    const availablePriests = allPriests.filter((p) => {
      if (p.userId && onLeavePriestSet.has(p.userId)) return false;
      if (p.employeeId && onLeavePriestSet.has(p.employeeId)) return false;
      if (p.email && onLeavePriestSet.has(p.email.toLowerCase())) return false;
      return true;
    });

    // 3. Match On-Duty Priests
    const onDutyList = [];
    const matchedKeys = new Set();

    const addOnDuty = (priest, reason) => {
      const key = priest.userId || priest.email;
      if (!matchedKeys.has(key)) {
        matchedKeys.add(key);
        onDutyList.push({ priest, reason });
      }
    };

    // A. Check if a priest was directly assigned to this booking
    const assignedPriestId = bookingContext.assignedPriest?.toString();
    if (assignedPriestId) {
      const assigned = availablePriests.find(
        (p) => p.userId === assignedPriestId || p.employeeId === assignedPriestId
      );
      if (assigned) {
        addOnDuty(assigned, "Assigned Priest for this Pooja");
      }
    }

    // B. Check Task / Duty Roster for this dateKey
    const allPriestIds = availablePriests.flatMap((p) => [p.userId, p.employeeId]).filter(Boolean);
    const allPriestEmails = availablePriests.map((p) => p.email?.toLowerCase()).filter(Boolean);

    const tasks = await Task.find({
      $or: [
        { staffId: { $in: allPriestIds } },
        { employeeId: { $in: allPriestIds } },
        { staffEmail: { $in: allPriestEmails } },
      ],
      dateKey,
      status: { $nin: ["Cancelled", "Rejected"] },
    }).lean();

    // C. Check ShiftAssignment collection for this dateKey
    const shiftAssignments = await ShiftAssignment.find({
      $or: [
        { staffId: { $in: allPriestIds } },
        { employeeId: { $in: allPriestIds } },
        { employeeEmail: { $in: allPriestEmails } },
      ],
      dateKey,
      attendanceStatus: { $ne: "Absent" },
    }).lean();

    for (const priest of availablePriests) {
      const priestTask = tasks.find(
        (t) =>
          (t.staffId && (t.staffId === priest.userId || t.staffId === priest.employeeId)) ||
          (t.employeeId && t.employeeId === priest.employeeId) ||
          (t.staffEmail && t.staffEmail.toLowerCase() === priest.email?.toLowerCase())
      );

      if (priestTask) {
        if (priestTask.startTime && priestTask.endTime) {
          const sMin = parseTimeToMinutes(priestTask.startTime);
          const eMin = parseTimeToMinutes(priestTask.endTime);
          if (sMin !== null && eMin !== null) {
            if (isDateOnly || isTimeInDutyRange(targetMinutes, sMin, eMin)) {
              addOnDuty(priest, `Duty Task: ${priestTask.dutyName || priestTask.title} (${priestTask.startTime} - ${priestTask.endTime})`);
              continue;
            }
          }
        } else if (priestTask.time) {
          const range = parseTimeRange(priestTask.time);
          if (range) {
            if (isDateOnly || isTimeInDutyRange(targetMinutes, range.start, range.end)) {
              addOnDuty(priest, `Duty Task: ${priestTask.dutyName || priestTask.title} (${priestTask.time})`);
              continue;
            }
          } else {
            const singleMin = parseTimeToMinutes(priestTask.time);
            if (singleMin !== null && targetMinutes !== null) {
              if (Math.abs(targetMinutes - singleMin) <= 90) {
                addOnDuty(priest, `Duty Task: ${priestTask.dutyName || priestTask.title} (${priestTask.time})`);
                continue;
              }
            } else if (isDateOnly) {
              addOnDuty(priest, `Duty Task: ${priestTask.dutyName || priestTask.title}`);
              continue;
            }
          }
        }
      }

      // Check ShiftAssignment
      const priestShiftAssignment = shiftAssignments.find(
        (sa) =>
          (sa.staffId && (sa.staffId === priest.userId || sa.staffId === priest.employeeId)) ||
          (sa.employeeId && sa.employeeId === priest.employeeId) ||
          (sa.employeeEmail && sa.employeeEmail.toLowerCase() === priest.email?.toLowerCase())
      );

      if (priestShiftAssignment && priestShiftAssignment.startTime && priestShiftAssignment.endTime) {
        const saStart = parseTimeToMinutes(priestShiftAssignment.startTime);
        const saEnd = parseTimeToMinutes(priestShiftAssignment.endTime);
        if (saStart !== null && saEnd !== null) {
          if (isDateOnly || isTimeInDutyRange(targetMinutes, saStart, saEnd)) {
            addOnDuty(priest, `Shift Duty: ${priestShiftAssignment.shiftName} (${priestShiftAssignment.startTime} - ${priestShiftAssignment.endTime})`);
            continue;
          }
        }
      }

      // D. Check Employee Record currentDuty / defaultShift / shift
      if (priest.employeeRecord) {
        const emp = priest.employeeRecord;
        const dutyStr = emp.currentDuty?.shift || emp.shift || emp.defaultShift || "";
        const parsedRange = parseTimeRange(dutyStr);

        if (parsedRange) {
          if (isDateOnly || isTimeInDutyRange(targetMinutes, parsedRange.start, parsedRange.end)) {
            addOnDuty(priest, `Duty Shift: ${dutyStr}`);
            continue;
          }
        } else if (dutyStr) {
          // Look up shift in Shift collection
          const cleanShiftName = dutyStr.replace(/\(.*?\)/g, "").trim().toLowerCase();
          if (shiftMap.has(cleanShiftName)) {
            const s = shiftMap.get(cleanShiftName);
            if (isDateOnly || isTimeInDutyRange(targetMinutes, s.start, s.end)) {
              addOnDuty(priest, `Duty Shift: ${dutyStr} (${s.raw})`);
              continue;
            }
          }
        }
      }
    }

    // E. Fallback: If no priest's shift matched the exact hour
    if (onDutyList.length === 0) {
      // 1. Priests with any task or duty scheduled on this day
      for (const priest of availablePriests) {
        const hasTaskToday = tasks.some(
          (t) =>
            (t.staffId && (t.staffId === priest.userId || t.staffId === priest.employeeId)) ||
            (t.staffEmail && t.staffEmail.toLowerCase() === priest.email?.toLowerCase())
        );
        if (hasTaskToday) {
          addOnDuty(priest, "Scheduled Duty on Pooja Date");
        }
      }

      // 2. If still none, all active priests not on leave
      if (onDutyList.length === 0) {
        for (const priest of availablePriests) {
          addOnDuty(priest, "Active Temple Priest");
        }
      }
    }

    return onDutyList;
  } catch (error) {
    console.error("Error finding on-duty priests:", error);
    return [];
  }
};

/**
 * Dispatch pooja booking notification to all on-duty priests.
 *
 * @param {Object} booking - The booking document or payload
 * @param {Object} [options] - Additional options
 */
const notifyOnDutyPriestsForPoojaBooking = async (booking, options = {}) => {
  try {
    if (!booking) return { success: false, reason: "No booking data provided" };

    const devoteeName = clean(booking.devoteeName || booking.customerName) || "Devotee";
    const datetime = booking.datetime || booking.bookingDate || new Date();
    const devoteePhone = clean(booking.devoteePhone || booking.contactNumber || booking.phone);
    const notes = clean(booking.notes);
    const amount = Number(booking.amount) || 0;
    const paymentMethod = clean(booking.paymentMethod) || "Cash/Online";
    const bookingId = booking._id ? booking._id.toString() : (clean(booking.bookingNumber) || "");

    // Resolve service / pooja names (handles single and combined bookings)
    let poojaNames = clean(booking.service);
    if (booking.isCombined && Array.isArray(booking.items) && booking.items.length > 0) {
      const poojaItems = booking.items
        .filter((item) => !item.type || String(item.type).toLowerCase() === "pooja")
        .map((item) => item.name || item.service)
        .filter(Boolean);
      if (poojaItems.length > 0) {
        poojaNames = poojaItems.join(", ");
      }
    }
    if (!poojaNames) poojaNames = "General Pooja";

    const { formattedTimings } = getDutyDateKeyAndMinutes(datetime);

    // Find on-duty priests for this booking datetime
    const onDutyList = await findOnDutyPriests(datetime, {
      assignedPriest: booking.assignedPriest,
      service: poojaNames,
    });

    if (onDutyList.length === 0) {
      console.log(`ℹ️ [Priest Notification] No on-duty priests found for ${poojaNames} on ${datetime}`);
      return { success: false, reason: "No on-duty priests available" };
    }

    // Auto-assign on-duty priest to booking if not already assigned
    if (!booking.assignedPriest && onDutyList.length > 0) {
      const primaryPriest = onDutyList[0].priest;
      if (primaryPriest.userId && mongoose.Types.ObjectId.isValid(primaryPriest.userId)) {
        try {
          if (typeof booking.save === "function") {
            booking.assignedPriest = primaryPriest.userId;
            booking.priestName = primaryPriest.name;
            await booking.save();
          } else if (booking._id) {
            const BookingModel = require("../models/Booking");
            await BookingModel.findByIdAndUpdate(booking._id, {
              assignedPriest: primaryPriest.userId,
              priestName: primaryPriest.name,
            });
          }
        } catch (assignErr) {
          console.warn("Auto-assignment of on-duty priest skipped:", assignErr.message);
        }
      }
    }

    const notifiedPriests = [];

    for (const item of onDutyList) {
      const { priest, reason } = item;

      // Avoid sending duplicate notification to the same priest for the same booking
      if (bookingId && priest.userId) {
        const existing = await Notification.findOne({
          audienceId: priest.userId,
          category: "booking",
          message: new RegExp(devoteeName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
          createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) }, // within last 10 minutes
        });
        if (existing) {
          console.log(`ℹ️ [Priest Notification] Notification already sent to ${priest.name} for this booking.`);
          continue;
        }
      }

      const notifTitle = `🪔 New Pooja Booked: ${poojaNames}`;
      const notifMessage = [
        `Namaste Sri ${priest.name},`,
        "",
        `A new pooja has been booked by a devotee during your duty schedule:`,
        "",
        `🙏 Devotee Name: ${devoteeName}`,
        `🪔 Pooja Name: ${poojaNames}`,
        `⏰ Timings: ${formattedTimings}`,
        devoteePhone ? `📞 Contact: ${devoteePhone}` : null,
        amount > 0 ? `💰 Amount: ₹${amount} (${paymentMethod})` : null,
        notes ? `📝 Special Notes / Sankalpa: ${notes}` : null,
        `📍 Duty Schedule: ${reason}`,
        "",
        `You are on duty at this time. Please check your Priest Portal to view complete details and arrange the required materials.`,
      ]
        .filter((line) => line !== null)
        .join("\n");

      await createNotification({
        title: notifTitle,
        message: notifMessage,
        audienceId: priest.userId,
        audienceEmail: priest.email,
        audienceRole: "priest",
        category: "booking",
      });

      notifiedPriests.push({ name: priest.name, email: priest.email, duty: reason });
    }

    console.log(`✅ [Priest Notification] Successfully sent pooja booking notification to ${notifiedPriests.length} on-duty priest(s):`, notifiedPriests);
    return { success: true, count: notifiedPriests.length, notifiedPriests };
  } catch (error) {
    console.error("❌ Failed to notify on-duty priests for pooja booking:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  findOnDutyPriests,
  notifyOnDutyPriestsForPoojaBooking,
  parseTimeToMinutes,
  parseTimeRange,
  isTimeInDutyRange,
  getDutyDateKeyAndMinutes,
};
