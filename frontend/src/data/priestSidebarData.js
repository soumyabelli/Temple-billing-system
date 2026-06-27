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
} from "react-icons/fa";

export const priestSidebarItems = [
  { title: "Dashboard", icon: MdDashboard, path: "/priest" },
  { title: "Assigned Poojas", icon: FaClipboardList, path: "/priest/assigned-poojas" },
  { title: "Seva Schedule", icon: FaCalendarAlt, path: "/priest/seva-schedule" },
  { title: "Completed Services", icon: FaCheckCircle, path: "/priest/completed-services" },
  { title: "Special Duties", icon: FaStar, path: "/priest/special-duties" },
  { title: "Festival Duties", icon: MdFestival, path: "/priest/festival-duties" },
  { title: "Inventory Requests", icon: FaBoxOpen, path: "/priest/inventory-requests" },
  { title: "Notifications", icon: MdNotifications, path: "/priest/notifications" },
  { title: "Profile", icon: MdOutlinePerson, path: "/priest/profile" },
  { title: "Settings", icon: MdOutlineSettings, path: "/priest/settings" },
  { title: "Logout", icon: MdLogout, path: "/logout" },
];
