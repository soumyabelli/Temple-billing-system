import {
  MdDashboard,
  MdTempleBuddhist,
  MdOutlinePayments,
  MdNotifications,
  MdReceiptLong,
  MdManageAccounts,
  MdOutlineSettings,
  MdOutlinePerson,
  MdLogout,
  MdPeopleAlt,
  MdFestival,
  MdVerified,
  MdFeedback,
} from "react-icons/md";
import { FaDonate, FaBoxes, FaCalendarAlt, FaListAlt, FaPlusCircle, FaBullhorn, FaUsers } from "react-icons/fa";
import { HiDocumentReport } from "react-icons/hi";
import { AiOutlinePieChart } from "react-icons/ai";
import { GiTakeMyMoney } from "react-icons/gi";
import { FiRepeat } from "react-icons/fi";
import { RiQrCodeLine } from "react-icons/ri";
import { BiRefresh } from "react-icons/bi";
import { TbReportAnalytics } from "react-icons/tb";

export const sidebarItems = [
  { title: "Dashboard", icon: MdDashboard, path: "/admin" },
  { title: "Devotees Management", icon: MdPeopleAlt, path: "/admin/devotees" },
  { title: "Pooja Booking", icon: MdTempleBuddhist, path: "/admin/pooja" },
  {
    title: "Donations",
    icon: FaDonate,
    path: "/admin/donations",
  },
  { title: "Billing & Payments", icon: MdOutlinePayments, path: "/admin/billing" },
  {
    title: "Prasada",
    icon: FaBoxes,
    path: "/admin/prasada/booked",
    subItems: [{ title: "Prasada Booked", path: "/admin/prasada/booked" }],
  },
  { title: "Prasadam & Inventory", icon: FaBoxes, path: "/admin/inventory" },
  {
    title: "Employee Management",
    icon: MdPeopleAlt,
    path: "/admin/employees",
    subItems: [
      { title: "All Employees", path: "/admin/employees" },
      { title: "Add Employee", path: "/admin/employees/add" },
      { title: "Attendance", path: "/admin/employees/attendance" },
      { title: "Payroll", path: "/admin/employees/payroll" },
      { title: "Leave Management", path: "/admin/employees/leave" },
      { title: "Performance", path: "/admin/employees/performance" },
      { title: "Duty & Shift Management", path: "/admin/employees/shifts" },
    ],
  },
  { title: "Events", icon: FaCalendarAlt, path: "/admin/events" },
  { title: "Feedback & Complaints", icon: MdFeedback, path: "/admin/feedback" },
  { title: "Notifications", icon: MdNotifications, path: "/admin/notifications" },
  { title: "Reports & Analytics", icon: HiDocumentReport, path: "/admin/reports" },
  { title: "Receipts & Documents", icon: MdReceiptLong, path: "/admin/receipts" },
  { title: "User Management", icon: MdManageAccounts, path: "/admin/users" },
  { title: "Settings", icon: MdOutlineSettings, path: "/admin/settings" },
  { title: "Profile", icon: MdOutlinePerson, path: "/admin/profile" },
  { title: "Logout", icon: MdLogout, path: "/logout" },
];
