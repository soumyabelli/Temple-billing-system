import { jsPDF } from "jspdf";
import { useEffect, useMemo, useState } from "react";
import { getDevoteeBookings, getDevoteeDonations, getPrasadamOrders } from "../../services/devoteeService";

const formatCurrency = (value) => `₹ ${Number(value || 0).toLocaleString()}`;

const getRangeStart = (range) => {
  const now = new Date();
  if (range === "weekly") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  }
  if (range === "yearly") {
    return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  }
  return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
};

const formatRangeLabel = (range) => {
  if (range === "weekly") return "Weekly";
  if (range === "yearly") return "Yearly";
  return "Monthly";
};

const BillingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [donations, setDonations] = useState([]);
  const [prasadamOrders, setPrasadamOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportRange, setReportRange] = useState("monthly");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bookingRes, donationRes, prasadamRes] = await Promise.all([
          getDevoteeBookings(),
          getDevoteeDonations(),
          getPrasadamOrders(),
        ]);
        setBookings(bookingRes.bookings || []);
        setDonations(donationRes.donations || []);
        setPrasadamOrders(prasadamRes.orders || []);
      } catch (error) {
        console.warn("Unable to load billing data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const bookingRevenue = useMemo(
    () => bookings.reduce((total, item) => total + Number(item.amount || 0), 0),
    [bookings]
  );

  const donationRevenue = useMemo(
    () => donations.reduce((total, item) => total + Number(item.amount || 0), 0),
    [donations]
  );

  const prasadamRevenue = useMemo(
    () => prasadamOrders.reduce((total, item) => total + Number(item.totalPrice || 0), 0),
    [prasadamOrders]
  );

  const totalRevenue = bookingRevenue + donationRevenue + prasadamRevenue;

  const reportStartDate = useMemo(() => getRangeStart(reportRange), [reportRange]);

  const filterByDate = (item, dateKeys) => {
    const rawDate = dateKeys.map((key) => item[key]).find(Boolean);
    const parsed = rawDate ? new Date(rawDate) : null;
    return parsed instanceof Date && !Number.isNaN(parsed.getTime()) && parsed >= reportStartDate;
  };

  const filteredBookings = useMemo(
    () => bookings.filter((item) => filterByDate(item, ["createdAt", "datetime"])),
    [bookings, reportStartDate]
  );

  const filteredDonations = useMemo(
    () => donations.filter((item) => filterByDate(item, ["createdAt", "date"])),
    [donations, reportStartDate]
  );

  const filteredPrasadamOrders = useMemo(
    () => prasadamOrders.filter((item) => filterByDate(item, ["createdAt", "orderDate", "date"])),
    [prasadamOrders, reportStartDate]
  );

  const reportBookingRevenue = useMemo(
    () => filteredBookings.reduce((total, item) => total + Number(item.amount || 0), 0),
    [filteredBookings]
  );

  const reportDonationRevenue = useMemo(
    () => filteredDonations.reduce((total, item) => total + Number(item.amount || 0), 0),
    [filteredDonations]
  );

  const reportPrasadamRevenue = useMemo(
    () => filteredPrasadamOrders.reduce((total, item) => total + Number(item.totalPrice || 0), 0),
    [filteredPrasadamOrders]
  );

  const reportRevenue = reportBookingRevenue + reportDonationRevenue + reportPrasadamRevenue;

  const paymentMethods = useMemo(() => {
    const methodCounts = {};
    donations.forEach((item) => {
      const method = item.paymentMethod || "UPI";
      methodCounts[method] = (methodCounts[method] || 0) + 1;
    });
    prasadamOrders.forEach((item) => {
      const method = item.paymentMethod || "UPI";
      methodCounts[method] = (methodCounts[method] || 0) + 1;
    });
    return Object.entries(methodCounts).map(([method, count]) => ({ method, count }));
  }, [donations, prasadamOrders]);

  const recentTransactions = useMemo(() => {
    const mapped = [
      ...bookings.map((item) => ({
        id: item._id,
        category: "Pooja Booking",
        description: item.service,
        amount: Number(item.amount || 0),
        paymentMethod: item.paymentMethod || "Offline",
        status: item.status || "Pending",
        date: item.createdAt || item.datetime || "",
      })),
      ...donations.map((item) => ({
        id: item._id,
        category: item.category || "Donation",
        description: item.notes || item.transactionId || "Donation received",
        amount: Number(item.amount || 0),
        paymentMethod: item.paymentMethod || "UPI",
        status: item.status || "Completed",
        date: item.createdAt || "",
      })),
      ...prasadamOrders.map((item) => ({
        id: item._id,
        category: "Prasadam Order",
        description: item.itemName || "Prasadam",
        amount: Number(item.totalPrice || 0),
        paymentMethod: item.paymentMethod || "UPI",
        status: item.status || "Pending",
        date: item.createdAt || item.orderDate || "",
      })),
    ];
    return mapped
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  }, [bookings, donations, prasadamOrders]);

  const reportTransactions = useMemo(() => {
    const mapped = [
      ...filteredBookings.map((item) => ({
        id: item._id,
        category: "Pooja Booking",
        description: item.service,
        amount: Number(item.amount || 0),
        paymentMethod: item.paymentMethod || "Offline",
        status: item.status || "Pending",
        date: item.createdAt || item.datetime || "",
      })),
      ...filteredDonations.map((item) => ({
        id: item._id,
        category: item.category || "Donation",
        description: item.notes || item.transactionId || "Donation received",
        amount: Number(item.amount || 0),
        paymentMethod: item.paymentMethod || "UPI",
        status: item.status || "Completed",
        date: item.createdAt || "",
      })),
      ...filteredPrasadamOrders.map((item) => ({
        id: item._id,
        category: "Prasadam Order",
        description: item.itemName || "Prasadam",
        amount: Number(item.totalPrice || 0),
        paymentMethod: item.paymentMethod || "UPI",
        status: item.status || "Pending",
        date: item.createdAt || item.orderDate || "",
      })),
    ];
    return mapped.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filteredBookings, filteredDonations, filteredPrasadamOrders]);

  const downloadPdfFile = (filename, lines) => {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(16);
    doc.text("Temple Billing Report", 20, y);
    doc.setFontSize(11);
    y += 10;

    lines.forEach((line) => {
      const split = doc.splitTextToSize(String(line), 170);
      split.forEach((text) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(text, 20, y);
        y += 8;
      });
    });
    doc.save(filename);
  };

  const handleDownloadReport = () => {
    const periodLabel = formatRangeLabel(reportRange);
    const lines = [
      `Report type: ${periodLabel}`,
      `Generated: ${new Date().toLocaleString()}`,
      "",
      "Summary",
      `Total revenue: ${formatCurrency(reportRevenue)}`,
      `Booking revenue: ${formatCurrency(reportBookingRevenue)}`,
      `Donation revenue: ${formatCurrency(reportDonationRevenue)}`,
      `Prasadam revenue: ${formatCurrency(reportPrasadamRevenue)}`,
      `Transactions in range: ${reportTransactions.length}`,
      "",
      "Transactions",
    ];

    if (reportTransactions.length === 0) {
      lines.push("No transactions found for this period.");
    } else {
      reportTransactions.forEach((item) => {
        lines.push(
          `${item.date ? new Date(item.date).toLocaleDateString() : "-"} | ${item.category} | ${item.description} | ${formatCurrency(item.amount)} | ${item.paymentMethod} | ${item.status}`
        );
      });
    }

    downloadPdfFile(`billing-report-${reportRange}.pdf`, lines);
  };

  return (
    <div className="mt-5 space-y-6">
      <div className="rounded-2xl border border-[#ece8e1] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-[42px] font-bold text-[#111827]">Billing & Payments</h1>
            <p className="mt-2 text-[#525252]">Complete payment dashboard for bookings, donations, and prasadam sales.</p>
          </div>
          <div className="rounded-3xl bg-[#f8fafc] px-5 py-3 text-sm font-semibold text-[#0f766e]">Updated live from temple transactions</div>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-3xl border border-[#e5e7eb] bg-[#f8fafc] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label htmlFor="reportRange" className="text-sm font-semibold text-[#334155]">Report range</label>
            <select
              id="reportRange"
              value={reportRange}
              onChange={(e) => setReportRange(e.target.value)}
              className="rounded-3xl border border-[#cbd5e1] bg-white px-4 py-2 text-sm text-[#0f172a] shadow-sm outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#bfdbfe]"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <button
            onClick={handleDownloadReport}
            className="inline-flex items-center justify-center rounded-3xl bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]"
          >
            Download {formatRangeLabel(reportRange)} Report PDF
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-[#e5e7eb] bg-[#f8fafc] p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-[#475569]">Total Revenue</p>
            <p className="mt-4 text-[2rem] font-bold text-[#0f172a]">{formatCurrency(totalRevenue)}</p>
            <p className="mt-2 text-sm text-[#475569]">Bookings, donations and prasadam income.</p>
          </div>
          <div className="rounded-3xl border border-[#e5e7eb] bg-white p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-[#475569]">Booking Revenue</p>
            <p className="mt-4 text-[2rem] font-bold text-[#0f172a]">{formatCurrency(bookingRevenue)}</p>
            <p className="mt-2 text-sm text-[#475569]">Total value of all pooja bookings.</p>
          </div>
          <div className="rounded-3xl border border-[#e5e7eb] bg-white p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-[#475569]">Donation Income</p>
            <p className="mt-4 text-[2rem] font-bold text-[#0f172a]">{formatCurrency(donationRevenue)}</p>
            <p className="mt-2 text-sm text-[#475569]">Donations collected across all campaigns.</p>
          </div>
          <div className="rounded-3xl border border-[#e5e7eb] bg-white p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-[#475569]">Prasadam Sales</p>
            <p className="mt-4 text-[2rem] font-bold text-[#0f172a]">{formatCurrency(prasadamRevenue)}</p>
            <p className="mt-2 text-sm text-[#475569]">Total prasadam order payments.</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#ece8e1] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#111827]">{formatRangeLabel(reportRange)} Report Summary</h2>
            <p className="mt-2 text-sm text-[#64748b]">Metrics for the selected report period.</p>
          </div>
          <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-sm font-semibold text-[#2563eb]">{reportTransactions.length} transactions</span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-[#e5e7eb] bg-[#f8fafc] p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-[#475569]">Total revenue</p>
            <p className="mt-4 text-[1.9rem] font-bold text-[#0f172a]">{formatCurrency(reportRevenue)}</p>
          </div>
          <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-[#475569]">Booking revenue</p>
            <p className="mt-4 text-[1.9rem] font-bold text-[#0f172a]">{formatCurrency(reportBookingRevenue)}</p>
          </div>
          <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-[#475569]">Donation revenue</p>
            <p className="mt-4 text-[1.9rem] font-bold text-[#0f172a]">{formatCurrency(reportDonationRevenue)}</p>
          </div>
          <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-[#475569]">Prasadam revenue</p>
            <p className="mt-4 text-[1.9rem] font-bold text-[#0f172a]">{formatCurrency(reportPrasadamRevenue)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#ece8e1] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#111827]">Recent Transactions</h2>
                <p className="mt-2 text-sm text-[#64748b]">All recent payment activity from bookings, donations and prasadam.</p>
              </div>
              <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-sm font-semibold text-[#2563eb]">{recentTransactions.length} latest</span>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm text-[#334155]">
                <thead className="border-b border-[#e2e8f0] text-[#475569]">
                  <tr>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="px-4 py-6 text-center text-sm text-[#64748b]">Loading transactions…</td></tr>
                  ) : recentTransactions.length === 0 ? (
                    <tr><td colSpan="6" className="px-4 py-6 text-center text-sm text-[#64748b]">No recent transactions found.</td></tr>
                  ) : (
                    recentTransactions.map((item) => (
                      <tr key={`${item.id}-${item.date}`} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]">
                        <td className="px-4 py-4 font-semibold text-[#0f172a]">{item.category}</td>
                        <td className="px-4 py-4 text-[#475569] max-w-[220px] truncate">{item.description}</td>
                        <td className="px-4 py-4 font-semibold text-[#0f172a]">{formatCurrency(item.amount)}</td>
                        <td className="px-4 py-4">{item.paymentMethod}</td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "Completed" || item.status === "Confirmed" ? "bg-[#def7ec] text-[#166534]" : item.status === "Pending" ? "bg-[#fef3c7] text-[#92400e]" : "bg-[#fee2e2] text-[#b91c1c]"}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">{item.date ? new Date(item.date).toLocaleString() : "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[#ece8e1] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-[#111827]">Payment Methods</h2>
            <p className="mt-2 text-sm text-[#64748b]">Most used payment channels for current receipts.</p>
            <div className="mt-6 space-y-3">
              {paymentMethods.length > 0 ? paymentMethods.map((method) => (
                <div key={method.method} className="flex items-center justify-between rounded-3xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-4">
                  <span className="font-semibold text-[#0f172a]">{method.method}</span>
                  <span className="rounded-full bg-[#e0f2fe] px-3 py-1 text-sm font-semibold text-[#0369a1]">{method.count}</span>
                </div>
              )) : (
                <p className="text-sm text-[#64748b]">No payment methods tracked yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#ece8e1] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-[#111827]">Billing Insights</h2>
            <div className="mt-5 space-y-4">
              <div className="rounded-3xl bg-[#f8fafc] p-4">
                <p className="text-sm text-[#475569]">Total bookings</p>
                <p className="mt-2 text-3xl font-bold text-[#0f172a]">{bookings.length}</p>
              </div>
              <div className="rounded-3xl bg-[#f8fafc] p-4">
                <p className="text-sm text-[#475569]">Total donations</p>
                <p className="mt-2 text-3xl font-bold text-[#0f172a]">{donations.length}</p>
              </div>
              <div className="rounded-3xl bg-[#f8fafc] p-4">
                <p className="text-sm text-[#475569]">Prasadam orders</p>
                <p className="mt-2 text-3xl font-bold text-[#0f172a]">{prasadamOrders.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingManagement;
