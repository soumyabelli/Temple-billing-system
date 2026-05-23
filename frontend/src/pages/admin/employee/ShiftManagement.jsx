import SectionCard from "../../../components/admin/employee/SectionCard";
import { shiftSchedules, employees } from "./employeeData";

const shiftCards = [
  { title: "Morning Pooja", count: 12, accent: "from-amber-500 to-orange-500" },
  { title: "Afternoon Duty", count: 8, accent: "from-cyan-500 to-sky-600" },
  { title: "Evening Aarti", count: 6, accent: "from-violet-500 to-fuchsia-500" },
  { title: "Donation Counter", count: 5, accent: "from-emerald-500 to-teal-600" },
  { title: "Prasadam Counter", count: 7, accent: "from-yellow-500 to-amber-500" },
  { title: "Security Shift", count: 9, accent: "from-slate-500 to-slate-700" },
];

const ShiftManagement = () => {
  return (
    <div className="space-y-8">
      <SectionCard title="Shift Management" subtitle="Schedule priest duty, temple operations, and festival rosters." className="bg-gradient-to-r from-[#211d50] via-[#403b8f] to-[#8067e0] text-white border-transparent shadow-2xl shadow-violet-600/20">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {shiftCards.map((card) => (
            <div key={card.title} className={`rounded-[28px] border border-white/10 bg-gradient-to-br ${card.accent} px-5 py-6 shadow-xl shadow-slate-900/10`}>
              <p className="text-sm uppercase tracking-[0.16em] text-white/80">{card.title}</p>
              <p className="mt-4 text-3xl font-semibold text-white">{card.count} slots</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
        <div className="space-y-5">
          <SectionCard title="Shift Calendar" subtitle="Drag and assign duties with a temple-first timetable." className="overflow-hidden">
            <div className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <div className="grid grid-cols-7 gap-3 text-center text-xs uppercase tracking-[0.16em] text-slate-500">
                {"Mon Tue Wed Thu Fri Sat Sun".split(" ").map((day) => (
                  <div key={day} className="rounded-2xl bg-white py-3 shadow-sm">{day}</div>
                ))}
              </div>
              {[...Array(4)].map((_, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-7 gap-3">
                  {Array.from({ length: 7 }).map((__, colIndex) => (
                    <div key={colIndex} className="min-h-[106px] rounded-3xl bg-white p-3 shadow-sm">
                      <div className="text-xs text-slate-400">{colIndex + 1 + rowIndex * 7}</div>
                      <div className="mt-2 text-sm font-semibold text-slate-900">{shiftSchedules[(colIndex + rowIndex) % shiftSchedules.length].role}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Duty Assignment" subtitle="Assign temple roster members to active shifts." className="overflow-hidden">
            <div className="space-y-4">
              {shiftSchedules.map((shift) => (
                <div key={`${shift.day}-${shift.role}`} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{shift.role}</p>
                      <p className="text-sm text-slate-500">{shift.day} • {shift.time}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{shift.employee}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-5">
          <SectionCard title="Upcoming Shifts" subtitle="Next duty assignments and conflict alerts." className="overflow-hidden">
            <div className="space-y-3">
              {employees.slice(0, 5).map((emp) => (
                <div key={emp.id} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{emp.name}</p>
                      <p className="text-sm text-slate-500">{emp.role}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{emp.shift}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Shift Alerts" subtitle="Conflicts and assignment warnings." className="overflow-hidden">
            <div className="space-y-3 text-sm text-slate-600">
              <div className="rounded-[22px] border border-rose-200 bg-rose-50 p-4">
                <p className="font-semibold text-rose-700">Conflict detected</p>
                <p className="mt-1">Bakshi and Mukesh have overlapping night duties on Friday.</p>
              </div>
              <div className="rounded-[22px] border border-amber-200 bg-amber-50 p-4">
                <p className="font-semibold text-amber-700">Shift capacity low</p>
                <p className="mt-1">Evening Aarti has 2 open duty slots remaining.</p>
              </div>
              <div className="rounded-[22px] border border-sky-200 bg-sky-50 p-4">
                <p className="font-semibold text-sky-700">Festival staffing</p>
                <p className="mt-1">Additional volunteers needed for Saturday cultural puja.</p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default ShiftManagement;
