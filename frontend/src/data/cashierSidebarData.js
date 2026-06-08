import { FaHome, FaFileInvoice, FaCreditCard, FaHeart, FaCalendarAlt, FaBox, FaReceipt, FaHistory, FaSignOutAlt } from "react-icons/fa";

export const cashierSidebarItems = [
  { title: "Dashboard", icon: FaHome, path: "/cashier" },
  { title: "Quick Billing", icon: FaFileInvoice, path: "/cashier/quick-billing" },
  { title: "Payment Processing", icon: FaCreditCard, path: "/cashier/payment-processing" },
  { title: "Receipt Generation", icon: FaHeart, path: "/cashier/receipt-generation" },
  { title: "Today's Transactions", icon: FaCalendarAlt, path: "/cashier/transactions" },
  { title: "Booking Payments", icon: FaBox, path: "/cashier/booking-payments" },
  { title: "Prasadam Sales", icon: FaReceipt, path: "/cashier/prasadam-sales" },
  { title: "Notifications", icon: FaHistory, path: "/cashier/notifications" },
  { title: "Logout", icon: FaSignOutAlt, path: "/login" },
];

