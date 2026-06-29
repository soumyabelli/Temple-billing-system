import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaDonate, FaRupeeSign, FaUsers, FaBoxes } from "react-icons/fa";
import { MdTempleBuddhist, MdOutlinePayments } from "react-icons/md";
import AdminLayout from "../../layouts/AdminLayout";
import DashboardCards from "../../components/dashboard/DashboardCards";
import RevenueChart from "../../components/dashboard/RevenueChart";
import DonationChart from "../../components/dashboard/DonationChart";
import RecentBookings from "../../components/pooja/RecentBookings";
import LowStock from "../../components/inventory/LowStock";
import LogoutModal from "../../components/LogoutModal";
import { useAuth } from "../../context/AuthContext";
import DevoteesManagement from "./DevoteesManagement";
import DevoteeDetails from "./DevoteeDetails";
import NotificationsCenter from "./NotificationsCenter";
import { getAdminUsers } from "../../services/authService";
import {
  getAdminBookings,
  getAdminDonations,
  getAdminPrasadamOrders,
  getAdminEvents,
} from "../../services/adminService";
import { getShiftDashboard } from "../../services/shiftService";
import axios from "axios";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase().replace(/@temple\.local$/, "@gmail.com");

const normalizeAmount = (value) => {
  if (value == null) return 0;
  const numeric = Number(String(value).replace(/[^0-9.-]+/g, ""));
  return Number.isNaN(numeric) ? 0 : numeric;
};

const formatRs = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

const getItemDate = (item) => {
  const date = new Date(item.createdAt || item.datetime || item.date);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isSameDay = (left, right) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const cardIcons = {
  revenue: { icon: <FaRupeeSign />, accent: "bg-orange-100 text-orange-600" },
  daily: { icon: <FaDonate />, accent: "bg-green-100 text-green-600" },
  pooja: { icon: <MdTempleBuddhist />, accent: "bg-violet-100 text-violet-600" },
  donation: { icon: <FaDonate />, accent: "bg-amber-100 text-amber-600" },
  prasadam: { icon: <FaBoxes />, accent: "bg-sky-100 text-sky-600" },
  pending: { icon: <MdOutlinePayments />, accent: "bg-rose-100 text-rose-600" },
  devotees: { icon: <FaUsers />, accent: "bg-blue-100 text-blue-600" },
  lowStock: { icon: <FaBoxes />, accent: "bg-red-100 text-red-600" },
  duty: { icon: <FaUsers />, accent: "bg-emerald-100 text-emerald-600" },
  extraShift: { icon: <FaUsers />, accent: "bg-purple-100 text-purple-600" },
  overtime: { icon: <FaRupeeSign />, accent: "bg-orange-100 text-orange-600" },
  festival: { icon: <MdTempleBuddhist />, accent: "bg-pink-100 text-pink-600" },
};

const PlaceholderView = ({ title, darkMode }) => (
  <div className={`mt-5 rounded-2xl border p-8 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
    <h2 className={`text-3xl font-bold ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>{title}</h2>
    <p className={`mt-2 ${darkMode ? "text-slate-300" : "text-gray-600"}`}>Module layout is ready. Connect forms, APIs, and database operations next.</p>
  </div>
);

const AdminDashboard = () => {
  const [showLogout, setShowLogout] = useState(false);
  const [selectedDevotee, setSelectedDevotee] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [donations, setDonations] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [prasadamOrders, setPrasadamOrders] = useState([]);
  const [shiftData, setShiftData] = useState(null);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const { logoutUser, token } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, bookingsRes, donationsRes, inventoryRes, prasadamRes, shiftRes, eventsRes] = await Promise.all([
          getAdminUsers(token),
          getAdminBookings(),
          getAdminDonations(),
          axios.get("http://localhost:5000/api/admin/inventory-items").catch(() => ({ data: { items: [] } })),
          getAdminPrasadamOrders(),
          getShiftDashboard().catch(() => null),
          getAdminEvents().catch(() => ({ events: [] })),
        ]);
        setUsers(usersRes.users || []);
        setBookings(bookingsRes.bookings || []);
        setDonations(donationsRes.donations || []);
        setInventoryItems(inventoryRes.data?.items || []);
        setPrasadamOrders(prasadamRes.orders || []);
        setShiftData(shiftRes);
        setEvents(eventsRes.events || []);
      } catch (error) {
        console.warn("Unable to load admin data . please try again", error);
      }
    };
    if (token) load();
  }, [token]);

  const devoteeUsers = useMemo(() => {
    const fromUsers = users.filter((u) => (u.role || "").toLowerCase() === "devotee");
    const map = new Map(fromUsers.map((u) => [normalizeEmail(u.email), { ...u, email: normalizeEmail(u.email) }]));

    bookings.forEach((b) => {
      const name = String(b.devoteeName || "").trim();
      if (!name) return;
      const pseudoEmail = `${name.toLowerCase().replace(/\s+/g, ".")}@gmail.com`;
      if (!map.has(pseudoEmail)) {
        map.set(pseudoEmail, { name, email: pseudoEmail, role: "devotee", _id: `booking-${name}` });
      }
    });

    donations.forEach((d) => {
      const name = String(d.donorName || "").trim();
      if (!name) return;
      const pseudoEmail = `${name.toLowerCase().replace(/\s+/g, ".")}@gmail.com`;
      if (!map.has(pseudoEmail)) {
        map.set(pseudoEmail, { name, email: pseudoEmail, role: "devotee", _id: `donation-${name}` });
      }
    });

    return Array.from(map.values());
  }, [users, bookings, donations]);

  const handleLogout = () => {
    logoutUser();
    setShowLogout(false);
    navigate("/login");
  };

  const handleEditDevotee = (devotee) => {
    setSelectedDevotee(devotee);
  };

  const handleBackToDevotees = () => {
    setSelectedDevotee(null);
  };

  const dynamicStatCards = useMemo(() => {
    const bookingRevenue = bookings.reduce((sum, item) => sum + normalizeAmount(item.amount), 0);
    const donationRevenue = donations.reduce((sum, item) => sum + normalizeAmount(item.amount), 0);
    const prasadamRevenue = prasadamOrders.reduce((sum, item) => sum + normalizeAmount(item.amount), 0);
    const totalRevenue = bookingRevenue + donationRevenue + prasadamRevenue;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const sumForDay = (day) => {
      const matchDay = (item) => {
        const date = getItemDate(item);
        return date && isSameDay(date, day);
      };
      return (
        bookings.filter(matchDay).reduce((sum, item) => sum + normalizeAmount(item.amount), 0) +
        donations.filter(matchDay).reduce((sum, item) => sum + normalizeAmount(item.amount), 0) +
        prasadamOrders.filter(matchDay).reduce((sum, item) => sum + normalizeAmount(item.amount), 0)
      );
    };

    const todayCollections = sumForDay(today);
    const yesterdayCollections = sumForDay(yesterday);
    const collectionsTrendUp = todayCollections >= yesterdayCollections;

    const pendingPayments =
      bookings
        .filter((item) => item.status === "Pending" || item.paymentStatus === "Pending")
        .reduce((sum, item) => sum + normalizeAmount(item.amount), 0) +
      donations
        .filter((item) => String(item.status || "").toLowerCase() === "pending")
        .reduce((sum, item) => sum + normalizeAmount(item.amount), 0);

    const pendingCount =
      bookings.filter((item) => item.status === "Pending" || item.paymentStatus === "Pending").length +
      donations.filter((item) => String(item.status || "").toLowerCase() === "pending").length;

    const devoteeCount = users.filter((user) => String(user.role || "").toLowerCase() === "devotee").length;
    const lowStockCount = inventoryItems.filter((item) => item.currentStock <= item.minimumStock).length;

    const todayKey = today.toISOString().slice(0, 10);
    const assignments = shiftData?.assignments || [];
    const todayAssignments = assignments.filter((item) => item.dateKey === todayKey);
    const activeDutyCount = todayAssignments.length;
    const extraShiftCount = todayAssignments.filter((item) =>
      /overtime|temporary|extra/i.test(item.assignmentType || "")
    ).length;
    const overtimeHours = shiftData?.stats?.overtimeHours || 0;
    const festivalAssignments = assignments.filter(
      (item) => /festival/i.test(item.assignmentType || "") && item.dateKey >= todayKey
    ).length;
    const upcomingFestivals = events.filter((event) => {
      const eventDate = new Date(event.date);
      return !Number.isNaN(eventDate.getTime()) && eventDate >= today && event.status !== "Cancelled";
    }).length;

    const pendingBookings = bookings.filter((item) => item.status === "Pending").length;

    return [
      {
        title: "Total Revenues",
        amount: formatRs(totalRevenue),
        trend: `${bookings.length + donations.length + prasadamOrders.length}`,
        trendLabel: "total transactions",
        trendUp: true,
        ...cardIcons.revenue,
      },
      {
        title: "Daily Collections",
        amount: formatRs(todayCollections),
        trend: formatRs(yesterdayCollections),
        trendLabel: "yesterday",
        trendUp: collectionsTrendUp,
        ...cardIcons.daily,
      },
      {
        title: "Pooja Bookings",
        amount: String(bookings.length),
        trend: String(pendingBookings),
        trendLabel: "pending approval",
        trendUp: pendingBookings === 0,
        ...cardIcons.pooja,
      },
      {
        title: "Total Donations",
        amount: formatRs(donationRevenue),
        trend: String(donations.length),
        trendLabel: "donation records",
        trendUp: true,
        ...cardIcons.donation,
      },
      {
        title: "Prasadam Sales",
        amount: formatRs(prasadamRevenue),
        trend: String(prasadamOrders.length),
        trendLabel: "orders placed",
        trendUp: true,
        ...cardIcons.prasadam,
      },
      {
        title: "Pending Payments",
        amount: formatRs(pendingPayments),
        trend: String(pendingCount),
        trendLabel: "awaiting payment",
        trendUp: pendingCount === 0,
        ...cardIcons.pending,
      },
      {
        title: "Total Devotees",
        amount: String(devoteeCount),
        trend: "Registered",
        trendLabel: "devotee accounts",
        trendUp: true,
        ...cardIcons.devotees,
      },
      {
        title: "Low Stock Items",
        amount: String(lowStockCount),
        trend: lowStockCount > 0 ? "Requires attention" : "All stocked",
        trendLabel: "",
        trendUp: lowStockCount === 0,
        ...cardIcons.lowStock,
      },
      {
        title: "Active Duty Assignments",
        amount: String(activeDutyCount),
        trend: "Today",
        trendLabel: "scheduled duties",
        trendUp: true,
        ...cardIcons.duty,
      },
      {
        title: "Extra Shift Assignments",
        amount: String(extraShiftCount),
        trend: "Today",
        trendLabel: "overtime / temp shifts",
        trendUp: true,
        ...cardIcons.extraShift,
      },
      {
        title: "Overtime Hours",
        amount: `${overtimeHours} hrs`,
        trend: "This week",
        trendLabel: "from shift records",
        trendUp: true,
        ...cardIcons.overtime,
      },
      {
        title: "Festival Assignments",
        amount: String(festivalAssignments || upcomingFestivals),
        trend: "Upcoming",
        trendLabel: "festival duties / events",
        trendUp: true,
        ...cardIcons.festival,
      },
    ];
  }, [bookings, donations, prasadamOrders, users, inventoryItems, shiftData, events]);

  const monthlyRevenue = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let index = 5; index >= 0; index -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
      months.push({
        month: date.toLocaleString("default", { month: "short" }),
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
      });
    }

    return months.map(({ month, year, monthIndex }) => {
      const inMonth = (item) => {
        const date = getItemDate(item);
        return date && date.getFullYear() === year && date.getMonth() === monthIndex;
      };
      const value =
        bookings.filter(inMonth).reduce((sum, item) => sum + normalizeAmount(item.amount), 0) +
        donations.filter(inMonth).reduce((sum, item) => sum + normalizeAmount(item.amount), 0) +
        prasadamOrders.filter(inMonth).reduce((sum, item) => sum + normalizeAmount(item.amount), 0);
      return { month, value };
    });
  }, [bookings, donations, prasadamOrders]);

  const donationSources = useMemo(() => {
    if (!donations.length) return [];
    const methodTotals = {};
    donations.forEach((donation) => {
      const method = donation.paymentMethod || "Other";
      methodTotals[method] = (methodTotals[method] || 0) + normalizeAmount(donation.amount);
    });
    const total = Object.values(methodTotals).reduce((sum, value) => sum + value, 0);
    const colors = {
      UPI: "bg-violet-500",
      Cash: "bg-orange-400",
      Online: "bg-emerald-500",
      Card: "bg-sky-500",
      "Bank Transfer": "bg-indigo-500",
      "Net Banking": "bg-teal-500",
      Cheque: "bg-sky-500",
      Other: "bg-gray-400",
    };
    return Object.entries(methodTotals)
      .map(([label, amount]) => ({
        label,
        value: total ? Math.round((amount / total) * 100) : 0,
        color: colors[label] || "bg-gray-400",
      }))
      .sort((left, right) => right.value - left.value);
  }, [donations]);

  const recentBookings = useMemo(
    () =>
      [...bookings].sort((left, right) => {
        const leftDate = getItemDate(left)?.getTime() || 0;
        const rightDate = getItemDate(right)?.getTime() || 0;
        return rightDate - leftDate;
      }),
    [bookings]
  );

  return (
    <>
      <AdminLayout onLogoutClick={() => setShowLogout(true)}>
        {({ activeItem, darkMode }) => {
          if (activeItem === "Dashboard") {
            return (
              <>
                <div className="mt-5">
                  <h1 className={`text-[30px] md:text-[38px] font-bold leading-tight ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>Welcome back, Admin</h1>
                  <p className={`${darkMode ? "text-slate-300" : "text-gray-600"}`}>Manage collections, bookings and operations from one dashboard.</p>
                </div>

                <DashboardCards cards={dynamicStatCards} />

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
                  <div className={`rounded-2xl border p-4 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
                    <h3 className={`text-xl font-bold ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>Monthly Revenue</h3>
                    <RevenueChart data={monthlyRevenue} />
                  </div>
                  <div className={`rounded-2xl border p-4 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
                    <h3 className={`text-xl font-bold ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>Donation Sources</h3>
                    {donationSources.length ? (
                      <DonationChart sources={donationSources} />
                    ) : (
                      <p className="mt-6 text-sm text-gray-500">No donation records yet.</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
                  <div className={`rounded-2xl border p-5 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
                    <h3 className={`text-2xl font-bold mb-3 ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>Recent Bookings</h3>
                    <RecentBookings bookings={recentBookings} />
                  </div>
                  <div className={`rounded-2xl border p-5 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
                    <h3 className={`text-2xl font-bold mb-3 ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>Low Stock Alerts</h3>
                    <LowStock items={inventoryItems.map(i => ({ name: i.name, stock: i.currentStock, status: i.currentStock <= i.minimumStock ? "Low" : "OK" }))} />
                  </div>
                </div>
              </>
            );
          }

          if (activeItem === "Devotees Management") {
            if (selectedDevotee) {
              return (
                <DevoteeDetails
                  darkMode={darkMode}
                  devotee={selectedDevotee}
                  onBack={handleBackToDevotees}
                  bookings={bookings}
                  donations={donations}
                />
              );
            }

            return (
              <DevoteesManagement
                darkMode={darkMode}
                onEditProfile={handleEditDevotee}
                devotees={devoteeUsers}
                bookings={bookings}
                donations={donations}
              />
            );
          }

          if (activeItem === "Notifications") {
            return <NotificationsCenter darkMode={darkMode} />;
          }

          return <PlaceholderView title={activeItem} darkMode={darkMode} />;
        }}
      </AdminLayout>

      {showLogout && <LogoutModal onClose={() => setShowLogout(false)} onLogout={handleLogout} />}
    </>
  );
};

export default AdminDashboard;
