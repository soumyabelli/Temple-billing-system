const RecentDonations = ({ donations = [] }) => {
  const recent = [...donations]
    .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
    .slice(0, 3);

  return (
    <div className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl text-white">
      <h2 className="text-2xl font-semibold">Recent Donation Activity</h2>
      <p className="mt-2 text-slate-400">Live donation inflows from the backend ledger.</p>

      <div className="mt-6 space-y-4">
        {recent.map((donation, index) => (
          <div key={`${donation._id || donation.id}-${index}`} className="rounded-3xl bg-slate-900/70 p-4">
            <p className="text-lg font-semibold text-white">{donation.donorName || donation.donor || "Unknown donor"}</p>
            <p className="text-sm text-slate-400">{donation.category || "General"} • {donation.amount ? `₹${donation.amount}` : "₹0"}</p>
            <p className="text-sm text-slate-400">{new Date(donation.createdAt || donation.date).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        ))}
        {recent.length === 0 && <p className="text-slate-400">No donations have been recorded yet.</p>}
      </div>
    </div>
  );
};

export default RecentDonations;
