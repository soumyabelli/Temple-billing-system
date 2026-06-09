import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiSearch, FiFilter, FiUpload, FiPlus } from "react-icons/fi";
import { ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useNavigate } from "react-router-dom";
import SectionCard from "../../../components/admin/employee/SectionCard";
import EmployeeTable from "../../../components/admin/employee/EmployeeTable";
import { attendanceTrend, payrollTrend } from "./employeeData";
import { getEmployees, getEmployee, deleteEmployee } from "../../../services/employeeService";

const chartColors = ["#7c3aed", "#ec4899", "#38bdf8", "#f59e0b", "#10b981"];

const AllEmployees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await getEmployees();
      setEmployees(response);
      setFilteredEmployees(response);
    } catch (error) {
      console.error("Failed to load employees", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const query = searchTerm.toLowerCase();
    setFilteredEmployees(
      employees.filter((employee) => {
        const name = employee.name?.toLowerCase() || "";
        const email = employee.email?.toLowerCase() || "";
        const role = employee.role?.toLowerCase() || "";
        const department = employee.department?.toLowerCase() || "";
        return name.includes(query) || email.includes(query) || role.includes(query) || department.includes(query);
      })
    );
  }, [searchTerm, employees]);

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await deleteEmployee(id);
      setEmployees((current) => current.filter((employee) => employee._id !== id));
      setSelectedEmployee((current) => (current?._id === id ? null : current));
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleViewEmployee = async (employee) => {
    try {
      const latestEmployee = await getEmployee(employee._id);
      setSelectedEmployee(latestEmployee);
    } catch (error) {
      console.error("Failed to load employee details", error);
      setSelectedEmployee(employee);
    }
  };

  const handleExport = () => {
    if (!filteredEmployees.length) return;

    const headers = [
      "Name",
      "Email",
      "Role",
      "Department",
      "Contact",
      "Shift",
      "Status",
      "Joining Date",
      "Salary",
      "Employment Type",
    ];

    const csvRows = [
      headers.join(","),
      ...filteredEmployees.map((employee) => {
        const row = [
          employee.name || "",
          employee.email || "",
          employee.role || "",
          employee.department || "",
          employee.phone || employee.emergencyContact || "",
          employee.shift || "",
          employee.status || "Active",
          employee.joiningDate || "",
          employee.salary || "",
          employee.employmentType || "",
        ]
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",");
        return row;
      }),
    ].join("\n");

    const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `temple-employees-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const departmentStrength = useMemo(() => {
    const counts = employees.reduce((total, employee) => {
      const department = employee.department || "Unassigned";
      total[department] = (total[department] || 0) + 1;
      return total;
    }, {});

    return Object.entries(counts).map(([department, value]) => ({ department, value }));
  }, [employees]);

  const distributionData = useMemo(() => {
    const counts = employees.reduce((total, employee) => {
      const role = employee.role || "Unknown";
      total[role] = (total[role] || 0) + 1;
      return total;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [employees]);

  const recentJoinings = useMemo(() => {
    return employees
      .filter((employee) => employee.joiningDate)
      .slice()
      .sort((a, b) => new Date(b.joiningDate) - new Date(a.joiningDate))
      .slice(0, 3)
      .map((employee) => ({
        name: employee.name,
        role: employee.role,
        date: new Date(employee.joiningDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      }));
  }, [employees]);

  const upcomingBirthdays = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    return employees
      .filter((employee) => employee.dob)
      .map((employee) => {
        const dob = new Date(employee.dob);
        const birthdayThisYear = new Date(currentYear, dob.getMonth(), dob.getDate());
        const nextBirthday = birthdayThisYear < today ? new Date(currentYear + 1, dob.getMonth(), dob.getDate()) : birthdayThisYear;
        return {
          ...employee,
          nextBirthday,
        };
      })
      .sort((a, b) => a.nextBirthday - b.nextBirthday)
      .slice(0, 3)
      .map((employee) => ({
        name: employee.name,
        role: employee.role || employee.department || "Staff",
        date: employee.nextBirthday.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
      }));
  }, [employees]);

  const employeeStats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((employee) => employee.status === "Active").length;
    const recent = Math.max(0, employees.filter((employee) => {
      if (!employee.joiningDate) return false;
      return new Date(employee.joiningDate) >= new Date(new Date().setMonth(new Date().getMonth() - 1));
    }).length);

    return [
      { title: "Total Employees", value: total, delta: total ? `${total > 0 ? "+2.8%" : "0%"}` : "0%", icon: "👥", accent: "from-violet-500 to-purple-600" },
      { title: "Active Employees", value: active, delta: active ? "+1.9%" : "0%", icon: "✅", accent: "from-cyan-500 to-blue-600" },
      { title: "New Joinings", value: recent, delta: recent ? "+1.2%" : "0%", icon: "✨", accent: "from-amber-400 to-orange-500" },
    ];
  }, [employees]);

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] bg-gradient-to-r from-[#221b3d] via-[#3a2f63] to-[#6b4f9f] p-6 text-white shadow-2xl shadow-violet-500/20 backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-amber-300/80">Employee Management</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">All Employees</h1>
            <p className="max-w-2xl text-slate-200/90 mt-2">Premium temple HR dashboard with smart employee search, role-based insights, and workflow action controls.</p>
          </div>
          <button onClick={() => navigate("/admin/employees/add")} className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-3 font-semibold text-slate-950 shadow-xl shadow-amber-500/20 transition hover:-translate-y-0.5">
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
            className="rounded-[28px] border border-white/15 bg-white/80 p-5 shadow-2xl shadow-slate-900/5 backdrop-blur-xl"
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
            <FiSearch /> <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} type="text" placeholder="Search employees..." className="w-48 bg-transparent text-sm outline-none" />
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-slate-800 transition">
            <FiFilter /> Filters
          </button>
          <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-600 shadow-sm hover:bg-amber-50 transition">
            <FiUpload /> Export
          </button>
        </div>}>
        <EmployeeTable employees={filteredEmployees} onView={handleViewEmployee} onDelete={handleDeleteEmployee} loading={loading} />
      </SectionCard>

      {selectedEmployee && (
        <SectionCard title="Selected Employee" subtitle="Review detailed employee profile." className="bg-white/95 text-slate-950">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-200">
                  {selectedEmployee.photo ? (
                    <img src={selectedEmployee.photo} alt={selectedEmployee.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-xl font-bold text-slate-600">
                      {(selectedEmployee.name || "E").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-500">Name</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">{selectedEmployee.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {selectedEmployee.role} | {selectedEmployee.status || "Active"}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Department</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{selectedEmployee.department || "-"}</p>
              <p className="mt-1 text-sm text-slate-600">Shift: {selectedEmployee.shift || "-"}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Contact</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{selectedEmployee.phone || selectedEmployee.emergencyContact || "-"}</p>
              <p className="mt-1 text-sm text-slate-600">Joined: {selectedEmployee.joiningDate || new Date(selectedEmployee.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Email</p>
              <p className="mt-1 font-semibold text-slate-900">{selectedEmployee.email || "-"}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Gender</p>
              <p className="mt-1 font-semibold text-slate-900">{selectedEmployee.gender || "-"}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Date of Birth</p>
              <p className="mt-1 font-semibold text-slate-900">{selectedEmployee.dob || "-"}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Blood Group</p>
              <p className="mt-1 font-semibold text-slate-900">{selectedEmployee.bloodGroup || "-"}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Aadhaar</p>
              <p className="mt-1 font-semibold text-slate-900">{selectedEmployee.aadhaar || "-"}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Emergency Contact</p>
              <p className="mt-1 font-semibold text-slate-900">{selectedEmployee.emergencyContact || "-"}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Employment Type</p>
              <p className="mt-1 font-semibold text-slate-900">{selectedEmployee.employmentType || "-"}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Salary</p>
              <p className="mt-1 font-semibold text-slate-900">{selectedEmployee.salary || "-"}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Permissions</p>
              <p className="mt-1 font-semibold text-slate-900">{selectedEmployee.permissions || "-"}</p>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Address</p>
            <p className="mt-1 font-semibold text-slate-900">{selectedEmployee.address || "-"}</p>
          </div>
        </SectionCard>
      )}

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

          <SectionCard title="Employee Distribution" subtitle="Live role proportion in the temple workforce." className="text-center">
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
