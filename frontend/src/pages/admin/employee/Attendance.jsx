import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import SectionCard from "../../../components/admin/employee/SectionCard";
import { attendanceTrend, departmentStrength, employees, attendanceHeatmap } from "./employeeData";

const attendanceTiles = [
  { title: "Present Today", value: 42, accent: "bg-emerald-100 text-emerald-700" },
  { title: "Absent", value: 4, accent: "bg-rose-100 text-rose-700" },
  { title: "Late Entries", value: 7, accent: "bg-amber-100 text-amber-700" },
  { title: "Half Day", value: 3, accent: "bg-sky-100 text-sky-700" },
  { title: "Overtime Staff", value: 5, accent: "bg-violet-100 text-violet-700" },
];

const Attendance = () => {
  return (
    <div className="space-y-8">
      <SectionCard title="Attendance Dashboard" subtitle="Monitor daily attendance and punctuality for temple staff." className="bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#191c3b] via-[#3b2a6d] to-[#7d5dd8] text-white border-transparent shadow-2xl shadow-violet-600/20">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          {attendanceTiles.map((tile) => (
            <div key={tile.title} className={`rounded-[28px] border border-white/10 px-5 py-6 ${tile.accent} bg-white/10 shadow-xl shadow-slate-900/10`}>
              <p className="text-sm uppercase tracking-[0.18em] text-slate-100/70">{tile.title}</p>
              <p className="mt-4 text-3xl font-semibold text-white">{tile.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-[1.7fr_0.9fr]">
        <div className="space-y-5">
          <SectionCard title="Monthly Attendance Trend" subtitle="Attendance heatmap for the week." className="overflow-hidden">
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceTrend} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="attendanceColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.15} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#64748b" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b" }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: "#8b5cf6" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Daily Attendance Table" subtitle="Quick status for today's roster." className="overflow-hidden">
            <div className="overflow-x-auto rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-100 text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Employee</th>
                    <th className="px-5 py-4">Department</th>
                    <th className="px-5 py-4">Shift</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Check-in</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.slice(0, 6).map((emp) => (
                    <tr key={emp.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold text-slate-900">{emp.name}</td>
                      <td className="px-5 py-4">{emp.department}</td>
                      <td className="px-5 py-4">{emp.shift}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${emp.status === "Active" ? "bg-emerald-100 text-emerald-700" : emp.status === "On Leave" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{emp.status === "Active" ? "09:12 AM" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-5">
          <SectionCard title="Attendance Trends" subtitle="Compare performance by day." className="overflow-hidden">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={attendanceHeatmap} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#64748b" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b" }} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard title="Weekly Punctuality" subtitle="Top punctual employees and score." className="overflow-hidden">
            <div className="space-y-4">
              <div className="rounded-[28px] bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">Punctuality Score</p>
                    <h3 className="mt-2 text-3xl font-semibold text-slate-900">94.7%</h3>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">Stable</span>
                </div>
              </div>
              <div className="space-y-3">
                {employees.slice(0, 4).map((emp) => (
                  <div key={emp.id} className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-white p-4">
                    <div>
                      <p className="font-semibold text-slate-900">{emp.name}</p>
                      <p className="text-sm text-slate-500">{emp.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{Math.floor(90 + Math.random() * 9)}%</p>
                      <p className="text-xs text-slate-500">On time</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Attendance Calendar" subtitle="Mark shifts and attendance events." className="overflow-hidden">
            <div className="grid gap-3 rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <span>{day}</span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">21/22</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
