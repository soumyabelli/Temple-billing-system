<<<<<<< HEAD

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CashierDashboard.css";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  FaChartBar,
  FaBell,
  FaChevronDown,
  FaSearch,
  FaQrcode,
  FaArrowUp,
  FaEye,
  FaCheck,
  FaClock,
  FaFileInvoice,
  FaHeart,
  FaPrint,
  FaDownload,
  FaCreditCard,
  FaCalendarAlt,
  FaBox,
  FaReceipt,
  FaHistory,
  FaHome,
  FaSignOutAlt,
} from "react-icons/fa";

import { cashierSidebarItems } from "../../data/cashierSidebarData";

import CashierPoojaBookings from "./PoojaBookingsCashier";

// SVG Logos
const TempleLogo = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 5L85 45H15L50 5Z" fill="url(#goldGrad)" />
    <path d="M50 20L75 50H25L50 20Z" fill="url(#goldGradLight)" />
    <rect x="25" y="50" width="50" height="40" rx="4" fill="url(#goldGrad)" />
    <rect x="42" y="65" width="16" height="25" rx="2" fill="#2E0209" />
    <circle cx="50" cy="72" r="2" fill="#D4AF37" />
    <path d="M50 0V5" stroke="#D4AF37" strokeWidth="3" />
    <circle cx="50" cy="-2" r="2" fill="#D4AF37" />
    <defs>
      <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="goldGradLight" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
  </svg>
);

const TempleWatermark = () => (
  <svg width="100%" height="220" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.15 }}>
    <path d="M100 10L170 90H30L100 10Z" stroke="#F59E0B" strokeWidth="2" />
    <path d="M100 35L150 90H50L100 35Z" stroke="#F59E0B" strokeWidth="2" />
    <path d="M100 60L130 90H70L100 60Z" stroke="#F59E0B" strokeWidth="2" />
    <rect x="50" y="90" width="100" height="80" stroke="#F59E0B" strokeWidth="2" />
    <rect x="85" y="120" width="30" height="50" stroke="#F59E0B" strokeWidth="2" />
    <path d="M100 2V10" stroke="#F59E0B" strokeWidth="2" />
    <circle cx="100" cy="2" r="2" fill="#F59E0B" />
  </svg>
);

const CashierDashboard = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      // ignore
    }
    navigate("/login");
  };

  // Chart data
  const revenueData = [
    { name: "14 May", amount: 18000 },
    { name: "15 May", amount: 28000 },
    { name: "16 May", amount: 48000 },
    { name: "17 May", amount: 32000 },
    { name: "18 May", amount: 52000 },
    { name: "19 May", amount: 42000 },
    { name: "20 May", amount: 68450 },
  ];

  const paymentData = [
    { name: "UPI", value: 45, color: "#7C3AED" },
    { name: "Cash", value: 30, color: "#10B981" },
    { name: "Card", value: 15, color: "#2563EB" },
    { name: "Net Banking", value: 10, color: "#F59E0B" },
  ];



  const statCards = [
    {
      title: "Today's Collection",
      value: "₹ 68,450",
      change: "18.6% from yesterday",
      trend: "up",
      color: "orange",
      icon: <div className="stat-icon-container orange-icon"><span className="coin-sack-icon">💰</span></div>
    },
    {
      title: "Total Transactions",
      value: "128",
      change: "12.4% from yesterday",
      trend: "up",
      color: "indigo",
      icon: <div className="stat-icon-container indigo-icon"><FaFileInvoice className="text-white text-lg" /></div>
    },
   
   
    {
      title: "Pooja Bookings",
      value: "42",
      change: "10.1%",
      trend: "up",
      color: "blue",
      icon: <div className="stat-icon-container blue-icon"><span className="pooja-icon">🛕</span></div>
    },
    {
      title: "Prasadam Sales",
      value: "₹ 12,780",
      change: "14.5%",
      trend: "up",
      color: "peach",
      icon: <div className="stat-icon-container peach-icon"><span className="prasadam-icon">🍊</span></div>
    }
  ];

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo-circle">
            <TempleLogo />
          </div>
          <div>
            <div className="brand-title">Sri Shanti Mahadev Mandir</div>
            <div className="brand-subtitle">Established 1982</div>
          </div>
        </div>

        <div className="sidebar-profile">
          <div className="profile-img-wrapper">
            <img src="https://i.pravatar.cc/100?img=33" alt="Cashier Avatar" />
            <span className="online-indicator"></span>
          </div>
          <div className="profile-info">
            <h3>Cashier</h3>
            <p>Online</p>
          </div>
        </div>

        <ul className="sidebar-menu">
          {cashierSidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.title;
            return (
              <li
                key={item.title}
                className={`menu-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  if (item.title === "Logout") {
                    handleLogout();
                    return;
                  }
                  setActiveMenu(item.title);
                  navigate(item.path);
                }}
              >
                <span className="menu-icon">
                  <Icon size={18} />
                </span>
                <span className="menu-text">{item.title}</span>
              </li>
            );
          })}
        </ul>

        <div className="sidebar-footer-drawing">
          <TempleWatermark />
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="main-viewport">
        {/* HEADER */}
        <header className="viewport-header">

          <div className="header-left">
            <div className="hamburger-menu">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="header-title-container">
              <span className="header-temple-icon">🛕</span>
              <h1 className="header-title">Temple Billing System</h1>
              <span className="cashier-badge">Cashier Dashboard</span>
            </div>
          </div>

          <div className="header-center">
            <div className="search-bar-wrapper">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Search anything..." />
            </div>
          </div>

          <div className="header-right">
            <div className="icon-badge-btn">
              <FaBell />
              <span className="notification-dot">5</span>
            </div>
            <div className="icon-btn">
              <FaQrcode />
            </div>
            <div className="divider"></div>
            <div className="user-dropdown-btn">
              <img src="https://i.pravatar.cc/100?img=33" alt="Profile" className="user-avatar" />
              <div className="user-names">
                <span className="user-role">Cashier</span>
                <span className="user-welcome">Welcome!</span>
              </div>
              <FaChevronDown className="dropdown-arrow" />
            </div>
          </div>
        </header>

        {/* MAIN BODY SCROLL CONTAINER */}
        {/* MAIN BODY SCROLL CONTAINER */}
  <div className="main-body-content">
        {children ?? null}
  {/* STATS ROW */}
  <div className="stats-grid">
    {statCards.map((card, i) => (
      <div key={i} className={`stat-card card-style-${card.color}`}>
        <div className="stat-header">
          <span className="stat-title">{card.title}</span>
          {card.icon}
        </div>
        <div className="stat-value">{card.value}</div>
        <div className="stat-footer">
          {card.trend === "up" && (
            <span className="trend-arrow-up">
              <FaArrowUp />
            </span>
          )}
          <span className="stat-change">{card.change}</span>
        </div>
      </div>
    ))}
  </div>

          {/* MIDDLE CHARTS AND WIDGETS ROW */}
          <div className="charts-widgets-row">
            {/* LINE CHART */}
            <div className="chart-box daily-revenue-box">
              <div className="box-header">
                <h3>Daily Revenue Overview</h3>
                <div className="revenue-today-tag">
                  Today: <span className="tag-bold">₹ 68,450</span>
                </div>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: "#1E293B", borderRadius: "8px", border: "none", color: "#FFF" }}
                      labelStyle={{ color: "#94A3B8" }}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" dot={{ stroke: "#F59E0B", strokeWidth: 2, r: 4, fill: "#FFF" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* DONUT CHART */}
            <div className="chart-box payment-methods-box">
              <div className="box-header">
                <h3>Payment Methods</h3>
              </div>
              <div className="donut-chart-container">
                <div className="donut-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {paymentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="donut-center-text">
                    <span className="donut-total-val">₹ 68,450</span>
                    <span className="donut-total-lbl">Total</span>
                  </div>
                </div>
                <div className="donut-legend">
                  {paymentData.map((item, index) => (
                    <div key={index} className="legend-item">
                      <div className="legend-marker-wrapper">
                        <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                        <span className="legend-name">{item.name}</span>
                      </div>
                      <span className="legend-percent">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SIDE COLUMN WIDGETS */}
            <div className="side-widgets-column">
              {/* Recent Donations */}
              <div className="widget-card">
                <div className="widget-header">
                  <h4>Recent Donations</h4>
                  <a href="#all-donations" className="view-all-link">View All</a>
                </div>
                <ul className="widget-list">
                  <li className="list-item">
                    <div className="item-meta">
                      <span className="avatar-initial orange-bg">R</span>
                      <div>
                        <span className="item-title">Ramesh Kumar</span>
                        <span className="item-subtitle text-upi">● UPI</span>
                      </div>
                    </div>
                    <span className="item-value">₹ 2,000</span>
                  </li>
                  <li className="list-item">
                    <div className="item-meta">
                      <span className="avatar-initial green-bg">S</span>
                      <div>
                        <span className="item-title">Suresh Reddy</span>
                        <span className="item-subtitle text-cash">● Cash</span>
                      </div>
                    </div>
                    <span className="item-value">₹ 1,500</span>
                  </li>
                  <li className="list-item">
                    <div className="item-meta">
                      <span className="avatar-initial blue-bg">L</span>
                      <div>
                        <span className="item-title">Lakshmi Devi</span>
                        <span className="item-subtitle text-card">● Card</span>
                      </div>
                    </div>
                    <span className="item-value">₹ 1,000</span>
                  </li>
                  <li className="list-item">
                    <div className="item-meta">
                      <span className="avatar-initial orange-bg">A</span>
                      <div>
                        <span className="item-title">Anil Kumar</span>
                        <span className="item-subtitle text-upi">● UPI</span>
                      </div>
                    </div>
                    <span className="item-value">₹ 750</span>
                  </li>
                </ul>
              </div>

              {/* Upcoming Pooja Payments */}
              <div className="widget-card">
                <div className="widget-header">
                  <h4>Upcoming Pooja Payments</h4>
                </div>
                <ul className="widget-list">
                  <li className="list-item">
                    <div className="item-meta">
                      <span className="widget-icon-pill green-light"><FaCalendarAlt /></span>
                      <div>
                        <span className="item-title">Archana Pooja</span>
                        <span className="item-subtitle">10:30 AM</span>
                      </div>
                    </div>
                    <span className="item-value green-val">₹ 500</span>
                  </li>
                  <li className="list-item">
                    <div className="item-meta">
                      <span className="widget-icon-pill blue-light"><FaCalendarAlt /></span>
                      <div>
                        <span className="item-title">Abhisheka</span>
                        <span className="item-subtitle">11:00 AM</span>
                      </div>
                    </div>
                    <span className="item-value blue-val">₹ 1,200</span>
                  </li>
                  <li className="list-item">
                    <div className="item-meta">
                      <span className="widget-icon-pill orange-light"><FaCalendarAlt /></span>
                      <div>
                        <span className="item-title">Homa</span>
                        <span className="item-subtitle">01:00 PM</span>
                      </div>
                    </div>
                    <span className="item-value orange-val">₹ 2,000</span>
                  </li>
                  <li className="list-item">
                    <div className="item-meta">
                      <span className="widget-icon-pill red-light"><FaCalendarAlt /></span>
                      <div>
                        <span className="item-title">Special Seva</span>
                        <span className="item-subtitle">03:00 PM</span>
                      </div>
                    </div>
                    <span className="item-value red-val">₹ 1,500</span>
                  </li>
                </ul>
              </div>

              {/* Low Stock Alert */}
              <div className="widget-card stock-alert-card">
                <div className="widget-header red-header">
                  <h4>⚠️ Low Stock Alert (Prasadam)</h4>
                </div>
                <ul className="widget-list">
                  <li className="list-item">
                    <div className="item-meta">
                      <span className="stock-bullet">🟠</span>
                      <div>
                        <span className="item-title">Laddu</span>
                      </div>
                    </div>
                    <span className="item-stock-tag warning-tag">Only 15 Left</span>
                  </li>
                  <li className="list-item">
                    <div className="item-meta">
                      <span className="stock-bullet">🔴</span>
                      <div>
                        <span className="item-title">Pulihora</span>
                      </div>
                    </div>
                    <span className="item-stock-tag danger-tag">Only 8 Left</span>
                  </li>
                  <li className="list-item">
                    <div className="item-meta">
                      <span className="stock-bullet">🟠</span>
                      <div>
                        <span className="item-title">Panakam</span>
                      </div>
                    </div>
                    <span className="item-stock-tag warning-tag">Only 12 Left</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS ROW */}
          <div className="quick-actions-section">
            <h3 className="section-title">⚡ Quick Actions</h3>
            <div className="quick-actions-row">
              <button className="action-tile-btn text-blue-btn">
                <div className="action-tile-icon-wrapper bg-blue-100">
                  <FaFileInvoice />
                </div>
                <span>Generate Bill</span>
              </button>
              <button className="action-tile-btn text-green-btn">
                <div className="action-tile-icon-wrapper bg-green-100">
                  <FaCreditCard />
                </div>
                <span>Accept Payment</span>
              </button>
              <button className="action-tile-btn text-purple-btn">
                <div className="action-tile-icon-wrapper bg-purple-100">
                  <FaPrint />
                </div>
                <span>Print Receipt</span>
              </button>
              <button className="action-tile-btn text-orange-btn">
                <div className="action-tile-icon-wrapper bg-orange-100">
                  <FaDownload />
                </div>
                <span>Download PDF</span>
              </button>
              <button className="action-tile-btn text-pink-btn">
                <div className="action-tile-icon-wrapper bg-pink-100">
                  <FaSearch />
                </div>
                <span>Search Receipt</span>
              </button>
              <button className="action-tile-btn text-teal-btn">
                <div className="action-tile-icon-wrapper bg-teal-100">
                  <FaChartBar />
                </div>
                <span>Daily Report</span>
              </button>
            </div>
          </div>

          {/* BOTTOM TRANSACTIONS AND SUMMARY */}
          <div className="bottom-tables-row">
            {/* TRANSACTION TABLE */}
            <div className="transactions-table-box">
              <div className="box-header">
                <h3>Recent Transactions</h3>
              </div>
              <div className="table-responsive">
                <table className="custom-dashboard-table">
                  <thead>
                    <tr>
                      <th>Receipt No</th>
                      <th>Date & Time</th>
                      <th>Devotee Name</th>
                      <th>Service / Item</th>
                      <th>Amount (₹)</th>
                      <th>Payment Method</th>
                      <th>Status</th>
                      <th style={{ textAlign: "center" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="bold-txt">REC00125</td>
                      <td>20 May 2025, 10:15 AM</td>
                      <td>Ramesh Kumar</td>
                      <td>Archana Pooja</td>
                      <td className="bold-txt">500</td>
                      <td>
                        <span className="payment-method-badge badge-upi">UPI</span>
                      </td>
                      <td>
                        <span className="status-badge badge-paid"><FaCheck /> Paid</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button className="view-action-btn"><FaEye /></button>
                      </td>
                    </tr>
                    <tr>
                      <td className="bold-txt">REC00124</td>
                      <td>20 May 2025, 09:45 AM</td>
                      <td>Suresh Reddy</td>
                      <td>Donation</td>
                      <td className="bold-txt">1,000</td>
                      <td>
                        <span className="payment-method-badge badge-cash">Cash</span>
                      </td>
                      <td>
                        <span className="status-badge badge-paid"><FaCheck /> Paid</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button className="view-action-btn"><FaEye /></button>
                      </td>
                    </tr>
                    <tr>
                      <td className="bold-txt">REC00123</td>
                      <td>20 May 2025, 09:10 AM</td>
                      <td>Mahesh Babu</td>
                      <td>Prasadam</td>
                      <td className="bold-txt">250</td>
                      <td>
                        <span className="payment-method-badge badge-card">Card</span>
                      </td>
                      <td>
                        <span className="status-badge badge-paid"><FaCheck /> Paid</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button className="view-action-btn"><FaEye /></button>
                      </td>
                    </tr>
                    <tr>
                      <td className="bold-txt">REC00122</td>
                      <td>20 May 2025, 08:40 AM</td>
                      <td>Anil Kumar</td>
                      <td>Abhisheka</td>
                      <td className="bold-txt">1,200</td>
                      <td>
                        <span className="payment-method-badge badge-upi">UPI</span>
                      </td>
                      <td>
                        <span className="status-badge badge-paid"><FaCheck /> Paid</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button className="view-action-btn"><FaEye /></button>
                      </td>
                    </tr>
                    <tr>
                      <td className="bold-txt">REC00121</td>
                      <td>20 May 2025, 08:10 AM</td>
                      <td>Lakshmi Devi</td>
                      <td>Special Seva</td>
                      <td className="bold-txt">1,500</td>
                      <td>
                        <span className="payment-method-badge badge-netbanking">Net Banking</span>
                      </td>
                      <td>
                        <span className="status-badge badge-pending"><FaClock /> Pending</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button className="view-action-btn"><FaEye /></button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* TODAY'S SUMMARY */}
            <div className="summary-box">
              <div className="box-header">
                <h3>Today's Summary</h3>
              </div>
              <ul className="summary-list">
                <li>
                  <span className="summary-lbl">Total Collection</span>
                  <span className="summary-val bold-txt">₹ 68,450</span>
                </li>
                <li>
                  <span className="summary-lbl">Total Transactions</span>
                  <span className="summary-val">128</span>
                </li>
                <li>
                  <span className="summary-lbl">Average Bill Value</span>
                  <span className="summary-val">₹ 534</span>
                </li>
                <li>
                  <span className="summary-lbl">Active Payments</span>
                  <span className="summary-val">15</span>
                </li>
              </ul>
            </div>
          </div>
=======
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
        { name: "Cash", value: 18230, color: "#10B981" },
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
>>>>>>> 1a512012f6af945a370c9e9129f3773ce078e50c
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
};

export default CashierDashboard;
=======
}

>>>>>>> 1a512012f6af945a370c9e9129f3773ce078e50c
