import { useEffect, useState } from "react";
import axios from "axios";
import SectionCard from "../../../components/admin/employee/SectionCard";
import DonationPageShell from "../../../components/admin/donations/DonationPageShell";

const AllDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/donations");
      setDonations(Array.isArray(res.data?.donations) ? res.data.donations : []);
    } catch (error) {
      console.error("Unable to fetch donations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const headers = [
      "Receipt ID",
      "Donor",
      "Donation Type",
      "Amount",
      "Payment Method",
      "Transaction ID",
      "Date",
      "Status",
    ];

    const rows = donations.map((item) => [
      item._id || "",
      item.donorName || "",
      item.category || "",
      item.amount != null ? item.amount.toString() : "",
      item.paymentMethod || "",
      item.transactionId || "",
      new Date(item.createdAt || Date.now()).toLocaleDateString(),
      item.status || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "donations-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  return (
    <DonationPageShell
      title="All Donations"
      subtitle="A comprehensive donation registry with search, status, verification and export workflows."
      actions={
        <button
          onClick={handleExport}
          className="rounded-2xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-300"
        >
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
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-8 px-3 text-center text-slate-500">
                    Loading donations...
                  </td>
                </tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 px-3 text-center text-slate-500">
                    No donations found.
                  </td>
                </tr>
              ) : (
                donations.map((item) => (
                  <tr key={item._id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                    <td className="py-4 px-3 font-medium text-slate-900">{item._id?.slice(-8).toUpperCase()}</td>
                    <td className="py-4 px-3">{item.donorName}</td>
                    <td className="py-4 px-3">{item.category}</td>
                    <td className="py-4 px-3 text-amber-600 font-semibold">₹{item.amount?.toLocaleString()}</td>
                    <td className="py-4 px-3">{item.paymentMethod}</td>
                    <td className="py-4 px-3">{item.transactionId || "—"}</td>
                    <td className="py-4 px-3">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-3">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.status === "Completed" ? "bg-emerald-100 text-emerald-700" : item.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-3">{item.verifiedBy || "N/A"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Donation Summary" subtitle="Key insights from the current donation ledger." className="h-full">
          <div className="grid gap-4">
            <div className="rounded-3xl bg-slate-950/10 p-5">
              <p className="text-sm text-slate-400">Total donations recorded</p>
              <p className="mt-3 text-3xl font-semibold text-white">{donations.length}</p>
            </div>
            <div className="rounded-3xl bg-slate-950/10 p-5">
              <p className="text-sm text-slate-400">Latest donation</p>
              <p className="mt-3 text-xl text-white">
                {donations[0]?.donorName ? `${donations[0].donorName} - ₹${donations[0].amount?.toLocaleString()}` : "No donations yet"}
              </p>
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
