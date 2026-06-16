const DashboardCard = ({
  title,
  amount,
  icon,
  trend,
  trendUp = true,
  trendLabel = "from yesterday",
  accent = "bg-orange-100 text-orange-600",
}) => {
  const trendTextColor = trendUp ? "text-green-700" : "text-red-600";
  const trendPrefix = trendUp ? "↑" : "↓";

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#ece8e1] min-h-[108px]">
      <div className="flex items-start gap-3">
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl ${accent}`}>
          {icon}
        </div>

        <div className="flex-1">
          <h3 className="text-sm text-gray-500">{title}</h3>
          <h1 className="text-[38px] leading-none font-bold text-[#1f1f1f] mt-2">{amount}</h1>
          <p className={`mt-2 text-sm font-semibold ${trendTextColor}`}>
            {trendPrefix} {trend} {trendLabel}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;

