import SectionCard from "../../../components/admin/employee/SectionCard";
import DonationPageShell from "../../../components/admin/donations/DonationPageShell";

const donations = [
  { id: "D-10234", donor: "Ramesh Kumar", type: "Annadanam", amount: "₹5,000", method: "UPI", tx: "UPI452312", date: "20 May 2026", status: "Success", verifiedBy: "Priya" },
  { id: "D-10250", donor: "Priya Shetty", type: "Temple Fund", amount: "₹10,000", method: "Net Banking", tx: "NB-7891", date: "19 May 2026", status: "Success", verifiedBy: "Suresh" },
  { id: "D-10271", donor: "Suresh Rao", type: "Festival Donation", amount: "₹2,500", method: "Cash", tx: "CASH-559", date: "18 May 2026", status: "Pending", verifiedBy: "N/A" },
];

const AllDonations = () => {
  return (
    <DonationPageShell
      title="All Donations"
      subtitle="A comprehensive donation registry with search, status, verification and export workflows."
      actions={
        <button className="rounded-2xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-300">
          Export Report
        </button>
      }
    >
      <SectionCard title="Donation Records" subtitle="Receipt ID, donor, payment method and verification status.">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 text-slate-900">
                <th className="py-4 px-3">Receipt ID</th>
                <th className="py-4 px-3">Donor</th>
                <th className="py-4 px-3">Donation Type</th>
                <th className="py-4 px-3">Amount</th>
                <th className="py-4 px-3">Payment Method</th>
                <th className="py-4 px-3">Transaction ID</th>
                <th className="py-4 px-3">Date</th>
                <th className="py-4 px-3">Status</th>
                <th className="py-4 px-3">Verified By</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((item) => (
                <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                  <td className="py-4 px-3 font-medium text-slate-900">{item.id}</td>
                  <td className="py-4 px-3">{item.donor}</td>
                  <td className="py-4 px-3">{item.type}</td>
                  <td className="py-4 px-3 text-amber-600 font-semibold">{item.amount}</td>
                  <td className="py-4 px-3">{item.method}</td>
                  <td className="py-4 px-3">{item.tx}</td>
                  <td className="py-4 px-3">{item.date}</td>
                  <td className="py-4 px-3">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.status === "Success" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-3">{item.verifiedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Donation Summary" subtitle="Key insights from the current donation ledger." className="h-full">
          <div className="grid gap-4">
            <div className="rounded-3xl bg-slate-950/10 p-5">
              <p className="text-sm text-slate-400">Payment success rate</p>
              <p className="mt-3 text-3xl font-semibold text-white">98.5%</p>
            </div>
            <div className="rounded-3xl bg-slate-950/10 p-5">
              <p className="text-sm text-slate-400">Recent activity</p>
              <p className="mt-3 text-xl text-white">3 donations verified in the last hour</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Quick Actions" subtitle="Fast access to receipts, verification and campaign tools." className="h-full">
          <div className="space-y-4">
            <button className="w-full rounded-2xl bg-violet-700 px-4 py-3 text-white transition hover:bg-violet-600">View Donation Details</button>
            <button className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white transition hover:bg-white/20">Print Receipt</button>
            <button className="w-full rounded-2xl bg-amber-400 px-4 py-3 text-slate-950 transition hover:bg-amber-300">Verify Payment</button>
          </div>
        </SectionCard>
      </div>
    </DonationPageShell>
  );
};

export default AllDonations;
