import {
  MdCalendarMonth,
  MdOutlineFilterAlt,
  MdOutlineSearch,
  MdOutlineEvent,
  MdOutlineCurrencyRupee,
  MdOutlineRemoveRedEye,
  MdOutlineEdit,
  MdOutlineKeyboardArrowDown,
  MdLocationOn,
  MdAccessTime,
  MdPeople,
  MdCampaign,
  MdQrCode2,
  MdAssessment,
  MdGroups,
} from "react-icons/md";
import { FaRegCalendarAlt } from "react-icons/fa";

const stats = [
  {
    title: "Upcoming Festivals",
    value: "12",
    note: "4 new this month",
    icon: MdOutlineEvent,
    iconTone: "bg-[#fff3e6] text-[#ff8b00]",
  },
  {
    title: "Today's Events",
    value: "5",
    note: "Active celebrations",
    icon: MdCalendarMonth,
    iconTone: "bg-[#f0ebff] text-[#7c6bdb]",
  },
  {
    title: "Total Registrations",
    value: "2,350",
    note: "18% from last festival",
    icon: MdPeople,
    iconTone: "bg-[#ebf8ea] text-[#2f9f2f]",
  },
  {
    title: "Festival Revenue",
    value: "Rs 3,42,500",
    note: "12.5% increase",
    icon: MdOutlineCurrencyRupee,
    iconTone: "bg-[#eaf0ff] text-[#3a74cc]",
  },
];

const festivalRows = [
  {
    name: "Maha Shivaratri",
    date: "25 Feb 2026",
    venue: "Main Temple",
    slots: 500,
    registrations: 420,
    status: "Active",
    avatar: "https://i.pravatar.cc/80?img=12",
  },
  {
    name: "Ugadi Utsavam",
    date: "09 Apr 2026",
    venue: "Hall A",
    slots: 300,
    registrations: 250,
    status: "Upcoming",
    avatar: "https://i.pravatar.cc/80?img=20",
  },
  {
    name: "Hanuman Jayanti",
    date: "17 Apr 2026",
    venue: "Temple Ground",
    slots: 400,
    registrations: 375,
    status: "Active",
    avatar: "https://i.pravatar.cc/80?img=33",
  },
  {
    name: "Navaratri Seva",
    date: "10 Oct 2026",
    venue: "Hall B",
    slots: 800,
    registrations: 620,
    status: "Upcoming",
    avatar: "https://i.pravatar.cc/80?img=40",
  },
  {
    name: "Kartika Deepotsavam",
    date: "18 Nov 2026",
    venue: "Main Temple",
    slots: 1000,
    registrations: 920,
    status: "Completed",
    avatar: "https://i.pravatar.cc/80?img=52",
  },
];

const registrations = [
  { name: "Ramesh Kumar", festival: "Maha Shivaratri", tickets: 2, amount: "Rs 500", time: "21 May 2026, 10:30 AM", avatar: "https://i.pravatar.cc/60?img=12" },
  { name: "Lakshmi Devi", festival: "Navaratri Seva", tickets: 4, amount: "Rs 1200", time: "21 May 2026, 09:15 AM", avatar: "https://i.pravatar.cc/60?img=5" },
];

const monthlyRevenue = [
  { month: "Jan", value: 70 },
  { month: "Feb", value: 90 },
  { month: "Mar", value: 120 },
  { month: "Apr", value: 150 },
  { month: "May", value: 180 },
  { month: "Jun", value: 130 },
  { month: "Jul", value: 110 },
];

const quickActions = [
  { title: "Add Festival", icon: MdCalendarMonth, tone: "bg-[#fff7ea] text-[#e58a0a]" },
  { title: "Send Notification", icon: MdCampaign, tone: "bg-[#f2f0ff] text-[#6f61d3]" },
  { title: "Generate Passes", icon: FaRegCalendarAlt, tone: "bg-[#eef9ec] text-[#3a9a3a]" },
  { title: "QR Check-In", icon: MdQrCode2, tone: "bg-[#edf3ff] text-[#4a75df]" },
  { title: "Event Report", icon: MdAssessment, tone: "bg-[#fff1ee] text-[#ea5f46]" },
  { title: "Manage Slots", icon: MdGroups, tone: "bg-[#fff6e9] text-[#cc8a21]" },
];

const statusClass = {
  Active: "bg-[#e8f6e8] text-[#2e8e2e]",
  Upcoming: "bg-[#e8f0ff] text-[#3573cb]",
  Completed: "bg-[#efefef] text-[#555]",
};

const FestivalsEventsManagement = () => {
  return (
    <div className="mt-5 space-y-4 pb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[46px] leading-tight font-bold text-[#17151f]">Festivals & Events</h1>
          <p className="mt-1 text-[20px] text-[#5c6675]">Manage temple festivals, event schedules, cultural programs, and celebrations.</p>
        </div>
        <div className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#ece8e1] bg-white px-4 text-[20px] text-[#7b4a1f]">
          <MdCalendarMonth size={21} />
          21 May 2026, Thursday
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {stats.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="rounded-2xl border border-[#ece8e1] bg-white p-4">
              <div className="flex items-center gap-4">
                <div className={`flex h-20 w-20 items-center justify-center rounded-full ${card.iconTone}`}>
                  <Icon size={36} />
                </div>
                <div>
                  <p className="text-[29px] font-semibold text-[#1f2530]">{card.title}</p>
                  <p className="text-[54px] leading-none font-bold text-[#1c2230]">{card.value}</p>
                  <p className="mt-1 text-[25px] text-[#2f9f2f]">Up {card.note}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2.25fr_1.1fr]">
        <div className="rounded-2xl border border-[#ece8e1] bg-white p-4">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-[40px] font-bold text-[#17151f]">Festival Schedule</h2>
            <div className="flex items-center gap-2">
              <button className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#ece8e1] px-4 text-[18px] text-[#4f5866]">
                <MdOutlineFilterAlt size={18} /> Filter
              </button>
              <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#ff8b00] px-4 text-[18px] font-semibold text-white hover:bg-[#ec7f00]">
                + Add Festival
              </button>
            </div>
          </div>

          <div className="mb-4 flex h-11 items-center gap-2 rounded-xl border border-[#ece8e1] bg-[#faf9f7] px-3 text-[#8b93a0]">
            <MdOutlineSearch size={20} />
            <input className="w-full bg-transparent text-[17px] text-[#202632] outline-none" placeholder="Search festival or event..." />
          </div>

          <div className="overflow-auto rounded-xl border border-[#f1ede6]">
            <table className="w-full min-w-[980px] text-[17px]">
              <thead className="bg-[#f8f6f2] text-[#2a3140]">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">Festival</th>
                  <th className="px-3 py-3 text-left font-semibold">Date</th>
                  <th className="px-3 py-3 text-left font-semibold">Venue</th>
                  <th className="px-3 py-3 text-left font-semibold">Slots</th>
                  <th className="px-3 py-3 text-left font-semibold">Registrations</th>
                  <th className="px-3 py-3 text-left font-semibold">Status</th>
                  <th className="px-3 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {festivalRows.map((row) => (
                  <tr key={row.name} className="border-t border-[#f1ede6] text-[#2f3645]">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <img src={row.avatar} alt={row.name} className="h-9 w-9 rounded-full object-cover" />
                        <span>{row.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">{row.date}</td>
                    <td className="px-3 py-3">{row.venue}</td>
                    <td className="px-3 py-3">{row.slots}</td>
                    <td className="px-3 py-3">{row.registrations}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-xl px-3 py-1 text-[14px] font-semibold ${statusClass[row.status]}`}>{row.status}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <button className="inline-flex h-8 w-10 items-center justify-center rounded-lg border border-[#ece8e1] bg-[#faf7f2] text-[#7b5324]">
                          <MdOutlineRemoveRedEye />
                        </button>
                        <button className="inline-flex h-8 w-10 items-center justify-center rounded-lg border border-[#ece8e1] bg-[#faf7f2] text-[#7b5324]">
                          <MdOutlineEdit />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[#ece8e1] bg-white p-4">
            <h3 className="text-[40px] font-bold text-[#17151f]">Upcoming Festival</h3>
            <img
              src="https://images.unsplash.com/photo-1532664189809-02133fee698d?auto=format&fit=crop&w=1300&q=80"
              alt="Maha Shivaratri"
              className="mt-3 h-[168px] w-full rounded-xl object-cover"
            />
            <div className="mt-3">
              <h4 className="text-[39px] font-bold text-[#1b2230]">Maha Shivaratri</h4>
              <div className="mt-1 space-y-1 text-[24px] text-[#3f4757]">
                <p className="flex items-center gap-2"><FaRegCalendarAlt className="text-[#8b5b2d]" /> Date : 25 Feb 2026</p>
                <p className="flex items-center gap-2"><MdLocationOn className="text-[#8b5b2d]" /> Venue : Main Temple</p>
                <p className="flex items-center gap-2"><MdAccessTime className="text-[#8b5b2d]" /> Time : 6:00 PM</p>
                <p className="flex items-center gap-2"><MdPeople className="text-[#8b5b2d]" /> Registrations : 420</p>
                <p className="flex items-center gap-2"><MdOutlineCurrencyRupee className="text-[#8b5b2d]" /> Collection : Rs 1,25,000</p>
              </div>
              <button className="mt-3 h-11 w-full rounded-lg bg-[#ff8b00] text-[19px] font-semibold text-white hover:bg-[#ec7f00]">View Full Details</button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#ece8e1] bg-white p-4">
            <h3 className="text-[36px] font-bold text-[#17151f]">Quick Actions</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button key={action.title} className={`h-[92px] rounded-xl text-[18px] font-medium ${action.tone}`}>
                    <div className="flex h-full flex-col items-center justify-center gap-1">
                      <Icon size={26} />
                      <span>{action.title}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.25fr_1fr]">
        <div className="rounded-2xl border border-[#ece8e1] bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[34px] font-bold text-[#17151f]">Recent Registrations</h3>
          </div>
          <div className="overflow-auto rounded-xl border border-[#f1ede6]">
            <table className="w-full min-w-[760px] text-[16px]">
              <thead className="bg-[#f8f6f2] text-[#2a3140]">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">Name</th>
                  <th className="px-3 py-3 text-left font-semibold">Festival</th>
                  <th className="px-3 py-3 text-left font-semibold">Tickets</th>
                  <th className="px-3 py-3 text-left font-semibold">Amount</th>
                  <th className="px-3 py-3 text-left font-semibold">Registered On</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((row) => (
                  <tr key={row.name} className="border-t border-[#f1ede6] text-[#2f3645]">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <img src={row.avatar} alt={row.name} className="h-8 w-8 rounded-full object-cover" />
                        <span>{row.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">{row.festival}</td>
                    <td className="px-3 py-3">{row.tickets}</td>
                    <td className="px-3 py-3">{row.amount}</td>
                    <td className="px-3 py-3">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="mt-3 text-[18px] font-semibold text-[#ff8b00]">View All Registrations</button>
        </div>

        <div className="rounded-2xl border border-[#ece8e1] bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[34px] font-bold text-[#17151f]">Revenue Overview (Monthly)</h3>
            <button className="inline-flex h-8 items-center gap-1 rounded-md border border-[#ece8e1] px-2 text-[12px] text-[#4f5866]">
              2026 <MdOutlineKeyboardArrowDown />
            </button>
          </div>

          <div className="h-[220px] rounded-xl border border-[#f1ede6] bg-[#fffdfa] p-3">
            <div className="flex h-full items-end justify-between gap-2">
              {monthlyRevenue.map((item) => (
                <div key={item.month} className="flex h-full flex-1 flex-col items-center justify-end">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-[#f1a229] to-[#f5cb75]"
                    style={{ height: `${item.value}%` }}
                  />
                  <p className="mt-2 text-[13px] text-[#4f5866]">{item.month}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[14px] text-[#5c6675]">
        <span>(C) 2026 Sri Shanti Mahadev Mandir. All rights reserved.</span>
        <span className="font-medium text-[#8b5b2d]">Sacred Event Management Portal</span>
      </div>
    </div>
  );
};

export default FestivalsEventsManagement;
