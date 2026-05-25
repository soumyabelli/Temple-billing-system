const formatAmount = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return value || "₹0";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
};

const TopDonors = ({ donations = [] }) => {
  const totals = donations.reduce((acc, donation) => {
    const name = donation.donorName || donation.donor || "Unknown";
    const amount = Number(donation.amount) || 0;
    acc[name] = (acc[name] || 0) + amount;
    return acc;
  }, {});

  const topDonors = Object.entries(totals)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  return (
    <div className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl text-white">
      <h2 className="text-2xl font-semibold">Top Donors</h2>
      <p className="mt-2 text-slate-400">High-value donors based on the current donation dataset.</p>

      <div className="mt-6 space-y-4">
        {topDonors.length > 0 ? (
          topDonors.map((donor, index) => (
            <div key={donor.name} className="flex items-center justify-between rounded-3xl bg-slate-900/70 p-4">
              <div>
                <p className="text-lg font-semibold text-white">{donor.name}</p>
                <p className="text-sm text-slate-400">Contributor rank #{index + 1}</p>
              </div>
              <p className="text-lg font-semibold text-amber-300">{formatAmount(donor.amount)}</p>
            </div>
          ))
        ) : (
          <p className="text-slate-400">No donation data available yet.</p>
        )}
      </div>
    </div>
  );
};

export default TopDonors;
