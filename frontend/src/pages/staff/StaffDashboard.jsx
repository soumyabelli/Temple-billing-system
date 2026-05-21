import { FaClipboardList, FaCheckCircle, FaClock, FaBoxOpen, FaBell } from "react-icons/fa";

const statCards = [
  { title: "Today's Tasks", value: "8", icon: <FaClipboardList />, color: "bg-amber-500" },
  { title: "Completed", value: "5", icon: <FaCheckCircle />, color: "bg-emerald-500" },
  { title: "Pending", value: "3", icon: <FaClock />, color: "bg-orange-500" },
  { title: "Low Stock", value: "7", icon: <FaBoxOpen />, color: "bg-indigo-500" },
];

const StaffDashboard = () => {
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="rounded-3xl bg-white p-6 shadow-lg border border-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Sri Shanti Mahadev Mandir</p>
              <h1 className="mt-3 text-4xl font-bold text-slate-900">Welcome back, Staff Member!</h1>
              <p className="mt-2 text-slate-600">Here’s your overview and tasks for today.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-3xl bg-slate-50 px-4 py-3 text-slate-700 shadow-sm border border-slate-200">14 May 2025, Wednesday</div>
              <button className="inline-flex items-center gap-2 rounded-3xl bg-amber-500 px-5 py-3 text-white font-semibold shadow-lg hover:bg-amber-600">
                <FaBell /> Notifications
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => (
                <div key={card.title} className="rounded-3xl bg-white p-5 shadow-lg border border-slate-200">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{card.title}</p>
                      <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
                    </div>
                    <div className={`${card.color} text-white rounded-3xl p-3`}>
                      {card.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Today’s Assigned Duties</h2>
                  <p className="text-sm text-slate-500">View the work scheduled for your shift.</p>
                </div>
                <button className="text-amber-600 font-semibold">View All</button>
              </div>
              <div className="space-y-4">
                {[
                  { time: "06:00 AM", task: "Temple Cleaning (Main Hall)", status: "Completed" },
                  { time: "08:00 AM", task: "Prasadam Preparation Support", status: "In Progress" },
                  { time: "10:00 AM", task: "Flower Decoration", status: "Completed" },
                  { time: "12:30 PM", task: "Passenger / Devotee Assistance", status: "In Progress" },
                  { time: "03:00 PM", task: "Inventory Room Arrangement", status: "Pending" },
                  { time: "05:00 PM", task: "Evening Aarti Preparation", status: "Pending" },
                ].map((item) => (
                  <div key={item.time} className="flex flex-col gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{item.time}</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{item.task}</p>
                    </div>
                    <span className={`rounded-full px-4 py-2 text-sm font-semibold ${item.status === "Completed" ? "bg-emerald-100 text-emerald-700" : item.status === "In Progress" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Inventory Alerts</h3>
                  <p className="text-sm text-slate-500">Items needing attention today.</p>
                </div>
                <button className="text-amber-600 font-semibold">View All</button>
              </div>
              <div className="space-y-4">
                {[
                  { name: "Camphor", detail: "Stock: 5 Units", status: "Low Stock" },
                  { name: "Ghee", detail: "Stock: 3 Units", status: "Low Stock" },
                  { name: "Incense Sticks", detail: "Stock: 2 Boxes", status: "Low Stock" },
                  { name: "Pooja Flowers", detail: "Stock: 1 Basket", status: "Low Stock" },
                  { name: "Coconut", detail: "Stock: 8 Units", status: "Reorder Soon" },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-3xl bg-slate-50 p-4 border border-slate-200">
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.detail}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "Low Stock" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Attendance Overview</h3>
                  <p className="text-sm text-slate-500">Today�s attendance snapshot.</p>
                </div>
                <button className="text-amber-600 font-semibold">View Attendance</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200">
                  <p className="text-sm text-slate-500">Present</p>
                  <p className="mt-3 text-3xl font-bold text-slate-900">14</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200">
                  <p className="text-sm text-slate-500">Absent</p>
                  <p className="mt-3 text-3xl font-bold text-slate-900">2</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200">
                  <p className="text-sm text-slate-500">On Leave</p>
                  <p className="mt-3 text-3xl font-bold text-slate-900">2</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200">
                  <p className="text-sm text-slate-500">Team Members</p>
                  <p className="mt-3 text-3xl font-bold text-slate-900">18</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
