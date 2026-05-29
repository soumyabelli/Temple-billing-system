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
} from "react-icons/fa";
import { MdTempleBuddhist, MdOutlinePayments } from "react-icons/md";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import DashboardCard from "../components/DashboardCard";

const statCards = [
  { title: "Total Revenue", amount: "Rs 2,45,680", trend: "12.3%", trendUp: true, icon: <FaRupeeSign />, accent: "bg-orange-100 text-orange-600" },
  { title: "Daily Collection", amount: "Rs 48,650", trend: "8.2%", trendUp: true, icon: <FaDonate />, accent: "bg-green-100 text-green-600" },
  { title: "Pooja Bookings", amount: "156", trend: "18%", trendUp: true, icon: <MdTempleBuddhist />, accent: "bg-violet-100 text-violet-600" },
  { title: "Total Donations", amount: "Rs 75,230", trend: "15.4%", trendUp: true, icon: <FaDonate />, accent: "bg-amber-100 text-amber-600" },
  { title: "Prasadam Sales", amount: "Rs 21,430", trend: "7.1%", trendUp: true, icon: <FaBoxes />, accent: "bg-sky-100 text-sky-600" },
  { title: "Pending Payments", amount: "Rs 12,560", trend: "2.2%", trendUp: false, icon: <MdOutlinePayments />, accent: "bg-rose-100 text-rose-600" },
  { title: "Total Devotees", amount: "2,350", trend: "4.3%", trendUp: true, icon: <FaUsers />, accent: "bg-blue-100 text-blue-600" },
  { title: "Low Stock Items", amount: "8", trend: "Requires attention", trendUp: false, icon: <FaBoxes />, accent: "bg-red-100 text-red-600" },
];

const devotees = [
  { name: "Lakshmi Narayanan", contact: "+91 98452 12345", address: "Mylapore, Chennai", bookings: "Archana - 17 May 2026, Festival Pooja - 29 May 2026", donations: "Annadanam - Rs 2,500, General Donation - Rs 1,000" },
  { name: "Venkatesh Rao", contact: "+91 99001 56678", address: "Basavanagudi, Bengaluru", bookings: "Abhisheka - 20 May 2026", donations: "Temple Construction Fund - Rs 5,000" },
  { name: "Meera Iyer", contact: "+91 97022 44119", address: "T. Nagar, Chennai", bookings: "Special Seva - 18 May 2026, Homa - 27 May 2026", donations: "Festival Donation - Rs 3,500, General Donation - Rs 750" },
  { name: "Ravi Chandran", contact: "+91 90500 33112", address: "Mysuru", bookings: "Homa - 31 May 2026", donations: "General Donation - Rs 2,200" },
  { name: "Sowmya Devi", contact: "+91 93211 55471", address: "Madurai", bookings: "Abhisheka - 03 June 2026", donations: "Annadanam - Rs 1,200" },
  { name: "Prakash Iyer", contact: "+91 90909 13090", address: "Coimbatore", bookings: "Archana - 05 June 2026", donations: "Festival Donation - Rs 2,000" },
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
    <div className={`rounded-2xl border p-4 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-xl font-bold ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>{title}</h3>
        <button className={`text-xs rounded-lg px-2.5 py-1 border ${darkMode ? "border-[#475569] text-slate-300" : "border-[#ece8e1] text-gray-600"}`}>Monthly</button>
      </div>
      <svg viewBox="0 0 720 220" className="w-full h-[180px] md:h-[220px]">
        <defs>
          <linearGradient id={`fill-${title.replace(/\s+/g, "-")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d={`${linePath} L720,220 L0,220 Z`} fill={`url(#fill-${title.replace(/\s+/g, "-")})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="3" />
      </svg>
    </div>
  );
};

const DashboardView = ({ darkMode }) => {
  return (
    <>
      <div className="mt-5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className={`text-[30px] md:text-[38px] font-bold leading-tight ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>Welcome back, Admin</h1>
          <p className={`${darkMode ? "text-slate-300" : "text-gray-600"}`}>Manage collections, bookings and operations from one dashboard.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            ["+ Add Donation", <FaDonate key="d" />],
            ["+ Book Pooja", <MdTempleBuddhist key="p" />],
            ["+ Generate Receipt", <FaReceipt key="r" />],
            ["+ Add Devotee", <FaUsers key="u" />],
          ].map(([label, icon]) => (
            <button key={label} className="px-3 py-2 text-sm rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold flex items-center justify-center gap-2">
              {icon}{label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
        {statCards.map((card) => <DashboardCard key={card.title} {...card} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
        <ChartCard title="Monthly Collections" points={monthlyCollection} color="#d97706" darkMode={darkMode} />
        <ChartCard title="Donations Trend" points={donationsTrend} color="#059669" darkMode={darkMode} />
      </div>

      <div className={`mt-4 rounded-2xl border p-5 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
        <h3 className={`text-2xl font-bold mb-3 ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>Recent Activities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {recentActivities.map((activity) => (
            <div key={activity} className={`rounded-xl px-3 py-2 text-sm ${darkMode ? "bg-[#111827] text-slate-300" : "bg-[#faf8f5] text-gray-700"}`}>{activity}</div>
          ))}
        </div>
      </div>
    </>
  );
};

const DevoteesView = ({ darkMode }) => {
  // Devotees list is currently placeholder in this file; real data is handled in /src/pages/admin/AdminDashboard.jsx

  const [page, setPage] = useState(1);
  const perPage = 4;
  const totalPages = Math.ceil(devotees.length / perPage);
  const start = (page - 1) * perPage;
  const pageRows = devotees.slice(start, start + perPage);

  return (
    <>
      <div className="mt-5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className={`text-[30px] md:text-[38px] font-bold leading-tight ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>Devotees Management</h1>
          <p className={`${darkMode ? "text-slate-300" : "text-gray-600"}`}>Register devotees, track bookings and donations, and send personalized notifications.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full xl:w-auto">
          <div className={`rounded-xl px-3 py-2 flex items-center gap-2 w-full sm:w-[300px] border ${darkMode ? "bg-[#1f2937] border-[#334155] text-slate-400" : "bg-white border-[#ece8e1] text-gray-400"}`}>
            <FaSearch />
            <input className="w-full bg-transparent outline-none text-sm" placeholder="Search devotee by name / mobile" />
          </div>
          <button className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-4 py-2.5 font-semibold">+ Register Devotee</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
        <DashboardCard title="Total Devotees" amount="2,350" trend="+4.3%" trendUp icon={<FaUsers />} accent="bg-blue-100 text-blue-600" />
        <DashboardCard title="Booking Status" amount="559" trend="Active this month" trendUp icon={<MdTempleBuddhist />} accent="bg-violet-100 text-violet-600" />
        <DashboardCard title="Donation Records" amount="Rs 4,85,300" trend="+12.8%" trendUp icon={<FaDonate />} accent="bg-amber-100 text-amber-600" />
        <DashboardCard title="Notifications Sent" amount="1,284" trend="Realtime updates" trendUp icon={<FaBell />} accent="bg-green-100 text-green-600" />
      </div>

      <div className={`mt-4 rounded-2xl border p-4 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
        <div className="flex items-center justify-between mb-3">
          <h2 className={`text-[26px] font-bold ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>Devotee Details</h2>
          <button className="text-amber-600 text-sm font-semibold">Export Records</button>
        </div>

        <div className="overflow-auto max-h-[430px] rounded-xl border border-[#ece8e1]/60">
          <table className="w-full text-[14px] min-w-[980px]">
            <thead className={`sticky top-0 z-10 ${darkMode ? "bg-[#111827] text-slate-300" : "bg-[#f8f6f2] text-gray-600"}`}>
              <tr>
                <th className="py-3 px-3 text-left">Devotee Name</th>
                <th className="py-3 px-3 text-left">Contact Number</th>
                <th className="py-3 px-3 text-left">Address</th>
                <th className="py-3 px-3 text-left">Booking History</th>
                <th className="py-3 px-3 text-left">Donation History</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((devotee, idx) => (
                <tr
                  key={devotee.contact}
                  className={`border-t transition-colors ${idx % 2 === 0
                    ? darkMode ? "bg-[#1f2937]" : "bg-white"
                    : darkMode ? "bg-[#111827]" : "bg-[#fcfbf9]"
                  } ${darkMode ? "hover:bg-[#253246]" : "hover:bg-orange-50"}`}
                >
                  <td className={`py-3 px-3 font-semibold flex items-center gap-2 ${darkMode ? "text-slate-100" : "text-[#1f1f1f]"}`}><FaRegAddressCard className="text-amber-600" />{devotee.name}</td>
                  <td className={`py-3 px-3 ${darkMode ? "text-slate-300" : "text-gray-700"}`}>{devotee.contact}</td>
                  <td className={`py-3 px-3 ${darkMode ? "text-slate-300" : "text-gray-700"}`}>{devotee.address}</td>
                  <td className={`py-3 px-3 ${darkMode ? "text-slate-300" : "text-gray-700"}`}>{devotee.bookings}</td>
                  <td className={`py-3 px-3 ${darkMode ? "text-slate-300" : "text-gray-700"}`}>{devotee.donations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Showing {start + 1}-{Math.min(start + perPage, devotees.length)} of {devotees.length}</p>
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 text-sm rounded-lg border disabled:opacity-50">Previous</button>
            <span className={`text-sm ${darkMode ? "text-slate-300" : "text-gray-700"}`}>Page {page} / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1.5 text-sm rounded-lg border disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </>
  );
};

const PlaceholderView = ({ title, darkMode }) => (
  <div className={`mt-5 rounded-2xl border p-8 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
    <h2 className={`text-3xl font-bold ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>{title}</h2>
    <p className={`mt-2 ${darkMode ? "text-slate-300" : "text-gray-600"}`}>Module layout is ready. Connect forms, APIs, and database operations next.</p>
  </div>
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
    <div className={`${darkMode ? "bg-[#0f172a]" : "bg-[#f5f3ef]"} min-h-screen transition-colors duration-300`}>
      <Sidebar
        activeItem={activeItem}
        onSelect={setActiveItem}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        darkMode={darkMode}
      />

      <div className={`transition-all duration-300 p-4 md:p-5 ${collapsed ? "lg:ml-[84px]" : "lg:ml-[254px]"}`}>
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
