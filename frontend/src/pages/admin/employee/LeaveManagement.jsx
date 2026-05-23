import SectionCard from "../../../components/admin/employee/SectionCard";
import { leaveRequests, employees, departmentStrength } from "./employeeData";

const leaveTiles = [
  { title: "Leave Requests", value: 14, accent: "bg-sky-100 text-sky-700" },
  { title: "Approved Leaves", value: 9, accent: "bg-emerald-100 text-emerald-700" },
  { title: "Rejected Leaves", value: 3, accent: "bg-rose-100 text-rose-700" },
  { title: "Employees On Leave", value: 6, accent: "bg-amber-100 text-amber-700" },
];

const LeaveManagement = () => {
  return (
    <div className="space-y-8">
      <SectionCard title="Leave Management" subtitle="Approve, review, and track employee leave requests." className="bg-gradient-to-r from-[#251f4c] via-[#4c3692] to-[#7b61d0] text-white border-transparent shadow-2xl shadow-violet-600/20">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {leaveTiles.map((tile) => (
            <div key={tile.title} className={`rounded-[28px] border border-white/10 px-5 py-6 ${tile.accent} bg-white/10 shadow-xl shadow-slate-900/10`}>
              <p className="text-sm uppercase tracking-[0.16em] text-slate-100/70">{tile.title}</p>
              <p className="mt-4 text-3xl font-semibold text-white">{tile.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-5">
          <SectionCard title="Leave Requests" subtitle="Manage pending employee leave approvals." className="overflow-hidden">
            <div className="overflow-x-auto rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-100 text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Employee</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Days</th>
                    <th className="px-5 py-4">Period</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.map((request) => (
                    <tr key={request.employee} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold text-slate-900">{request.employee}</td>
                      <td className="px-5 py-4">{request.type}</td>
                      <td className="px-5 py-4">{request.days}</td>
                      <td className="px-5 py-4">{request.period}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${request.status === "Approved" ? "bg-emerald-100 text-emerald-700" : request.status === "Rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                          {request.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard title="Leave Balance" subtitle="Employee leave buckets and availability." className="overflow-hidden">
            <div className="grid gap-4 sm:grid-cols-2">
              {employees.slice(0, 4).map((emp) => (
                <div key={emp.id} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{emp.name}</p>
                      <p className="text-xs text-slate-500">{emp.role}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{Math.floor(8 + Math.random() * 5)} days</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-5">
          <SectionCard title="Leave Calendar" subtitle="Scheduled and upcoming leaves." className="overflow-hidden">
            <div className="grid gap-3 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                {"MTWTFSS".split("").map((day) => (<div key={day} className="py-2 rounded-2xl bg-white shadow-sm">{day}</div>))}
              </div>
              {[1,2,3,4,5].map((row) => (
                <div key={row} className="grid grid-cols-7 gap-2 text-center text-sm">
                  {Array.from({ length: 7 }).map((_, idx) => (
                    <div key={idx} className="rounded-2xl bg-white/80 py-4 shadow-sm">{row * 7 - 6 + idx}</div>
                  ))}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Upcoming Leaves" subtitle="Team members on leave next week." className="overflow-hidden">
            <div className="space-y-4">
              {leaveRequests.map((leave) => (
                <div key={leave.employee} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{leave.employee}</p>
                      <p className="text-sm text-slate-500">{leave.type} • {leave.period}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{leave.days} days</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Department Leave Impact" subtitle="Which team has the most absence requests?" className="overflow-hidden">
            <div className="space-y-4">
              {departmentStrength.map((dept) => (
                <div key={dept.department} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{dept.department}</p>
                      <p className="text-sm text-slate-500">Team strength</p>
                    </div>
                    <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{Math.max(1, Math.round(dept.value * 0.35))} leaves</div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default LeaveManagement;
