import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaChartLine,
  FaMoneyBillWave,
  FaLandmark,
  FaShoppingBag,
  FaWallet,
} from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = {
  saffron: "#FF9933",
  gold: "#D4AF37",
  white: "#FFFFFF",
  deepBlue: "#1E3A8A",
  cream: "#FFF8E7",
};

function TempleLogo() {
  return (
    <div style={{ width: 38, height: 38, display: "grid", placeItems: "center" }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          background:
            "linear-gradient(135deg, rgba(255,153,51,0.18) 0%, rgba(212,175,55,0.22) 100%)",
          border: "1px solid rgba(212,175,55,0.35)",
          display: "grid",
          placeItems: "center",
          boxShadow: "0 10px 24px rgba(0,0,0,0.10)",
        }}
      >
        <span aria-hidden style={{ fontSize: 18 }}>🛕</span>
      </div>
    </div>
  );
}

function TrendPill({ value, direction }) {
  const isUp = direction === "up";
  const style = isUp
    ? {
        background: "rgba(212,175,55,0.10)",
        color: "#B45309",
        border: "1px solid rgba(212,175,55,0.25)",
      }
    : {
        background: "rgba(239,68,68,0.10)",
        color: "#DC2626",
        border: "1px solid rgba(239,68,68,0.25)",
      };

  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
      style={style}
    >
      <span className="mr-1" aria-hidden>
        {isUp ? "▲" : "▼"}
      </span>
      {value}
    </span>
  );
}

function SkeletonBlock() {
  return <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />;
}

function formatINR(n) {
  if (typeof n !== "number") return n;
  return n.toLocaleString("en-IN");
}

async function fetchJSON(url, fallback) {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return fallback;
  }
}

export default function CashierDashboard() {
  // NOTE: Cashier sidebar + header come from <CashierLayout />.
  // This page is intentionally UI-only (no internal sidebar).
  const [loading, setLoading] = useState(true);




  const today = useMemo(() => new Date(), []);
  const currentDateText = useMemo(() => {
    return today.toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  }, [today]);

  const [dashboard, setDashboard] = useState({
    kpis: {
      todaysCollection: { value: 45230, delta: 12.5, dir: "up" },
      todaysTransactions: { value: 128, delta: 8.3, dir: "up" },
      poojaBookings: { value: 32, delta: 5.6, dir: "up" },
      prasadamSales: { value: 8760, delta: -2.1, dir: "down" },
      pendingPayments: { value: 18, delta: -10, dir: "down" },
    },
    chart: {
      points: [
        { t: "12 AM", v: 1250 },
        { t: "4 AM", v: 7800 },
        { t: "8 AM", v: 9800 },
        { t: "12 PM", v: 18500 },
        { t: "4 PM", v: 27100 },
        { t: "8 PM", v: 40230 },
        { t: "12 AM", v: 45230 },
      ],
    },
    payments: {
      total: 45230,
      breakdown: [
        { name: "Cashs", value: 18230, color: "#10B981" },
        { name: "UPI", value: 15400, color: "#7C3AED" },
        { name: "Card", value: 8750, color: "#2563EB" },
        { name: "Net Banking", value: 2850, color: "#F59E0B" },
      ],
    },
    collectionSummary: {
      today: 45230,
      yesterday: 40210,
      thisMonth: 845600,
      lastMonth: 789450,
    },
    transactions: {
      rows: [
        {
          id: "TRX00125",
          type: "Pooja Booking",
          amount: 1100,
          status: "Paid",
          time: "10:30 AM",
        },
        {
          id: "TRX00124",
          type: "Donation",
          amount: 2500,
          status: "Paid",
          time: "10:15 AM",
        },
        {
          id: "TRX00123",
          type: "Prasadam Sale",
          amount: 250,
          status: "Paid",
          time: "10:05 AM",
        },
        {
          id: "TRX00122",
          type: "Pooja Booking",
          amount: 1500,
          status: "Pending",
          time: "09:50 AM",
        },
        {
          id: "TRX00121",
          type: "Donation",
          amount: 5000,
          status: "Paid",
          time: "09:30 AM",
        },
      ],
    },
    widgets: {
      donation: { daily: 3200, monthly: 84500 },
      pooja: { daily: 12000, monthly: 320000 },
      prasadam: { daily: 8760, monthly: 189000 },
      pendingReceipts: { count: 18, total: 12500 },
      festival: { current: 248000 },
      topDonors: [
        { name: "Ramesh Kumar", amount: 5500 },
        { name: "Lakshmi Devi", amount: 4200 },
        { name: "Suresh Reddy", amount: 3500 },
      ],
      bookings: { total: 72, completed: 50, pending: 22 },
      cashCounter: { opening: 5000, current: 45230, closing: 40230 },
    },
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      // API integration placeholders (dummy fallback)
      await fetchJSON("/api/dashboard/cashier", null);
      await fetchJSON("/api/donations", []);
      await fetchJSON("/api/bookings", []);
      await fetchJSON("/api/payments", []);
      await fetchJSON("/api/transactions", []);

      if (!mounted) return;
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const k = dashboard.kpis;

  const KPI = ({ title, value, delta, dir, icon, toneBg, toneText }) => (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-2xl p-5 border border-gray-100 bg-white shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-slate-500">{title}</div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">
            {title.toLowerCase().includes("collection") ||
            title.toLowerCase().includes("sales")
              ? `₹${formatINR(value)}`
              : formatINR(value)}
          </div>
        </div>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: toneBg, color: toneText }}
        >
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <TrendPill value={`${delta > 0 ? "+" : ""}${delta}%`} direction={dir} />
      </div>
    </motion.div>
  );

  return (
    <div className="bg-[#FFF8E7] min-h-[calc(100vh-96px)]">
      <div className="max-w-[1600px] mx-auto">
        {/* Welcome */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-[28px] bg-white/80 border border-[#e8d7b3] shadow-sm p-6 md:p-8 mt-2"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0D5] border border-[#FDE68A]/50">
                <span aria-hidden>🛕</span>
                <span className="text-xs font-bold text-[#8B5A0B]">Temple Cashier</span>
              </div>
              <h2 className="mt-4 text-2xl md:text-3xl font-extrabold text-[#2d1608]">
                Welcome, Cashier 🙏
              </h2>
              <p className="mt-2 text-[#7a4a16] text-sm md:text-base font-semibold">
                Manage billing, collections, donations and devotee transactions.
              </p>
            </div>
            <div className="flex gap-3">
              <motion.div whileHover={{ scale: 1.02 }} className="rounded-2xl bg-[#FFF8E7] border border-[#FDE68A]/50 px-5 py-4">
                <div className="text-xs font-bold text-[#B45309]">Focus</div>
                <div className="mt-2 text-lg font-extrabold">Daily Revenue</div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} className="rounded-2xl bg-[#FFF8E7] border border-[#FDE68A]/50 px-5 py-4">
                <div className="text-xs font-bold text-[#B45309]">Status</div>
                <div className="mt-2 text-lg font-extrabold">Active</div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* KPI Cards */}
        <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <KPI
            title="Today's Collection"
            value={k.todaysCollection.value}
            delta={k.todaysCollection.delta}
            dir={k.todaysCollection.dir}
            icon={<FaMoneyBillWave />}
            toneBg="rgba(255,153,51,0.12)"
            toneText={COLORS.saffron}
          />
          <KPI
            title="Today's Transactions"
            value={k.todaysTransactions.value}
            delta={k.todaysTransactions.delta}
            dir={k.todaysTransactions.dir}
            icon={<FaChartLine />}
            toneBg="rgba(212,175,55,0.12)"
            toneText={COLORS.gold}
          />
          <KPI
            title="Pooja Bookings"
            value={k.poojaBookings.value}
            delta={k.poojaBookings.delta}
            dir={k.poojaBookings.dir}
            icon={<FaLandmark />}
            toneBg="rgba(212,175,55,0.12)"
            toneText={COLORS.gold}
          />
          <KPI
            title="Prasadam Sales"
            value={k.prasadamSales.value}
            delta={k.prasadamSales.delta}
            dir={k.prasadamSales.dir}
            icon={<FaShoppingBag />}
            toneBg="rgba(212,175,55,0.10)"
            toneText={COLORS.gold}
          />
          <KPI
            title="Pending Payments"
            value={k.pendingPayments.value}
            delta={k.pendingPayments.delta}
            dir={k.pendingPayments.dir}
            icon={<FaWallet />}
            toneBg="rgba(255,153,51,0.10)"
            toneText={COLORS.saffron}
          />
        </section>

        {/* Row 1 */}
        <section className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
          <motion.div whileHover={{ y: -2 }} className="xl:col-span-1 rounded-[20px] bg-white border border-[#ead6c0] shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500">Today's Collection Overview</div>
                <div className="mt-2 text-base font-extrabold text-slate-900">Collection Overview</div>
              </div>
              <div className="w-10 h-10 rounded-[20px] bg-[#FF9933]/15 border border-[#FF9933]/25 flex items-center justify-center text-[#FF9933]">
                <FaChartLine />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-slate-500">Hourly collection</div>
              <div className="text-xs font-bold text-slate-900">₹{formatINR(dashboard.chart.points.at(-1)?.v || 0)}</div>
            </div>

            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={dashboard.chart.points}>
                  <defs>
                    <linearGradient id="goldLine" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.saffron} stopOpacity={0.45} />
                      <stop offset="95%" stopColor={COLORS.saffron} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="t" tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="v" stroke={COLORS.saffron} strokeWidth={3} fill="url(#goldLine)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <div className="xl:col-span-2">
            <div className="rounded-[20px] bg-white border border-[#ead6c0] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#FFF8E7] to-white">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-slate-900">Recent Transactions</div>
                  <div className="text-xs font-semibold text-slate-500">Today</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-5 space-y-3">
                    <SkeletonBlock />
                    <SkeletonBlock />
                    <SkeletonBlock />
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr className="text-xs uppercase text-slate-500 font-bold">
                        <th className="text-left p-4">Transaction ID</th>
                        <th className="text-left p-4">Type</th>
                        <th className="text-left p-4">Amount</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.transactions.rows.map((r) => (
                        <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="p-4 font-semibold text-slate-900">{r.id}</td>
                          <td className="p-4 text-slate-700">{r.type}</td>
                          <td className="p-4 text-slate-900 font-bold">₹{formatINR(r.amount)}</td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border ${
                                r.status === "Paid"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-orange-50 text-orange-700 border-orange-200"
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600">{r.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 text-xs text-slate-500 font-semibold">
          API placeholders: GET /api/dashboard/cashier
        </div>
      </div>
    </div>
  );
}

