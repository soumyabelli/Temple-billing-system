import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import templeBg from "../../assets/temple-bg.jpg";
import CashierPageShell from "../../components/cashier/CashierPageShell";
import {
  fetchBookings,
  fetchDonations,
  fetchInventoryItems,
  fetchPrasadamOrders,
  fetchBills,
  formatCurrency,
  formatDate,
  formatDateTime,
  isToday,
  sumBy,
  toDateKey,
} from "../../services/cashierService";

const paymentPalette = {
  Cash: "#16a34a",
  UPI: "#7c3aed",
  Card: "#2563eb",
  "Bank Transfer": "#f59e0b",
  "Net Banking": "#f97316",
};

const buildLastDays = (days = 7) => {
  const rows = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    rows.push({
      key: toDateKey(date),
      label: date.toLocaleDateString("en-IN", { weekday: "short" }),
    });
  }
  return rows;
};

const CashierDashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [donations, setDonations] = useState([]);
  const [prasadamOrders, setPrasadamOrders] = useState([]);
  const [bills, setBills] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [bookingRows, donationRows, prasadamRows, billRows, inventoryRows] = await Promise.allSettled([
          fetchBookings(),
          fetchDonations(),
          fetchPrasadamOrders(),
          fetchBills(),
          fetchInventoryItems(),
        ]);

        if (!mounted) return;

        setBookings(bookingRows.status === "fulfilled" ? bookingRows.value : []);
        setDonations(donationRows.status === "fulfilled" ? donationRows.value : []);
        setPrasadamOrders(prasadamRows.status === "fulfilled" ? prasadamRows.value : []);
        setBills(billRows.status === "fulfilled" ? billRows.value : []);
        setInventoryItems(inventoryRows.status === "fulfilled" ? inventoryRows.value : []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const dailySeries = useMemo(() => {
    const days = buildLastDays(7);
    return days.map((day) => ({
      day: day.label,
      amount: sumBy(bills.filter((bill) => toDateKey(bill.billDate) === day.key), (bill) => bill.amount),
    }));
  }, [bills]);

  const paymentSeries = useMemo(() => {
    const totals = bills.reduce((acc, bill) => {
      const key = bill.paymentMode || "Cash";
      acc[key] = (acc[key] || 0) + Number(bill.amount || 0);
      return acc;
    }, {});

    return Object.entries(totals).map(([name, value]) => ({
      name,
      value,
      color: paymentPalette[name] || "#f59e0b",
    }));
  }, [bills]);

  const todayBills = useMemo(() => bills.filter((bill) => isToday(bill.billDate)), [bills]);
  const pendingBookings = useMemo(() => bookings.filter((booking) => String(booking.status || "Pending") === "Pending"), [bookings]);
  const lowStockItems = useMemo(() => inventoryItems.filter((item) => Number(item.currentStock) < Number(item.minimumStock)), [inventoryItems]);

  const recentActivity = useMemo(
    () =>
      [...bills]
        .sort((a, b) => new Date(b.billDate || b.createdAt || 0) - new Date(a.billDate || a.createdAt || 0))
        .slice(0, 8)
        .map((bill, index) => ({
          id: bill.referenceNo || `RC-${String(index + 1).padStart(4, "0")}`,
          name: bill.devoteeName,
          type: bill.billType || "Other",
          service: bill.sevaType,
          amount: bill.amount,
          paymentMode: bill.paymentMode || "Cash",
          status: bill.status || "Paid",
          date: formatDateTime(bill.billDate || bill.createdAt),
        })),
    [bills]
  );

  const stats = [
    {
      title: "Today's Collection",
      value: formatCurrency(sumBy(todayBills, (bill) => bill.amount)),
      note: `${todayBills.length} bills recorded today`,
      tone: "orange",
    },
    {
      title: "Pooja Bookings",
      value: bookings.length,
      note: `${pendingBookings.length} pending approvals`,
      tone: "gold",
    },
    {
      title: "Donation Value",
      value: formatCurrency(sumBy(donations, (donation) => donation.amount)),
      note: `${donations.length} donation records`,
      tone: "green",
    },
    {
      title: "Prasadam Sales",
      value: formatCurrency(sumBy(prasadamOrders, (order) => order.amount || order.totalPrice)),
      note: `${prasadamOrders.length} orders`,
      tone: "blue",
    },
  ];

  return (
    <CashierPageShell
      eyebrow="Temple Cashier Dashboard"
      title="Temple billing, bookings and collections at a glance"
      description="A single workspace for pooja bookings, donation entry, prasadam sales, bill tracking, receipts and quick settlement."
      image={templeBg}
      imageAlt="Temple dashboard background"
      stats={stats}
      actions={
        <>
          <button
            type="button"
            onClick={() => navigate("/cashier/billing")}
            className="rounded-full bg-[#f28c18] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-95"
          >
            Open Billing
          </button>
          <button
            type="button"
            onClick={() => navigate("/cashier/pooja-bookings")}
            className="rounded-full border border-[#f0c58f] bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-[#fff8ef]"
          >
            Pooja Bookings
          </button>
          <button
            type="button"
            onClick={() => navigate("/cashier/donations")}
            className="rounded-full border border-[#f0c58f] bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-[#fff8ef]"
          >
            Donations
          </button>
          <button
            type="button"
            onClick={() => navigate("/cashier/receipts")}
            className="rounded-full border border-[#f0c58f] bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-[#fff8ef]"
          >
            Receipts
          </button>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-[22px] border border-[#f0d3a2] bg-white/90 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-slate-950">Seven day collection trend</h2>
              <p className="mt-1 text-sm font-medium text-slate-600">Bills recorded across pooja, donation and prasadam counters.</p>
            </div>
            <span className="rounded-full border border-[#f4ddb4] bg-[#fff8ef] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#8a5200]">
              Live ledger
            </span>
          </div>
          <div className="mt-5 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="cashierLine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f28c18" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#f28c18" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f2e4cf" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", borderRadius: 12, border: "none", color: "#fff" }}
                  labelStyle={{ color: "#cbd5e1" }}
                />
                <Area type="monotone" dataKey="amount" stroke="#f28c18" strokeWidth={3} fill="url(#cashierLine)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-[22px] border border-[#f0d3a2] bg-white/90 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-slate-950">Payment methods</h2>
              <p className="mt-1 text-sm font-medium text-slate-600">Where today's collections are coming from.</p>
            </div>
          </div>
          <div className="relative mt-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentSeries} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={2}>
                  {paymentSeries.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {paymentSeries.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-2xl border border-[#f2e2c7] bg-[#fff8ef] px-3 py-2 text-sm">
                <span className="font-semibold text-slate-800">{item.name}</span>
                <span className="font-bold text-slate-950">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[22px] border border-[#f0d3a2] bg-white/90 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-slate-950">Recent cashier activity</h2>
              <p className="mt-1 text-sm font-medium text-slate-600">Latest bill records written by the counter.</p>
            </div>
            <span className="rounded-full bg-[#fff1d6] px-3 py-1 text-xs font-bold text-[#8a5200]">
              {loading ? "Loading..." : `${recentActivity.length} shown`}
            </span>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-[#fff7eb] text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-bold">Receipt</th>
                  <th className="px-4 py-3 font-bold">Devotee</th>
                  <th className="px-4 py-3 font-bold">Type</th>
                  <th className="px-4 py-3 font-bold">Service</th>
                  <th className="px-4 py-3 font-bold">Amount</th>
                  <th className="px-4 py-3 font-bold">Method</th>
                  <th className="px-4 py-3 font-bold">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((row) => (
                  <tr key={row.id} className="border-b border-[#f2e7d7]">
                    <td className="px-4 py-3 font-bold text-slate-950">{row.id}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{row.name}</td>
                    <td className="px-4 py-3">{row.type}</td>
                    <td className="px-4 py-3">{row.service}</td>
                    <td className="px-4 py-3 font-bold text-slate-950">{formatCurrency(row.amount)}</td>
                    <td className="px-4 py-3">{row.paymentMode}</td>
                    <td className="px-4 py-3 text-slate-600">{row.date}</td>
                  </tr>
                ))}
                {!recentActivity.length ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                      No bill records found yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[22px] border border-[#f0d3a2] bg-white/90 p-5 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-950">Quick actions</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: "Billing", path: "/cashier/billing" },
                { label: "Pooja", path: "/cashier/pooja-bookings" },
                { label: "Donations", path: "/cashier/donations" },
                { label: "Prasadam", path: "/cashier/prasadam-sales" },
                { label: "Receipts", path: "/cashier/receipts" },
                { label: "Reports", path: "/cashier/reports" },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className="rounded-2xl border border-[#f2e2c7] bg-[#fff8ef] px-3 py-4 text-sm font-bold text-slate-900 transition hover:bg-white"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[22px] border border-[#f0d3a2] bg-white/90 p-5 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-950">Operational summary</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl bg-[#fff8ef] px-4 py-3">
                <span className="font-medium text-slate-600">Pending bookings</span>
                <span className="font-extrabold text-slate-950">{pendingBookings.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[#fff8ef] px-4 py-3">
                <span className="font-medium text-slate-600">Low stock items</span>
                <span className="font-extrabold text-slate-950">{lowStockItems.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[#fff8ef] px-4 py-3">
                <span className="font-medium text-slate-600">Donation rows</span>
                <span className="font-extrabold text-slate-950">{donations.length}</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </CashierPageShell>
  );
};

export default CashierDashboardPage;
