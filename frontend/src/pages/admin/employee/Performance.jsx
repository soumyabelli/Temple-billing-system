import { useCallback, useEffect, useMemo, useState } from "react";
import SectionCard from "../../../components/admin/employee/SectionCard";
import { getPerformanceDashboard } from "../../../services/payrollService";

const formatMonthKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const Performance = () => {
  const [monthKey, setMonthKey] = useState(formatMonthKey(new Date()));
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getPerformanceDashboard(monthKey);
      setDashboard(response);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Failed to load performance data.");
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, [monthKey]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const performanceTiles = useMemo(() => {
    const summary = dashboard?.summary || {};
    const leaderboard = dashboard?.leaderboard || [];
    const totalPresent = leaderboard.reduce((sum, item) => sum + Number(item.presentDays || 0), 0);
    const totalExtraDuty = leaderboard.reduce((sum, item) => sum + Number(item.extraDutyDays || 0), 0);

    return [
      { title: "Top Performers", value: summary.topPerformers || 0, accent: "bg-violet-100 text-violet-700" },
      { title: "Total Present Days", value: totalPresent, accent: "bg-emerald-100 text-emerald-700" },
      { title: "Extra Duty Days", value: totalExtraDuty, accent: "bg-sky-100 text-sky-700" },
      { title: "Attendance Score", value: `${summary.attendanceScore || 0}%`, accent: "bg-amber-100 text-amber-700" },
    ];
  }, [dashboard]);

  return (
    <div className="space-y-8">
      <SectionCard
        title="Performance Analytics"
        subtitle="Leaderboard based on present days and extra duty completed this month."
        className="bg-gradient-to-r from-[#211d4f] via-[#473d92] to-[#8f6be0] text-white border-transparent shadow-2xl shadow-violet-600/20"
      >
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <label className="text-sm text-white/80">
            Review Month
            <input
              type="month"
              value={monthKey}
              onChange={(event) => setMonthKey(event.target.value)}
              className="ml-3 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white outline-none"
            />
          </label>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {performanceTiles.map((tile) => (
            <div key={tile.title} className={`rounded-[28px] border border-white/10 px-5 py-6 ${tile.accent} bg-white/10 shadow-xl shadow-slate-900/10`}>
              <p className="text-sm uppercase tracking-[0.16em] text-slate-100/70">{tile.title}</p>
              <p className="mt-4 text-3xl font-semibold text-white">{tile.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      <SectionCard title="Performance Leaderboard" subtitle="Ranked by present days and extra duty for this month." className="overflow-hidden">
        <div className="space-y-4">
          {loading ? (
            <p className="text-sm text-slate-500">Loading leaderboard…</p>
          ) : (dashboard?.leaderboard || []).length === 0 ? (
            <p className="text-sm text-slate-500">No attendance or extra duty records for this month yet.</p>
          ) : (
            dashboard.leaderboard.map((person) => (
              <div key={`${person.rank}-${person.name}`} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                      #{person.rank}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{person.name}</p>
                      <p className="text-sm text-slate-500">{person.department}</p>
                      <p className="mt-1 text-sm text-slate-600">{person.metric}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                    Score {person.score}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
};

export default Performance;
