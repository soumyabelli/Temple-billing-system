const DashboardCard = ({
  title,
  amount,
  icon,
  trend,
  trendUp = true,
  trendLabel = "from yesterday",
  accent = "bg-temple-100 text-temple-600 dark:bg-temple-500/20 dark:text-temple-400",
  hideTrend = false,
}) => {
  const trendTextColor = trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400";
  const trendPrefix = trendUp ? "↑" : "↓";

  return (
    <div className="relative overflow-hidden bg-temple-100/60 dark:bg-[#1e293b]/70 backdrop-blur-xl rounded-2xl p-5 border border-white/40 dark:border-white/5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
      {/* Subtle background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-temple-500/0 to-temple-500/0 group-hover:from-temple-500/5 group-hover:to-transparent transition-colors duration-500 pointer-events-none" />
      
      <div className="relative flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl shadow-inner transition-transform duration-300 group-hover:scale-110 ${accent}`}>
            {icon}
          </div>
          {!hideTrend && trend != null && trend !== "" && (
            <div className={`px-2.5 py-1 rounded-full text-xs font-bold bg-temple-100 dark:bg-[#0f172a] shadow-sm ${trendTextColor}`}>
              {trendPrefix} {trend}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</h3>
          <h1 className="text-[32px] md:text-[38px] leading-tight font-bold text-slate-800 dark:text-slate-100 tracking-tight">{amount}</h1>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;

