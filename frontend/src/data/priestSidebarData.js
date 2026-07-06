import {
  MdDashboard,
  MdNotifications,
  MdOutlineSettings,
  MdOutlinePerson,
  MdLogout,
  MdFestival,
} from "react-icons/md";
import {
  FaClipboardList,
  FaCalendarAlt,
  FaCheckCircle,
  FaStar,
  FaBoxOpen,
  FaClock,
  FaFileSignature,
} from "react-icons/fa";

export const priestSidebarItems = [
  { title: "Dashboard", icon: MdDashboard, path: "/priest" },
  { title: "My Duties", icon: FaClipboardList, path: "/priest/my-duties" },
  { title: "Inventory Requests", icon: FaBoxOpen, path: "/priest/inventory-requests" },
  { title: "Attendance", icon: FaClock, path: "/priest/attendance" },
  { title: "Apply Leave", icon: FaFileSignature, path: "/priest/apply-leave" },
  { title: "Notifications", icon: MdNotifications, path: "/priest/notifications" },
  { title: "Profile", icon: MdOutlinePerson, path: "/priest/profile" },
  { title: "Settings", icon: MdOutlineSettings, path: "/priest/settings" },
  { title: "Logout", icon: MdLogout, path: "/logout" },
];
