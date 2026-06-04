import { useEffect, useMemo, useState } from "react";
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
import { FiCalendar, FiChevronLeft, FiChevronRight, FiClock, FiUsers } from "react-icons/fi";
import { FaCalendarCheck, FaRegTimesCircle, FaUserClock } from "react-icons/fa";

import SectionCard from "../../../components/admin/employee/SectionCard";
import { getAdminAttendanceDashboard } from "../../../services/attendanceService";

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

const Attendance = () => {
  const [monthKey, setMonthKey] = useState(formatMonthKey(new Date()));
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminAttendanceDashboard(monthKey);
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
  }, [monthKey]);

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
  const timeline = dashboard?.timeline || [];
  const todayDuty = dashboard?.todayDuty || [];
  const shiftSummary = dashboard?.shiftSummary || {};
  const summary = dashboard?.summary || {};
  const monthLabel = dashboard?.monthLabel || monthKey;
  const headerDate = dashboard?.headerDate || "";

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

  return (
    <div className="space-y-6">
      <SectionCard
        title="Attendance Dashboard"
        subtitle="Live attendance tracking for staff and employees."
        topRight={
          <div className="flex items-center gap-2">
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

      <div className="grid gap-5 xl:grid-cols-[1.65fr_0.95fr]">
        <div className="space-y-5">
          <SectionCard
            title="Attendance Records"
            subtitle="Latest check-ins, check-outs, leave entries, and working hours."
            topRight={<span className="text-sm font-semibold text-slate-500">{headerDate}</span>}
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
                    <th className="px-4 py-3">Check In</th>
                    <th className="px-4 py-3">Check Out</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-slate-500" colSpan="8">
                        No attendance records found for this month.
                      </td>
                    </tr>
                  ) : (
                    records.map((record) => (
                      <tr key={record.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-4 font-medium text-slate-900">{record.date}</td>
                        <td className="px-4 py-4 text-slate-700">{record.employeeName || "Unknown"}</td>
                        <td className="px-4 py-4 text-slate-600">{record.department || "-"}</td>
                        <td className="px-4 py-4 text-slate-600">{record.shift || "-"}</td>
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>

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
        </div>

        <div className="space-y-5">
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

          <SectionCard title="Shift Breakdown" subtitle="Employees grouped by shift assignments.">
            <div className="space-y-3">
              {shiftEntries.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
                  No shift data available.
                </div>
              ) : (
                shiftEntries.map(([shiftName, count]) => (
                  <div key={shiftName} className="rounded-[22px] border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{shiftName}</p>
                        <p className="text-sm text-slate-500">{count} employee(s)</p>
                      </div>
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        Shift
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

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
                    <p className="mt-1 text-sm text-slate-500">{task.area || "General area"}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                      <span className="rounded-full bg-slate-100 px-3 py-1">{task.staffName || "Staff"}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">{task.time || task.dueDate || "-"}</span>
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
