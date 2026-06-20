import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { FiCalendar, FiChevronLeft, FiChevronRight, FiClock, FiDownload, FiEdit2, FiSave, FiUsers } from "react-icons/fi";
import { FaCalendarCheck, FaRegTimesCircle, FaUserClock } from "react-icons/fa";

import SectionCard from "../../../components/admin/employee/SectionCard";
import { getAdminAttendanceDashboard, updateAttendance } from "../../../services/attendanceService";
import { getAdminEmployees } from "../../../services/adminService";

const formatMonthKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const shiftMonthKey = (monthKey, delta) => {
  const [yearPart, monthPart] = monthKey.split("-");
  const monthDate = new Date(Number(yearPart), Number(monthPart) - 1, 1);
  monthDate.setMonth(monthDate.getMonth() + delta);
  return formatMonthKey(monthDate);
};

const statusToneMap = {
  Present: "text-emerald-600 bg-emerald-50",
  Late: "text-amber-600 bg-amber-50",
  Leave: "text-blue-600 bg-blue-50",
  Absent: "text-rose-600 bg-rose-50",
  "Half Day": "text-violet-600 bg-violet-50",
};

const summaryIconMap = {
  Employees: FiUsers,
  Present: FaCalendarCheck,
  Absent: FaRegTimesCircle,
  Leave: FaUserClock,
  "Working Days": FiCalendar,
  Attendance: FiClock,
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const calendarToneMap = {
  Present: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Late: "bg-amber-100 text-amber-700 border-amber-200",
  Leave: "bg-sky-100 text-sky-700 border-sky-200",
  Absent: "bg-rose-100 text-rose-700 border-rose-200",
};

const formatDisplayDate = (dateKey) => {
  const date = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateKey || "--";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const getMonthRange = (monthKey) => {
  const [yearPart, monthPart] = monthKey.split("-");
  const year = Number(yearPart);
  const monthIndex = Number(monthPart) - 1;
  const startDate = new Date(year, monthIndex, 1);
  const endDate = new Date(year, monthIndex + 1, 0);
  return { year, monthIndex, startDate, endDate };
};

const buildCalendarDays = (monthKey, records = [], employeeId = "") => {
  const { year, monthIndex, startDate, endDate } = getMonthRange(monthKey);
  const todayKey = new Date().toISOString().slice(0, 10);
  const visibleRecordByDate = new Map();

  records.forEach((record) => {
    if (employeeId && record.employeeId && String(record.employeeId) !== String(employeeId)) return;
    if (employeeId && record.employeeEmail && !record.employeeId) return;
    visibleRecordByDate.set(record.dateKey, record);
  });

  const firstVisible = new Date(startDate);
  firstVisible.setDate(firstVisible.getDate() - ((firstVisible.getDay() + 6) % 7));

  const days = [];
  for (let index = 0; index < 42; index += 1) {
    const cursor = new Date(firstVisible);
    cursor.setDate(firstVisible.getDate() + index);
    const dateKey = cursor.toISOString().slice(0, 10);
    const record = visibleRecordByDate.get(dateKey);
    let status = record?.status || null;

    if (!status && cursor >= startDate && cursor <= endDate && dateKey <= todayKey) {
      status = "Absent";
    }

    days.push({
      dateKey,
      day: cursor.getDate(),
      muted: cursor.getMonth() !== monthIndex,
      today: dateKey === todayKey,
      status,
    });
  }

  return days;
};

const Attendance = () => {
  const [monthKey, setMonthKey] = useState(formatMonthKey(new Date()));
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [editingRecord, setEditingRecord] = useState(null);
  const [correctionForm, setCorrectionForm] = useState({
    checkIn: "",
    checkOut: "",
    status: "Present",
    shift: "Morning",
    note: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const response = await getAdminEmployees();
        const list = Array.isArray(response) ? response : response?.employees || [];
        setEmployees(list);
        if (!selectedEmployeeId && list.length > 0) {
          setSelectedEmployeeId(list[0]._id || list[0].id || "");
        }
      } catch (requestError) {
        setEmployees([]);
      }
    };

    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminAttendanceDashboard(monthKey, selectedEmployeeId || undefined);
      setDashboard(response);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load attendance dashboard");
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey, selectedEmployeeId]);

  const selectedEmployee = useMemo(
    () => employees.find((employee) => String(employee._id || employee.id) === String(selectedEmployeeId)) || null,
    [employees, selectedEmployeeId]
  );

  const summaryCards = dashboard?.overview?.length
    ? dashboard.overview
    : [
        { label: "Employees", value: "0", tone: "info" },
        { label: "Present", value: "0", tone: "success" },
        { label: "Absent", value: "0", tone: "danger" },
        { label: "Leave", value: "0", tone: "warning" },
        { label: "Working Days", value: "0" },
        { label: "Attendance", value: "0%", tone: "accent" },
      ];

  const records = dashboard?.records || [];
  const todayRecords = dashboard?.todayRecords || [];
  const timeline = dashboard?.timeline || [];
  const todayDuty = dashboard?.todayDuty || [];
  const shiftSummary = dashboard?.shiftSummary || {};
  const summary = dashboard?.summary || {};
  const monthLabel = dashboard?.monthLabel || monthKey;
  const headerDate = dashboard?.headerDate || "";

  const selectedEmployeeRecords = useMemo(() => {
    if (!selectedEmployee) {
      return records;
    }

    const employeeEmail = String(selectedEmployee.email || "").toLowerCase();
    return records.filter((record) => {
      const recordEmployeeId = String(record.employeeId || record.staffId || "");
      const recordEmployeeEmail = String(record.employeeEmail || "").toLowerCase();
      return recordEmployeeId === String(selectedEmployee._id || selectedEmployee.id) || (employeeEmail && recordEmployeeEmail === employeeEmail);
    });
  }, [records, selectedEmployee]);

  const selectedEmployeeTodayRecord = useMemo(() => {
    if (!selectedEmployee) {
      return null;
    }

    const employeeId = String(selectedEmployee._id || selectedEmployee.id || "");
    const employeeEmail = String(selectedEmployee.email || "").toLowerCase();
    return (
      todayRecords.find((record) => {
        const recordEmployeeId = String(record.employeeId || "");
        const recordEmployeeEmail = String(record.employeeEmail || "").toLowerCase();
        return recordEmployeeId === employeeId || (employeeEmail && recordEmployeeEmail === employeeEmail);
      }) || null
    );
  }, [selectedEmployee, todayRecords]);

  const calendarDays = useMemo(
    () => buildCalendarDays(monthKey, records, selectedEmployee?._id || selectedEmployee?.id || ""),
    [monthKey, records, selectedEmployee]
  );

  const monthlyEmployeeSummary = useMemo(() => {
    const { startDate, endDate } = getMonthRange(monthKey);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = today.toISOString().slice(0, 10);

    const recordsByDate = new Map();
    selectedEmployeeRecords.forEach((record) => {
      recordsByDate.set(record.dateKey, record);
    });

    let present = 0;
    let absent = 0;
    let leave = 0;
    let late = 0;

    for (let cursor = new Date(startDate); cursor <= endDate; cursor.setDate(cursor.getDate() + 1)) {
      const currentKey = cursor.toISOString().slice(0, 10);
      const record = recordsByDate.get(currentKey);

      if (record?.status === "Leave") {
        leave += 1;
        continue;
      }

      if (record?.status === "Late") {
        present += 1;
        late += 1;
        continue;
      }

      if (record?.status === "Present") {
        present += 1;
        continue;
      }

      if (record?.status === "Half Day") {
        present += 1;
        continue;
      }

      if (cursor <= today && currentKey <= todayKey) {
        absent += 1;
      }
    }

    const workingDays = present + absent + leave;
    const attendancePercent = workingDays > 0 ? Math.round((present / workingDays) * 100) : 0;

    return { present, absent, leave, late, workingDays, attendancePercent };
  }, [monthKey, selectedEmployeeRecords]);

  const correctionTargetName = editingRecord?.employeeName || selectedEmployee?.name || "Record";

  const chartData = useMemo(() => {
    return timeline.map((entry) => ({
      day: entry.date?.split(" ")[0] || entry.dateKey?.slice(8, 10) || "",
      present: entry.present || 0,
      absent: entry.absent || 0,
      leave: entry.leave || 0,
      late: entry.late || 0,
      attendancePercent: entry.attendancePercent || 0,
    }));
  }, [timeline]);

  const shiftEntries = useMemo(() => Object.entries(shiftSummary), [shiftSummary]);
  const selectedEmployeeShiftLabel = selectedEmployee
    ? selectedEmployeeTodayRecord?.shift || selectedEmployee?.shift || "Morning"
    : "All Employees";
  const selectedEmployeeShiftTiming =
    selectedEmployee && selectedEmployeeTodayRecord?.shiftStartTime && selectedEmployeeTodayRecord?.shiftEndTime
      ? `${selectedEmployeeTodayRecord.shiftStartTime} - ${selectedEmployeeTodayRecord.shiftEndTime}`
      : "--";

  const openCorrection = (record) => {
    setEditingRecord(record);
    setCorrectionForm({
      checkIn: record.checkIn && record.checkIn !== "--" ? record.checkIn : "",
      checkOut: record.checkOut && record.checkOut !== "--" ? record.checkOut : "",
      status: record.status || "Present",
      shift: record.shift || "Morning",
      note: record.note || "",
    });
  };

  const closeCorrection = () => {
    setEditingRecord(null);
  };

  const saveCorrection = async () => {
    if (!editingRecord) return;

    try {
      setSavingId(editingRecord.id);
      await updateAttendance(editingRecord.id, correctionForm);
      await loadDashboard();
      setEditingRecord(null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update attendance record");
    } finally {
      setSavingId("");
    }
  };

  const exportPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    let y = 42;

    doc.setFontSize(18);
    doc.text("Attendance Report", 40, y);
    y += 22;
    doc.setFontSize(10);
    doc.text(`Month: ${monthLabel}`, 40, y);
    y += 18;
    doc.text(`Employee: ${selectedEmployee?.name || "All Employees"}`, 40, y);
    y += 22;

    const summaryLines = [
      `Present: ${monthlyEmployeeSummary.present}`,
      `Absent: ${monthlyEmployeeSummary.absent}`,
      `Leave: ${monthlyEmployeeSummary.leave}`,
      `Late: ${monthlyEmployeeSummary.late}`,
      `Attendance %: ${monthlyEmployeeSummary.attendancePercent}%`,
    ];

    summaryLines.forEach((line) => {
      doc.text(line, 40, y);
      y += 16;
    });

    y += 12;
    doc.setFontSize(12);
    doc.text("Latest Records", 40, y);
    y += 16;
    doc.setFontSize(9);

    selectedEmployeeRecords.slice(0, 20).forEach((record) => {
      const row = `${record.date || formatDisplayDate(record.dateKey)} | ${record.employeeName || "-"} | ${record.shift || "-"} | ${record.checkIn || "--"} | ${record.checkOut || "--"} | ${record.status || "-"}`;
      doc.text(row, 40, y);
      y += 14;
      if (y > 760) {
        doc.addPage();
        y = 40;
      }
    });

    doc.save(`attendance-report-${monthKey}.pdf`);
  };

  const exportExcel = () => {
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([
        ["Metric", "Value"],
        ["Month", monthLabel],
        ["Employee", selectedEmployee?.name || "All Employees"],
        ["Present", monthlyEmployeeSummary.present],
        ["Absent", monthlyEmployeeSummary.absent],
        ["Leave", monthlyEmployeeSummary.leave],
        ["Late", monthlyEmployeeSummary.late],
        ["Attendance %", `${monthlyEmployeeSummary.attendancePercent}%`],
      ]),
      "Summary"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(
        todayRecords.map((record) => ({
          Employee: record.employeeName,
          Shift: record.shift,
          "Check In": record.checkIn,
          "Check Out": record.checkOut,
          Status: record.status,
          "Working Hours": record.workingHours,
        }))
      ),
      "Today"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(
        selectedEmployeeRecords.map((record) => ({
          Date: record.date || formatDisplayDate(record.dateKey),
          Employee: record.employeeName,
          Shift: record.shift,
          "Check In": record.checkIn,
          "Check Out": record.checkOut,
          Status: record.status,
          "Working Hours": record.workingHours,
        }))
      ),
      "Monthly Records"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(
        calendarDays.map((day) => ({
          Date: day.dateKey,
          Day: day.day,
          Status: day.status || "",
        }))
      ),
      "Calendar"
    );

    XLSX.writeFile(workbook, `attendance-report-${monthKey}.xlsx`);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Attendance Dashboard"
        subtitle="Live attendance tracking for staff and employees."
        topRight={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedEmployeeId}
              onChange={(event) => setSelectedEmployeeId(event.target.value)}
              className="min-w-[180px] rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 outline-none"
            >
              <option value="">All Employees</option>
              {employees.map((employee) => (
                <option key={employee._id || employee.id} value={employee._id || employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="2020"
              max="2100"
              value={Number(monthKey.slice(0, 4))}
              onChange={(event) => setMonthKey(`${event.target.value}-${monthKey.slice(5, 7)}`)}
              className="w-24 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 outline-none"
            />
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
              onClick={() => setMonthKey((current) => shiftMonthKey(current, -1))}
              aria-label="Previous month"
            >
              <FiChevronLeft />
            </button>
            <button
              type="button"
              className="inline-flex min-w-[150px] items-center justify-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700"
            >
              <FiCalendar />
              {monthLabel}
            </button>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
              onClick={() => setMonthKey((current) => shiftMonthKey(current, 1))}
              aria-label="Next month"
            >
              <FiChevronRight />
            </button>
            <button
              type="button"
              onClick={exportPdf}
              className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700"
            >
              <FiDownload /> PDF
            </button>
            <button
              type="button"
              onClick={exportExcel}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"
            >
              <FiDownload /> Excel
            </button>
            <button
              type="button"
              onClick={printReport}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Print
            </button>
          </div>
        }
      >
        {error ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-slate-500">
            Loading attendance data...
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            {summaryCards.map((card) => {
              const Icon = summaryIconMap[card.label || card.title] || FiClock;
              const tone = card.tone || "info";
              return (
                <div
                  key={card.label || card.title}
                  className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-lg shadow-slate-900/5"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        tone === "success"
                          ? "bg-emerald-100 text-emerald-600"
                          : tone === "danger"
                            ? "bg-rose-100 text-rose-600"
                            : tone === "warning"
                              ? "bg-amber-100 text-amber-600"
                              : tone === "accent"
                                ? "bg-violet-100 text-violet-600"
                                : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      <Icon className="text-xl" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-500">{card.label || card.title}</p>
                      <p className="mt-1 text-3xl font-semibold text-slate-900">{card.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Today's Attendance Table"
        subtitle="All employees, their assigned shift times, and the current status in one place."
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Shift</th>
                <th className="px-4 py-3">Shift Time</th>
                <th className="px-4 py-3">Check In</th>
                <th className="px-4 py-3">Check Out</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {todayRecords.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan="7">
                    No attendance data is available for today.
                  </td>
                </tr>
              ) : (
                todayRecords.map((record) => (
                  <tr key={record.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-4 font-medium text-slate-900">{record.employeeName}</td>
                    <td className="px-4 py-4 text-slate-600">{record.shift || "-"}</td>
                    <td className="px-4 py-4 text-slate-600">
                      {record.shiftStartTime && record.shiftEndTime ? `${record.shiftStartTime} - ${record.shiftEndTime}` : "--"}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{record.checkIn || "--"}</td>
                    <td className="px-4 py-4 text-slate-600">{record.checkOut || "--"}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${calendarToneMap[record.status] || "border-slate-200 bg-slate-100 text-slate-700"}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => openCorrection(record)}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <FiEdit2 /> Correct
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

            <div className="space-y-6">
        <SectionCard
          title="Monthly Attendance Records"
          subtitle={selectedEmployee ? `Monthly attendance for ${selectedEmployee.name}.` : "Monthly attendance for the selected employee."}
          topRight={<span className="text-sm font-semibold text-slate-500">{selectedEmployeeShiftLabel}</span>}
          className="overflow-hidden"
        >
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Shift</th>
                    <th className="px-4 py-3">Shift Time</th>
                    <th className="px-4 py-3">Check In</th>
                    <th className="px-4 py-3">Check Out</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Hours</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedEmployeeRecords.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-slate-500" colSpan="10">
                        No attendance records found for the selected employee.
                      </td>
                    </tr>
                  ) : (
                    selectedEmployeeRecords.map((record) => (
                      <tr key={record.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-4 font-medium text-slate-900">{record.date}</td>
                        <td className="px-4 py-4 text-slate-700">{record.employeeName || "Unknown"}</td>
                        <td className="px-4 py-4 text-slate-600">{record.department || "-"}</td>
                        <td className="px-4 py-4 text-slate-600">{record.shift || "-"}</td>
                        <td className="px-4 py-4 text-slate-600">
                          {record.shiftStartTime && record.shiftEndTime ? `${record.shiftStartTime} - ${record.shiftEndTime}` : "--"}
                        </td>
                        <td className="px-4 py-4 text-slate-600">{record.checkIn || "--"}</td>
                        <td className="px-4 py-4 text-slate-600">{record.checkOut || "--"}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              statusToneMap[record.status] || "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-700">{record.workingHours || "--"}</td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => openCorrection(record)}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <FiEdit2 /> Correct
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          <SectionCard title="Attendance Trend" subtitle="Daily attendance percentage across the selected month." className="overflow-hidden">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#64748b" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b" }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="attendancePercent" stroke="#f97316" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Status Breakdown" subtitle="Present, absent, leave, and late counts from the selected month.">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.slice(-7)} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#64748b" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b" }} />
                  <Tooltip />
                  <Bar dataKey="present" fill="#22c55e" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="absent" fill="#ef4444" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="leave" fill="#3b82f6" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          <SectionCard title="Attendance Calendar" subtitle="Day-wise status for the selected employee or month view.">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500">
              {calendarDays.slice(0, 7).map((day, index) => (
                <div key={`${day.dateKey}-${index}`} className="rounded-xl bg-slate-100 px-2 py-2">
                  {new Date(`${day.dateKey}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short" })}
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {calendarDays.map((day) => (
                <div
                  key={day.dateKey}
                  className={`rounded-[22px] border p-4 ${day.muted ? "bg-slate-50" : "bg-white"} ${day.today ? "ring-2 ring-amber-300" : "border-slate-200"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-lg font-semibold text-slate-900">{day.day}</p>
                    <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${calendarToneMap[day.status] || "border-slate-200 bg-slate-100 text-slate-700"}`}>
                      {day.status || "-"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{formatDisplayDate(day.dateKey)}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Selected Employee Summary" subtitle={selectedEmployee ? selectedEmployee.name : "Choose an employee to review their monthly summary."}>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-emerald-50 p-4 text-center">
                <p className="text-sm font-medium text-emerald-700">Present</p>
                <p className="mt-2 text-3xl font-semibold text-emerald-700">{monthlyEmployeeSummary.present}</p>
              </div>
              <div className="rounded-2xl bg-rose-50 p-4 text-center">
                <p className="text-sm font-medium text-rose-700">Absent</p>
                <p className="mt-2 text-3xl font-semibold text-rose-700">{monthlyEmployeeSummary.absent}</p>
              </div>
              <div className="rounded-2xl bg-sky-50 p-4 text-center">
                <p className="text-sm font-medium text-sky-700">Leave</p>
                <p className="mt-2 text-3xl font-semibold text-sky-700">{monthlyEmployeeSummary.leave}</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4 text-center">
                <p className="text-sm font-medium text-amber-700">Late</p>
                <p className="mt-2 text-3xl font-semibold text-amber-700">{monthlyEmployeeSummary.late}</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-900">Shift:</span> {selectedEmployeeShiftLabel}</p>
              <p className="mt-1"><span className="font-semibold text-slate-900">Shift Time:</span> {selectedEmployeeShiftTiming}</p>
              <p className="mt-1"><span className="font-semibold text-slate-900">Default Duty:</span> {selectedEmployee?.defaultDuty || "-"}</p>
              <p className="mt-1"><span className="font-semibold text-slate-900">Duty Location:</span> {selectedEmployee?.dutyLocation || "-"}</p>
              <p className="mt-1"><span className="font-semibold text-slate-900">Attendance:</span> {monthlyEmployeeSummary.attendancePercent}%</p>
            </div>
          </SectionCard>
        </div>

        <SectionCard title={`Monthly Overview (${monthLabel})`} subtitle="Summary of staff attendance for the selected month.">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {summaryCards.slice(0, 6).map((card) => (
                <div key={card.label || card.title} className="rounded-[22px] border border-slate-200 bg-white p-4">
                  <p className="text-sm text-slate-500">{card.label || card.title}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-600">
                <span>Attendance Progress</span>
                <span>{summary.attendancePercent || 0}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-500"
                  style={{ width: `${summary.attendancePercent || 0}%` }}
                />
              </div>
            </div>
          </SectionCard>

        {editingRecord ? (
            <SectionCard title={`Manual Correction - ${correctionTargetName}`} subtitle="Update check-in, check-out, shift, or status." className="overflow-hidden">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-slate-600">
                  Check In
                  <input
                    type="text"
                    value={correctionForm.checkIn}
                    onChange={(event) => setCorrectionForm((current) => ({ ...current, checkIn: event.target.value }))}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                    placeholder="06:05 AM"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-600">
                  Check Out
                  <input
                    type="text"
                    value={correctionForm.checkOut}
                    onChange={(event) => setCorrectionForm((current) => ({ ...current, checkOut: event.target.value }))}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                    placeholder="02:00 PM"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-600">
                  Status
                  <select
                    value={correctionForm.status}
                    onChange={(event) => setCorrectionForm((current) => ({ ...current, status: event.target.value }))}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                  >
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="Absent">Absent</option>
                    <option value="Leave">Leave</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-600">
                  Shift
                  <input
                    type="text"
                    value={correctionForm.shift}
                    onChange={(event) => setCorrectionForm((current) => ({ ...current, shift: event.target.value }))}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                    placeholder="Morning"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-600 md:col-span-2">
                  Note
                  <textarea
                    value={correctionForm.note}
                    onChange={(event) => setCorrectionForm((current) => ({ ...current, note: event.target.value }))}
                    className="min-h-[96px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                    placeholder="Reason for correction"
                  />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={saveCorrection}
                  disabled={savingId === editingRecord.id}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <FiSave /> {savingId === editingRecord.id ? "Saving..." : "Save Correction"}
                </button>
                <button
                  type="button"
                  onClick={closeCorrection}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </SectionCard>
          ) : null}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          <SectionCard title="Today's Duties" subtitle="Assigned duties for today from the tasks module.">
            <div className="space-y-3">
              {todayDuty.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
                  No duties assigned for today.
                </div>
              ) : (
                todayDuty.slice(0, 5).map((task) => (
                  <div key={task.id} className="rounded-[22px] border border-slate-200 bg-white p-4">
                    <p className="font-semibold text-slate-900">{task.duty || "Duty"}</p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {task.assignmentType || "Special Duty"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{task.area || "General area"}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                      <span className="rounded-full bg-slate-100 px-3 py-1">{task.staffName || "Staff"}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        {task.shiftStartTime && task.shiftEndTime ? `${task.shiftStartTime} - ${task.shiftEndTime}` : task.time || task.dueDate || "-"}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">By {task.assignedBy || "Admin"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard title="Today's Snapshot" subtitle="Live counts for the selected day.">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-emerald-50 p-4 text-center">
                <p className="text-sm font-medium text-emerald-700">Present</p>
                <p className="mt-2 text-3xl font-semibold text-emerald-700">{dashboard?.today?.presentCount || 0}</p>
              </div>
              <div className="rounded-2xl bg-rose-50 p-4 text-center">
                <p className="text-sm font-medium text-rose-700">Absent</p>
                <p className="mt-2 text-3xl font-semibold text-rose-700">{dashboard?.today?.absentCount || 0}</p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-4 text-center">
                <p className="text-sm font-medium text-blue-700">Leave</p>
                <p className="mt-2 text-3xl font-semibold text-blue-700">{dashboard?.today?.leaveCount || 0}</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4 text-center">
                <p className="text-sm font-medium text-amber-700">Late</p>
                <p className="mt-2 text-3xl font-semibold text-amber-700">{dashboard?.today?.lateCount || 0}</p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
