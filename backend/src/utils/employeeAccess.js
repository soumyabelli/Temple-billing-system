const ROLE_ACCESS = {
  admin: {
    permissions: ["employees.manage", "attendance.manage", "payroll.manage", "reports.export"],
    menuAccess: ["dashboard", "employees", "attendance", "payroll", "reports"],
  },
  priest: {
    permissions: ["poojas.view", "poojas.update", "attendance.self", "profile.self"],
    menuAccess: ["dashboard", "poojas", "schedule", "duties", "notifications", "profile"],
  },
  staff: {
    permissions: ["tasks.view", "tasks.update", "attendance.self", "leave.self", "profile.self"],
    menuAccess: ["dashboard", "tasks", "attendance", "leave", "notifications", "profile"],
  },
  cashier: {
    permissions: ["billing.manage", "bookings.view", "donations.record", "profile.self"],
    menuAccess: ["dashboard", "billing", "bookings", "donations", "receipts", "profile"],
  },
  accountant: {
    permissions: ["accounts.view", "payroll.view", "reports.view", "profile.self"],
    menuAccess: ["dashboard", "accounts", "payroll", "reports", "profile"],
  },
};

const LOGIN_ALLOWED_STATUSES = ["Active", "On Leave"];
const ATTENDANCE_ALLOWED_STATUSES = ["Active"];

const getRoleAccess = (role) => ROLE_ACCESS[String(role || "").toLowerCase()] || {
  permissions: [],
  menuAccess: ["dashboard", "profile"],
};

const canLoginForStatus = (status) => LOGIN_ALLOWED_STATUSES.includes(status || "Active");
const canMarkAttendanceForStatus = (status) => ATTENDANCE_ALLOWED_STATUSES.includes(status || "Active");

module.exports = {
  LOGIN_ALLOWED_STATUSES,
  ATTENDANCE_ALLOWED_STATUSES,
  getRoleAccess,
  canLoginForStatus,
  canMarkAttendanceForStatus,
};
