import React from "react";
import { FaDonate, FaUsers, FaCalendarCheck, FaHandHoldingHeart } from "react-icons/fa";

const DonationStats = ({ stats = {} }) => {
  const displayStats = [
    {
      title: "Total Donations",
      value: stats.totalAmount != null ? `₹${Number(stats.totalAmount).toLocaleString("en-IN")}` : "₹0",
      subtitle: `${stats.totalDonors ?? 0} total contributions`,
      icon: <FaDonate />,
      accent: "from-amber-500 to-orange-600",
    },
    {
      title: "This Month's Donations",
      value: stats.currentMonthAmount != null ? `₹${Number(stats.currentMonthAmount).toLocaleString("en-IN")}` : "₹0",
      subtitle: `${stats.currentMonthDonors ?? 0} donors this month`,
      icon: <FaCalendarCheck />,
      accent: "from-emerald-500 to-teal-600",
    },
    {
      title: "Today's Donations",
      value: stats.todayAmount != null ? `₹${Number(stats.todayAmount).toLocaleString("en-IN")}` : "₹0",
      subtitle: `${stats.todayDonors ?? 0} received today`,
      icon: <FaHandHoldingHeart />,
      accent: "from-orange-500 to-amber-600",
    },
    {
      title: "Total Donors",
      value: stats.totalDonors ?? 0,
      subtitle: "Verified devotee donors",
      icon: <FaUsers />,
      accent: "from-indigo-500 to-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {displayStats.map((item, index) => (
        <div
          key={index}
          className="rounded-[32px] border border-amber-200/60 bg-temple-100 dark:bg-[#0f172a] p-6 shadow-md backdrop-blur-lg transition hover:shadow-lg"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-extrabold text-amber-700">{item.title}</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-200">{item.value}</h2>
              {item.subtitle && (
                <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{item.subtitle}</p>
              )}
            </div>

            <div className={`h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br ${item.accent} text-white flex items-center justify-center text-2xl shadow-md`}>
              {item.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DonationStats;
