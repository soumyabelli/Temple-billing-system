require("dotenv").config();

const { connectDB } = require("../src/config/db");
const ShiftAssignment = require("../src/models/ShiftAssignment");
const Task = require("../src/models/Task");

const clean = (value) => String(value || "").trim();

const run = async () => {
  const connected = await connectDB();

  if (!connected) {
    throw new Error("MongoDB connection is required to run the migration.");
  }

  const assignments = await ShiftAssignment.find().sort({ createdAt: 1 });
  let migrated = 0;
  let skipped = 0;

  for (const assignment of assignments) {
    const dutyName = clean(assignment.shiftName);
    const dutyArea = clean(assignment.category || assignment.notes || "General");
    const reportingTime = clean(assignment.startTime);

    const filter = {
      employeeId: assignment.employeeId,
      shiftId: assignment.shiftId,
      dateKey: assignment.dateKey,
      dutyName,
    };

    const payload = {
      assignmentType: "Duty & Shift",
      shiftId: assignment.shiftId,
      shiftName: assignment.shiftName,
      shiftStartTime: assignment.startTime,
      shiftEndTime: assignment.endTime,
      staffId: assignment.staffId || assignment.employeeId,
      employeeId: assignment.employeeId,
      staffName: assignment.employeeName,
      employeeName: assignment.employeeName,
      staffEmail: assignment.employeeEmail,
      employeeEmail: assignment.employeeEmail,
      dateKey: assignment.dateKey,
      startTime: assignment.startTime,
      endTime: assignment.endTime,
      title: dutyName,
      description: dutyArea,
      dueDate: assignment.dateKey,
      dutyName,
      duty: dutyName,
      area: dutyArea,
      dutyArea,
      time: reportingTime,
      reportingTime,
      category: assignment.category,
      requiredStaff: assignment.requiredStaff,
      attendanceStatus: assignment.attendanceStatus || "Pending",
      conflict: Boolean(assignment.conflict),
      notes: assignment.notes || "",
      assignedBy: assignment.assignedBy || "Admin",
      durationMinutes: assignment.durationMinutes || 0,
      status: assignment.attendanceStatus || "Pending",
    };

    const result = await Task.updateOne(filter, { $set: payload }, { upsert: true });
    if (result.upsertedCount || result.modifiedCount) {
      migrated += 1;
    } else {
      skipped += 1;
    }
  }

  if (process.env.DELETE_SHIFT_ASSIGNMENTS_AFTER_MIGRATION === "true") {
    await ShiftAssignment.deleteMany({});
  }

  console.log(`Migrated ${migrated} assignment(s). Skipped ${skipped}.`);
  process.exit(0);
};

run().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exit(1);
});
