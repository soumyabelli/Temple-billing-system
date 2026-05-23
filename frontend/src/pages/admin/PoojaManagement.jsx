import {
  MdCalendarMonth,
  MdOutlineCalendarToday,
  MdOutlineTaskAlt,
  MdOutlineVerified,
  MdOutlineCurrencyRupee,
  MdOutlineSearch,
  MdOutlineFilterAlt,
  MdOutlineRemoveRedEye,
  MdOutlineEdit,
  MdOutlinePrint,
  MdOutlineQrCode2,
  MdOutlineArrowOutward,
  MdOutlineAccessTime,
  MdOutlineNotificationsNone,
  MdOutlineManageAccounts,
} from "react-icons/md";
import { FaPlus, FaDownload } from "react-icons/fa6";
import { LuSunMedium } from "react-icons/lu";
import { GiPrayer } from "react-icons/gi";

const stats = [
  {
    title: "Today's Bookings",
    value: "86",
    trend: "12.4% from yesterday",
    icon: MdOutlineCalendarToday,
    iconBg: "bg-[#fff1e2]",
    iconText: "text-[#f97316]",
  },
  {
    title: "Upcoming Poojas",
    value: "42",
    trend: "8.7% from yesterday",
    icon: MdOutlineTaskAlt,
    iconBg: "bg-[#eaf6e8]",
    iconText: "text-[#15803d]",
  },
  {
    title: "Completed Services",
    value: "128",
    trend: "15.3% from yesterday",
    icon: MdOutlineVerified,
    iconBg: "bg-[#efe9ff]",
    iconText: "text-[#6d28d9]",
  },
  {
    title: "Booking Revenue",
    value: "Rs 48,650",
    trend: "18.6% from yesterday",
    icon: MdOutlineCurrencyRupee,
    iconBg: "bg-[#fff3db]",
    iconText: "text-[#ea580c]",
  },
];

const bookingRows = [
  { id: "BK1258", devotee: "Ramesh Kumar", pooja: "Archana", date: "14 May 2025", slot: "09:00 AM - 10:00 AM", amount: "Rs 550", status: "Confirmed" },
  { id: "BK1257", devotee: "Lakshmi Devi", pooja: "Abhisheka", date: "14 May 2025", slot: "11:00 AM - 12:00 PM", amount: "Rs 1,100", status: "Pending" },
  { id: "BK1256", devotee: "Suresh Babu", pooja: "Homa", date: "13 May 2025", slot: "08:00 AM - 09:30 AM", amount: "Rs 2,200", status: "Completed" },
  { id: "BK1255", devotee: "Meera Iyer", pooja: "Special Seva", date: "13 May 2025", slot: "04:00 PM - 05:00 PM", amount: "Rs 1,500", status: "Confirmed" },
  { id: "BK1254", devotee: "Venkatesh K.", pooja: "Festival Pooja", date: "12 May 2025", slot: "06:30 PM - 07:30 PM", amount: "Rs 2,500", status: "Confirmed" },
  { id: "BK1253", devotee: "Anitha Reddy", pooja: "Archana", date: "12 May 2025", slot: "10:00 AM - 11:00 AM", amount: "Rs 550", status: "Pending" },
  { id: "BK1252", devotee: "Ravi Shankar", pooja: "Abhisheka", date: "11 May 2025", slot: "07:00 AM - 08:00 AM", amount: "Rs 1,100", status: "Completed" },
  { id: "BK1251", devotee: "Krishna Prasad", pooja: "Homa", date: "11 May 2025", slot: "05:30 PM - 06:30 PM", amount: "Rs 2,200", status: "Confirmed" },
];

const sevaSchedule = [
  { time: "06:00 AM - 07:00 AM", name: "Suprabhata Seva", priest: "Srinivas Sharma", status: "Active", icon: LuSunMedium, iconTone: "bg-[#ebf7ea] text-[#15803d]" },
  { time: "09:00 AM - 10:00 AM", name: "Archana", priest: "Raghavendra", status: "Upcoming", icon: GiPrayer, iconTone: "bg-[#fff2e8] text-[#f97316]" },
  { time: "12:00 PM - 01:30 PM", name: "Abhisheka", priest: "Venkatesh Bhat", status: "Upcoming", icon: MdOutlineVerified, iconTone: "bg-[#eeebff] text-[#4f46e5]" },
  { time: "06:30 PM - 07:30 PM", name: "Maha Harathi", priest: "Somashekar", status: "Scheduled", icon: GiPrayer, iconTone: "bg-[#ffecef] text-[#e11d48]" },
];

const quickActions = [
  { label: "Add Booking", icon: MdOutlineCalendarToday, tone: "bg-[#f3efff] text-[#5b34d7]" },
  { label: "Assign Priest", icon: MdOutlineManageAccounts, tone: "bg-[#edf6eb] text-[#187a3b]" },
  { label: "Generate Receipt", icon: MdOutlinePrint, tone: "bg-[#eef3ff] text-[#2454c9]" },
  { label: "QR Confirmation", icon: MdOutlineQrCode2, tone: "bg-[#fff1e7] text-[#f97316]" },
  { label: "Booking History", icon: MdOutlineAccessTime, tone: "bg-[#edf2ff] text-[#3b56d0]" },
  { label: "Send Reminder", icon: MdOutlineNotificationsNone, tone: "bg-[#fff2e9] text-[#f97316]" },
];

const receipts = [
  { receiptId: "RC1258", bookingId: "BK1258", devotee: "Ramesh Kumar", amount: "Rs 550", method: "UPI", date: "14 May 2025, 09:05 AM" },
  { receiptId: "RC1257", bookingId: "BK1256", devotee: "Suresh Babu", amount: "Rs 2,200", method: "Card", date: "13 May 2025, 08:15 AM" },
  { receiptId: "RC1256", bookingId: "BK1255", devotee: "Meera Iyer", amount: "Rs 1,500", method: "Net Banking", date: "13 May 2025, 04:10 PM" },
  { receiptId: "RC1255", bookingId: "BK1254", devotee: "Venkatesh K.", amount: "Rs 2,500", method: "UPI", date: "12 May 2025, 06:40 PM" },
];

const statusTheme = {
  Confirmed: "bg-[#e8f6e9] text-[#187a3b]",
  Pending: "bg-[#fff1df] text-[#ea580c]",
  Completed: "bg-[#e9efff] text-[#2454c9]",
  Active: "bg-[#e8f6e9] text-[#187a3b]",
  Upcoming: "bg-[#fff1df] text-[#ea580c]",
  Scheduled: "bg-[#e9efff] text-[#2454c9]",
};

const PoojaManagement = () => {
  return (
    <div className="mt-5 space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[42px] leading-tight font-bold text-[#15141f]">Pooja Booking Management</h1>
          <p className="mt-1 text-[20px] text-[#5d6674]">Manage pooja schedules, bookings, slots, receipts and seva operations.</p>
        </div>

        <div className="inline-flex h-12 items-center gap-2 rounded-xl border border-[#f0e1d2] bg-[#fff7ee] px-4 text-[20px] font-semibold text-[#a64b0f]">
          <MdCalendarMonth size={22} />
          14 May 2025, Wednesday
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {stats.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="rounded-2xl border border-[#ece8e1] bg-white p-5">
              <div className="flex items-center gap-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${card.iconBg}`}>
                  <Icon className={card.iconText} size={30} />
                </div>
                <div>
                  <p className="text-[20px] font-medium text-[#323946]">{card.title}</p>
                  <p className="text-[44px] leading-none font-bold text-[#111827]">{card.value}</p>
                  <p className="mt-1 text-[18px] font-medium text-[#0b8a37]">↑ {card.trend}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-[#ece8e1] bg-white">
            <div className="flex flex-col gap-3 border-b border-[#f0ece6] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-[36px] font-bold text-[#15141f]">Pooja Bookings</h2>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex h-11 items-center gap-2 rounded-xl border border-[#ece8e1] bg-[#faf9f7] px-3 text-[#858b96]">
                  <MdOutlineSearch size={20} />
                  <input
                    className="w-[180px] bg-transparent text-[16px] text-[#242938] outline-none placeholder:text-[#9ca3af]"
                    placeholder="Search booking..."
                  />
                </div>
                <button className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#ece8e1] px-4 text-[16px] font-semibold text-[#3a3f4d]">
                  <MdOutlineFilterAlt size={20} /> Filter
                </button>
                <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#f97316] px-4 text-[16px] font-semibold text-white hover:bg-[#ea580c]">
                  <FaPlus size={12} /> Add Booking
                </button>
              </div>
            </div>

            <div className="overflow-auto">
              <table className="w-full min-w-[1020px] text-[15px]">
                <thead className="bg-[#faf9f7] text-[#2b3240]">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Booking ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Devotee</th>
                    <th className="px-4 py-3 text-left font-semibold">Pooja</th>
                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                    <th className="px-4 py-3 text-left font-semibold">Slot</th>
                    <th className="px-4 py-3 text-left font-semibold">Amount</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingRows.map((row) => (
                    <tr key={row.id} className="border-t border-[#f0ece6] text-[#2f3645]">
                      <td className="px-4 py-3">{row.id}</td>
                      <td className="px-4 py-3 font-medium">{row.devotee}</td>
                      <td className="px-4 py-3">{row.pooja}</td>
                      <td className="px-4 py-3">{row.date}</td>
                      <td className="px-4 py-3">{row.slot}</td>
                      <td className="px-4 py-3 font-semibold">{row.amount}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-lg px-2.5 py-1 text-[13px] font-semibold ${statusTheme[row.status]}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-[#f97316]">
                          <button type="button" aria-label="View booking"><MdOutlineRemoveRedEye size={18} /></button>
                          <button type="button" aria-label="Edit booking"><MdOutlineEdit size={18} /></button>
                          <button type="button" aria-label="Print receipt"><MdOutlinePrint size={18} /></button>
                          <button type="button" aria-label="Generate QR"><MdOutlineQrCode2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#f0ece6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[15px] text-[#6b7280]">Showing 1 to 8 of 120 entries</p>
              <div className="flex items-center gap-2 text-[14px]">
                <button className="h-8 w-8 rounded border border-[#ece8e1] text-[#6b7280]">{"<"}</button>
                <button className="h-8 w-8 rounded bg-[#f97316] text-white">1</button>
                <button className="h-8 w-8 rounded border border-[#ece8e1]">2</button>
                <button className="h-8 w-8 rounded border border-[#ece8e1]">3</button>
                <button className="h-8 w-8 rounded border border-[#ece8e1]">...</button>
                <button className="h-8 w-8 rounded border border-[#ece8e1]">15</button>
                <button className="h-8 w-8 rounded border border-[#ece8e1] text-[#6b7280]">{">"}</button>
              </div>
            </div>
          </div>

          <div className="overflow-auto rounded-2xl border border-[#ece8e1] bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[36px] font-bold text-[#15141f]">Recent Receipts</h2>
            </div>

            <table className="w-full min-w-[920px] text-[15px]">
              <thead className="text-[#2b3240]">
                <tr className="border-b border-[#f0ece6]">
                  <th className="py-2 text-left font-semibold">Receipt ID</th>
                  <th className="py-2 text-left font-semibold">Booking ID</th>
                  <th className="py-2 text-left font-semibold">Devotee</th>
                  <th className="py-2 text-left font-semibold">Amount</th>
                  <th className="py-2 text-left font-semibold">Payment Method</th>
                  <th className="py-2 text-left font-semibold">Date</th>
                  <th className="py-2 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((row) => (
                  <tr key={row.receiptId} className="border-b border-[#f0ece6] text-[#2f3645]">
                    <td className="py-2">{row.receiptId}</td>
                    <td className="py-2">{row.bookingId}</td>
                    <td className="py-2">{row.devotee}</td>
                    <td className="py-2 font-semibold">{row.amount}</td>
                    <td className="py-2">{row.method}</td>
                    <td className="py-2">{row.date}</td>
                    <td className="py-2">
                      <button type="button" aria-label="Download receipt" className="text-[#f97316]">
                        <FaDownload />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-2 flex justify-end">
              <button className="inline-flex items-center gap-1 text-[15px] font-semibold text-[#f97316]">
                View All Receipts <MdOutlineArrowOutward />
              </button>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-4">
          <div className="rounded-2xl border border-[#ece8e1] bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[26px] font-bold text-[#15141f]">Today's Seva Schedule</h3>
              <button className="text-[14px] font-semibold text-[#f97316]">View All</button>
            </div>

            <div className="space-y-2">
              {sevaSchedule.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={`${item.time}-${item.name}`} className="flex items-start gap-3 rounded-xl border border-[#f3efe8] p-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${item.iconTone}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] text-[#6b7280]">{item.time}</p>
                      <p className="text-[19px] font-semibold text-[#15141f]">{item.name}</p>
                      <p className="text-[14px] text-[#5b6472]">Priest: {item.priest}</p>
                    </div>
                    <span className={`rounded-lg px-2.5 py-1 text-[12px] font-semibold ${statusTheme[item.status]}`}>
                      {item.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[#ece8e1] bg-white p-4">
            <h3 className="mb-3 text-[34px] font-bold text-[#15141f]">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    className={`flex h-[88px] flex-col items-center justify-center gap-1 rounded-xl text-[14px] font-semibold ${action.tone}`}
                  >
                    <Icon size={22} />
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[#ece8e1] bg-white p-4">
            <h3 className="text-[34px] font-bold text-[#15141f]">Booking Overview <span className="text-[20px] font-medium text-[#4b5563]">(This Month)</span></h3>

            <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="relative h-44 w-44 rounded-full bg-[conic-gradient(#7FB3FF_0deg_182deg,#FA8A3B_182deg_280deg,#8AC28A_280deg_360deg)]">
                <div className="absolute inset-[18px] rounded-full bg-white flex flex-col items-center justify-center">
                  <p className="text-[13px] text-[#6b7280]">Total Bookings</p>
                  <p className="text-[44px] leading-none font-bold text-[#15141f]">356</p>
                </div>
              </div>

              <div className="w-full space-y-2 text-[15px] text-[#2f3645]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#8AC28A]" />Confirmed</div>
                  <span>180 (50.6%)</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#FA8A3B]" />Pending</div>
                  <span>96 (27.0%)</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#7FB3FF]" />Completed</div>
                  <span>80 (22.4%)</span>
                </div>
                <div className="border-t border-[#f0ece6] pt-2">
                  <p className="text-[14px] text-[#6b7280]">Total Revenue</p>
                  <p className="text-[44px] leading-none font-bold text-[#f97316]">Rs 2,45,680</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoojaManagement;
