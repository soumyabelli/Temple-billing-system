import {
  MdArrowBack,
  MdEdit,
  MdBadge,
  MdPhone,
  MdEmail,
  MdLocationOn,
  MdCalendarMonth,
  MdAccessTime,
  MdEventNote,
  MdVolunteerActivism,
  MdOutlineHistory,
  MdOutlinePayments,
  MdOutlineCheckCircle,
  MdOutlinePrint,
  MdOutlineNotifications,
  MdOutlineCreditCard,
  MdOutlineDoNotDisturbOn,
  MdRemoveRedEye,
  MdFileDownload,
} from "react-icons/md";

const defaultDevotee = {
  name: "Ramesh Kumar",
  mobile: "9876543210",
  city: "Hyderabad",
  bookings: 12,
  donations: "Rs 11,500",
  status: "Active",
  avatar: "https://i.pravatar.cc/100?img=12",
};

const recentActivities = [
  { type: "Pooja Booking", detail: "Maha Rudrabhishek", date: "10 May 2026", value: "Confirmed", valueTone: "bg-green-100 text-green-700", icon: MdEventNote, tone: "bg-violet-100 text-violet-700" },
  { type: "Donation", detail: "General Donation", date: "09 May 2026", value: "Rs 1,500", valueTone: "text-green-700", icon: MdVolunteerActivism, tone: "bg-green-100 text-green-700" },
  { type: "Pooja Booking", detail: "Satyanarayana Vratham", date: "02 May 2026", value: "Confirmed", valueTone: "bg-green-100 text-green-700", icon: MdEventNote, tone: "bg-violet-100 text-violet-700" },
  { type: "Donation", detail: "Annakadanam", date: "25 Apr 2026", value: "Rs 2,000", valueTone: "text-green-700", icon: MdVolunteerActivism, tone: "bg-green-100 text-green-700" },
];

const bookingHistory = [
  { id: "BK12580-12", pooja: "Maha Rudrabhishek", date: "10 May 2026", time: "06:00 AM", amount: "Rs 2,500", status: "Confirmed" },
  { id: "BK12580-11", pooja: "Satyanarayana Vratham", date: "02 May 2026", time: "09:00 AM", amount: "Rs 1,200", status: "Confirmed" },
  { id: "BK12580-10", pooja: "Abhishekam", date: "20 Apr 2026", time: "08:00 AM", amount: "Rs 800", status: "Completed" },
  { id: "BK12580-09", pooja: "Ganapathi Homam", date: "05 Apr 2026", time: "07:30 AM", amount: "Rs 1,500", status: "Cancelled" },
];

const donationBreakdown = [
  { label: "General Donation", amount: "Rs 6,000 (52%)", color: "bg-green-500" },
  { label: "Festival Donation", amount: "Rs 3,000 (26%)", color: "bg-orange-500" },
  { label: "Annakadanam", amount: "Rs 1,500 (13%)", color: "bg-blue-500" },
  { label: "Temple Development", amount: "Rs 1,000 (9%)", color: "bg-purple-500" },
];

const receipts = [
  { no: "RC12580-24", type: "Donation", date: "09 May 2026", amount: "Rs 1,500" },
  { no: "RC12580-23", type: "Pooja Booking", date: "10 May 2026", amount: "Rs 2,500" },
  { no: "RC12580-22", type: "Donation", date: "25 Apr 2026", amount: "Rs 2,000" },
  { no: "RC12580-21", type: "Pooja Booking", date: "02 May 2026", amount: "Rs 1,200" },
];

const quickActions = [
  { label: "Booking History", icon: MdOutlineHistory, tone: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  { label: "Donation History", icon: MdVolunteerActivism, tone: "bg-orange-50 text-orange-700 border-orange-100" },
  { label: "Print Receipts", icon: MdOutlinePrint, tone: "bg-blue-50 text-blue-700 border-blue-100" },
  { label: "Send Notification", icon: MdOutlineNotifications, tone: "bg-red-50 text-red-700 border-red-100" },
  { label: "Generate ID Card", icon: MdOutlineCreditCard, tone: "bg-green-50 text-green-700 border-green-100" },
  { label: "Disable Account", icon: MdOutlineDoNotDisturbOn, tone: "bg-rose-50 text-rose-700 border-rose-100" },
];

const statusTone = {
  Confirmed: "bg-green-100 text-green-700",
  Completed: "bg-blue-100 text-blue-700",
  Cancelled: "bg-rose-100 text-rose-700",
};

const DevoteeDetails = ({ darkMode, devotee = defaultDevotee, onBack }) => {
  const current = { ...defaultDevotee, ...devotee };

  return (
    <div className="mt-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 hover:text-amber-700"
        >
          <MdArrowBack size={18} /> Back to Devotee List
        </button>
        <div className="flex items-center gap-2">
          <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#f0c9a4] bg-[#fff8f1] px-4 text-sm font-semibold text-amber-600">
            <MdEdit size={17} /> Edit Profile
          </button>
          <button className={`inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold ${darkMode ? "border-[#334155] text-slate-200" : "border-[#ece8e1] text-gray-700 bg-white"}`}>
            <MdBadge size={17} /> Print ID Card
          </button>
        </div>
      </div>

      <div>
        <h1 className={`text-[36px] font-bold ${darkMode ? "text-slate-100" : "text-[#17151f]"}`}>Devotee Details</h1>
        <p className={`${darkMode ? "text-slate-300" : "text-[#5c6675]"} text-[17px]`}>Manage devotee information, bookings, donations, receipts and communication.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
        <div className={`rounded-2xl border p-4 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
          <div className="flex items-start gap-3">
            <img src={current.avatar} alt={current.name} className="h-24 w-24 rounded-full object-cover" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className={`text-[34px] leading-tight font-bold ${darkMode ? "text-slate-100" : "text-[#17151f]"}`}>{current.name}</h2>
                <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">{current.status}</span>
              </div>
              <p className={`${darkMode ? "text-slate-400" : "text-gray-500"} text-sm`}>Devotee ID: DEV12580</p>
              <div className={`mt-2 space-y-1.5 text-sm ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
                <p className="flex items-center gap-2"><MdPhone /> {current.mobile}</p>
                <p className="flex items-center gap-2"><MdEmail /> ramesh.kumar@gmail.com</p>
                <p className="flex items-center gap-2"><MdLocationOn /> {current.city}, Telangana</p>
                <p className="flex items-center gap-2"><MdCalendarMonth /> Registered on: 12 Jan 2025</p>
                <p className="flex items-center gap-2"><MdAccessTime /> Last Visit: 10 May 2026</p>
              </div>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl border p-4 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
          <p className={`${darkMode ? "text-slate-300" : "text-gray-500"} text-sm`}>Total Bookings</p>
          <p className={`text-[40px] leading-none font-bold mt-2 ${darkMode ? "text-slate-100" : "text-[#17151f]"}`}>{current.bookings}</p>
          <p className="mt-2 text-sm font-semibold text-green-700">8 this year</p>
        </div>

        <div className={`rounded-2xl border p-4 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
          <p className={`${darkMode ? "text-slate-300" : "text-gray-500"} text-sm`}>Total Donations</p>
          <p className={`text-[40px] leading-none font-bold mt-2 ${darkMode ? "text-slate-100" : "text-[#17151f]"}`}>{current.donations}</p>
          <p className="mt-2 text-sm font-semibold text-green-700">15.4% this year</p>
        </div>

        <div className={`rounded-2xl border p-4 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
          <p className={`${darkMode ? "text-slate-300" : "text-gray-500"} text-sm`}>Last Visit</p>
          <p className={`text-[34px] leading-none font-bold mt-2 ${darkMode ? "text-slate-100" : "text-[#17151f]"}`}>10 May 2026</p>
          <p className={`mt-2 text-sm ${darkMode ? "text-slate-300" : "text-gray-600"}`}>2 days ago</p>
        </div>

        <div className={`rounded-2xl border p-4 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
          <p className={`${darkMode ? "text-slate-300" : "text-gray-500"} text-sm`}>Pending Payments</p>
          <p className={`text-[40px] leading-none font-bold mt-2 ${darkMode ? "text-slate-100" : "text-[#17151f]"}`}>Rs 1,250</p>
          <p className="mt-2 text-sm font-semibold text-amber-600">1 pending</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2.2fr_1fr]">
        <div className="space-y-4">
          <div className={`rounded-2xl border p-4 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
            <div className={`grid grid-cols-2 gap-2 sm:grid-cols-5 ${darkMode ? "text-slate-300" : "text-gray-600"}`}>
              {["Overview", "Bookings", "Donations", "Receipts", "Notifications"].map((tab, idx) => (
                <button
                  key={tab}
                  className={`h-10 rounded-lg text-sm font-semibold ${
                    idx === 0
                      ? "bg-orange-50 text-orange-600 border border-orange-200"
                      : darkMode
                        ? "hover:bg-[#111827]"
                        : "hover:bg-[#faf7f2]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl border p-4 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
            <h3 className={`text-[24px] font-bold mb-3 ${darkMode ? "text-slate-100" : "text-[#17151f]"}`}>Personal Information</h3>
            <div className={`grid grid-cols-[140px_10px_1fr] gap-y-3 text-sm ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
              <span className="font-semibold">Date of Birth</span><span>:</span><span>15 Aug 1990</span>
              <span className="font-semibold">Gender</span><span>:</span><span>Male</span>
              <span className="font-semibold">Occupation</span><span>:</span><span>Software Engineer</span>
              <span className="font-semibold">Address</span><span>:</span><span>1-8-276/A, Kukatpally, Hyderabad, Telangana - 500072</span>
              <span className="font-semibold">Family Members</span><span>:</span><span>4 Members</span>
            </div>
          </div>

          <div className={`rounded-2xl border p-4 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
            <h3 className={`text-[24px] font-bold mb-3 ${darkMode ? "text-slate-100" : "text-[#17151f]"}`}>Recent Activity</h3>
            <div className="space-y-2">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={`${activity.type}-${activity.date}-${activity.detail}`} className={`flex items-center justify-between gap-2 rounded-xl border p-3 ${darkMode ? "border-[#334155] bg-[#111827]" : "border-[#f0ece6] bg-[#fffdfa]"}`}>
                    <div className="flex items-center gap-2">
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${activity.tone}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className={`font-semibold ${darkMode ? "text-slate-100" : "text-[#1f2937]"}`}>{activity.type}</p>
                        <p className={`${darkMode ? "text-slate-400" : "text-gray-600"} text-sm`}>{activity.detail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`${darkMode ? "text-slate-400" : "text-gray-500"} text-sm`}>{activity.date}</p>
                      {activity.value.startsWith("Rs") ? (
                        <p className={`mt-1 text-sm font-semibold ${activity.valueTone}`}>{activity.value}</p>
                      ) : (
                        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${activity.valueTone}`}>{activity.value}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={`rounded-2xl border p-4 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
          <h3 className={`text-[24px] font-bold mb-3 ${darkMode ? "text-slate-100" : "text-[#17151f]"}`}>Quick Actions</h3>
          <div className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button key={action.label} className={`w-full h-11 rounded-xl border px-3 text-left font-semibold text-sm flex items-center gap-2 ${action.tone}`}>
                  <Icon size={18} /> {action.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className={`rounded-2xl border p-4 xl:col-span-1 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
          <h3 className={`text-[24px] font-bold mb-3 ${darkMode ? "text-slate-100" : "text-[#17151f]"}`}>Bookings History</h3>
          <div className="overflow-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className={`${darkMode ? "text-slate-300" : "text-gray-600"}`}>
                <tr>
                  <th className="py-2 text-left">Booking ID</th>
                  <th className="py-2 text-left">Pooja / Service</th>
                  <th className="py-2 text-left">Date</th>
                  <th className="py-2 text-left">Slot / Time</th>
                  <th className="py-2 text-left">Amount</th>
                  <th className="py-2 text-left">Status</th>
                  <th className="py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookingHistory.map((row) => (
                  <tr key={row.id} className={`border-t ${darkMode ? "border-[#334155] text-slate-300" : "border-[#f1ede6] text-gray-700"}`}>
                    <td className="py-2">{row.id}</td>
                    <td className="py-2">{row.pooja}</td>
                    <td className="py-2">{row.date}</td>
                    <td className="py-2">{row.time}</td>
                    <td className="py-2">{row.amount}</td>
                    <td className="py-2"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusTone[row.status]}`}>{row.status}</span></td>
                    <td className="py-2">
                      <div className="flex items-center gap-2 text-amber-600">
                        <button type="button" aria-label="View booking"><MdRemoveRedEye /></button>
                        <button type="button" aria-label="Print booking"><MdOutlinePrint /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="mt-3 text-sm font-semibold text-amber-600">View All Bookings</button>
        </div>

        <div className={`rounded-2xl border p-4 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
          <h3 className={`text-[24px] font-bold mb-3 ${darkMode ? "text-slate-100" : "text-[#17151f]"}`}>Donation Summary</h3>
          <div className="flex items-center justify-center pt-2">
            <div className="relative h-40 w-40 rounded-full bg-[conic-gradient(#22c55e_0deg_187deg,#f97316_187deg_281deg,#3b82f6_281deg_328deg,#8b5cf6_328deg_360deg)]">
              <div className={`absolute inset-7 rounded-full ${darkMode ? "bg-[#1f2937]" : "bg-white"}`} />
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            {donationBreakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                  <span className={darkMode ? "text-slate-300" : "text-gray-700"}>{item.label}</span>
                </div>
                <span className={darkMode ? "text-slate-300" : "text-gray-700"}>{item.amount}</span>
              </div>
            ))}
          </div>
          <div className={`mt-4 border-t pt-3 ${darkMode ? "border-[#334155]" : "border-[#f1ede6]"}`}>
            <p className={`${darkMode ? "text-slate-300" : "text-gray-600"} text-sm`}>Total Donations</p>
            <p className={`text-[36px] leading-none font-bold ${darkMode ? "text-slate-100" : "text-[#17151f]"}`}>Rs 11,500</p>
          </div>
          <button className="mt-3 text-sm font-semibold text-amber-600">View All Donations</button>
        </div>

        <div className={`rounded-2xl border p-4 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
          <h3 className={`text-[24px] font-bold mb-3 ${darkMode ? "text-slate-100" : "text-[#17151f]"}`}>Recent Receipts</h3>
          <div className="overflow-auto">
            <table className="w-full min-w-[460px] text-sm">
              <thead className={`${darkMode ? "text-slate-300" : "text-gray-600"}`}>
                <tr>
                  <th className="py-2 text-left">Receipt No</th>
                  <th className="py-2 text-left">Type</th>
                  <th className="py-2 text-left">Date</th>
                  <th className="py-2 text-left">Amount</th>
                  <th className="py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((row) => (
                  <tr key={row.no} className={`border-t ${darkMode ? "border-[#334155] text-slate-300" : "border-[#f1ede6] text-gray-700"}`}>
                    <td className="py-2">{row.no}</td>
                    <td className="py-2">{row.type}</td>
                    <td className="py-2">{row.date}</td>
                    <td className="py-2">{row.amount}</td>
                    <td className="py-2 text-amber-600"><MdFileDownload /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="mt-3 text-sm font-semibold text-amber-600">View All Receipts</button>
        </div>
      </div>

      <div className={`pb-2 text-sm ${darkMode ? "text-slate-400" : "text-gray-600"} flex items-center justify-between`}>
        <span>(C) 2026 Sri Shanti Mahadev Mandir. All rights reserved.</span>
        <span className="text-amber-700 font-medium">Sacred Devotee Management System</span>
      </div>
    </div>
  );
};

export default DevoteeDetails;
