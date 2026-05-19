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
} from "react-icons/md";
import { FaDonate, FaBoxes, FaCalendarAlt } from "react-icons/fa";
import { HiDocumentReport } from "react-icons/hi";

export const sidebarItems = [
  { title: "Dashboard", icon: MdDashboard },
  { title: "Devotees Management", icon: MdPeopleAlt },
  { title: "Pooja Booking", icon: MdTempleBuddhist },
  { title: "Donations", icon: FaDonate },
  { title: "Billing & Payments", icon: MdOutlinePayments },
  { title: "Prasadam & Inventory", icon: FaBoxes },
  { title: "Employees & Staff", icon: MdPeopleAlt },
  { title: "Festivals & Events", icon: FaCalendarAlt },
  { title: "Notifications", icon: MdNotifications },
  { title: "Reports & Analytics", icon: HiDocumentReport },
  { title: "Receipts & Documents", icon: MdReceiptLong },
  { title: "User Management", icon: MdManageAccounts },
  { title: "Settings", icon: MdOutlineSettings },
  { title: "Profile", icon: MdOutlinePerson },
  { title: "Logout", icon: MdLogout },
];
