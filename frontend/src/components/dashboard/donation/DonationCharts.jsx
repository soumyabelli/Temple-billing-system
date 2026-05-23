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

const monthlyData = [
  { month: "Jan", collected: 32000, target: 28000 },
  { month: "Feb", collected: 45000, target: 42000 },
  { month: "Mar", collected: 50000, target: 47000 },
  { month: "Apr", collected: 62000, target: 52000 },
  { month: "May", collected: 54000, target: 56000 },
];

const categoryData = [
  { name: "Annadanam", value: 35 },
  { name: "Temple Fund", value: 26 },
  { name: "Festival", value: 18 },
  { name: "Sponsorship", value: 12 },
  { name: "QR/UPI", value: 9 },
];

const COLORS = ["#7c3aed", "#f59e0b", "#ef4444", "#14b8a6", "#38bdf8"];

const DonationCharts = () => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Monthly Donation Progress</h2>
            <p className="mt-2 text-slate-400">Monitor monthly inflows against administrative targets.</p>
          </div>
        </div>
        <div className="mt-6 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#b45309" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8} />
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
            <p className="mt-2 text-slate-400">Donation composition by category, useful for planning campaigns and admin reports.</p>
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
