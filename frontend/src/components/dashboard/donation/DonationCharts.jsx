import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const TEMPLE_COLORS = ["#d97706", "#059669", "#0284c7", "#7c3aed", "#ea580c", "#e11d48", "#475569"];

const normalizeDate = (item) => {
  const dateValue = item.createdAt || item.date;
  const parsed = new Date(dateValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const DonationCharts = ({ donations = [] }) => {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const currentMonthIdx = now.getMonth();
  const currentMonthShort = monthNames[currentMonthIdx];
  const currentMonthFull = now.toLocaleString("en-IN", { month: "long", year: "numeric" });

  const monthlyCounts = {};
  const monthlyMap = donations.reduce((acc, donation) => {
    const date = normalizeDate(donation);
    if (!date) return acc;
    const month = monthNames[date.getMonth()];
    acc[month] = (acc[month] || 0) + (Number(donation.amount) || 0);
    monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    return acc;
  }, {});

  const currentMonthCollected = monthlyMap[currentMonthShort] || 0;
  const currentMonthDonors = monthlyCounts[currentMonthShort] || 0;

  const monthlyData = monthNames.map((month) => {
    const collected = monthlyMap[month] || 0;
    return {
      month,
      collected,
      target: Math.round(collected * 1.1) + 2000,
    };
  });

  const categoryMap = donations.reduce((acc, donation) => {
    const category = donation.category || "General";
    acc[category] = (acc[category] || 0) + (Number(donation.amount) || 0);
    return acc;
  }, {});

  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="rounded-[32px] border border-amber-200/60 bg-temple-100 dark:bg-[#0f172a] p-6 shadow-md backdrop-blur-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">Monthly Donation Progress</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">Live donation collection trends from the temple database.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 dark:border-emerald-700/60 px-4 py-2 text-left sm:text-right shadow-sm">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                This Month ({currentMonthShort} {now.getFullYear()})
              </p>
              <p className="text-xl font-black text-emerald-950 dark:text-emerald-200">
                ₹{currentMonthCollected.toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                {currentMonthDonors} {currentMonthDonors === 1 ? "donation" : "donations"} recorded
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d97706" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.08} />
                </linearGradient>
                <linearGradient id="colTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12, fontWeight: 600 }} />
              <YAxis stroke="#64748b" width={55} tick={{ fontSize: 12, fontWeight: 600 }} tickFormatter={(value) => {
                if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                if (value >= 1000) return (value / 1000).toFixed(1) + 'k';
                return value;
              }} />
              <Tooltip 
                formatter={(value, name) => [`₹${Number(value).toLocaleString("en-IN")}`, name]}
                contentStyle={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #fcd34d", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", color: "#1e293b", fontWeight: "700" }} 
              />
              <Area 
                type="monotone" 
                dataKey="collected" 
                stroke="#d97706" 
                strokeWidth={3} 
                dot={{ r: 4, fill: "#d97706", strokeWidth: 1, stroke: "#fff" }}
                activeDot={{ r: 7, stroke: "#b45309", strokeWidth: 2, fill: "#f59e0b" }}
                fillOpacity={1} 
                fill="url(#colCollected)" 
                name="Collected (₹)" 
              />
              <Area 
                type="monotone" 
                dataKey="target" 
                stroke="#059669" 
                strokeWidth={2} 
                strokeDasharray="4 4" 
                dot={false}
                fillOpacity={1} 
                fill="url(#colTarget)" 
                name="Target (₹)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-[32px] border border-amber-200/60 bg-temple-100 dark:bg-[#0f172a] p-6 shadow-md backdrop-blur-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">Category Share</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">Current donation category breakdown by total amount.</p>
          </div>
        </div>
        <div className="mt-6 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={68} outerRadius={108} paddingAngle={4}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={TEMPLE_COLORS[index % TEMPLE_COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: "#334155", fontWeight: "600", fontSize: "13px" }} />
              <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #fcd34d", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", color: "#1e293b", fontWeight: "700" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DonationCharts;
