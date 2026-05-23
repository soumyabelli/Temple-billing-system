const donors = [
  { name: "Ramesh Kumar", amount: "₹1,24,000", type: "Gold Donor" },
  { name: "Priya Shetty", amount: "₹92,500", type: "Silver Donor" },
  { name: "Suresh Rao", amount: "₹76,800", type: "Bronze Donor" },
];

const TopDonors = () => {
  return (
    <div className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl text-white">
      <h2 className="text-2xl font-semibold">Top Donors</h2>
      <p className="mt-2 text-slate-400">Donor leaders by contribution, useful for recognition and stewardship planning.</p>

      <div className="mt-6 space-y-4">
        {donors.map((donor, index) => (
          <div key={index} className="flex items-center justify-between rounded-3xl bg-slate-900/70 p-4">
            <div>
              <p className="text-lg font-semibold text-white">{donor.name}</p>
              <p className="text-sm text-slate-400">{donor.type}</p>
            </div>
            <p className="text-lg font-semibold text-amber-300">{donor.amount}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopDonors;
