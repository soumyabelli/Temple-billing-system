import "../../styles/admin/devotees.css";
import {
  FaUsers,
  FaUserPlus,
  FaDonate,
  FaEye,
  FaEdit,
  FaBell,
  FaHistory,
  FaPrint,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFilter,
  FaDownload,
} from "react-icons/fa";
import { MdEventAvailable, MdCalendarMonth } from "react-icons/md";

const statCards = [
  {
    title: "Total Devotees",
    value: "2,350",
    change: "4.3% from yesterday",
    icon: FaUsers,
    iconWrap: "bg-orange-100 text-orange-500",
  },
  {
    title: "New Registrations",
    value: "128",
    change: "8.6% from yesterday",
    icon: FaUserPlus,
    iconWrap: "bg-green-100 text-green-600",
  },
  {
    title: "Active Bookings",
    value: "342",
    change: "12.7% from yesterday",
    icon: MdEventAvailable,
    iconWrap: "bg-violet-100 text-violet-600",
  },
  {
    title: "Total Donations",
    value: "Rs 5,42,300",
    change: "15.4% from yesterday",
    icon: FaDonate,
    iconWrap: "bg-amber-100 text-amber-500",
  },
];

const devotees = [
  {
    name: "Ramesh Kumar",
    mobile: "9876543210",
    city: "Hyderabad",
    bookings: 12,
    donations: "Rs 11,500",
    status: "Active",
    avatar: "https://i.pravatar.cc/100?img=12",
  },
  {
    name: "Lakshmi Devi",
    mobile: "9988776655",
    city: "Vijayawada",
    bookings: 8,
    donations: "Rs 7,250",
    status: "Active",
    avatar: "https://i.pravatar.cc/100?img=5",
  },
  {
    name: "Suresh Babu",
    mobile: "9123456780",
    city: "Tirupati",
    bookings: 15,
    donations: "Rs 15,750",
    status: "Active",
    avatar: "https://i.pravatar.cc/100?img=15",
  },
  {
    name: "Meera Iyer",
    mobile: "9900112233",
    city: "Chennai",
    bookings: 6,
    donations: "Rs 5,300",
    status: "Pending",
    avatar: "https://i.pravatar.cc/100?img=47",
  },
  {
    name: "Venkatesh K.",
    mobile: "9345678901",
    city: "Bangalore",
    bookings: 10,
    donations: "Rs 8,900",
    status: "Active",
    avatar: "https://i.pravatar.cc/100?img=68",
  },
  {
    name: "Anitha Reddy",
    mobile: "9870011223",
    city: "Hyderabad",
    bookings: 5,
    donations: "Rs 3,600",
    status: "Pending",
    avatar: "https://i.pravatar.cc/100?img=33",
  },
  {
    name: "Ravi Shankar",
    mobile: "9001122334",
    city: "Visakhapatnam",
    bookings: 9,
    donations: "Rs 6,800",
    status: "Active",
    avatar: "https://i.pravatar.cc/100?img=11",
  },
  {
    name: "Krishna Prasad",
    mobile: "9887766554",
    city: "Warangal",
    bookings: 7,
    donations: "Rs 4,200",
    status: "Active",
    avatar: "https://i.pravatar.cc/100?img=18",
  },
];

const recentBookings = [
  { id: "BK1258", service: "Special Seva", date: "14 May 2025", amount: "Rs 1,100", status: "Confirmed" },
  { id: "BK1257", service: "Archana", date: "14 May 2025", amount: "Rs 550", status: "Confirmed" },
  { id: "BK1256", service: "Abhishekam", date: "13 May 2025", amount: "Rs 1,500", status: "Confirmed" },
  { id: "BK1255", service: "Homa", date: "13 May 2025", amount: "Rs 2,200", status: "Completed" },
  { id: "BK1254", service: "Archana", date: "12 May 2025", amount: "Rs 550", status: "Confirmed" },
];

const donationHistory = [
  { date: "14 May 2025", type: "General Donation", amount: "Rs 1,100", mode: "UPI" },
  { date: "13 May 2025", type: "Annadanam", amount: "Rs 550", mode: "Cash" },
  { date: "12 May 2025", type: "Festival Donation", amount: "Rs 2,000", mode: "Card" },
  { date: "11 May 2025", type: "General Donation", amount: "Rs 750", mode: "UPI" },
  { date: "10 May 2025", type: "Temple Construction", amount: "Rs 5,000", mode: "Net Banking" },
];

const actionButtons = [
  { label: "Add Booking", icon: MdEventAvailable, theme: "bg-violet-50 text-violet-700" },
  { label: "Donation Entry", icon: FaDonate, theme: "bg-green-50 text-green-700" },
  { label: "Print Receipt", icon: FaPrint, theme: "bg-blue-50 text-blue-700" },
  { label: "Send Notification", icon: FaBell, theme: "bg-orange-50 text-orange-700" },
  { label: "View History", icon: FaHistory, theme: "bg-indigo-50 text-indigo-700" },
  { label: "Edit Profile", icon: FaEdit, theme: "bg-amber-50 text-amber-700" },
];

const DevoteesManagement = ({ darkMode }) => {
  return (
    <div className="mt-5 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-[30px] md:text-[38px] font-bold leading-tight ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>
            Devotees Management
          </h1>
          <p className={`${darkMode ? "text-slate-300" : "text-gray-600"}`}>
            Manage devotee profiles, booking history, and donation records.
          </p>
        </div>

        <div className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${darkMode ? "border-[#334155] bg-[#1f2937] text-slate-200" : "border-[#ece8e1] bg-white text-[#6b4c2e]"}`}>
          <MdCalendarMonth className="text-[18px]" />
          14 May 2025, Wednesday
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className={`rounded-2xl border p-4 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${card.iconWrap}`}>
                  <Icon className="text-[20px]" />
                </div>
                <div>
                  <p className={`${darkMode ? "text-slate-300" : "text-gray-500"}`}>{card.title}</p>
                  <h3 className={`text-[32px] leading-tight font-bold ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>{card.value}</h3>
                  <p className="text-[14px] text-green-600">Up {card.change}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <div className={`rounded-2xl border p-4 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <h2 className={`text-[24px] font-bold ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>Devotee List</h2>
              <input
                type="text"
                placeholder="Search devotee by name or mobile..."
                className={`h-10 rounded-xl border px-3 text-sm outline-none sm:w-[290px] ${darkMode ? "border-[#334155] bg-[#111827] text-slate-200 placeholder:text-slate-500" : "border-[#ece8e1] bg-[#faf9f7] text-gray-700 placeholder:text-gray-400"}`}
              />
            </div>

            <div className="flex items-center gap-2">
              <button className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm ${darkMode ? "border-[#334155] bg-[#111827] text-slate-200" : "border-[#ece8e1] bg-white text-gray-700"}`}>
                <FaFilter className="text-[12px]" /> Filter
              </button>
              <button className="h-10 rounded-xl bg-amber-500 px-4 text-sm font-semibold text-white hover:bg-amber-600">
                + Add Devotee
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#ece8e1]/70">
            <table className="w-full min-w-[820px] text-sm">
              <thead className={`${darkMode ? "bg-[#111827] text-slate-300" : "bg-[#f8f6f2] text-gray-600"}`}>
                <tr>
                  <th className="px-3 py-3 text-left">Devotee</th>
                  <th className="px-3 py-3 text-left">Mobile</th>
                  <th className="px-3 py-3 text-left">City</th>
                  <th className="px-3 py-3 text-left">Bookings</th>
                  <th className="px-3 py-3 text-left">Donations</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {devotees.map((devotee, idx) => (
                  <tr
                    key={devotee.mobile}
                    className={`border-t ${darkMode ? "border-[#334155]" : "border-[#f1ede6]"} ${idx % 2 === 0 ? (darkMode ? "bg-[#1f2937]" : "bg-white") : (darkMode ? "bg-[#111827]" : "bg-[#fdfcfa]")}`}
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <img src={devotee.avatar} alt={devotee.name} className="h-8 w-8 rounded-full object-cover" />
                        <span className={`font-semibold ${darkMode ? "text-slate-100" : "text-[#1f1f1f]"}`}>{devotee.name}</span>
                      </div>
                    </td>
                    <td className={`px-3 py-3 ${darkMode ? "text-slate-300" : "text-gray-700"}`}>{devotee.mobile}</td>
                    <td className={`px-3 py-3 ${darkMode ? "text-slate-300" : "text-gray-700"}`}>{devotee.city}</td>
                    <td className={`px-3 py-3 ${darkMode ? "text-slate-300" : "text-gray-700"}`}>{devotee.bookings}</td>
                    <td className={`px-3 py-3 ${darkMode ? "text-slate-300" : "text-gray-700"}`}>{devotee.donations}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${devotee.status === "Active" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                        {devotee.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3 text-amber-600">
                        <button type="button" aria-label="View devotee"><FaEye /></button>
                        <button type="button" aria-label="Edit devotee"><FaEdit /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Showing 1 to 8 of 120 entries</p>
            <div className="flex items-center gap-1 text-sm">
              <button className={`h-8 rounded-md border px-2 ${darkMode ? "border-[#334155] text-slate-300" : "border-[#ece8e1] text-gray-500"}`}>Prev</button>
              <button className="h-8 w-8 rounded-md bg-amber-500 text-white">1</button>
              <button className={`h-8 w-8 rounded-md border ${darkMode ? "border-[#334155] text-slate-300" : "border-[#ece8e1] text-gray-700"}`}>2</button>
              <button className={`h-8 w-8 rounded-md border ${darkMode ? "border-[#334155] text-slate-300" : "border-[#ece8e1] text-gray-700"}`}>3</button>
              <button className={`h-8 w-8 rounded-md border ${darkMode ? "border-[#334155] text-slate-300" : "border-[#ece8e1] text-gray-700"}`}>...</button>
              <button className={`h-8 w-8 rounded-md border ${darkMode ? "border-[#334155] text-slate-300" : "border-[#ece8e1] text-gray-700"}`}>15</button>
              <button className={`h-8 rounded-md border px-2 ${darkMode ? "border-[#334155] text-slate-300" : "border-[#ece8e1] text-gray-500"}`}>Next</button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`rounded-2xl border p-4 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
            <h3 className={`text-[30px] font-bold ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>Devotee Profile</h3>
            <div className="mt-3 flex items-start gap-3">
              <img
                src="https://i.pravatar.cc/120?img=12"
                alt="Ramesh Kumar"
                className="h-[104px] w-[104px] rounded-full object-cover"
              />
              <div>
                <h4 className={`text-[28px] font-bold ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>Ramesh Kumar</h4>
                <p className={`mt-1 flex items-center gap-2 text-sm ${darkMode ? "text-slate-300" : "text-gray-600"}`}><FaPhoneAlt className="text-[12px]" />9876543210</p>
                <p className={`mt-1 flex items-center gap-2 text-sm ${darkMode ? "text-slate-300" : "text-gray-600"}`}><FaEnvelope className="text-[12px]" />ramesh.kumar@gmail.com</p>
                <p className={`mt-1 flex items-center gap-2 text-sm ${darkMode ? "text-slate-300" : "text-gray-600"}`}><FaMapMarkerAlt className="text-[12px]" />Hyderabad, Telangana</p>
                <p className={`mt-2 text-sm ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
                  Registered on: <span className="font-semibold">12 Jan 2025</span>
                </p>
                <p className={`mt-2 text-[15px] font-semibold ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>
                  Total Donations: <span className="text-amber-600">Rs 11,500</span>
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border p-4 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
            <h3 className={`mb-3 text-[30px] font-bold ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {actionButtons.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    className={`h-[86px] rounded-xl text-sm font-medium flex flex-col items-center justify-center gap-1 ${action.theme}`}
                  >
                    <Icon className="text-[20px]" />
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className={`rounded-2xl border p-4 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className={`text-[30px] font-bold ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>Recent Bookings</h3>
            <button className="text-sm font-semibold text-amber-600">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className={`${darkMode ? "text-slate-300" : "text-gray-600"}`}>
                <tr>
                  <th className="py-2 text-left">Booking ID</th>
                  <th className="py-2 text-left">Pooja / Service</th>
                  <th className="py-2 text-left">Date</th>
                  <th className="py-2 text-left">Amount</th>
                  <th className="py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((row) => (
                  <tr key={row.id} className={`border-t ${darkMode ? "border-[#334155] text-slate-300" : "border-[#f1ede6] text-gray-700"}`}>
                    <td className="py-2">{row.id}</td>
                    <td className="py-2">{row.service}</td>
                    <td className="py-2">{row.date}</td>
                    <td className="py-2">{row.amount}</td>
                    <td className="py-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.status === "Confirmed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`rounded-2xl border p-4 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className={`text-[30px] font-bold ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>Donation History</h3>
            <button className="text-sm font-semibold text-amber-600">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className={`${darkMode ? "text-slate-300" : "text-gray-600"}`}>
                <tr>
                  <th className="py-2 text-left">Date</th>
                  <th className="py-2 text-left">Donation Type</th>
                  <th className="py-2 text-left">Amount</th>
                  <th className="py-2 text-left">Payment Mode</th>
                  <th className="py-2 text-left">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {donationHistory.map((row) => (
                  <tr key={`${row.date}-${row.type}`} className={`border-t ${darkMode ? "border-[#334155] text-slate-300" : "border-[#f1ede6] text-gray-700"}`}>
                    <td className="py-2">{row.date}</td>
                    <td className="py-2">{row.type}</td>
                    <td className="py-2">{row.amount}</td>
                    <td className="py-2">{row.mode}</td>
                    <td className="py-2 text-amber-600"><FaDownload /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={`pb-2 text-sm ${darkMode ? "text-slate-400" : "text-gray-600"} flex items-center justify-between`}>
        <span>(C) 2025 Sri Shanti Mahadev Mandir. All rights reserved.</span>
        <span className="text-amber-700 font-medium">Sacred Management Portal</span>
      </div>
    </div>
  );
};

export default DevoteesManagement;
