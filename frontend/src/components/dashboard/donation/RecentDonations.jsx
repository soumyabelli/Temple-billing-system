const recentDonations = [
  { label: "₹22,000 Annadanam", time: "10 min ago" },
  { label: "₹48,500 Temple Fund", time: "1 hour ago" },
  { label: "₹12,000 Festival Donation", time: "3 hours ago" },
];

const RecentDonations = () => {
  return (
    <div className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl text-white">
      <h2 className="text-2xl font-semibold">Recent Donation Activity</h2>
      <p className="mt-2 text-slate-400">Latest donation inflows that require admin attention or reporting.</p>

      <div className="mt-6 space-y-4">
        {recentDonations.map((donation, index) => (
          <div key={index} className="rounded-3xl bg-slate-900/70 p-4">
            <p className="text-lg font-semibold text-white">{donation.label}</p>
            <p className="text-sm text-slate-400">{donation.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentDonations;
