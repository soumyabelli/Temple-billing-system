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

const COLORS = ["#7c3aed", "#f59e0b", "#ef4444", "#14b8a6", "#38bdf8", "#a855f7", "#22c55e"];

const normalizeDate = (item) => {
  const dateValue = item.createdAt || item.date;
  const parsed = new Date(dateValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const DonationCharts = ({ donations = [] }) => {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const monthlyMap = donations.reduce((acc, donation) => {
    const date = normalizeDate(donation);
    if (!date) return acc;
    const month = monthNames[date.getMonth()];
    acc[month] = (acc[month] || 0) + (Number(donation.amount) || 0);
    return acc;
  }, {});

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
      <div className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Monthly Donation Progress</h2>
            <p className="mt-2 text-slate-400">Live donation collection trends from the backend dataset.</p>
          </div>
        </div>
        <div className="mt-6 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} />
              <Area type="monotone" dataKey="collected" stroke="#f59e0b" fillOpacity={1} fill="url(#colCollected)" />
              <Area type="monotone" dataKey="target" stroke="#7c3aed" fillOpacity={1} fill="url(#colTarget)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Category Share</h2>
            <p className="mt-2 text-slate-400">Current donation category breakdown by amount.</p>
          </div>
        </div>
        <div className="mt-6 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={68} outerRadius={108} paddingAngle={4}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: "#cbd5e1" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DonationCharts;
