import { useMemo, useState } from "react";
import {
  FaDonate,
  FaRupeeSign,
  FaUsers,
  FaBoxes,
  FaBell,
  FaRegAddressCard,
  FaSearch,
  FaReceipt,
  FaBed,
} from "react-icons/fa";
import { MdTempleBuddhist, MdOutlinePayments } from "react-icons/md";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import DashboardCard from "../components/DashboardCard";
import { motion } from "framer-motion";

const statCards = [
  { title: "Total Revenue", amount: "Rs 2,45,680", trend: "12.3%", trendUp: true, icon: <FaRupeeSign />, accent: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" },
  { title: "Daily Collection", amount: "Rs 48,650", trend: "8.2%", trendUp: true, icon: <FaDonate />, accent: "bg-temple-100 text-temple-600 dark:bg-temple-500/20 dark:text-temple-400" },
  { title: "Pooja Bookings", amount: "156", trend: "18%", trendUp: true, icon: <MdTempleBuddhist />, accent: "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400" },
  { title: "Total Donations", amount: "Rs 75,230", trend: "15.4%", trendUp: true, icon: <FaDonate />, accent: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400" },
  { title: "Prasadam Sales", amount: "Rs 21,430", trend: "7.1%", trendUp: true, icon: <FaBoxes />, accent: "bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400" },
  { title: "Pending Payments", amount: "Rs 12,560", trend: "2.2%", trendUp: false, icon: <MdOutlinePayments />, accent: "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400" },
  { title: "Total Devotees", amount: "2,350", trend: "4.3%", trendUp: true, icon: <FaUsers />, accent: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" },
  { title: "Low Stock Items", amount: "8", trend: "Requires attention", trendUp: false, icon: <FaBoxes />, accent: "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400" },
  { title: "Room Booked Revenue", amount: "Rs 1,12,400", trend: "5.4%", trendUp: true, icon: <FaBed />, accent: "bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400" },
];

const devotees = [
  { name: "Lakshmi Narayanan", contact: "+91 98452 12345", address: "Mylapore, Chennai", bookings: "Archana - 17 May 2026", donations: "Annadanam - Rs 2,500" },
  { name: "Venkatesh Rao", contact: "+91 99001 56678", address: "Basavanagudi, Bengaluru", bookings: "Abhisheka - 20 May 2026", donations: "Temple Fund - Rs 5,000" },
  { name: "Meera Iyer", contact: "+91 97022 44119", address: "T. Nagar, Chennai", bookings: "Special Seva - 18 May 2026", donations: "Festival - Rs 3,500" },
  { name: "Ravi Chandran", contact: "+91 90500 33112", address: "Mysuru", bookings: "Homa - 31 May 2026", donations: "General - Rs 2,200" },
  { name: "Sowmya Devi", contact: "+91 93211 55471", address: "Madurai", bookings: "Abhisheka - 03 June 2026", donations: "Annadanam - Rs 1,200" },
  { name: "Prakash Iyer", contact: "+91 90909 13090", address: "Coimbatore", bookings: "Archana - 05 June 2026", donations: "Festival - Rs 2,000" },
];

const recentActivities = [
  "Donation of Rs 5,000 received from Venkatesh Rao.",
  "Archana booking confirmed for Lakshmi Narayanan.",
  "Receipt generated for Festival donation.",
  "Inventory alert: Camphor below threshold.",
  "Payment confirmation sent to 17 devotees.",
];

const monthlyCollection = [32, 41, 45, 53, 48, 60, 64, 71, 68, 76, 73, 82];
const donationsTrend = [16, 22, 20, 25, 24, 30, 36, 39, 42, 40, 43, 48];

const buildPath = (points, width = 720, height = 220) => {
  const step = width / (points.length - 1);
  return points
    .map((value, idx) => {
      const x = idx * step;
      const y = height - (value / 100) * height;
      return `${idx === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
};

const ChartCard = ({ title, points, color, darkMode }) => {
  const linePath = useMemo(() => buildPath(points), [points]);
  return (
    <div className={`rounded-[24px] border p-6 transition-all duration-300 hover:shadow-lg ${darkMode ? "bg-[#1e293b]/70 backdrop-blur-xl border-white/5" : "bg-temple-100/60 backdrop-blur-xl border-white/40 shadow-sm"}`}>
      <div className="flex items-center justify-between mb-5">
        <h3 className={`text-xl font-bold font-serif ${darkMode ? "text-slate-100" : "text-slate-800"}`}>{title}</h3>
        <button className={`text-xs rounded-xl px-3 py-1.5 font-medium transition-colors ${darkMode ? "bg-temple-100/5 text-slate-300 hover:bg-temple-100/10" : "bg-temple-100 text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>Monthly</button>
      </div>
      <svg viewBox="0 0 720 220" className="w-full h-[180px] md:h-[220px] drop-shadow-md">
        <defs>
          <linearGradient id={`fill-${title.replace(/\s+/g, "-")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <path d={`${linePath} L720,220 L0,220 Z`} fill={`url(#fill-${title.replace(/\s+/g, "-")})`} />
        <motion.path 
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          d={linePath} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" 
        />
      </svg>
    </div>
  );
};

const DashboardView = ({ darkMode }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mt-6 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
        <div>
          <h1 className={`text-3xl md:text-[40px] font-bold font-serif leading-tight ${darkMode ? "text-slate-100" : "text-slate-800"}`}>Welcome back, Admin</h1>
          <p className={`mt-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Manage collections, bookings and operations from one dashboard.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ["Add Donation", <FaDonate key="d" />],
            ["Book Pooja", <MdTempleBuddhist key="p" />],
            ["Receipt", <FaReceipt key="r" />],
            ["Add Devotee", <FaUsers key="u" />],
          ].map(([label, icon]) => (
            <button key={label} className="px-4 py-2.5 text-sm rounded-xl bg-gradient-to-r from-temple-500 to-temple-600 hover:from-temple-600 hover:to-temple-700 text-white font-medium flex items-center justify-center gap-2 shadow-md shadow-temple-500/20 transition-all hover:shadow-lg hover:-translate-y-0.5">
              {icon}{label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">
        {statCards.map((card, idx) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
            <DashboardCard {...card} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-5">
        <ChartCard title="Monthly Collections" points={monthlyCollection} color="#e58220" darkMode={darkMode} />
        <ChartCard title="Donations Trend" points={donationsTrend} color="#10b981" darkMode={darkMode} />
      </div>

      <div className={`mt-5 rounded-[24px] border p-6 ${darkMode ? "bg-[#1e293b]/70 backdrop-blur-xl border-white/5" : "bg-temple-100/60 backdrop-blur-xl border-white/40 shadow-sm"}`}>
        <h3 className={`text-2xl font-bold font-serif mb-4 ${darkMode ? "text-slate-100" : "text-slate-800"}`}>Recent Activities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentActivities.map((activity, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * idx }}
              key={activity} className={`rounded-xl px-4 py-3 text-sm flex items-start gap-3 border transition-colors hover:border-temple-300 ${darkMode ? "bg-temple-100/5 border-white/5 text-slate-300" : "bg-temple-100 border-slate-100 text-slate-600"}`}>
              <div className="h-2 w-2 rounded-full bg-temple-500 mt-1.5 shrink-0" />
              {activity}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const DevoteesView = ({ darkMode }) => {
  const [page, setPage] = useState(1);
  const perPage = 4;
  const totalPages = Math.ceil(devotees.length / perPage);
  const start = (page - 1) * perPage;
  const pageRows = devotees.slice(start, start + perPage);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mt-6 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
        <div>
          <h1 className={`text-3xl md:text-[40px] font-bold font-serif leading-tight ${darkMode ? "text-slate-100" : "text-slate-800"}`}>Devotees Management</h1>
          <p className={`mt-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Register devotees, track bookings and donations, and send personalized notifications.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
          <div className={`rounded-xl px-4 py-2.5 flex items-center gap-2 w-full sm:w-[320px] border transition-colors ${darkMode ? "bg-temple-100/5 border-white/10 text-slate-300 focus-within:border-temple-500/50" : "bg-temple-100/80 border-slate-200 text-slate-600 focus-within:border-temple-400"}`}>
            <FaSearch className="text-slate-400" />
            <input className="w-full bg-transparent outline-none text-sm placeholder:text-slate-400" placeholder="Search devotee by name / mobile" />
          </div>
          <button className="bg-gradient-to-r from-temple-500 to-temple-600 hover:from-temple-600 hover:to-temple-700 text-white rounded-xl px-5 py-2.5 font-medium shadow-md shadow-temple-500/20 transition-all hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap">
            + Register Devotee
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">
        <DashboardCard title="Total Devotees" amount="2,350" trend="+4.3%" trendUp icon={<FaUsers />} accent="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" />
        <DashboardCard title="Active Bookings" amount="559" trend="This month" trendUp icon={<MdTempleBuddhist />} accent="bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400" />
        <DashboardCard title="Total Donations" amount="Rs 4,85k" trend="+12.8%" trendUp icon={<FaDonate />} accent="bg-temple-100 text-temple-600 dark:bg-temple-500/20 dark:text-temple-400" />
        <DashboardCard title="Notifications" amount="1,284" trend="Sent today" trendUp icon={<FaBell />} accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" />
      </div>

      <div className={`mt-5 rounded-[24px] border p-6 ${darkMode ? "bg-[#1e293b]/70 backdrop-blur-xl border-white/5" : "bg-temple-100/60 backdrop-blur-xl border-white/40 shadow-sm"}`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className={`text-2xl font-bold font-serif ${darkMode ? "text-slate-100" : "text-slate-800"}`}>Devotee Details</h2>
          <button className="text-temple-500 hover:text-temple-600 text-sm font-semibold transition-colors">Export Records</button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
          <table className="w-full text-[14px] min-w-[980px]">
            <thead className={`${darkMode ? "bg-temple-100/5 text-slate-300" : "bg-slate-50 text-slate-600"}`}>
              <tr>
                <th className="py-4 px-4 text-left font-medium">Devotee Name</th>
                <th className="py-4 px-4 text-left font-medium">Contact Number</th>
                <th className="py-4 px-4 text-left font-medium">Address</th>
                <th className="py-4 px-4 text-left font-medium">Booking History</th>
                <th className="py-4 px-4 text-left font-medium">Donation History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {pageRows.map((devotee) => (
                <tr
                  key={devotee.contact}
                  className={`transition-colors ${darkMode ? "hover:bg-temple-100/5" : "bg-temple-100 hover:bg-slate-50/80"}`}
                >
                  <td className={`py-4 px-4 font-semibold flex items-center gap-3 ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
                    <div className="h-8 w-8 rounded-full bg-temple-100 dark:bg-temple-500/20 text-temple-600 dark:text-temple-400 flex items-center justify-center">
                      <FaRegAddressCard size={14} />
                    </div>
                    {devotee.name}
                  </td>
                  <td className={`py-4 px-4 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>{devotee.contact}</td>
                  <td className={`py-4 px-4 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>{devotee.address}</td>
                  <td className={`py-4 px-4 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-temple-100/10 dark:text-slate-300">
                      {devotee.bookings}
                    </span>
                  </td>
                  <td className={`py-4 px-4 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-temple-100 text-temple-700 dark:bg-temple-500/20 dark:text-temple-300 border border-temple-100 dark:border-transparent">
                      {devotee.donations}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Showing {start + 1}-{Math.min(start + perPage, devotees.length)} of {devotees.length}</p>
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-temple-100/5 border-slate-200 text-slate-600 hover:bg-slate-50">Previous</button>
            <span className={`text-sm font-medium px-2 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-temple-100/5 border-slate-200 text-slate-600 hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PlaceholderView = ({ title, darkMode }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`mt-6 rounded-[24px] border p-10 text-center ${darkMode ? "bg-[#1e293b]/70 backdrop-blur-xl border-white/5" : "bg-temple-100/60 backdrop-blur-xl border-white/40 shadow-sm"}`}>
    <h2 className={`text-3xl font-bold font-serif ${darkMode ? "text-slate-100" : "text-slate-800"}`}>{title}</h2>
    <p className={`mt-3 max-w-lg mx-auto ${darkMode ? "text-slate-400" : "text-slate-500"}`}>This module layout has been standardized. Connect it with specific components and forms next.</p>
  </motion.div>
);

const AdminDashboard = () => {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const renderContent = () => {
    if (activeItem === "Dashboard") return <DashboardView darkMode={darkMode} />;
    if (activeItem === "Devotees Management") return <DevoteesView darkMode={darkMode} />;
    return <PlaceholderView title={activeItem} darkMode={darkMode} />;
  };

  return (
    <div className={`${darkMode ? "bg-[#0f172a] text-slate-100" : "bg-[#f8fafc] text-slate-900"} min-h-screen transition-colors duration-500 relative font-sans`}>
      {/* Decorative ambient background elements */}
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 ${darkMode ? "opacity-30" : "opacity-[0.03]"}`}>
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-temple-500/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[120px]" />
      </div>

      <Sidebar
        activeItem={activeItem}
        onSelect={setActiveItem}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        darkMode={darkMode}
      />

      <div className={`relative transition-all duration-300 p-4 md:p-6 ${collapsed ? "lg:ml-[84px]" : "lg:ml-[260px]"}`}>
        <Topbar
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode((prev) => !prev)}
          onOpenMobileSidebar={() => setMobileOpen(true)}
        />
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
