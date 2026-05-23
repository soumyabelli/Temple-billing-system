const donations = [
  {
    id: "D-1024",
    name: "Ramesh Kumar",
    category: "Annadanam",
    amount: "₹22,000",
    date: "20 May 2026",
    status: "Verified",
    verifiedBy: "Priya",
  },
  {
    id: "D-1025",
    name: "Sneha Patel",
    category: "Temple Fund",
    amount: "₹48,500",
    date: "19 May 2026",
    status: "Pending",
    verifiedBy: "—",
  },
  {
    id: "D-1026",
    name: "Suresh Rao",
    category: "Festival Donation",
    amount: "₹12,000",
    date: "18 May 2026",
    status: "Refund Requested",
    verifiedBy: "Anita",
  },
];

const statusStyles = {
  Verified: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  "Refund Requested": "bg-rose-100 text-rose-700",
};

const DonationTable = () => {
  return (
    <div className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl text-white">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Donation Activity Log</h2>
          <p className="mt-2 text-slate-400">Latest donation entries and verification status for admin review.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-3xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-300">Manage Donation Types</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="py-4 px-3">Receipt ID</th>
              <th className="py-4 px-3">Donor</th>
              <th className="py-4 px-3">Category</th>
              <th className="py-4 px-3">Amount</th>
              <th className="py-4 px-3">Date</th>
              <th className="py-4 px-3">Status</th>
              <th className="py-4 px-3">Verified By</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((donation) => (
              <tr key={donation.id} className="border-b border-slate-800 hover:bg-slate-900/60 transition">
                <td className="py-4 px-3 font-medium text-white">{donation.id}</td>
                <td className="py-4 px-3">{donation.name}</td>
                <td className="py-4 px-3">{donation.category}</td>
                <td className="py-4 px-3 text-amber-300 font-semibold">{donation.amount}</td>
                <td className="py-4 px-3">{donation.date}</td>
                <td className="py-4 px-3">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[donation.status]}`}>
                    {donation.status}
                  </span>
                </td>
                <td className="py-4 px-3">{donation.verifiedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DonationTable;
