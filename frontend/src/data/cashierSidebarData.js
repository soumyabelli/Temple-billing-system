import {
  FaHome,
  FaFileInvoice,
  FaCalendarAlt,
  FaHeart,
  FaReceipt,
  FaUserPlus,
  FaCreditCard,
  FaChartBar,
  FaBox,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";

export const cashierSidebarItems = [
  { title: "Dashboard", icon: FaHome, path: "/cashier" },

  { title: "Billing", icon: FaFileInvoice, path: "/cashier/quick-billing" },

  { title: "Pooja Bookings", icon: FaCalendarAlt, path: "/cashier/pooja-bookings" },

  { title: "Donations", icon: FaHeart, path: "/cashier/donations" },

  { title: "Prasadam Sales", icon: FaReceipt, path: "/cashier/prasadam-sales" },

  { title: "Receipts", icon: FaReceipt, path: "/cashier/receipts" },

  { title: "Register Devotees", icon: FaUserPlus, path: "/cashier/register-devotees" },

  { title: "Payments", icon: FaCreditCard, path: "/cashier/payments" },

  { title: "Reports", icon: FaChartBar, path: "/cashier/reports" },

  { title: "Inventory", icon: FaBox, path: "/cashier/inventory" },

  { title: "Notifications", icon: FaBell, path: "/cashier/notifications" },

  { title: "Profile", icon: FaUserCircle, path: "/cashier/profile" },

  // Logout is handled by sidebar component via onLogoutClick
  { title: "Logout", icon: FaSignOutAlt, path: "/login" },
];


