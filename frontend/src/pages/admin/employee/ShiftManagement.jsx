import { useEffect, useState } from "react";
import { 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiAlertTriangle, 
  FiPlus, 
  FiTrash2, 
  FiEdit2, 
  FiArrowLeft, 
  FiArrowRight, 
  FiInfo,
  FiX
} from "react-icons/fi";
import SectionCard from "../../../components/admin/employee/SectionCard";
import { 
  getShiftDashboard, 
  createShift, 
  updateShift, 
  deleteShift, 
  assignShift, 
  deleteAssignment 
} from "../../../services/shiftService";
import { getEmployees } from "../../../services/employeeService";

const CATEGORIES = [
  "Priest Services", 
  "Pooja Services", 
  "Accounts", 
  "Billing", 
  "Prasadam", 
  "Maintenance", 
  "Security", 
  "Devotee Services", 
  "General"
];

const parseTime = (timeStr) => {
  if (!timeStr) return { hour: "09", minute: "00", meridiem: "AM" };
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return { hour: "09", minute: "00", meridiem: "AM" };
  return {
    hour: String(match[1]).padStart(2, "0"),
    minute: match[2],
    meridiem: match[3].toUpperCase(),
  };
};

const getBadgeClass = (status) => {
  switch (status) {
    case "Checked Out":
      return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
    case "Checked In":
      return "bg-sky-500/10 text-sky-500 border border-sky-500/20";
    case "Employee unavailable":
      return "bg-rose-500/10 text-rose-500 border border-rose-500/20";
    case "Absent":
    case "Shift Missed":
    case "Missed":
      return "bg-red-500/10 text-red-500 border border-red-500/20";
    case "Pending":
    default:
      return "bg-slate-500/10 text-slate-500 border border-slate-500/20";
  }
};

const getCurrentWeekStartKey = () => {
  const today = new Date();
  const dayIndex = today.getDay();
  const mondayOffset = dayIndex === 0 ? -6 : 1 - dayIndex;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
};

const ShiftManagement = () => {
  // Database state
  const [shifts, setShifts] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [planner, setPlanner] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    totalShifts: 0,
    completedShifts: 0,
    missedShifts: 0,
    overtimeHours: 0,
    manpowerAvailable: 0,
  });
  
  const [employees, setEmployees] = useState([]);
  const [weekStart, setWeekStart] = useState(getCurrentWeekStartKey);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals state
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Shift Type Form State
  const [shiftForm, setShiftForm] = useState({
    shiftName: "",
    startHour: "09",
    startMinute: "00",
    startMeridiem: "AM",
    endHour: "05",
    endMinute: "00",
    endMeridiem: "PM",
    category: "General",
    requiredStaff: 1,
    notes: "",
  });

  // Shift Assignment Form State
  const [assignForm, setAssignForm] = useState({
    employeeId: "",
    shiftId: "",
    date: "",
    notes: "",
  });
  const [assignError, setAssignError] = useState("");
  const [shiftTypeError, setShiftTypeError] = useState("");

  // Load Dashboard Data
  const loadData = async (targetWeekStart) => {
    try {
      setLoading(true);
      setError("");
      
      const dashboard = await getShiftDashboard(targetWeekStart);
      setShifts(dashboard.shifts || []);
      setAssignments(dashboard.assignments || []);
      setPlanner(dashboard.planner || []);
      setUpcomingAssignments(dashboard.upcomingAssignments || []);
      setAlerts(dashboard.alerts || []);
      setStats(dashboard.stats || {
        totalShifts: 0,
        completedShifts: 0,
        missedShifts: 0,
        overtimeHours: 0,
        manpowerAvailable: 0,
      });
      
      const empData = await getEmployees();
      setEmployees(Array.isArray(empData) ? empData : empData.employees || []);
    } catch (err) {
      console.error("ShiftManagement load error", err);
      setError("Failed to load shift dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(weekStart);
  }, [weekStart]);

  // Navigate Weeks
  const handlePrevWeek = () => {
    if (!weekStart) return;
    const current = new Date(`${weekStart}T00:00:00`);
    current.setDate(current.getDate() - 7);
    setWeekStart(current.toISOString().slice(0, 10));
  };

  const handleNextWeek = () => {
    if (!weekStart) return;
    const current = new Date(`${weekStart}T00:00:00`);
    current.setDate(current.getDate() + 7);
    setWeekStart(current.toISOString().slice(0, 10));
  };

  const handleCurrentWeek = () => {
    setWeekStart(getCurrentWeekStartKey());
  };

  // Open Add Shift Modal
  const handleAddShiftClick = () => {
    setEditingShift(null);
    setShiftForm({
      shiftName: "",
      startHour: "09",
      startMinute: "00",
      startMeridiem: "AM",
      endHour: "05",
      endMinute: "00",
      endMeridiem: "PM",
      category: "General",
      requiredStaff: 1,
      notes: "",
    });
    setShiftTypeError("");
    setShowShiftModal(true);
  };

  // Open Edit Shift Modal
  const handleEditShiftClick = (shift) => {
    const start = parseTime(shift.startTime);
    const end = parseTime(shift.endTime);
    setEditingShift(shift);
    setShiftForm({
      shiftName: shift.shiftName,
      startHour: start.hour,
      startMinute: start.minute,
      startMeridiem: start.meridiem,
      endHour: end.hour,
      endMinute: end.minute,
      endMeridiem: end.meridiem,
      category: shift.category || "General",
      requiredStaff: shift.requiredStaff || 1,
      notes: shift.notes || "",
    });
    setShiftTypeError("");
    setShowShiftModal(true);
  };

  // Delete Shift Type
  const handleDeleteShiftClick = async (shiftId) => {
    if (!window.confirm("Are you sure you want to delete this shift type? This will also remove all its assignments.")) return;
    try {
      await deleteShift(shiftId);
      loadData(weekStart);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete shift type");
    }
  };

  // Save Shift Type (Create/Update)
  const handleShiftFormSubmit = async (e) => {
    e.preventDefault();
    setShiftTypeError("");
    
    // Combine hours and minutes
    const startTimeStr = `${Number(shiftForm.startHour)}:${shiftForm.startMinute} ${shiftForm.startMeridiem}`;
    const endTimeStr = `${Number(shiftForm.endHour)}:${shiftForm.endMinute} ${shiftForm.endMeridiem}`;
    
    const payload = {
      shiftName: shiftForm.shiftName.trim(),
      startTime: startTimeStr,
      endTime: endTimeStr,
      category: shiftForm.category,
      requiredStaff: Number(shiftForm.requiredStaff) || 1,
      notes: shiftForm.notes.trim(),
    };

    if (!payload.shiftName) {
      setShiftTypeError("Shift Name is required");
      return;
    }

    try {
      if (editingShift) {
        await updateShift(editingShift.id, payload);
      } else {
        await createShift(payload);
      }
      setShowShiftModal(false);
      loadData(weekStart);
    } catch (err) {
      setShiftTypeError(err.response?.data?.message || "Failed to save shift type");
    }
  };

  // Open Assign Shift Modal
  const handleAssignClick = () => {
    setAssignForm({
      employeeId: "",
      shiftId: "",
      date: "",
      notes: "",
    });
    setAssignError("");
    setShowAssignModal(true);
  };

  // Save Assignment
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setAssignError("");

    if (!assignForm.employeeId) {
      setAssignError("Please select an employee");
      return;
    }
    if (!assignForm.shiftId) {
      setAssignError("Please select a shift type");
      return;
    }
    if (!assignForm.date) {
      setAssignError("Please select a date");
      return;
    }

    try {
      await assignShift({
        shiftId: assignForm.shiftId,
        employeeId: assignForm.employeeId,
        date: assignForm.date,
        notes: assignForm.notes,
        assignedBy: "Admin",
      });
      setShowAssignModal(false);
      loadData(weekStart);
    } catch (err) {
      setAssignError(err.response?.data?.message || "Failed to assign shift");
    }
  };

  // Unassign/Delete Assignment
  const handleUnassignClick = async (assignmentId) => {
    if (!window.confirm("Are you sure you want to delete this shift assignment?")) return;
    try {
      await deleteAssignment(assignmentId);
      loadData(weekStart);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to unassign shift");
    }
  };

  // Helpers to select options
  const hoursOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutesOptions = ["00", "15", "30", "45"];
  const activeEmployees = employees.filter(emp => emp.status === "Active");

  if (loading && !shifts.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-slate-500">Loading Shift Management data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <SectionCard 
        title="Shift Management" 
        subtitle="Schedule priest duty, temple operations, and manage rosters with automated leaves & conflict checks." 
        className="bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#4f46e5] text-white border-transparent shadow-2xl shadow-violet-600/10"
        topRight={
          <button 
            onClick={handleAssignClick}
            className="flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition hover:bg-amber-600 active:scale-95"
          >
            <FiPlus size={16} /> Assign Shift
          </button>
        }
      >
        {/* Statistics Cards */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-sm transition-all hover:bg-white/10">
            <p className="text-xs uppercase tracking-wider text-white/60">Total Shift Types</p>
            <p className="mt-3 text-3xl font-bold text-white">{stats.totalShifts}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-sm transition-all hover:bg-white/10">
            <p className="text-xs uppercase tracking-wider text-white/60">Completed Shifts</p>
            <p className="mt-3 text-3xl font-bold text-emerald-400">{stats.completedShifts}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-sm transition-all hover:bg-white/10">
            <p className="text-xs uppercase tracking-wider text-white/60">Missed Shifts</p>
            <p className="mt-3 text-3xl font-bold text-rose-400">{stats.missedShifts}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-sm transition-all hover:bg-white/10">
            <p className="text-xs uppercase tracking-wider text-white/60">Overtime Hours</p>
            <p className="mt-3 text-3xl font-bold text-sky-400">{stats.overtimeHours} hrs</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-sm transition-all hover:bg-white/10">
            <p className="text-xs uppercase tracking-wider text-white/60">Active Staff Available</p>
            <p className="mt-3 text-3xl font-bold text-amber-400">{stats.manpowerAvailable}</p>
          </div>
        </div>
      </SectionCard>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-3">
          <FiAlertTriangle size={18} className="text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Main Weekly Planner Calendar */}
      <SectionCard 
        title="Weekly Shift Planner" 
        subtitle="Manage and view roster schedules in a weekly layout."
        topRight={
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrevWeek} 
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 transition active:scale-95"
              title="Previous Week"
            >
              <FiArrowLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-slate-800 bg-slate-100/70 border border-slate-200/50 rounded-xl px-4 py-2">
              Week start: {weekStart ? new Date(`${weekStart}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Loading..."}
            </span>
            <button 
              onClick={handleNextWeek} 
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 transition active:scale-95"
              title="Next Week"
            >
              <FiArrowRight size={16} />
            </button>
            <button 
              onClick={handleCurrentWeek} 
              className="text-xs font-semibold text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-xl px-3 py-2 border border-violet-100 transition"
            >
              This Week
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto pb-4">
          <div className="grid grid-cols-7 gap-4 min-w-[1024px]">
            {planner.map((day) => (
              <div key={day.dateKey} className="rounded-3xl border border-slate-200 bg-slate-50/50 p-4 shadow-sm min-h-[360px] flex flex-col">
                <div className="text-center border-b border-slate-200/60 pb-2 mb-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{day.label.split(",")[0]}</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{day.label.split(",")[1] || day.dateKey.split("-")[2]}</p>
                </div>
                
                <div className="flex-1 space-y-3">
                  {day.items.map((item) => (
                    <div 
                      key={item.id} 
                      className={`relative rounded-2xl border p-3 shadow-sm flex flex-col gap-1.5 transition-all hover:-translate-y-0.5 ${
                        item.conflict 
                          ? "bg-rose-50/60 border-rose-200/60 text-slate-900" 
                          : "bg-white border-slate-200/60 text-slate-900"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold leading-snug">{item.shiftName}</span>
                        <button 
                          onClick={() => handleUnassignClick(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition self-start"
                          title="Unassign shift"
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs text-slate-700">
                        <FiUser size={12} className="text-slate-400 flex-shrink-0" />
                        <span className="font-semibold truncate">{item.employeeName}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <FiClock size={11} className="text-slate-400 flex-shrink-0" />
                        <span>{item.startTime} - {item.endTime}</span>
                      </div>
                      
                      {item.conflict && (
                        <div className="flex items-center gap-1 text-[10px] text-rose-600 font-semibold mt-1">
                          <FiAlertTriangle size={11} className="flex-shrink-0" />
                          <span>Shift Overlap</span>
                        </div>
                      )}
                      
                      <span className={`text-[9px] font-semibold tracking-wider uppercase inline-block self-start rounded-full px-2 py-0.5 mt-1 border ${getBadgeClass(item.attendanceStatus)}`}>
                        {item.attendanceStatus}
                      </span>
                    </div>
                  ))}
                  
                  {day.items.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                      <FiCalendar size={20} className="stroke-[1.5] text-slate-300" />
                      <p className="text-[11px] mt-1.5 italic">No duties scheduled</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* 3. Shift Types Configuration Table & Alerts / Upcoming columns */}
      <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        {/* Shift Types Catalog */}
        <SectionCard 
          title="Active Shift Types" 
          subtitle="Configure default roster periods and staff requirements."
          topRight={
            <button 
              onClick={handleAddShiftClick}
              className="flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 px-3.5 py-2 text-xs font-semibold text-white transition active:scale-95"
            >
              <FiPlus size={14} /> Add Shift Type
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100/80 text-slate-500 rounded-xl">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Shift Name</th>
                  <th className="px-4 py-3">Timings</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Required Staff</th>
                  <th className="px-4 py-3 rounded-r-xl text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shifts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center text-slate-400 italic">No shift types created. Click "+ Add Shift Type" to get started.</td>
                  </tr>
                ) : (
                  shifts.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3.5 font-bold text-slate-800">{s.shiftName}</td>
                      <td className="px-4 py-3.5 text-slate-700 font-medium">{s.startTime} - {s.endTime}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-block rounded-xl bg-slate-100 px-2.5 py-1 font-semibold text-slate-600 text-[10px]">
                          {s.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 font-semibold">{s.requiredStaff} staff</td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => handleEditShiftClick(s)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-violet-600 hover:border-violet-200 transition"
                            title="Edit shift settings"
                          >
                            <FiEdit2 size={13} />
                          </button>
                          <button 
                            onClick={() => handleDeleteShiftClick(s.id)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 transition"
                            title="Delete shift type"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Alerts & Upcoming Duties */}
        <div className="space-y-5">
          {/* Shift Alerts Panel */}
          <SectionCard title="Shift Alerts" subtitle="Conflicts, leaves, and staff capacity warnings.">
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="rounded-[22px] border border-slate-100 bg-slate-50/50 p-4 text-center text-xs text-slate-500">
                  <FiInfo size={16} className="mx-auto text-slate-400 mb-1" />
                  No roster conflicts or low capacity issues detected.
                </div>
              ) : (
                alerts.map((alert, idx) => (
                  <div 
                    key={idx} 
                    className={`rounded-[20px] border p-4 text-xs transition-all shadow-sm ${
                      alert.tone === "danger" 
                        ? "border-rose-100 bg-rose-50/60 text-rose-800" 
                        : "border-amber-100 bg-amber-50/60 text-amber-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <FiAlertTriangle size={14} className={alert.tone === "danger" ? "text-rose-600" : "text-amber-600"} />
                      <span>{alert.title}</span>
                    </div>
                    <p className="leading-relaxed opacity-90">{alert.message}</p>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          {/* Upcoming Shifts Panel */}
          <SectionCard title="Upcoming Roster" subtitle="Next scheduled duties.">
            <div className="space-y-2.5">
              {upcomingAssignments.length === 0 ? (
                <div className="rounded-[22px] border border-slate-100 bg-slate-50/50 p-4 text-center text-xs text-slate-500">
                  No upcoming shifts scheduled.
                </div>
              ) : (
                upcomingAssignments.map((a) => (
                  <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm hover:border-slate-300 transition flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{a.employeeName}</p>
                      <p className="text-slate-500 font-medium mt-0.5">{a.shiftName}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(`${a.dateKey}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })} • {a.startTime}</p>
                    </div>
                    <span className={`text-[9px] font-bold tracking-wider rounded-full px-2 py-0.5 border ${getBadgeClass(a.attendanceStatus)}`}>
                      {a.attendanceStatus}
                    </span>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* 4. Add/Edit Shift Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">{editingShift ? "Edit Shift Type" : "Add Shift Type"}</h3>
              <button 
                onClick={() => setShowShiftModal(false)}
                className="rounded-xl border border-slate-100 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
              >
                <FiX size={16} />
              </button>
            </div>
            
            <form onSubmit={handleShiftFormSubmit} className="mt-4 space-y-4 text-xs">
              {shiftTypeError && (
                <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-rose-600 font-semibold">
                  {shiftTypeError}
                </div>
              )}

              <div>
                <label className="block text-slate-600 font-semibold mb-1.5">Shift Name</label>
                <input 
                  type="text" 
                  value={shiftForm.shiftName}
                  onChange={(e) => setShiftForm({ ...shiftForm, shiftName: e.target.value })}
                  placeholder="e.g. Morning Pooja"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 outline-none focus:border-violet-600 font-medium text-slate-800 transition"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1.5">Start Time</label>
                  <div className="flex gap-1.5">
                    <select 
                      value={shiftForm.startHour}
                      onChange={(e) => setShiftForm({ ...shiftForm, startHour: e.target.value })}
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-2 py-2.5 outline-none font-medium text-slate-800 transition"
                    >
                      {hoursOptions.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select 
                      value={shiftForm.startMinute}
                      onChange={(e) => setShiftForm({ ...shiftForm, startMinute: e.target.value })}
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-2 py-2.5 outline-none font-medium text-slate-800 transition"
                    >
                      {minutesOptions.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select 
                      value={shiftForm.startMeridiem}
                      onChange={(e) => setShiftForm({ ...shiftForm, startMeridiem: e.target.value })}
                      className="rounded-xl border border-slate-200 bg-white px-2 py-2.5 outline-none font-bold text-slate-800 transition"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1.5">End Time</label>
                  <div className="flex gap-1.5">
                    <select 
                      value={shiftForm.endHour}
                      onChange={(e) => setShiftForm({ ...shiftForm, endHour: e.target.value })}
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-2 py-2.5 outline-none font-medium text-slate-800 transition"
                    >
                      {hoursOptions.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select 
                      value={shiftForm.endMinute}
                      onChange={(e) => setShiftForm({ ...shiftForm, endMinute: e.target.value })}
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-2 py-2.5 outline-none font-medium text-slate-800 transition"
                    >
                      {minutesOptions.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select 
                      value={shiftForm.endMeridiem}
                      onChange={(e) => setShiftForm({ ...shiftForm, endMeridiem: e.target.value })}
                      className="rounded-xl border border-slate-200 bg-white px-2 py-2.5 outline-none font-bold text-slate-800 transition"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1.5">Category</label>
                  <select 
                    value={shiftForm.category}
                    onChange={(e) => setShiftForm({ ...shiftForm, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 outline-none font-medium text-slate-800 transition"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1.5">Required Staff</label>
                  <input 
                    type="number" 
                    min="1"
                    value={shiftForm.requiredStaff}
                    onChange={(e) => setShiftForm({ ...shiftForm, requiredStaff: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 outline-none font-medium text-slate-800 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1.5">Notes (Optional)</label>
                <textarea 
                  value={shiftForm.notes}
                  onChange={(e) => setShiftForm({ ...shiftForm, notes: e.target.value })}
                  placeholder="Notes about location or specific duties"
                  rows="2"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 outline-none focus:border-violet-600 font-medium text-slate-800 transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowShiftModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="rounded-xl bg-violet-600 hover:bg-violet-700 px-5 py-2.5 font-semibold text-white transition active:scale-95 shadow-md shadow-violet-600/10"
                >
                  Save Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Assign Shift Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Assign Shift to Staff</h3>
              <button 
                onClick={() => setShowAssignModal(false)}
                className="rounded-xl border border-slate-100 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
              >
                <FiX size={16} />
              </button>
            </div>
            
            <form onSubmit={handleAssignSubmit} className="mt-4 space-y-4 text-xs">
              {assignError && (
                <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-rose-600 font-semibold flex items-center gap-2 leading-relaxed">
                  <FiAlertTriangle size={15} className="flex-shrink-0" />
                  <span>{assignError}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-600 font-semibold mb-1.5">Select Employee</label>
                <select 
                  value={assignForm.employeeId}
                  onChange={(e) => setAssignForm({ ...assignForm, employeeId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 outline-none font-semibold text-slate-800 transition"
                >
                  <option value="">-- Select Employee --</option>
                  {activeEmployees.map(emp => (
                    <option key={emp.id} value={emp.id || emp._id}>
                      {emp.name} ({emp.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1.5">Select Shift Type</label>
                <select 
                  value={assignForm.shiftId}
                  onChange={(e) => setAssignForm({ ...assignForm, shiftId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 outline-none font-semibold text-slate-800 transition"
                >
                  <option value="">-- Select Shift Type --</option>
                  {shifts.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.shiftName} ({s.startTime} - {s.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1.5">Date</label>
                <input 
                  type="date"
                  value={assignForm.date}
                  onChange={(e) => setAssignForm({ ...assignForm, date: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 outline-none font-semibold text-slate-850 transition"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1.5">Assignment Notes (Optional)</label>
                <textarea 
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                  placeholder="Special instructions for the duty"
                  rows="2"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 outline-none focus:border-violet-600 font-medium text-slate-800 transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAssignModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-2.5 font-semibold text-white transition active:scale-95 shadow-md shadow-amber-500/10"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftManagement;
