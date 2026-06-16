import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import SectionCard from "../../../components/admin/employee/SectionCard";
import { performanceList, topPerformers, departmentStrength } from "./employeeData";

const performanceTiles = [
  { title: "Top Performers", value: 8, accent: "bg-violet-100 text-violet-700" },
  { title: "Performance Score", value: "92.4%", accent: "bg-emerald-100 text-emerald-700" },
  { title: "Attendance Score", value: "95.1%", accent: "bg-sky-100 text-sky-700" },
  { title: "Task Completion Rate", value: "89%", accent: "bg-amber-100 text-amber-700" },
];

const radarData = [
  { subject: "Productivity", A: 85, B: 80 },
  { subject: "Discipline", A: 90, B: 88 },
  { subject: "Quality", A: 93, B: 85 },
  { subject: "Punctuality", A: 92, B: 86 },
  { subject: "Collaboration", A: 88, B: 82 },
];

const Performance = () => {
  return (
    <div className="space-y-8">
      <SectionCard title="Performance Analytics" subtitle="Measure employee productivity, discipline, and quality." className="bg-gradient-to-r from-[#211d4f] via-[#473d92] to-[#8f6be0] text-white border-transparent shadow-2xl shadow-violet-600/20">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {performanceTiles.map((tile) => (
            <div key={tile.title} className={`rounded-[28px] border border-white/10 px-5 py-6 ${tile.accent} bg-white/10 shadow-xl shadow-slate-900/10`}>
              <p className="text-sm uppercase tracking-[0.16em] text-slate-100/70">{tile.title}</p>
              <p className="mt-4 text-3xl font-semibold text-white">{tile.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-5">
          <SectionCard title="Performance Radar" subtitle="Compare performance metrics across teams." className="overflow-hidden">
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="80%">
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                  <Radar name="Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Performance Leaderboard" subtitle="Top rated employees for this month." className="overflow-hidden">
            <div className="space-y-4">
              {topPerformers.map((person) => (
                <div key={person.name} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{person.name}</p>
                      <p className="text-sm text-slate-500">{person.metric}</p>
                    </div>
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">{person.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-5">
          <SectionCard title="Quality Score" subtitle="Department performance comparison." className="overflow-hidden">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentStrength} margin={{ top: 20, right: 0, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
                  <XAxis dataKey="department" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b" }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#7c3aed" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Monthly Review" subtitle="Insights for employee development." className="overflow-hidden">
            <div className="space-y-3">
              {performanceList.map((item) => (
                <div key={item.name} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.department}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{item.rating}</span>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3 text-sm text-slate-500">
                    <span>Attendance: {item.attendance}</span>
                    <span>Discipline: {item.discipline}</span>
                    <span>Work Quality: {item.quality}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default Performance;
