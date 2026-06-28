import "./CashierDashboard.css";

import axios from "axios";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Gem,
  HandCoins,
  MapPin,
  Receipt,
  ShieldCheck,
  Store,
  Temple,
  Tractor,
  Truck,
  User,
  Users,
  Wallet,
} from "react-icons/fi";
import {
  FaBell,
  FaChartLine,
  FaChartPie,
  FaHome,
  FaMoneyBill,
  FaRegNewspaper,
  FaSignOutAlt,
  FaTemple,
  FaThLarge,
} from "react-icons/fa";
import { GiLotusFlower } from "react-icons/gi";
import {
  MdInventory,
  MdNotificationsActive,
  MdPayment,
  MdSavings,
} from "react-icons/md";
import { RiBillLine, RiFileListLine, RiRestaurantLine } from "react-icons/ri";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// Note: backend endpoints are preserved as requested.
const API_BASE = import.meta?.env?.VITE_API_BASE || "";

const formatINR = (value) => {
  if (value === null || value === undefined || value === "") return "₹0";
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};

const statusToBadge = (status) => {
  const s = String(status || "").toLowerCase();
  if (s.includes("paid")) return { label: "Paid", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
  if (s.includes("pending")) return { label: "Pending", color: "bg-orange-100 text-orange-700 border-orange-200" };
  if (s.includes("failed")) return { label: "Failed", color: "bg-red-100 text-red-700 border-red-200" };
  return { label: status || "Unknown", color: "bg-slate-100 text-slate-700 border-slate-200" };
};

const CashierDashboard = () => {
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState("dashboard");

  const [cashier, setCashier] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [donations, setDonations] = useState(null);
  const [payments, setPayments] = useState(null);
  const [transactions, setTransactions] = useState(null);
  const [inventory, setInventory] = useState(null);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const authToken = useMemo(() => {
    try {
      return localStorage.getItem("token") || localStorage.getItem("accessToken") || null;
    } catch {
      return null;
    }
  }, []);

  const authHeaders = useMemo(() => {
    if (!authToken) return {};
    return { Authorization: `Bearer ${authToken}` };
  }, [authToken]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const [dashRes, bRes, dRes, pRes, tRes, invRes] = await Promise.all([
          axios.get(`${API_BASE}/api/dashboard/cashier`, { headers: authHeaders }),
          axios.get(`${API_BASE}/api/bookings`, { headers: authHeaders }),
          axios.get(`${API_BASE}/api/donations`, { headers: authHeaders }),
          axios.get(`${API_BASE}/api/payments`, { headers: authHeaders }),
          axios.get(`${API_BASE}/api/transactions`, { headers: authHeaders }),
          axios.get(`${API_BASE}/api/inventory`, { headers: authHeaders }),
        ]);

        if (cancelled) return;
        setCashier(dashRes?.data || null);
        setBookings(bRes?.data || null);
        setDonations(dRes?.data || null);
        setPayments(pRes?.data || null);
        setTransactions(tRes?.data || null);
        setInventory(invRes?.data || null);
      } catch (err) {
        if (cancelled) return;
        setErrorMsg(err?.response?.data?.message || err?.message || "Failed to load dashboard data.");
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [authHeaders]);

  const kpis = useMemo(() => {
    const todayCollection = cashier?.todayCollection ?? cashier?.today?.collection ?? 0;
    const transactionsCount = cashier?.transactionsCount ?? cashier?.today?.transactionsCount ?? 0;
    const poojaBookingsCount = cashier?.poojaBookingsCount ?? cashier?.today?.poojaBookingsCount ?? 0;
    const donationCollection = cashier?.donationCollection ?? 0;
    const prasadamSales = cashier?.prasadamSales ?? 0;
    const pendingPayments = cashier?.pendingPayments ?? 0;

    return {
      todayCollection,
      transactionsCount,
      poojaBookingsCount,
      donationCollection,
      prasadamSales,
      pendingPayments,
    };
  }, [cashier]);

  const lineData = useMemo(() => {
    // Expecting backend to provide time-series; if not, return empty.
    const series = cashier?.collectionSeries || cashier?.timeSeries || [];
    if (!Array.isArray(series) || series.length === 0) return [];
    return series.map((p) => ({
      time: p.time || p.label || "",
      value: Number(p.value ?? p.amount ?? 0),
    }));
  }, [cashier]);

  const paymentDonut = useMemo(() => {
    const pm = cashier?.paymentMethods || {};
    const cash = Number(pm.cash ?? 0);
    const upi = Number(pm.upi ?? 0);
    const card = Number(pm.card ?? 0);
    const netBanking = Number(pm.netBanking ?? pm.net_banking ?? 0);

    const total = cash + upi + card + netBanking;
    if (!total) return [];

    const pct = (n) => Math.round((n / total) * 100);
    return [
      { name: "Cash", value: pct(cash), color: "#F97316" },
      { name: "UPI", value: pct(upi), color: "#FDBA74" },
      { name: "Card", value: pct(card), color: "#D4AF37" },
      { name: "Net Banking", value: pct(netBanking), color: "#F59E0B" },
    ];
  }, [cashier]);

  const recentTransactions = useMemo(() => {
    const list = transactions?.transactions || transactions?.data || transactions || [];
    if (!Array.isArray(list)) return [];
    return list.slice(0, 6);
  }, [transactions]);

  const inventoryAlerts = useMemo(() => {
    const list = inventory?.items || inventory?.data || inventory || [];
    if (!Array.isArray(list)) return [];
    const alerts = list.filter((it) => {
      const qty = Number(it?.quantity ?? it?.stock ?? 0);
      const low = Number(it?.lowStockThreshold ?? it?.threshold ?? 0);
      return low ? qty <= low : qty <= 5;
    });
    return alerts.slice(0, 4);
  }, [inventory]);

  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.clear();
    } catch {}
    navigate("/login");
  };

  const todayCollectionTotal = formatINR(kpis.todayCollection);

  return (
    <div className="min-h-screen bg-orange-50/40">
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        } lg:hidden`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-72 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:block ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } bg-gradient-to-b from-orange-600 to-orange-800 text-white shadow-xl`}
      >
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className="mt-1 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 border border-white/15">
              <span className="text-2xl">🛕</span>
            </div>
            <div>
              <div className="text-lg font-extrabold leading-tight">Temple Billing System</div>
              <div className="text-xs text-white/80 mt-1">Serve Devotees with Love</div>
            </div>
          </div>
        </div>

        <nav className="px-4">
          <SidebarItem
            active={activeMenu === "dashboard"}
            icon={<span>🏠</span>}
            label="Dashboard"
            onClick={() => setActiveMenu("dashboard")}
          />
          <SidebarItem active={activeMenu === "billing"} icon={<span>🧾</span>} label="Billing" onClick={() => setActiveMenu("billing")} />
          <SidebarItem
            active={activeMenu === "pooja"}
            icon={<span>🛕</span>}
            label="Pooja Bookings"
            onClick={() => setActiveMenu("pooja")}
          />
          <SidebarItem active={activeMenu === "donations"} icon={<span>💰</span>} label="Donations" onClick={() => setActiveMenu("donations")} />
          <SidebarItem
            active={activeMenu === "prasadam"}
            icon={<span>🍛</span>}
            label="Prasadam Sales"
            onClick={() => setActiveMenu("prasadam")}
          />
          <SidebarItem active={activeMenu === "receipts"} icon={<span>📄</span>} label="Receipts" onClick={() => setActiveMenu("receipts")} />
          <SidebarItem active={activeMenu === "devotees"} icon={<span>👥</span>} label="Devotees" onClick={() => setActiveMenu("devotees")} />
          <SidebarItem active={activeMenu === "payments"} icon={<span>💳</span>} label="Payments" onClick={() => setActiveMenu("payments")} />
          <SidebarItem active={activeMenu === "inventory"} icon={<span>📦</span>} label="Inventory" onClick={() => setActiveMenu("inventory")} />
          <SidebarItem
            active={activeMenu === "notifications"}
            icon={<span>🔔</span>}
            label="Notifications"
            onClick={() => setActiveMenu("notifications")}
          />
        </nav>

        <div className="px-4 mt-4">
          <SidebarItem
            active={activeMenu === "profile"}
            icon={<span>👤</span>}
            label="Profile"
            onClick={() => setActiveMenu("profile")}
          />
        </div>

        <div className="px-4 mt-3">
          <button
            onClick={logout}
            className="w-full rounded-xl bg-white/10 border border-white/15 px-4 py-3 flex items-center gap-3 hover:bg-white/15 transition"
          >
            <span>🚪</span>
            <span className="font-semibold">Logout</span>
          </button>
        </div>

        <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
          <div className="opacity-15 text-white text-[90px]">🛕</div>
        </div>
      </aside>

      <div className="lg:ml-72">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-orange-100">
          <div className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden inline-flex items-center justify-center rounded-xl p-2 hover:bg-orange-50"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                ☰
              </button>
              <div className="flex items-center gap-2">
                <span className="text-orange-600">🛕</span>
                <div>
                  <div className="text-sm md:text-base font-extrabold text-gray-900">Cashier Dashboard</div>
                  <div className="text-xs text-gray-500">Manage temple billing, collections, donations and devotee transactions efficiently.</div>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center">
              <input
                className="w-[360px] max-w-[42vw] rounded-xl border border-orange-100 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="Search devotee, bill, receipt..."
              />
            </div>

            <div className="flex items-center gap-3">
              <button className="rounded-xl p-2 hover:bg-orange-50" aria-label="Notifications">
                <FaBell className="text-orange-600 text-xl" />
              </button>
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <CalendarDays className="text-orange-600" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <div className="grid h-10 w-10 place-items-center rounded-full border border-orange-100 bg-orange-50 text-sm font-bold text-orange-600">
                  C
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Cashier</div>
                  <div className="text-xs text-gray-500">Cashier</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="px-4 md:px-6 py-6">
          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="relative overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-white via-orange-50 to-orange-100 shadow-sm px-5 md:px-7 py-6"
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #F97316 1px, transparent 0)" }} />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-orange-600/10 border border-orange-200 flex items-center justify-center text-2xl">🎐</div>
                <div>
                  <div className="text-2xl md:text-3xl font-extrabold text-gray-900">Welcome, Cashier 🙏</div>
                  <div className="mt-2 text-sm md:text-base text-gray-600">Manage temple billing, collections, donations and devotee transactions efficiently.</div>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="inline-flex items-center rounded-xl bg-white border border-orange-100 px-4 py-2">
                  <span className="text-orange-600 mr-2">🧧</span>
                  <span className="font-semibold text-gray-800">Today Total</span>
                  <span className="ml-2 font-extrabold text-orange-700">{todayCollectionTotal}</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="mt-6">
            {/* KPI Cards */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-2xl bg-white border border-orange-100 shadow-sm animate-pulse" />
                ))}
              </div>
            ) : errorMsg ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 p-4 shadow-sm">
                {errorMsg}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <KpiCard
                  title="Today's Collection"
                  value={formatINR(kpis.todayCollection)}
                  icon={<Wallet className="text-2xl" />}
                  accent="orange"
                />
                <KpiCard title="Transactions" value={kpis.transactionsCount || "0"} icon={<Receipt className="text-2xl" />} accent="blue" />
                <KpiCard title="Pooja Bookings" value={kpis.poojaBookingsCount || "0"} icon={<Temple className="text-2xl" />} accent="saffron" />
                <KpiCard
                  title="Donation Collection"
                  value={formatINR(kpis.donationCollection)}
                  icon={<HandCoins className="text-2xl" />}
                  accent="gold"
                />
                <KpiCard title="Prasadam Sales" value={formatINR(kpis.prasadamSales)} icon={<RiRestaurantLine className="text-2xl" />} accent="orange" />
                <KpiCard title="Pending Payments" value={kpis.pendingPayments || "0"} icon={<CircleHelp className="text-2xl" />} accent="red" />
              </div>
            )}
          </div>

          {/* Row 1: Chart + Table */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="lg:col-span-1 rounded-2xl bg-white border border-orange-100 shadow-sm p-4 md:p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-bold text-gray-900">Today's Collection Overview</div>
                  <div className="text-xs text-gray-500 mt-1">Temple counter performance</div>
                </div>
                <div className="text-orange-700 font-extrabold">{formatINR(kpis.todayCollection)}</div>
              </div>

              <div className="mt-4 h-[240px]">
                {!loading && !errorMsg && lineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="4 4" stroke="#FED7AA" />
                      <XAxis dataKey="time" tick={{ fontSize: 12, fill: "#9A3412" }} />
                      <YAxis tick={{ fontSize: 12, fill: "#9A3412" }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: "1px solid #FDBA74" }}
                        formatter={(v) => [`${v}`, "Collection"]}
                      />
                      <Line type="monotone" dataKey="value" stroke="#F97316" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : loading ? (
                  <div className="h-full rounded-xl bg-orange-50 animate-pulse" />
                ) : (
                  <EmptyState label="No data available" />
                )}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.04 }}
              className="lg:col-span-2 rounded-2xl bg-white border border-orange-100 shadow-sm p-4 md:p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-gray-900">Recent Transactions</div>
                  <div className="text-xs text-gray-500 mt-1">Latest billing activity</div>
                </div>
                <button className="rounded-xl bg-orange-600 hover:bg-orange-700 transition text-white px-4 py-2 text-sm font-bold">
                  View All
                </button>
              </div>

              <div className="mt-4 overflow-x-auto">
                {!loading && !errorMsg && recentTransactions.length > 0 ? (
                  <table className="min-w-[640px] w-full text-left">
                    <thead>
                      <tr className="text-xs text-gray-600">
                        <th className="pb-3 font-bold">Transaction ID</th>
                        <th className="pb-3 font-bold">Service Type</th>
                        <th className="pb-3 font-bold">Amount</th>
                        <th className="pb-3 font-bold">Status</th>
                        <th className="pb-3 font-bold">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((tx, idx) => {
                        const badge = statusToBadge(tx.status);
                        return (
                          <tr key={tx?._id || tx?.id || idx} className="border-t border-orange-50">
                            <td className="py-3 text-sm font-semibold text-gray-900">{tx?.transactionId || tx?.billNo || tx?._id || "-"}</td>
                            <td className="py-3 text-sm text-gray-700">{tx?.serviceType || tx?.type || "-"}</td>
                            <td className="py-3 text-sm font-bold text-gray-900">{formatINR(tx?.amount)}</td>
                            <td className="py-3">
                              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${badge.color}`}>
                                {badge.label}
                              </span>
                            </td>
                            <td className="py-3 text-sm text-gray-600">{tx?.time || tx?.createdAt ? new Date(tx.createdAt || tx.time).toLocaleTimeString() : "-"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : loading ? (
                  <div className="h-44 rounded-xl bg-orange-50 animate-pulse" />
                ) : (
                  <EmptyState label="No data available" />
                )}
              </div>
            </motion.section>
          </div>

          {/* Row 2: Quick actions + Donut + Summary */}
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <section className="rounded-2xl bg-white border border-orange-100 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-gray-900">Quick Actions</div>
                  <div className="text-xs text-gray-500 mt-1">Fast counter workflows</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-2 gap-3">
                {[
                  { label: "Create Bill", icon: "➕" },
                  { label: "New Booking", icon: "🛕" },
                  { label: "Donation Entry", icon: "💰" },
                  { label: "Prasadam Sale", icon: "🍛" },
                  { label: "Generate Receipt", icon: "🧾" },
                  { label: "Payment Entry", icon: "💳" },
                  { label: "Search Devotee", icon: "🔍" },
                  { label: "View Transactions", icon: "📜" },
                ].map((a) => (
                  <motion.button
                    key={a.label}
                    whileHover={{ y: -3 }}
                    className="h-20 rounded-2xl bg-orange-50 border border-orange-100 hover:bg-orange-100 transition flex items-center gap-3 px-4"
                    onClick={() => setActiveMenu(a.label)}
                  >
                    <span className="text-xl">{a.icon}</span>
                    <span className="text-sm font-bold text-gray-800">{a.label}</span>
                  </motion.button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-white border border-orange-100 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-gray-900">Payment Methods</div>
                  <div className="text-xs text-gray-500 mt-1">Cash / UPI / Card</div>
                </div>
                <FaChartPie className="text-orange-600 text-xl" />
              </div>

              <div className="mt-4 h-[260px] flex items-center justify-center">
                {!loading && !errorMsg && paymentDonut.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentDonut}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {paymentDonut.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : loading ? (
                  <div className="h-full w-full rounded-xl bg-orange-50 animate-pulse" />
                ) : (
                  <EmptyState label="No data available" />
                )}
                <div className="absolute text-center">
                  <div className="text-xs text-gray-500">Total</div>
                  <div className="text-lg md:text-xl font-extrabold text-orange-800">{formatINR(kpis.todayCollection)}</div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-white border border-orange-100 shadow-sm p-4">
              <div className="text-sm font-bold text-gray-900">Collection Summary</div>
              <div className="text-xs text-gray-500 mt-1">Daily and monthly overview</div>

              <div className="mt-4 space-y-3">
                <SummaryRow label="Today's Collection" value={formatINR(kpis.todayCollection)} accent="orange" />
                <SummaryRow label="Yesterday Collection" value={formatINR(cashier?.yesterdayCollection ?? 0)} accent="blue" />
                <SummaryRow label="This Month Revenue" value={formatINR(cashier?.thisMonthRevenue ?? 0)} accent="gold" />
                <SummaryRow label="Last Month Revenue" value={formatINR(cashier?.lastMonthRevenue ?? 0)} accent="red" />
              </div>
            </section>
          </div>

          {/* Temple widgets */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Widget
              icon="🎉"
              title="Festival Revenue"
              value={formatINR(cashier?.festivalRevenue ?? 0)}
              hint="Temple celebrations"
            />
            <Widget icon="🧘" title="Today's Poojas" value={cashier?.todaysPoojas ?? 0} hint="Live count" />
            <Widget icon="💝" title="Donation Summary" value={formatINR(cashier?.donationSummary ?? kpis.donationCollection)} hint="Devotee support" />
            <Widget icon="🏅" title="Top Donors" value={cashier?.topDonorsCount ?? 0} hint="Top contributors" />
            <Widget icon="🧾" title="Cash Counter Status" value={cashier?.cashCounterStatus ?? "Ready"} hint="Counter health" />
            <Widget icon="⏳" title="Pending Receipts" value={cashier?.pendingReceipts ?? 0} hint="Awaiting print" />
            <Widget icon="⚠️" title="Inventory Alerts" value={inventoryAlerts.length} hint="Low stock" />
            <Widget icon="🍛" title="Daily Prasadam Sales" value={formatINR(cashier?.dailyPrasadamSales ?? kpis.prasadamSales)} hint="Today" />
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left mt-1 rounded-xl px-4 py-3 flex items-center gap-3 transition border border-transparent ${
        active ? "bg-white/15 border-white/20" : "hover:bg-white/10"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-semibold">{label}</span>
    </button>
  );
};

const EmptyState = ({ label }) => (
  <div className="py-10 text-center">
    <div className="mx-auto h-12 w-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-700 text-2xl">🕉️</div>
    <div className="mt-3 text-sm font-bold text-gray-700">{label}</div>
  </div>
);

const KpiCard = ({ title, value, icon, accent }) => {
  const styles = {
    orange: "border-orange-200 bg-gradient-to-br from-white to-orange-50",
    blue: "border-blue-200 bg-gradient-to-br from-white to-blue-50",
    saffron: "border-yellow-200 bg-gradient-to-br from-white to-yellow-50",
    gold: "border-amber-200 bg-gradient-to-br from-white to-amber-50",
    red: "border-red-200 bg-gradient-to-br from-white to-red-50",
  };
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`rounded-2xl border shadow-sm p-4 transition ${styles[accent] || styles.orange}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-gray-500">{title}</div>
          <div className="mt-2 text-xl md:text-2xl font-extrabold text-gray-900">{value}</div>
        </div>
        <div className="h-11 w-11 rounded-2xl bg-white border border-orange-100 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-100 rounded-full px-2 py-1">+2.3%</span>
        <span className="text-xs text-gray-500">vs avg</span>
      </div>
    </motion.div>
  );
};

const SummaryRow = ({ label, value, accent }) => {
  const color =
    accent === "orange"
      ? "text-orange-700 bg-orange-50 border-orange-100"
      : accent === "blue"
        ? "text-blue-700 bg-blue-50 border-blue-100"
        : accent === "gold"
          ? "text-amber-800 bg-amber-50 border-amber-100"
          : "text-red-700 bg-red-50 border-red-100";

  return (
    <div className="flex items-center justify-between rounded-2xl border px-4 py-3">
      <div className="text-sm font-bold text-gray-800">{label}</div>
      <div className={`text-sm font-extrabold rounded-full px-3 py-1 border ${color}`}>{value}</div>
    </div>
  );
};

const Widget = ({ icon, title, value, hint }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-2xl bg-white border border-orange-100 shadow-sm p-4 transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-gray-500">{title}</div>
          <div className="mt-2 text-lg font-extrabold text-gray-900">{value}</div>
          <div className="mt-1 text-xs text-gray-500">{hint}</div>
        </div>
        <div className="h-11 w-11 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-2xl">{icon}</div>
      </div>
    </motion.div>
  );
};

export default CashierDashboard;
