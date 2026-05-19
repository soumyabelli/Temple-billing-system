import {
  MdDashboard,
  MdTempleBuddhist,
  MdOutlinePayments,
} from "react-icons/md";

import {
  FaUsers,
  FaDonate,
  FaBoxes,
  FaCalendarAlt,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

import { HiDocumentReport } from "react-icons/hi";

export const sidebarItems = [
  {
    title: "Dashboard",
    icon: MdDashboard,
  },
  {
    title: "Devotees",
    icon: FaUsers,
  },
  {
    title: "Pooja Bookings",
    icon: MdTempleBuddhist,
  },
  {
    title: "Donations",
    icon: FaDonate,
  },
  {
    title: "Billing & Payments",
    icon: MdOutlinePayments,
  },
  {
    title: "Inventory",
    icon: FaBoxes,
  },
  {
    title: "Employees",
    icon: FaUsers,
  },
  {
    title: "Festivals",
    icon: FaCalendarAlt,
  },
  {
    title: "Reports & Analytics",
    icon: HiDocumentReport,
  },
  {
    title: "Settings",
    icon: FaCog,
  },
  {
    title: "Logout",
    icon: FaSignOutAlt,
  },
];
