export const employeeStats = [
  { title: "Total Employees", value: 48, delta: "+4.2%", icon: "👥", accent: "from-violet-500 to-purple-600" },
  { title: "Active Employees", value: 42, delta: "+3.5%", icon: "✅", accent: "from-cyan-500 to-blue-600" },
  { title: "Priests", value: 12, delta: "+1", icon: "🕉️", accent: "from-amber-500 to-orange-600" },
  { title: "Cashiers", value: 8, delta: "+2", icon: "💰", accent: "from-emerald-500 to-teal-600" },
  { title: "On Leave", value: 6, delta: "-1", icon: "🌙", accent: "from-rose-500 to-fuchsia-600" },
  { title: "Monthly Payroll", value: "₹8.45L", delta: "+9.1%", icon: "📈", accent: "from-sky-500 to-indigo-600" },
];

export const employees = [
  { id: "EMP001", photo: "https://i.pravatar.cc/80?img=10", name: "Ramesh Sharma", role: "Head Priest", department: "Priest Services", contact: "+91 98765 43210", shift: "Morning", status: "Active", joiningDate: "01 Jan 2020", salary: "₹95,000" },
  { id: "EMP002", photo: "https://i.pravatar.cc/80?img=12", name: "Suresh Iyer", role: "Priest", department: "Pooja Services", contact: "+91 87654 32109", shift: "Afternoon", status: "Active", joiningDate: "15 Mar 2021", salary: "₹55,000" },
  { id: "EMP003", photo: "https://i.pravatar.cc/80?img=14", name: "Anita Desai", role: "Accountant", department: "Accounts", contact: "+91 76543 21098", shift: "Day", status: "Active", joiningDate: "10 Feb 2022", salary: "₹50,000" },
  { id: "EMP004", photo: "https://i.pravatar.cc/80?img=16", name: "Vikram Singh", role: "Cashier", department: "Billing", contact: "+91 65432 10987", shift: "Evening", status: "On Leave", joiningDate: "05 Apr 2021", salary: "₹40,000" },
  { id: "EMP005", photo: "https://i.pravatar.cc/80?img=18", name: "Meera Patel", role: "Inventory Manager", department: "Prasadam", contact: "+91 54321 09876", shift: "Day", status: "Active", joiningDate: "12 Jun 2022", salary: "₹48,000" },
  { id: "EMP006", photo: "https://i.pravatar.cc/80?img=20", name: "Arjun Kumar", role: "Maintenance Lead", department: "Maintenance", contact: "+91 43210 98765", shift: "Night", status: "Active", joiningDate: "20 Jul 2021", salary: "₹38,000" },
  { id: "EMP007", photo: "https://i.pravatar.cc/80?img=22", name: "Pooja Nair", role: "Support Staff", department: "Devotee Services", contact: "+91 32109 87654", shift: "Morning", status: "Active", joiningDate: "18 Aug 2022", salary: "₹32,000" },
  { id: "EMP008", photo: "https://i.pravatar.cc/80?img=24", name: "Mukesh Yadav", role: "Security Guard", department: "Security", contact: "+91 21098 76543", shift: "Night", status: "Active", joiningDate: "25 Sep 2021", salary: "₹28,000" },
];

export const recentJoinings = [
  { name: "Ravi Shankar", role: "Support Staff", date: "10 May 2025" },
  { name: "Lakshmi Devi", role: "Priest", date: "08 May 2025" },
  { name: "Ganesh Rao", role: "Cashier", date: "05 May 2025" },
];

export const upcomingBirthdays = [
  { name: "Suresh Iyer", role: "Priest", date: "20 May" },
  { name: "Anita Desai", role: "Accountant", date: "22 May" },
  { name: "Vikram Singh", role: "Cashier", date: "25 May" },
];

export const distributionData = [
  { name: "Priests", value: 12 },
  { name: "Cashiers", value: 8 },
  { name: "Support", value: 14 },
  { name: "Admin", value: 6 },
  { name: "Maintenance", value: 8 },
];

export const attendanceTrend = [
  { day: "Mon", value: 42 },
  { day: "Tue", value: 44 },
  { day: "Wed", value: 41 },
  { day: "Thu", value: 43 },
  { day: "Fri", value: 40 },
  { day: "Sat", value: 39 },
  { day: "Sun", value: 42 },
];

export const departmentStrength = [
  { department: "Priest Services", value: 12 },
  { department: "Pooja Services", value: 8 },
  { department: "Accounts", value: 6 },
  { department: "Billing", value: 6 },
  { department: "Maintenance", value: 8 },
];

export const payrollTrend = [
  { month: "Jan", salary: 630000 },
  { month: "Feb", salary: 670000 },
  { month: "Mar", salary: 710000 },
  { month: "Apr", salary: 740000 },
  { month: "May", salary: 845000 },
];

export const growthTrend = [
  { month: "Jan", employees: 38 },
  { month: "Feb", employees: 39 },
  { month: "Mar", employees: 41 },
  { month: "Apr", employees: 44 },
  { month: "May", employees: 48 },
];

export const departments = ["Priest Services", "Pooja Services", "Accounts", "Billing", "Prasadam", "Maintenance", "Security", "Devotee Services"];
export const employeeRoles = [
  { value: "admin", label: "Admin" },
  { value: "priest", label: "Priest" },
  { value: "accountant", label: "Accountant" },
  { value: "cashier", label: "Cashier" },
  { value: "staff", label: "Staff" },
];
export const shifts = ["Morning", "Afternoon", "Evening", "Night"];
export const empTypes = ["Full-time", "Part-time", "Contract", "Temporary"];

export const leaveRequests = [
  { employee: "Vikram Singh", type: "Sick Leave", days: 3, status: "Pending", period: "12-14 Jun" },
  { employee: "Pooja Nair", type: "Festival Leave", days: 1, status: "Approved", period: "18 Jun" },
  { employee: "Anita Desai", type: "Casual Leave", days: 2, status: "Rejected", period: "25-26 Jun" },
];

export const performanceList = [
  { name: "Meera Patel", department: "Prasadam", attendance: "98%", discipline: "Excellent", quality: "High", rating: 4.9 },
  { name: "Ramesh Sharma", department: "Priest Services", attendance: "95%", discipline: "Excellent", quality: "High", rating: 4.8 },
  { name: "Suresh Iyer", department: "Pooja Services", attendance: "92%", discipline: "Good", quality: "High", rating: 4.5 },
];

export const shiftSchedules = [
  { day: "Mon", role: "Morning Pooja", employee: "Ramesh Sharma", time: "5:30 AM - 9:30 AM" },
  { day: "Tue", role: "Afternoon Duty", employee: "Pooja Nair", time: "12:00 PM - 4:00 PM" },
  { day: "Wed", role: "Evening Aarti", employee: "Suresh Iyer", time: "6:00 PM - 9:00 PM" },
  { day: "Thu", role: "Donation Counter", employee: "Anita Desai", time: "10:00 AM - 2:00 PM" },
  { day: "Fri", role: "Prasadam Counter", employee: "Meera Patel", time: "2:00 PM - 6:00 PM" },
  { day: "Sat", role: "Security Shift", employee: "Mukesh Yadav", time: "8:00 PM - 4:00 AM" },
];

export const payrollOverview = [
  { name: "Priest Services", value: 320000 },
  { name: "Accounts", value: 150000 },
  { name: "Billing", value: 120000 },
  { name: "Maintenance", value: 85000 },
];

export const topPerformers = [
  { name: "Ramesh Sharma", metric: "Spiritual Services", score: 98 },
  { name: "Anita Desai", metric: "Accounts Accuracy", score: 94 },
  { name: "Meera Patel", metric: "Inventory Control", score: 91 },
];

export const attendanceHeatmap = [
  { label: "Mon", value: 42 },
  { label: "Tue", value: 44 },
  { label: "Wed", value: 41 },
  { label: "Thu", value: 43 },
  { label: "Fri", value: 40 },
  { label: "Sat", value: 39 },
  { label: "Sun", value: 42 },
];
