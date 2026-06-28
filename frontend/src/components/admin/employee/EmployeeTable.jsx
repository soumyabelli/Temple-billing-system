import { motion } from "framer-motion";
import { FiTrash2, FiEye } from "react-icons/fi";

const statusStyles = {
  Active: "bg-emerald-100 text-emerald-700",
  "On Leave": "bg-amber-100 text-amber-700",
  Inactive: "bg-slate-100 text-slate-700",
  Suspended: "bg-rose-100 text-rose-700",
  Resigned: "bg-zinc-100 text-zinc-700",
  Retired: "bg-indigo-100 text-indigo-700",
};

const EmployeeTable = ({ employees, onView, onDelete, loading }) => {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50/80 shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-slate-100 p-4">
        <div className="text-sm font-semibold text-slate-700">Employee roster</div>
        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-500">{loading ? "Loading..." : `${employees.length} records`}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-500">
            <tr>
              <th className="px-5 py-4">Employee</th>
              <th className="px-5 py-4">ID</th>
              <th className="px-5 py-4">Role</th>
              <th className="px-5 py-4">Department</th>
              <th className="px-5 py-4">Contact</th>
              <th className="px-5 py-4">Shift</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Join Date</th>
              <th className="px-5 py-4">Salary</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee, index) => {
              const recordId = employee.employeeId || employee.id || employee._id || "-";
              const contact = employee.phone || employee.emergencyContact || "-";
              const joiningDate = employee.joiningDate || employee.createdAt
                ? new Date(employee.joiningDate || employee.createdAt).toLocaleDateString()
                : "-";
              const salary = employee.salary ? `₹ ${Number(employee.salary).toLocaleString("en-IN")}` : "₹ 0";
              const shift = employee.currentDuty?.shift || employee.defaultShift || employee.shift || "-";
              const initial = (employee.name || "E").charAt(0).toUpperCase();

              return (
                <motion.tr
                  key={recordId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-slate-200 bg-white hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {employee.photo ? (
                        <img src={employee.photo} alt={employee.name} className="h-11 w-11 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-slate-100 text-sm font-bold text-slate-600">
                          {initial}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-slate-900">{employee.name}</div>
                        <div className="text-xs text-slate-500">{employee.department || "-"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-700">{recordId}</td>
                  <td className="px-5 py-4 text-slate-700">{employee.role}</td>
                  <td className="px-5 py-4 text-slate-700">{employee.department}</td>
                  <td className="px-5 py-4 text-slate-700">{contact}</td>
                  <td className="px-5 py-4 text-slate-700">{shift}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[employee.status] || "bg-slate-100 text-slate-700"}`}>
                      {employee.status || "Active"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-700">{joiningDate}</td>
                  <td className="px-5 py-4 text-slate-700">{salary}</td>
                  <td className="px-5 py-4 text-slate-700 space-x-2">
                    <button onClick={() => onView?.(employee)} className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-500 transition hover:border-slate-400 hover:text-slate-900">
                      <FiEye size={16} />
                    </button>
                    <button onClick={() => onDelete?.(employee._id)} className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-rose-600 transition hover:bg-rose-100">
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTable;
