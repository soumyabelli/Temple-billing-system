import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SectionCard from "../../../components/admin/employee/SectionCard";
import DonationPageShell from "../../../components/admin/donations/DonationPageShell";

const AllDonations = () => {
 const navigate = useNavigate();
 const [donations, setDonations] = useState([]);
 const [loading, setLoading] = useState(false);
 const [filterType, setFilterType] = useState("all");
 const [startDate, setStartDate] = useState("");
 const [endDate, setEndDate] = useState("");

 const fetchDonations = async () => {
 setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/donations");
      const fetchedDonations = Array.isArray(res.data?.donations) ? res.data.donations : [];
      setDonations(fetchedDonations);
    } catch (error) {
 console.error("Unable to fetch donations:", error);
 } finally {
 setLoading(false);
 }
 };

 const filteredDonations = useMemo(() => {
 return donations.filter((donation) => {
 if (!donation.createdAt) return true;
 const d = new Date(donation.createdAt);
 const now = new Date();

 if (filterType === "weekly") {
 const weekAgo = new Date();
 weekAgo.setDate(now.getDate() - 7);
 return d >= weekAgo;
 }
 if (filterType === "monthwise") {
 return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
 }
 if (filterType === "yearly") {
 return d.getFullYear() === now.getFullYear();
 }
 if (filterType === "datewise") {
 let match = true;
 if (startDate) {
 const start = new Date(startDate);
 start.setHours(0, 0, 0, 0);
 match = match && d >= start;
 }
 if (endDate) {
 const end = new Date(endDate);
 end.setHours(23, 59, 59, 999);
 match = match && d <= end;
 }
 return match;
 }
 return true; // "all"
 });
 }, [donations, filterType, startDate, endDate]);

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

    const rows = filteredDonations.map((item) => [
      item._id ? `DN-${item._id.slice(-6).toUpperCase()}` : "",
      item.donorName || "",
      item.category || "",
      item.amount != null ? item.amount.toString() : "",
      item.paymentMethod || "",
      item.paymentMethod === "Cash"
        ? "Offline Payment"
        : (item.transactionId || item.razorpayPaymentId || (item.razorpayOrderId ? item.razorpayOrderId.replace(/^order_/, "pay_") : `pay_${item._id?.slice(-14)}`)),
      new Date(item.createdAt || Date.now()).toLocaleDateString(),
      (item.status === "Collected" || item.status === "Completed") ? "Collected" : "Not Collected",
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
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/admin/donations")}
            className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 font-semibold text-white transition hover:bg-slate-700"
          >
            Back to Donations
          </button>
          <button
            onClick={handleExport}
            className="rounded-2xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 dark:text-slate-200 transition hover:bg-amber-300"
          >
            Export Report
          </button>
        </div>
      }
    >
      <SectionCard title="Filters" subtitle="Filter donations based on time period." className="relative z-50">
        <div className="grid gap-6 md:grid-cols-4 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Time Period</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Time</option>
              <option value="weekly">This Week</option>
              <option value="monthwise">This Month</option>
              <option value="yearly">This Year</option>
              <option value="datewise">Custom Date</option>
            </select>
          </div>
          {filterType === "datewise" && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Donation Records" subtitle="Receipt ID, donor, payment method and collection status.">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700 dark:text-slate-200 ">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 ">
                <th className="py-4 px-3">Receipt ID</th>
                <th className="py-4 px-3">Donor</th>
                <th className="py-4 px-3">Donation Type</th>
                <th className="py-4 px-3">Amount</th>
                <th className="py-4 px-3">Payment Method</th>
                <th className="py-4 px-3">Transaction ID</th>
                <th className="py-4 px-3">Date</th>
                <th className="py-4 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 px-3 text-center text-slate-500 dark:text-slate-200 ">
                    Loading donations...
                  </td>
                </tr>
              ) : filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 px-3 text-center text-slate-500 dark:text-slate-200 ">
                    No donations found.
                  </td>
                </tr>
              ) : (
                filteredDonations.map((item) => {
                  const isCash = item.paymentMethod === "Cash";
                  const displayTxnId = isCash
                    ? "Offline Payment"
                    : (item.transactionId || item.razorpayPaymentId || (item.razorpayOrderId ? item.razorpayOrderId.replace(/^order_/, "pay_") : `pay_${item._id?.slice(-14)}`));
                  const isCollected = item.status === "Collected" || item.status === "Completed";
                  const displayStatus = isCollected ? "Collected" : "Not Collected";

                  return (
                    <tr key={item._id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="py-4 px-3 font-medium text-slate-900 dark:text-slate-200 ">DN-{item._id?.slice(-6).toUpperCase()}</td>
                      <td className="py-4 px-3 font-semibold">{item.donorName}</td>
                      <td className="py-4 px-3">{item.category}</td>
                      <td className="py-4 px-3 text-amber-600 font-bold">₹{item.amount?.toLocaleString()}</td>
                      <td className="py-4 px-3">
                        <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold ${isCash ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300" : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"}`}>
                          {item.paymentMethod}
                        </span>
                      </td>
                      <td className="py-4 px-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                        {displayTxnId}
                      </td>
                      <td className="py-4 px-3 text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-3">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold border ${
                          isCollected
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                            : "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                        }`}>
                          {displayStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

 </DonationPageShell>
 );
};

export default AllDonations;
