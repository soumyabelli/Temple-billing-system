import { motion } from "framer-motion";
import { FiSearch, FiFilter, FiUpload, FiPlus } from "react-icons/fi";
import { ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Tooltip } from "recharts";
import SectionCard from "../../../components/admin/employee/SectionCard";
import EmployeeTable from "../../../components/admin/employee/EmployeeTable";
import {
  employeeStats,
  employees,
  recentJoinings,
  upcomingBirthdays,
  distributionData,
  attendanceTrend,
  departmentStrength,
  payrollTrend,
  growthTrend,
} from "./employeeData";

const chartColors = ["#7c3aed", "#ec4899", "#38bdf8", "#f59e0b", "#10b981"];

const AllEmployees = () => {
  return (
    <div className="space-y-8">
      <div className="rounded-[32px] bg-gradient-to-r from-[#221b3d] via-[#3a2f63] to-[#6b4f9f] p-6 text-white shadow-2xl shadow-violet-500/20 backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-amber-300/80">Employee Management</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">All Employees</h1>
            <p className="max-w-2xl text-slate-200/90 mt-2">Premium temple HR dashboard with smart employee search, role-based insights, and workflow action controls.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-3 font-semibold text-slate-950 shadow-xl shadow-amber-500/20 transition hover:-translate-y-0.5">
            <FiPlus /> Add Employee
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[repeat(3,minmax(0,1fr))]">
        {employeeStats.map((metric) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`rounded-[28px] border border-white/15 bg-white/80 p-5 shadow-2xl shadow-slate-900/5 backdrop-blur-xl`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">{metric.title}</p>
                <h3 className="mt-3 text-3xl font-semibold text-slate-900">{metric.value}</h3>
              </div>
              <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${metric.accent} text-white shadow-lg shadow-slate-900/10`}>
                <span>{metric.icon}</span>
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-500">{metric.delta} this month</div>
          </motion.div>
        ))}
      </div>

      <SectionCard title="Employee roster" subtitle="Search employees, filter by status, or export to Excel." topRight={<div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100/90 px-4 py-2 text-slate-600 shadow-sm">
            <FiSearch /> <input type="text" placeholder="Search employees..." className="w-48 bg-transparent text-sm outline-none" />
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-slate-800 transition">
            <FiFilter /> Filters
          </button>
          <button className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-600 shadow-sm hover:bg-amber-50 transition">
            <FiUpload /> Export
          </button>
        </div>}>
        <EmployeeTable employees={employees} />
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <SectionCard title="Attendance Summary" subtitle="Daily employee attendance at a glance." className="h-full">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={attendanceTrend} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.08} />
                    </linearGradient>
                  </defs>
                  <Tooltip cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="value" stroke="#7c3aed" fill="url(#attendanceGradient)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </SectionCard>
            <SectionCard title="Department Strength" subtitle="Team distribution across temple departments." className="h-full">
              <div className="space-y-4">
                {departmentStrength.map((dept) => (
                  <div key={dept.department} className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>{dept.department}</span>
                      <span>{dept.value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400" style={{ width: `${(dept.value / 16) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Payroll Trends" subtitle="Monthly salary spend and growth." className="h-full">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={payrollTrend} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="payrollGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <Tooltip cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }} />
                <Area type="monotone" dataKey="salary" stroke="#f59e0b" fill="url(#payrollGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>

        <div className="space-y-5">
          <SectionCard title="Recent Joinings" subtitle="Newest additions to the temple team." className="overflow-hidden">
            <div className="space-y-4">
              {recentJoinings.map((item) => (
                <div key={item.name} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.role}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Upcoming Birthdays" subtitle="Celebrate temple staff members." className="overflow-hidden">
            <div className="space-y-4">
              {upcomingBirthdays.map((item) => (
                <div key={item.name} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.role}</p>
                    </div>
                    <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Employee Distribution" subtitle="Role proportion in the temple workforce." className="text-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={distributionData} dataKey="value" cx="50%" cy="50%" innerRadius={52} outerRadius={90} paddingAngle={4}>
                  {distributionData.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} staff`} />
              </PieChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default AllEmployees;
