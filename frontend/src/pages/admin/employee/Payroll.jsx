import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import SectionCard from "../../../components/admin/employee/SectionCard";
import { payrollOverview, payrollTrend, employees, departmentStrength } from "./employeeData";

const payrollTiles = [
  { title: "Monthly Payroll", value: "₹8.45L", accent: "bg-violet-100 text-violet-700" },
  { title: "Pending Salary", value: "₹45,200", accent: "bg-amber-100 text-amber-700" },
  { title: "Paid Employees", value: 42, accent: "bg-emerald-100 text-emerald-700" },
  { title: "Bonus Distribution", value: "₹1.12L", accent: "bg-sky-100 text-sky-700" },
];

const Payroll = () => {
  return (
    <div className="space-y-8">
      <SectionCard title="Payroll Management" subtitle="Review salary payouts, bonus plans, and payment status." className="bg-gradient-to-r from-[#241f4f] via-[#3d3491] to-[#7857d2] text-white border-transparent shadow-2xl shadow-violet-600/20">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {payrollTiles.map((tile) => (
            <div key={tile.title} className={`rounded-[28px] border border-white/10 px-5 py-6 ${tile.accent} bg-white/10 shadow-xl shadow-slate-900/10`}>
              <p className="text-sm uppercase tracking-[0.16em] text-slate-100/70">{tile.title}</p>
              <p className="mt-4 text-3xl font-semibold text-white">{tile.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-[1.7fr_0.9fr]">
        <div className="space-y-5">
          <SectionCard title="Salary Payout Trend" subtitle="Monthly payroll spending analytics." className="overflow-hidden">
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={payrollTrend} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" opacity={0.4} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#64748b" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b" }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="salary" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: "#f59e0b" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Payroll Table" subtitle="Salary status and payout methods." className="overflow-hidden">
            <div className="overflow-x-auto rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-100 text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Employee</th>
                    <th className="px-5 py-4">Salary</th>
                    <th className="px-5 py-4">Bonus</th>
                    <th className="px-5 py-4">Deduction</th>
                    <th className="px-5 py-4">Net Salary</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.slice(0, 6).map((emp) => (
                    <tr key={emp.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold text-slate-900">{emp.name}</td>
                      <td className="px-5 py-4">{emp.salary}</td>
                      <td className="px-5 py-4">₹4,500</td>
                      <td className="px-5 py-4">₹1,200</td>
                      <td className="px-5 py-4 font-semibold text-slate-900">₹{Number(emp.salary.replace(/[^0-9]/g, "")) - 1200 + 4500}</td>
                      <td className="px-5 py-4"><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Paid</span></td>
                      <td className="px-5 py-4">Bank</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-5">
          <SectionCard title="Growth by Department" subtitle="Payroll allocation by team." className="overflow-hidden">
            <div className="space-y-4">
              {payrollOverview.map((item) => (
                <div key={item.name} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">Salary cost</p>
                    </div>
                    <p className="font-semibold text-slate-900">₹{item.value.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Upcoming Salary Dates" subtitle="Plan pending payouts with confidence." className="overflow-hidden">
            <div className="grid gap-4">
              {employees.slice(0, 4).map((emp) => (
                <div key={emp.id} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{emp.name}</p>
                      <p className="text-sm text-slate-500">{emp.role}</p>
                    </div>
                    <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">{emp.joiningDate}</span>
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

export default Payroll;
