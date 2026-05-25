import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const statusStyles = {
  Completed: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Failed: "bg-rose-100 text-rose-700",
};

const formatCurrency = (value) => {
  if (value == null) return "₹0";
  const amount = Number(value);
  if (Number.isNaN(amount)) return String(value);
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
};

const DonationTable = ({ donations = [] }) => {
  const navigate = useNavigate();

  const rows = useMemo(
    () =>
      donations.map((donation) => ({
        id: donation._id || donation.id || "-",
        donor: donation.donorName || donation.donor || "Unknown",
        category: donation.category || "General",
        amount: formatCurrency(donation.amount),
        date: donation.createdAt ? new Date(donation.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : donation.date || "-",
        status: donation.status || "Completed",
        verifiedBy: donation.verifiedBy || donation.verifiedBy || "Admin",
      })),
    [donations]
  );

  return (
    <div className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl text-white">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Donation Activity Log</h2>
          <p className="mt-2 text-slate-400">Live donation entries and verification status from the backend.</p>
        </div>
        <button
          onClick={() => navigate("/admin/donations/settings")}
          className="inline-flex items-center justify-center rounded-3xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-300"
        >
          Manage Donation Types
        </button>
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
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-800 hover:bg-slate-900/60 transition">
                <td className="py-4 px-3 font-medium text-white">{row.id}</td>
                <td className="py-4 px-3">{row.donor}</td>
                <td className="py-4 px-3">{row.category}</td>
                <td className="py-4 px-3 text-amber-300 font-semibold">{row.amount}</td>
                <td className="py-4 px-3">{row.date}</td>
                <td className="py-4 px-3">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[row.status] || "bg-slate-700 text-slate-100"}`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-4 px-3">{row.verifiedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DonationTable;
