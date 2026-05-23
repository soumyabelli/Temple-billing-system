import { motion } from "framer-motion";
import { FiMoreHorizontal } from "react-icons/fi";

const statusStyles = {
  Active: "bg-emerald-100 text-emerald-700",
  "On Leave": "bg-amber-100 text-amber-700",
  Pending: "bg-sky-100 text-sky-700",
  Absent: "bg-rose-100 text-rose-700",
};

const EmployeeTable = ({ employees }) => {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50/80 shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-slate-100 p-4">
        <div className="text-sm font-semibold text-slate-700">Employee roster</div>
        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-500">{employees.length} records</span>
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
            {employees.map((employee, index) => (
              <motion.tr
                key={employee.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="border-b border-slate-200 bg-white hover:bg-slate-50"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <img src={employee.photo} alt={employee.name} className="h-11 w-11 rounded-full object-cover border border-slate-200" />
                    <div>
                      <div className="font-semibold text-slate-900">{employee.name}</div>
                      <div className="text-xs text-slate-500">{employee.department}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-700">{employee.id}</td>
                <td className="px-5 py-4 text-slate-700">{employee.role}</td>
                <td className="px-5 py-4 text-slate-700">{employee.department}</td>
                <td className="px-5 py-4 text-slate-700">{employee.contact}</td>
                <td className="px-5 py-4 text-slate-700">{employee.shift}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[employee.status] || "bg-slate-100 text-slate-700"}`}>
                    {employee.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-700">{employee.joiningDate}</td>
                <td className="px-5 py-4 text-slate-700">{employee.salary}</td>
                <td className="px-5 py-4 text-slate-700">
                  <button className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-500 transition hover:border-amber-400 hover:text-amber-600">
                    <FiMoreHorizontal size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTable;
