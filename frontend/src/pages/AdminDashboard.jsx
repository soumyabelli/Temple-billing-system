import { useMemo, useState } from "react";
import {
  FaDonate,
  FaRupeeSign,
  FaUsers,
  FaBoxes,
  FaClock,
  FaLeaf,
  FaBell,
  FaRegAddressCard,
  FaSearch,
} from "react-icons/fa";
import { MdTempleBuddhist, MdOutlinePayments } from "react-icons/md";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import DashboardCard from "../components/DashboardCard";

const statCards = [
  { title: "Total Revenue", amount: "? 2,45,680", trend: "12.3%", trendUp: true, icon: <FaRupeeSign />, accent: "bg-orange-100 text-orange-600" },
  { title: "Daily Collection", amount: "? 48,650", trend: "8.2%", trendUp: true, icon: <FaDonate />, accent: "bg-green-100 text-green-600" },
  { title: "Pooja Bookings", amount: "156", trend: "18%", trendUp: true, icon: <MdTempleBuddhist />, accent: "bg-violet-100 text-violet-600" },
  { title: "Total Donations", amount: "? 75,230", trend: "15.4%", trendUp: true, icon: <FaDonate />, accent: "bg-amber-100 text-amber-600" },
  { title: "Prasadam Sales", amount: "? 21,430", trend: "7.1%", trendUp: true, icon: <FaLeaf />, accent: "bg-sky-100 text-sky-600" },
  { title: "Pending Payments", amount: "? 12,560", trend: "2.2%", trendUp: false, icon: <MdOutlinePayments />, accent: "bg-rose-100 text-rose-600" },
  { title: "Total Devotees", amount: "2,350", trend: "4.3%", trendUp: true, icon: <FaUsers />, accent: "bg-blue-100 text-blue-600" },
  { title: "Low Stock Items", amount: "8", trend: "Requires attention", trendUp: false, icon: <FaBoxes />, accent: "bg-red-100 text-red-600" },
];

const devotees = [
  {
    name: "Lakshmi Narayanan",
    contact: "+91 98452 12345",
    address: "Mylapore, Chennai",
    bookings: ["Archana - 17 May 2026", "Festival Pooja - 29 May 2026"],
    donations: ["Annadanam - ?2,500", "General Donation - ?1,000"],
    status: "Active",
  },
  {
    name: "Venkatesh Rao",
    contact: "+91 99001 56678",
    address: "Basavanagudi, Bengaluru",
    bookings: ["Abhisheka - 20 May 2026"],
    donations: ["Temple Construction Fund - ?5,000"],
    status: "Frequent",
  },
  {
    name: "Meera Iyer",
    contact: "+91 97022 44119",
    address: "T. Nagar, Chennai",
    bookings: ["Special Seva - 18 May 2026", "Homa - 27 May 2026"],
    donations: ["Festival Donation - ?3,500", "General Donation - ?750"],
    status: "Active",
  },
];

const bookingStatus = [
  ["Confirmed", "128", "bg-green-100 text-green-700"],
  ["Pending", "19", "bg-amber-100 text-amber-700"],
  ["Completed", "412", "bg-blue-100 text-blue-700"],
  ["Cancelled", "7", "bg-red-100 text-red-700"],
];

const notifications = [
  "Booking confirmation sent for Archana on 20 May 2026.",
  "Festival reminder queued for Vaikasi Visakam on 24 May 2026.",
  "Donation receipt email generated for Meera Iyer.",
  "Payment confirmation SMS sent to 17 devotees.",
];

const buildPath = (points) => {
  const width = 760;
  const height = 220;
  const step = width / (points.length - 1);
  return points
    .map((value, idx) => {
      const x = idx * step;
      const y = height - (value / 100) * height;
      return `${idx === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
};

const DashboardView = () => {
  const revenuePoints = [18, 50, 35, 42, 25, 43, 40, 64, 47, 61, 26, 50, 40, 74, 60, 69, 58];
  const linePath = useMemo(() => buildPath(revenuePoints), [revenuePoints]);

  return (
    <>
      <div className="mt-5 px-1 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[40px] font-bold text-[#1d1b19] leading-tight">Welcome back, Admin!</h1>
          <p className="text-gray-600 text-[28px]">Here&apos;s what&apos;s happening in your temple today.</p>
        </div>
        <div className="hidden xl:flex items-center gap-2 text-[#8a5f2d] border border-[#ece8e1] rounded-xl px-4 py-2 bg-white">
          <FaClock className="text-sm" />
          <span className="text-sm">19 May 2026, Tuesday</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
        {statCards.map((card) => <DashboardCard key={card.title} {...card} />)}
      </div>

      <div className="mt-4 bg-white rounded-2xl border border-[#ece8e1] p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[32px] font-bold">Revenue Overview</h2>
          <button className="text-sm border rounded-lg px-3 py-1.5 text-gray-600">This Week</button>
        </div>
        <svg viewBox="0 0 760 220" className="w-full h-[220px]">
          <defs>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e9a331" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#e9a331" stopOpacity="0.03" />
            </linearGradient>
          </defs>
          <path d={`${linePath} L760,220 L0,220 Z`} fill="url(#areaFill)" />
          <path d={linePath} fill="none" stroke="#d38e2c" strokeWidth="3" />
        </svg>
      </div>
    </>
  );
};

const DevoteesView = () => {
  return (
    <>
      <div className="mt-5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-[38px] font-bold text-[#1d1b19] leading-tight">Devotee Management</h1>
          <p className="text-gray-600 text-lg">Register devotees, track bookings and donations, and send personalized notifications.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-[#ece8e1] rounded-xl px-3 py-2 flex items-center gap-2 w-[300px]">
            <FaSearch className="text-gray-400" />
            <input className="w-full bg-transparent outline-none text-sm" placeholder="Search devotee by name / mobile" />
          </div>
          <button className="bg-[#d9962f] text-white rounded-xl px-4 py-2.5 font-semibold">+ Register Devotee</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
        <DashboardCard title="Total Devotees" amount="2,350" trend="+4.3%" trendUp icon={<FaUsers />} accent="bg-blue-100 text-blue-600" />
        <DashboardCard title="Booking Status" amount="559" trend="Active this month" trendUp icon={<MdTempleBuddhist />} accent="bg-violet-100 text-violet-600" />
        <DashboardCard title="Donation Records" amount="? 4,85,300" trend="+12.8%" trendUp icon={<FaDonate />} accent="bg-amber-100 text-amber-600" />
        <DashboardCard title="Notifications Sent" amount="1,284" trend="Realtime updates" trendUp icon={<FaBell />} accent="bg-green-100 text-green-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-300 gap-4 mt-4">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-[#ece8e1] p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[30px] font-bold">Devotee Details</h2>
            <button className="text-[#a46a2b] text-sm font-semibold">Export Records</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[14px] min-w-[900px]">
              <thead className="text-gray-500 border-b bg-[#faf8f5]">
                <tr>
                  <th className="py-2 text-left">Devotee Name</th>
                  <th className="py-2 text-left">Contact Number</th>
                  <th className="py-2 text-left">Address</th>
                  <th className="py-2 text-left">Booking History</th>
                  <th className="py-2 text-left">Donation History</th>
                </tr>
              </thead>
              <tbody>
                {devotees.map((devotee) => (
                  <tr key={devotee.contact} className="border-b align-top">
                    <td className="py-3 font-semibold flex items-center gap-2"><FaRegAddressCard className="text-[#a46a2b]" />{devotee.name}</td>
                    <td className="py-3">{devotee.contact}</td>
                    <td className="py-3">{devotee.address}</td>
                    <td className="py-3 text-gray-700">{devotee.bookings.join(", ")}</td>
                    <td className="py-3 text-gray-700">{devotee.donations.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#ece8e1] p-5">
          <h2 className="text-[30px] font-bold mb-3">Booking Status</h2>
          <div className="space-y-2">
            {bookingStatus.map(([label, count, color]) => (
              <div key={label} className="rounded-xl bg-[#faf8f5] p-3 flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${color}`}>{label}</span>
                <span className="font-semibold text-lg">{count}</span>
              </div>
            ))}
          </div>

          <h3 className="text-xl font-bold mt-6 mb-3">Devotee Dashboard</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p className="rounded-lg bg-[#faf8f5] px-3 py-2">Booking Status</p>
            <p className="rounded-lg bg-[#faf8f5] px-3 py-2">Donation History</p>
            <p className="rounded-lg bg-[#faf8f5] px-3 py-2">Payment Receipts</p>
            <p className="rounded-lg bg-[#faf8f5] px-3 py-2">Festival Notifications</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
        <div className="bg-white rounded-2xl border border-[#ece8e1] p-5">
          <h2 className="text-[30px] font-bold mb-3">Devotee Workflow</h2>
          <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
            <li>Devotee registered</li>
            <li>Services booked</li>
            <li>Donations recorded</li>
            <li>Notifications sent</li>
          </ol>
        </div>

        <div className="bg-white rounded-2xl border border-[#ece8e1] p-5">
          <h2 className="text-[30px] font-bold mb-3">Recent Notifications</h2>
          <div className="space-y-2 text-sm text-gray-700">
            {notifications.map((msg) => (
              <div key={msg} className="rounded-xl bg-[#faf8f5] px-3 py-2">{msg}</div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const AdminDashboard = () => {
  const [activeItem, setActiveItem] = useState("Dashboard");

  const renderContent = () => {
    if (activeItem === "Devotees Management") {
      return <DevoteesView />;
    }

    return <DashboardView />;
  };

  return (
    <div className="flex bg-[#f5f3ef] min-h-screen">
      <Sidebar activeItem={activeItem} onSelect={setActiveItem} />
      <div className="ml-[250px] flex-1 p-5 xl:p-6">
        <Topbar />
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
