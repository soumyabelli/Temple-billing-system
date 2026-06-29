const defaultDonationSources = [
  { label: "Online", value: 45, color: "bg-emerald-500" },
  { label: "Cash", value: 30, color: "bg-orange-400" },
  { label: "Cheque", value: 15, color: "bg-sky-500" },
  { label: "UPI", value: 10, color: "bg-violet-500" },
];

const DonationChart = ({ sources = [], showCounts = false }) => {
  const donationSources = sources.length ? sources : defaultDonationSources;
  const maxCount = Math.max(1, ...donationSources.map((source) => Number(source.count || 0)));

  return (
    <div className="space-y-4 mt-6">
      {donationSources.map((source) => {
        const barWidth = showCounts
          ? `${Math.max(4, (Number(source.count || 0) / maxCount) * 100)}%`
          : `${source.value}%`;

        return (
          <div key={source.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{source.label}</span>
              <span className="font-semibold text-gray-700">
                {showCounts
                  ? `${Number(source.count || 0)} · Rs ${Number(source.amount || 0).toLocaleString("en-IN")}`
                  : `${source.value}%`}
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-3 rounded-full ${source.color}`} style={{ width: barWidth }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DonationChart;
