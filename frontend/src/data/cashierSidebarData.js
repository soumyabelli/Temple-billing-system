import { FaHome, FaFileInvoice, FaCreditCard, FaHeart, FaCalendarAlt, FaBox, FaReceipt, FaHistory, FaSignOutAlt } from "react-icons/fa";

export const cashierSidebarItems = [
  { title: "Dashboard", icon: FaHome, path: "/cashier" },
  { title: "Billing", icon: FaFileInvoice, path: "/cashier/quick-billing" },
  { title: "Pooja Bookings", icon: FaCalendarAlt, path: "/cashier/booking-payments" },
  { title: "Donations", icon: FaHeart, path: "/cashier/donations" },
  { title: "Prasadam Sales", icon: FaReceipt, path: "/cashier/prasadam-sales" },
  { title: "Receipts", icon: FaBox, path: "/cashier/receipt-generation" },
  { title: "Register Devotees", icon: FaHistory, path: "/cashier/devotees" },
  { title: "Payments", icon: FaCreditCard, path: "/cashier/payment-processing" },
  { title: "Inventory", icon: FaBox, path: "/cashier/inventory" },
  { title: "Notifications", icon: FaHistory, path: "/cashier/notifications" },
  { title: "Profile", icon: FaHeart, path: "/cashier/profile" },
  { title: "Logout", icon: FaSignOutAlt, path: "/login" },
];


