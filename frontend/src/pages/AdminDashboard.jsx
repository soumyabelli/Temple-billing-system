import {
  FaDonate,
  FaRupeeSign,
  FaUsers,
  FaBoxes,
  FaClock,
  FaLeaf,
} from "react-icons/fa";
import { MdTempleBuddhist, MdOutlinePayments } from "react-icons/md";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import DashboardCard from "../components/DashboardCard";

const statCards = [
  {
    title: "Total Revenue",
    amount: "? 2,45,680",
    trend: "12.3%",
    trendUp: true,
    icon: <FaRupeeSign />,
    accent: "bg-orange-100 text-orange-600",
  },
  {
    title: "Daily Collection",
    amount: "? 48,650",
    trend: "8.2%",
    trendUp: true,
    icon: <FaDonate />,
    accent: "bg-green-100 text-green-600",
  },
  {
    title: "Pooja Bookings",
    amount: "156",
    trend: "18%",
    trendUp: true,
    icon: <MdTempleBuddhist />,
    accent: "bg-violet-100 text-violet-600",
  },
  {
    title: "Total Donations",
    amount: "? 75,230",
    trend: "15.4%",
    trendUp: true,
    icon: <FaDonate />,
    accent: "bg-amber-100 text-amber-600",
  },
  {
    title: "Prasadam Sales",
    amount: "? 21,430",
    trend: "7.1%",
    trendUp: true,
    icon: <FaLeaf />,
    accent: "bg-sky-100 text-sky-600",
  },
  {
    title: "Pending Payments",
    amount: "? 12,560",
    trend: "2.2%",
    trendUp: false,
    icon: <MdOutlinePayments />,
    accent: "bg-rose-100 text-rose-600",
  },
  {
    title: "Total Devotees",
    amount: "2,350",
    trend: "4.3%",
    trendUp: true,
    icon: <FaUsers />,
    accent: "bg-blue-100 text-blue-600",
  },
  {
    title: "Low Stock Items",
    amount: "8",
    trend: "Requires attention",
    trendUp: false,
    icon: <FaBoxes />,
    accent: "bg-red-100 text-red-600",
  },
];

const revenuePoints = [18, 50, 35, 42, 25, 43, 40, 64, 47, 61, 26, 50, 40, 74, 60, 69, 58];

const bookings = [
  {
    name: "Venkatesh Kumar",
    service: "Special Seva",
    date: "14 May 2025",
    amount: "? 1,100",
    status: "Confirmed",
    avatar: "https://i.pravatar.cc/60?img=12",
  },
  {
    name: "Lakshmi Devi",
    service: "Archana",
    date: "14 May 2025",
    amount: "? 550",
    status: "Confirmed",
    avatar: "https://i.pravatar.cc/60?img=32",
  },
  {
    name: "Ravi Shankar",
    service: "Abhishekam",
    date: "14 May 2025",
    amount: "? 1,500",
    status: "Confirmed",
    avatar: "https://i.pravatar.cc/60?img=15",
  },
  {
    name: "Meera Iyer",
    service: "Homa",
    date: "14 May 2025",
    amount: "? 2,200",
    status: "Confirmed",
    avatar: "https://i.pravatar.cc/60?img=24",
  },
  {
    name: "Suresh Babu",
    service: "Archana",
    date: "14 May 2025",
    amount: "? 550",
    status: "Pending",
    avatar: "https://i.pravatar.cc/60?img=19",
  },
];

const donors = [
  ["Ramesh Kumar", "? 11,000", "https://i.pravatar.cc/60?img=52"],
  ["Sita Mahalakshmi", "? 7,500", "https://i.pravatar.cc/60?img=47"],
  ["Venkatesh Reddy", "? 5,100", "https://i.pravatar.cc/60?img=11"],
  ["Lakshmi Narayanan", "? 3,600", "https://i.pravatar.cc/60?img=5"],
  ["Krishna Prasad", "? 2,750", "https://i.pravatar.cc/60?img=8"],
];

const lowStock = [
  ["Camphor", "10 Units Left", "???"],
  ["Ghee", "12 Units Left", "??"],
  ["Incense Sticks", "15 Units Left", "??"],
  ["Pooja Flowers", "18 Units Left", "??"],
  ["Coconut", "20 Units Left", "??"],
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

const AdminDashboard = () => {
  const linePath = buildPath(revenuePoints);

  return (
    <div className="flex bg-[#f5f3ef] min-h-screen">
      <Sidebar />

      <div className="ml-[250px] flex-1 p-5 xl:p-6">
        <Topbar />

        <div className="mt-5 px-1 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[40px] font-bold text-[#1d1b19] leading-tight">Welcome back, Admin! ??</h1>
            <p className="text-gray-600 text-[28px]">Here's what's happening in your temple today.</p>
          </div>
          <div className="hidden xl:flex items-center gap-2 text-[#8a5f2d] border border-[#ece8e1] rounded-xl px-4 py-2 bg-white">
            <FaClock className="text-sm" />
            <span className="text-sm">14 May 2025, Wednesday</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
          {statCards.map((card) => (
            <DashboardCard key={card.title} {...card} />
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
          <div className="bg-white rounded-2xl border border-[#ece8e1] p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[32px] font-bold">Revenue Overview</h2>
              <button className="text-sm border rounded-lg px-3 py-1.5 text-gray-600">This Week</button>
            </div>
            <div className="h-[280px]">
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
              <div className="grid grid-cols-7 text-xs text-gray-500 mt-1 px-1">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#ece8e1] p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[32px] font-bold">Recent Bookings</h2>
              <button className="text-[#a46a2b] text-sm">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[14px]">
                <thead className="text-gray-500 border-b bg-[#faf8f5]">
                  <tr>
                    <th className="py-2 text-left">Devotee Name</th>
                    <th className="py-2 text-left">Pooja / Service</th>
                    <th className="py-2 text-left">Date</th>
                    <th className="py-2 text-left">Amount</th>
                    <th className="py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((row) => (
                    <tr key={`${row.name}-${row.service}`} className="border-b last:border-0">
                      <td className="py-2.5 font-medium">
                        <div className="flex items-center gap-2.5">
                          <img src={row.avatar} alt={row.name} className="h-7 w-7 rounded-full" />
                          {row.name}
                        </div>
                      </td>
                      <td className="py-2.5">{row.service}</td>
                      <td className="py-2.5">{row.date}</td>
                      <td className="py-2.5 font-semibold">{row.amount}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-1 rounded-full text-xs ${row.status === "Confirmed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
          <div className="bg-white rounded-2xl border border-[#ece8e1] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[32px] font-bold">Donation Summary</h2>
              <button className="text-sm border rounded-lg px-3 py-1.5 text-gray-600">This Month</button>
            </div>
            <div className="flex items-center gap-6">
              <div className="h-44 w-44 rounded-full grid place-items-center" style={{ background: "conic-gradient(#f29d1f 0 35%, #41a247 35% 60%, #2d7fd3 60% 80%, #7d59b5 80% 90%, #7d8791 90% 100%)" }}>
                <div className="h-24 w-24 rounded-full bg-white flex flex-col items-center justify-center">
                  <p className="text-[28px] font-bold">? 75,230</p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="inline-block h-3 w-3 rounded-full bg-[#f29d1f] mr-2" />General Donation 35%</p>
                <p><span className="inline-block h-3 w-3 rounded-full bg-[#41a247] mr-2" />Annadanam 25%</p>
                <p><span className="inline-block h-3 w-3 rounded-full bg-[#2d7fd3] mr-2" />Festival Donation 20%</p>
                <p><span className="inline-block h-3 w-3 rounded-full bg-[#7d59b5] mr-2" />Temple Construction 10%</p>
                <p><span className="inline-block h-3 w-3 rounded-full bg-[#7d8791] mr-2" />Others 10%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#ece8e1] p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[32px] font-bold">Top Donors</h2>
              <button className="text-[#a46a2b] text-sm">View All</button>
            </div>
            <div className="space-y-2">
              {donors.map(([name, amount, avatar]) => (
                <div key={name} className="flex justify-between items-center rounded-xl bg-[#faf8f5] px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <img src={avatar} alt={name} className="h-8 w-8 rounded-full" />
                    <span className="font-medium">{name}</span>
                  </div>
                  <span className="font-bold">{amount}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#ece8e1] p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[32px] font-bold">Low Stock Items</h2>
              <button className="text-[#a46a2b] text-sm">View All</button>
            </div>
            <div className="space-y-2">
              {lowStock.map(([name, qty, icon]) => (
                <div key={name} className="flex justify-between items-center rounded-xl bg-[#faf8f5] px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="h-8 w-8 rounded-lg bg-white border border-[#ece8e1] flex items-center justify-center text-base">{icon}</span>
                    <span className="font-medium">{name}</span>
                  </div>
                  <span className="font-semibold text-red-500">{qty}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between text-gray-500 text-sm mt-5 px-1 pb-2">
          <p>© 2025 Sri Shanti Mahadev Mandir. All rights reserved.</p>
          <p>Sacred Management Portal</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

