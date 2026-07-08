import { useState, useEffect, useMemo } from "react";
import { getEmployeeProfile, updateEmployeeProfile, changeEmployeePassword } from "../../../services/employeeService";
import { fetchBills } from "../../../services/cashierService";
import { useAuth } from "../../../context/AuthContext";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FaBell,
  FaCalendarAlt,
  FaCamera,
  FaCheckCircle,
  FaDownload,
  FaEdit,
  FaEye,
  FaFileExcel,
  FaFilePdf,
  FaFilter,
  FaHistory,
  FaLock,
  FaPaperPlane,
  FaPlus,
  FaPrint,
  FaSearch,
  FaShieldAlt,
  FaTrash,
  FaUser,
  FaRupeeSign,
  FaWallet,
  FaDonate,
} from "react-icons/fa";
import { MdTempleBuddhist, MdOutlineVolunteerActivism } from "react-icons/md";
import AccountantDonutCard from "./AccountantDonutCard";
import AccountantRevenueChart from "./AccountantRevenueChart";
import Attendance from "../../staff/Attendance";
import LeaveRequest from "../../staff/LeaveRequest";
import {
  accountantStats,
  billingRows,
  billingStats,
  categorySegments,
  collectionTrend,
  dashboardQuickActions,
  devoteePaymentRows,
  devoteePaymentStats,
  donationRows,
  donationSummaryStats,
  inventoryExpenseSegments,
  inventoryRows,
  inventoryStats,
  inventoryTrend,
  monthlySummary,
  notificationRows,
  notificationTabs,
  paymentDailyTrend,
  paymentRows,
  paymentSegments,
  paymentStats,
  pendingBills,
  poojaMonthlyTrend,
  poojaRevenueRows,
  poojaRevenueStats,
  poojaRevenueTypeSegments,
  prasadamItemSegments,
  prasadamRows,
  prasadamStats,
  prasadamTrend,
  profileDetails,
  receiptRows,
  receiptTabs,
  reportCategories,
  reportDonationSegments,
  reportExpenseSegments,
  reportRevenueGrowth,
  recentTransactions,
} from "../accountantDashboardData";

const slugifyStatus = (value) => String(value || "").toLowerCase().replace(/\s+/g, "-");
const titleCase = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const ViewHero = ({ eyebrow, title, description, right }) => (
  <section className="accountant-view__hero">
    <div>
      {eyebrow ? <p className="accountant-view__eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
    {right ? <div className="accountant-view__heroActions">{right}</div> : null}
  </section>
);

const IconStatGrid = ({ items }) => (
  <section className="accountant-stats">
    {items.map((card) => {
      const Icon = card.icon;
      return (
        <article className="accountant-stat-card" key={card.title}>
          <div className="accountant-stat-card__icon" aria-hidden="true">
            <Icon />
          </div>
          <div>
            <p className="accountant-stat-card__title">{card.title}</p>
            <div className="accountant-stat-card__value">{card.value}</div>
            {card.change ? (
              <div className={`accountant-stat-card__change ${card.tone === "down" ? "is-down" : "is-up"}`}>
                <span>{card.change}</span>
              </div>
            ) : null}
          </div>
        </article>
      );
    })}
  </section>
);

const SummaryGrid = ({ items, stacked = false }) => (
  <div className={`accountant-summaryGrid ${stacked ? "accountant-summaryGrid--stacked" : ""}`}>
    {items.map((item) => (
      <article className={`accountant-summaryCard ${item.tone ? `is-${item.tone}` : ""}`} key={item.label}>
        <p className="accountant-summaryCard__label">{item.label}</p>
        <strong className="accountant-summaryCard__value">{item.value}</strong>
        <span className="accountant-summaryCard__note">{item.note}</span>
      </article>
    ))}
  </div>
);

const Toolbar = ({ children }) => <div className="accountant-toolbar">{children}</div>;

const TabsRow = ({ tabs, activeTab, onChange }) => (
  <div className="accountant-tabs" role="tablist" aria-label="Accountant view tabs">
    {tabs.map((tab) => (
      <button
        key={tab}
        type="button"
        role="tab"
        aria-selected={activeTab === tab}
        className={`accountant-tab ${activeTab === tab ? "is-active" : ""}`}
        onClick={() => onChange(tab)}
      >
        {tab}
      </button>
    ))}
  </div>
);

const DataTable = ({ columns, rows, renderRow, emptyText = "No records found." }) => (
  <div className="accountant-tableWrap">
    <table className="accountant-table accountant-table--wide">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length ? (
          rows.map((row) => renderRow(row))
        ) : (
          <tr>
            <td className="accountant-emptyState" colSpan={columns.length}>
              {emptyText}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const StatusBadge = ({ value }) => <span className={`accountant-status ${slugifyStatus(value)}`}>{value}</span>;

const RowActions = ({ actions }) => (
  <div className="accountant-actionGroup">
    {actions.map((action) => {
      const Icon = action.icon;
      return (
        <button key={action.label} type="button" className={`accountant-actionButton ${action.tone ? `is-${action.tone}` : ""}`}>
          <Icon />
          <span>{action.label}</span>
        </button>
      );
    })}
  </div>
);

const ProfileField = ({ label, value }) => (
  <div className="accountant-profileField">
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

const DashboardView = ({ user, currentDate, currentWeekday }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Date range selectors (default to last 30 days)
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchBills();
      setBills(data);
    } catch (err) {
      console.error("Failed to load bills data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter bills by date range
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const bDate = new Date(b.billDate || b.createdAt).toISOString().split("T")[0];
      return (!fromDate || bDate >= fromDate) && (!toDate || bDate <= toDate);
    });
  }, [bills, fromDate, toDate]);

  // Calculations
  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    let todayCollection = 0;
    let rangeTotal = 0;
    let totalDonations = 0;
    let poojaRevenue = 0;
    let prasadamRevenue = 0;

    let globalTotalRevenue = 0;
    let globalTotalDonations = 0;
    let globalPoojaRevenue = 0;
    let globalPrasadamRevenue = 0;

    // Payment methods mapping for donut chart
    const methods = { Cash: 0, UPI: 0, Card: 0, "Bank Transfer": 0, "Net Banking": 0 };
    // Category mapping for donut chart
    const categories = { Pooja: 0, Donation: 0, Prasadam: 0, Other: 0 };

    bills.forEach((b) => {
      const bDate = new Date(b.billDate || b.createdAt).toISOString().split("T")[0];
      const amt = Number(b.amount || 0);

      // Today's collection
      if (bDate === todayStr && String(b.status).toLowerCase() === "paid") {
        todayCollection += amt;
      }

      // Global lifetime stats
      if (String(b.status).toLowerCase() === "paid") {
        globalTotalRevenue += amt;
        const type = String(b.billType || "Other").toLowerCase();
        if (type.includes("donation")) {
          globalTotalDonations += amt;
        } else if (type.includes("pooja") || type.includes("booking")) {
          globalPoojaRevenue += amt;
        } else if (type.includes("prasadam") || type.includes("sale")) {
          globalPrasadamRevenue += amt;
        }
      }

      // Range metrics
      if ((!fromDate || bDate >= fromDate) && (!toDate || bDate <= toDate)) {
        if (String(b.status).toLowerCase() === "paid") {
          rangeTotal += amt;

          const type = String(b.billType || "Other").toLowerCase();
          if (type.includes("donation")) {
            totalDonations += amt;
            categories.Donation += amt;
          } else if (type.includes("pooja") || type.includes("booking")) {
            poojaRevenue += amt;
            categories.Pooja += amt;
          } else if (type.includes("prasadam") || type.includes("sale")) {
            prasadamRevenue += amt;
            categories.Prasadam += amt;
          } else {
            categories.Other += amt;
          }

          const mode = b.paymentMode || "Cash";
          if (methods[mode] !== undefined) {
            methods[mode] += amt;
          } else {
            methods.Cash += amt; // fallback
          }
        }
      }
    });

    const paymentSegments = Object.entries(methods)
      .filter(([_, val]) => val > 0)
      .map(([name, value]) => ({ name, value }));

    const categorySegments = Object.entries(categories)
      .filter(([_, val]) => val > 0)
      .map(([name, value]) => ({ name, value }));

    return {
      todayCollection,
      rangeTotal,
      totalDonations,
      poojaRevenue,
      prasadamRevenue,
      globalTotalRevenue,
      globalTotalDonations,
      globalPoojaRevenue,
      globalPrasadamRevenue,
      paymentSegments,
      categorySegments,
    };
  }, [bills, fromDate, toDate]);

  // Generate PDF Report
  const handleDownloadReport = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(242, 140, 24); // Temple Orange
    doc.text("SRI SHANTI MAHADEV MANDIR", 40, 55);

    doc.setFontSize(14);
    doc.setTextColor(51, 65, 85);
    doc.text("Accountant Ledger & Transaction Report", 40, 78);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Selected Range: ${fromDate} to ${toDate}`, 40, 98);
    doc.text(`Generated at: ${new Date().toLocaleString("en-IN")}`, 40, 112);

    // Divider
    doc.setDrawColor(242, 140, 24);
    doc.setLineWidth(1.5);
    doc.line(40, 122, 550, 122);

    // Summary Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Financial Range Summary", 40, 145);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`- Total Range Collections: Rs ${metrics.rangeTotal.toLocaleString("en-IN")}`, 50, 165);
    doc.text(`- Total Pooja Bookings Value: Rs ${metrics.poojaRevenue.toLocaleString("en-IN")}`, 50, 180);
    doc.text(`- Total Donations Value: Rs ${metrics.totalDonations.toLocaleString("en-IN")}`, 50, 195);
    doc.text(`- Total Prasadam Sales Value: Rs ${metrics.prasadamRevenue.toLocaleString("en-IN")}`, 50, 210);

    // Table of transactions
    const tableData = filteredBills.map((b, index) => [
      new Date(b.billDate || b.createdAt).toLocaleDateString("en-IN"),
      b.referenceNo || `TXN-${String(index + 1).padStart(4, "0")}`,
      b.devoteeName || "-",
      b.billType || "Other",
      b.sevaType || "-",
      `Rs ${Number(b.amount || 0).toLocaleString("en-IN")}`,
      b.paymentMode || "Cash",
      b.status || "Paid",
    ]);

    autoTable(doc, {
      startY: 235,
      head: [["Date", "Receipt No", "Devotee Name", "Type", "Service", "Amount", "Mode", "Status"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [242, 140, 24] },
      styles: { fontSize: 8 },
    });

    doc.save(`Financial_Report_${fromDate}_to_${toDate}.pdf`);
  };

  const statCards = [
    { title: "Today's Collection", value: `Rs ${metrics.todayCollection.toLocaleString("en-IN")}`, icon: FaRupeeSign },
    { title: "Total Revenue", value: `Rs ${metrics.globalTotalRevenue.toLocaleString("en-IN")}`, icon: FaWallet },
    { title: "Total Donations", value: `Rs ${metrics.globalTotalDonations.toLocaleString("en-IN")}`, icon: FaDonate },
    { title: "Pooja Revenue", value: `Rs ${metrics.globalPoojaRevenue.toLocaleString("en-IN")}`, icon: MdTempleBuddhist },
    { title: "Prasadam Revenue", value: `Rs ${metrics.globalPrasadamRevenue.toLocaleString("en-IN")}`, icon: MdOutlineVolunteerActivism },
  ];

  if (loading) {
    return (
      <div className="accountant-view flex items-center justify-center py-20">
        <p className="text-slate-500 font-semibold">Loading ledger transactions...</p>
      </div>
    );
  }

  return (
    <div className="accountant-view">
      <ViewHero
        eyebrow="Accountant Workspace"
        title="Welcome Accountant"
        description={`Overview of temple financial activities.`}
        right={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="font-bold">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="font-bold">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleDownloadReport}
              className="accountant-primaryButton"
            >
              <FaDownload /> Download Range Report
            </button>
          </div>
        }
      />

      <IconStatGrid items={statCards} />

      <section className="accountant-panels accountant-panels--top">
        <article className="accountant-panel md:col-span-2 lg:col-span-2">
          <div className="accountant-panel__header">
            <div>
              <p className="accountant-panel__eyebrow">Overview</p>
              <h3 className="accountant-panel__title">Transactions ledger ({filteredBills.length} records)</h3>
            </div>
          </div>

          <div className="accountant-tableWrap mt-4">
            <table className="accountant-table accountant-table--wide">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Receipt No.</th>
                  <th>Devotee Name</th>
                  <th>Type</th>
                  <th>Service</th>
                  <th>Amount</th>
                  <th>Payment Mode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.length ? (
                  filteredBills.slice(0, 10).map((bill, index) => (
                    <tr key={bill._id || index}>
                      <td>{new Date(bill.billDate || bill.createdAt).toLocaleDateString("en-IN")}</td>
                      <td className="font-bold text-slate-900">{bill.referenceNo || `TXN-${String(index + 1).padStart(4, "0")}`}</td>
                      <td className="font-semibold text-slate-800">{bill.devoteeName}</td>
                      <td>{bill.billType}</td>
                      <td>{bill.sevaType}</td>
                      <td className="font-bold text-slate-900">Rs {Number(bill.amount || 0).toLocaleString("en-IN")}</td>
                      <td>{bill.paymentMode}</td>
                      <td>
                        <StatusBadge value={bill.status || "Paid"} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="accountant-emptyState text-center py-8 text-slate-500">
                      No ledger transactions found in the selected range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <AccountantDonutCard
          title="Payment Methods"
          subtitle="Range distribution"
          segments={metrics.paymentSegments.length ? metrics.paymentSegments : [{ name: "No Data", value: 1 }]}
          centerValue={`Rs ${metrics.rangeTotal.toLocaleString("en-IN")}`}
          centerLabel="Range Total"
        />
      </section>

      <section className="accountant-panels accountant-panels--bottom">
        <AccountantDonutCard
          title="Category Distribution"
          subtitle="Range revenue split"
          segments={metrics.categorySegments.length ? metrics.categorySegments : [{ name: "No Data", value: 1 }]}
          centerValue={`Rs ${metrics.rangeTotal.toLocaleString("en-IN")}`}
          centerLabel="Revenue"
        />

        <article className="accountant-panel">
          <div className="accountant-panel__header">
            <div>
              <p className="accountant-panel__eyebrow">Performance</p>
              <h3 className="accountant-panel__title">Revenue Overview</h3>
            </div>
          </div>
          <div className="accountant-summary">
            <div className="accountant-summary__row">
              <span>Pooja Revenue</span>
              <strong>Rs {metrics.poojaRevenue.toLocaleString("en-IN")}</strong>
            </div>
            <div className="accountant-summary__row">
              <span>Donation Revenue</span>
              <strong>Rs {metrics.totalDonations.toLocaleString("en-IN")}</strong>
            </div>
            <div className="accountant-summary__row">
              <span>Prasadam Revenue</span>
              <strong>Rs {metrics.prasadamRevenue.toLocaleString("en-IN")}</strong>
            </div>
            <div className="accountant-summary__row is-positive">
              <span>Range Total Collection</span>
              <strong>Rs {metrics.rangeTotal.toLocaleString("en-IN")}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="accountant-banner">
        <div className="accountant-banner__icon" aria-hidden="true">
          <MdTempleBuddhist />
        </div>
        <div>
          <p className="accountant-banner__copy">May this temple prosper and all devotees be blessed.</p>
          <p className="accountant-banner__blessing">Om Namo Venkateshaya</p>
        </div>
      </section>
    </div>
  );
};

const DonationsView = ({ bills, loading }) => {
  const [search, setSearch] = useState("");
  const donationBills = useMemo(() => {
    return bills.filter((b) => {
      const isDon = String(b.billType || "").toLowerCase().includes("donation");
      const nameMatch = String(b.devoteeName || "").toLowerCase().includes(search.toLowerCase());
      const refMatch = String(b.referenceNo || "").toLowerCase().includes(search.toLowerCase());
      return isDon && (nameMatch || refMatch);
    });
  }, [bills, search]);

  const totalDonations = useMemo(() => {
    return donationBills.reduce((sum, b) => sum + Number(b.amount || 0), 0);
  }, [donationBills]);

  const donationSummaryStats = [
    { label: "Total Donations", value: donationBills.length, note: "All categories" },
    { label: "Donation Value", value: `Rs ${totalDonations.toLocaleString("en-IN")}`, note: "Settled revenue" }
  ];

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading donations ledger...</div>;
  }

  return (
    <div className="accountant-view">
      <ViewHero
        eyebrow="Donation Management"
        title="Donations"
        description="Track donation receipts, donor details, payment methods and settlement status."
        right={
          <span className="accountant-chip">
            <MdOutlineVolunteerActivism /> Real-time Ledger
          </span>
        }
      />

      <Toolbar>
        <label className="accountant-field accountant-field--search">
          <FaSearch />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by devotee name or receipt..."
          />
        </label>
      </Toolbar>

      <div className="accountant-twoColumn">
        <section className="accountant-panel">
          <div className="accountant-panel__header">
            <div>
              <p className="accountant-panel__eyebrow">Donation Ledger</p>
              <h3 className="accountant-panel__title">Donation Table</h3>
            </div>
          </div>

          <DataTable
            columns={["Receipt Number", "Donor Name", "Amount", "Payment Method", "Date", "Status"]}
            rows={donationBills}
            renderRow={(row, idx) => (
              <tr key={row._id || idx}>
                <td className="font-bold text-slate-900">{row.referenceNo || `TXN-${String(idx + 1).padStart(4, "0")}`}</td>
                <td className="font-semibold text-slate-800">{row.devoteeName}</td>
                <td className="font-bold text-slate-900">Rs {Number(row.amount || 0).toLocaleString("en-IN")}</td>
                <td>{row.paymentMode}</td>
                <td>{new Date(row.billDate || row.createdAt).toLocaleDateString("en-IN")}</td>
                <td>
                  <StatusBadge value={row.status || "Paid"} />
                </td>
              </tr>
            )}
          />
        </section>

        <aside className="accountant-sideRail">
          <SummaryGrid items={donationSummaryStats} stacked />
        </aside>
      </div>
    </div>
  );
};

const BillingView = ({ bills, loading }) => {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    return bills.filter((b) => {
      const nameMatch = String(b.devoteeName || "").toLowerCase().includes(search.toLowerCase());
      const refMatch = String(b.referenceNo || "").toLowerCase().includes(search.toLowerCase());
      const sevaMatch = String(b.sevaType || "").toLowerCase().includes(search.toLowerCase());
      return nameMatch || refMatch || sevaMatch;
    });
  }, [bills, search]);

  const paidCount = filtered.filter(b => String(b.status).toLowerCase() === "paid").length;
  const pendingCount = filtered.filter(b => String(b.status).toLowerCase() === "pending").length;
  const totalRevenue = filtered.filter(b => String(b.status).toLowerCase() === "paid").reduce((sum, b) => sum + Number(b.amount || 0), 0);

  const billingStats = [
    { label: "Total Bills", value: filtered.length, note: "All generated bills" },
    { label: "Paid Bills", value: paidCount, note: "Settled payments" },
    { label: "Total Billing Revenue", value: `Rs ${totalRevenue.toLocaleString("en-IN")}`, note: "Paid cycles" },
  ];

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading bills directory...</div>;
  }

  return (
    <div className="accountant-view">
      <ViewHero
        eyebrow="Billing Management"
        title="Billing"
        description="Auditing workspace for all generated temple bills."
        right={
          <span className="accountant-chip">
            <FaSearch /> Search enabled
          </span>
        }
      />

      <Toolbar>
        <label className="accountant-field accountant-field--search">
          <FaSearch />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by devotee, receipt, or service..."
          />
        </label>
      </Toolbar>

      <SummaryGrid items={billingStats} />

      <section className="accountant-panel">
        <div className="accountant-panel__header">
          <div>
            <p className="accountant-panel__eyebrow">Bills</p>
            <h3 className="accountant-panel__title">Billing Table</h3>
          </div>
        </div>

        <DataTable
          columns={["Bill Number", "Devotee Name", "Service Name", "Amount", "Status", "Date"]}
          rows={filtered}
          renderRow={(row, idx) => (
            <tr key={row._id || idx}>
              <td className="font-bold text-slate-900">{row.referenceNo || `TXN-${String(idx + 1).padStart(4, "0")}`}</td>
              <td className="font-semibold text-slate-800">{row.devoteeName}</td>
              <td>{row.sevaType}</td>
              <td className="font-bold text-slate-900">Rs {Number(row.amount || 0).toLocaleString("en-IN")}</td>
              <td>
                <StatusBadge value={row.status || "Paid"} />
              </td>
              <td>{new Date(row.billDate || row.createdAt).toLocaleDateString("en-IN")}</td>
            </tr>
          )}
        />
      </section>
    </div>
  );
};

const PaymentsView = ({ bills, loading }) => {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    return bills.filter((b) => {
      const nameMatch = String(b.devoteeName || "").toLowerCase().includes(search.toLowerCase());
      const refMatch = String(b.referenceNo || "").toLowerCase().includes(search.toLowerCase());
      return nameMatch || refMatch;
    });
  }, [bills, search]);

  const verifiedCount = filtered.filter(b => String(b.status).toLowerCase() === "paid").length;
  const pendingCount = filtered.filter(b => String(b.status).toLowerCase() === "pending").length;
  const totalAmount = filtered.reduce((sum, b) => sum + Number(b.amount || 0), 0);

  const paymentStats = [
    { label: "Total Transactions", value: filtered.length, note: "All logged payments" },
    { label: "Verified / Paid", value: verifiedCount, note: "Settled successfully" },
    { label: "Pending Verification", value: pendingCount, note: "Awaiting Razorpay/ledger validation" },
    { label: "Transaction Value", value: `Rs ${totalAmount.toLocaleString("en-IN")}`, note: "Accumulated volume" },
  ];

  const paymentSegments = useMemo(() => {
    const modes = {};
    filtered.forEach((b) => {
      const mode = b.paymentMode || "Cash";
      modes[mode] = (modes[mode] || 0) + Number(b.amount || 0);
    });
    return Object.entries(modes).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading payments...</div>;
  }

  return (
    <div className="accountant-view">
      <ViewHero
        eyebrow="Payment Management"
        title="Payments"
        description="Monitor daily payments, verify settlements and review channel-wise collections."
        right={
          <span className="accountant-chip">
            <FaShieldAlt /> Transaction Ledger
          </span>
        }
      />

      <Toolbar>
        <label className="accountant-field accountant-field--search">
          <FaSearch />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
          />
        </label>
      </Toolbar>

      <SummaryGrid items={paymentStats} />

      <div className="accountant-twoColumn accountant-twoColumn--charts">
        <section className="accountant-panel">
          <div className="accountant-panel__header">
            <div>
              <p className="accountant-panel__eyebrow">Transactions</p>
              <h3 className="accountant-panel__title">Payment Table</h3>
            </div>
          </div>

          <DataTable
            columns={["Transaction ID", "Devotee Name", "Amount", "Payment Method", "Payment Status", "Date"]}
            rows={filtered}
            renderRow={(row, idx) => (
              <tr key={row._id || idx}>
                <td className="font-bold text-slate-900">{row.referenceNo || `TXN-${String(idx + 1).padStart(4, "0")}`}</td>
                <td className="font-semibold text-slate-800">{row.devoteeName}</td>
                <td className="font-bold text-slate-900">Rs {Number(row.amount || 0).toLocaleString("en-IN")}</td>
                <td>{row.paymentMode}</td>
                <td>
                  <StatusBadge value={row.status || "Paid"} />
                </td>
                <td>{new Date(row.billDate || row.createdAt).toLocaleDateString("en-IN")}</td>
              </tr>
            )}
          />
        </section>

        <aside className="accountant-sideRail accountant-sideRail--chart">
          <AccountantDonutCard
            title="Payment Method Distribution"
            subtitle="Charts"
            segments={paymentSegments.length ? paymentSegments : [{ name: "No Data", value: 1 }]}
            centerValue={`Rs ${totalAmount.toLocaleString("en-IN")}`}
            centerLabel="Total payments"
          />
        </aside>
      </div>
    </div>
  );
};

const ReceiptsView = ({ bills, loading }) => {
  const [activeTab, setActiveTab] = useState("Pooja Booking");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return bills.filter((b) => {
      // tab filtering
      const type = String(b.billType || "").toLowerCase();
      let matchTab = false;
      if (activeTab === "Pooja Booking") {
        matchTab = type.includes("pooja") || type.includes("booking");
      } else if (activeTab === "Donation") {
        matchTab = type.includes("donation");
      } else if (activeTab === "Prasadam") {
        matchTab = type.includes("prasadam") || type.includes("sale");
      } else {
        matchTab = !type.includes("pooja") && !type.includes("booking") && !type.includes("donation") && !type.includes("prasadam") && !type.includes("sale");
      }

      // search filtering
      const nameMatch = String(b.devoteeName || "").toLowerCase().includes(search.toLowerCase());
      const refMatch = String(b.referenceNo || "").toLowerCase().includes(search.toLowerCase());
      return matchTab && (nameMatch || refMatch);
    });
  }, [bills, activeTab, search]);

  const receiptTabs = ["Pooja Booking", "Donation", "Prasadam", "Other"];

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading receipts...</div>;
  }

  return (
    <div className="accountant-view">
      <ViewHero
        eyebrow="Receipt Center"
        title="Receipts"
        description="Browse all system receipts across donations, poojas, payments, bills, festivals and prasadam."
        right={
          <span className="accountant-chip">
            <FaPrint /> Receipt Archive
          </span>
        }
      />

      <TabsRow tabs={receiptTabs} activeTab={activeTab} onChange={setActiveTab} />

      <Toolbar>
        <label className="accountant-field accountant-field--search">
          <FaSearch />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by devotee name or receipt no..."
          />
        </label>
      </Toolbar>

      <section className="accountant-panel">
        <div className="accountant-panel__header">
          <div>
            <p className="accountant-panel__eyebrow">{activeTab}</p>
            <h3 className="accountant-panel__title">System Receipts</h3>
          </div>
        </div>

        <DataTable
          columns={["Receipt ID", "Receipt Type", "Name", "Amount", "Date"]}
          rows={filtered}
          renderRow={(row, idx) => (
            <tr key={row._id || idx}>
              <td className="font-bold text-slate-900">{row.referenceNo || `TXN-${String(idx + 1).padStart(4, "0")}`}</td>
              <td>{row.billType}</td>
              <td className="font-semibold text-slate-800">{row.devoteeName}</td>
              <td className="font-bold text-slate-900">Rs {Number(row.amount || 0).toLocaleString("en-IN")}</td>
              <td>{new Date(row.billDate || row.createdAt).toLocaleDateString("en-IN")}</td>
            </tr>
          )}
        />
      </section>
    </div>
  );
};

const PoojaRevenueView = ({ bills, loading }) => {
  const poojaBills = useMemo(() => {
    return bills.filter((b) => String(b.billType || "").toLowerCase().includes("pooja") || String(b.billType || "").toLowerCase().includes("booking"));
  }, [bills]);

  const totalAmount = poojaBills.reduce((sum, b) => sum + Number(b.amount || 0), 0);
  const totalCount = poojaBills.length;
  const averageValue = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;

  const poojaRevenueStats = [
    { label: "Pooja Bookings", value: totalCount, note: "All services" },
    { label: "Pooja Revenue", value: `Rs ${totalAmount.toLocaleString("en-IN")}`, note: "Settled volume" },
    { label: "Average Value", value: `Rs ${averageValue.toLocaleString("en-IN")}`, note: "Per booking" }
  ];

  const poojaSegments = useMemo(() => {
    const categories = {};
    poojaBills.forEach((b) => {
      const name = b.sevaType || "General Seva";
      categories[name] = (categories[name] || 0) + Number(b.amount || 0);
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [poojaBills]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading pooja ledger...</div>;
  }

  return (
    <div className="accountant-view">
      <ViewHero
        eyebrow="Pooja Revenue"
        title="Pooja Revenue"
        description="Revenue from pooja services, booking activity and monthly collection trends."
        right={<span className="accountant-chip"><MdTempleBuddhist /> Revenue Focus</span>}
      />

      <SummaryGrid items={poojaRevenueStats} />

      <div className="accountant-twoColumn accountant-twoColumn--charts">
        <section className="accountant-panel">
          <div className="accountant-panel__header">
            <div>
              <p className="accountant-panel__eyebrow">Revenue Ledger</p>
              <h3 className="accountant-panel__title">Pooja Revenue Table</h3>
            </div>
          </div>

          <DataTable
            columns={["Booking ID", "Devotee Name", "Pooja Name", "Amount", "Date"]}
            rows={poojaBills}
            renderRow={(row, idx) => (
              <tr key={row._id || idx}>
                <td className="font-bold text-slate-900">{row.referenceNo || `TXN-${String(idx + 1).padStart(4, "0")}`}</td>
                <td className="font-semibold text-slate-800">{row.devoteeName}</td>
                <td>{row.sevaType}</td>
                <td className="font-bold text-slate-900">Rs {Number(row.amount || 0).toLocaleString("en-IN")}</td>
                <td>{new Date(row.billDate || row.createdAt).toLocaleDateString("en-IN")}</td>
              </tr>
            )}
          />
        </section>

        <aside className="accountant-sideRail accountant-sideRail--chart">
          <AccountantDonutCard
            title="Revenue by Pooja Type"
            subtitle="Charts"
            segments={poojaSegments.length ? poojaSegments : [{ name: "No Data", value: 1 }]}
            centerValue={`Rs ${totalAmount.toLocaleString("en-IN")}`}
            centerLabel="Total revenue"
          />
        </aside>
      </div>
    </div>
  );
};

const PrasadamSalesView = ({ bills, loading }) => {
  const prasadamBills = useMemo(() => {
    return bills.filter((b) => String(b.billType || "").toLowerCase().includes("prasadam") || String(b.billType || "").toLowerCase().includes("sale"));
  }, [bills]);

  const totalAmount = prasadamBills.reduce((sum, b) => sum + Number(b.amount || 0), 0);
  const totalCount = prasadamBills.length;
  const averageValue = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;

  const prasadamStats = [
    { label: "Prasadam Sales", value: totalCount, note: "All items" },
    { label: "Prasadam Revenue", value: `Rs ${totalAmount.toLocaleString("en-IN")}`, note: "Settled volume" },
    { label: "Average Order Value", value: `Rs ${averageValue.toLocaleString("en-IN")}`, note: "Per order" }
  ];

  const itemSegments = useMemo(() => {
    const items = {};
    prasadamBills.forEach((b) => {
      const name = b.sevaType || "Prasadam Item";
      items[name] = (items[name] || 0) + Number(b.amount || 0);
    });
    return Object.entries(items).map(([name, value]) => ({ name, value }));
  }, [prasadamBills]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading prasadam sales...</div>;
  }

  return (
    <div className="accountant-view">
      <ViewHero
        eyebrow="Prasadam Sales"
        title="Prasadam Sales"
        description="Track daily sales, monthly revenue and item-wise performance for prasadam counters."
        right={<span className="accountant-chip"><FaCheckCircle /> Sales Focus</span>}
      />

      <SummaryGrid items={prasadamStats} />

      <div className="accountant-twoColumn accountant-twoColumn--charts">
        <section className="accountant-panel">
          <div className="accountant-panel__header">
            <div>
              <p className="accountant-panel__eyebrow">Sales Ledger</p>
              <h3 className="accountant-panel__title">Prasadam Table</h3>
            </div>
          </div>

          <DataTable
            columns={["Order ID", "Devotee Name", "Item / Seva Name", "Total Amount", "Date"]}
            rows={prasadamBills}
            renderRow={(row, idx) => (
              <tr key={row._id || idx}>
                <td className="font-bold text-slate-900">{row.referenceNo || `TXN-${String(idx + 1).padStart(4, "0")}`}</td>
                <td className="font-semibold text-slate-800">{row.devoteeName}</td>
                <td>{row.sevaType}</td>
                <td className="font-bold text-slate-900">Rs {Number(row.amount || 0).toLocaleString("en-IN")}</td>
                <td>{new Date(row.billDate || row.createdAt).toLocaleDateString("en-IN")}</td>
              </tr>
            )}
          />
        </section>

        <aside className="accountant-sideRail accountant-sideRail--chart">
          <AccountantDonutCard
            title="Item-wise Revenue"
            subtitle="Revenue split"
            segments={itemSegments.length ? itemSegments : [{ name: "No Data", value: 1 }]}
            centerValue={`Rs ${totalAmount.toLocaleString("en-IN")}`}
            centerLabel="Sales total"
          />
        </aside>
      </div>
    </div>
  );
};

const InventoryFinanceView = () => (
  <div className="accountant-view">
    <ViewHero
      eyebrow="Inventory Finance"
      title="Inventory Finance"
      description="Monitor inventory expense tracking, purchase trends and pending procurement."
      right={<span className="accountant-chip"><FaFilter /> Expense Tracking</span>}
    />

    <SummaryGrid items={inventoryStats} />

    <div className="accountant-twoColumn accountant-twoColumn--charts">
      <section className="accountant-panel">
        <div className="accountant-panel__header">
          <div>
            <p className="accountant-panel__eyebrow">Purchases</p>
            <h3 className="accountant-panel__title">Inventory Purchase Table</h3>
          </div>
        </div>

        <DataTable
          columns={["Item Name", "Quantity", "Purchase Cost", "Supplier", "Date"]}
          rows={inventoryRows}
          renderRow={(row) => (
            <tr key={`${row.itemName}-${row.date}`}>
              <td>{row.itemName}</td>
              <td>{row.quantity}</td>
              <td>{row.purchaseCost}</td>
              <td>{row.supplier}</td>
              <td>{row.date}</td>
            </tr>
          )}
        />
      </section>

      <aside className="accountant-sideRail accountant-sideRail--chart">
        <AccountantDonutCard
          title="Expense Analysis"
          subtitle="Ledger charts"
          segments={inventoryExpenseSegments}
          centerValue="Rs 2,45,000"
          centerLabel="Total expenses"
        />
        <AccountantRevenueChart
          title="Purchase Trend"
          subtitle="Expense charts"
          points={inventoryTrend}
          rangeLabel="This Year"
          summaryLabel="Monthly purchases"
          summaryValue="Rs 1,20,000"
          trendLabel="+6.2% from last month"
        />
      </aside>
    </div>
  </div>
);

const DevoteePaymentsView = () => (
  <div className="accountant-view">
    <ViewHero
      eyebrow="Devotee Payments"
      title="Devotee Payments"
      description="Review all payments made by devotees and manage follow-up reminders."
      right={<span className="accountant-chip"><FaHistory /> Payment History</span>}
    />

    <SummaryGrid items={devoteePaymentStats} />

    <section className="accountant-panel">
      <div className="accountant-panel__header">
        <div>
          <p className="accountant-panel__eyebrow">Devotee Ledger</p>
          <h3 className="accountant-panel__title">All Devotee Payments</h3>
        </div>
      </div>

      <DataTable
        columns={["Devotee Name", "Mobile", "Payment Type", "Amount", "Status", "Date", "Actions"]}
        rows={devoteePaymentRows}
        renderRow={(row) => (
          <tr key={`${row.devoteeName}-${row.date}`}>
            <td>{row.devoteeName}</td>
            <td>{row.mobile}</td>
            <td>{row.paymentType}</td>
            <td>{row.amount}</td>
            <td>
              <StatusBadge value={row.status} />
            </td>
            <td>{row.date}</td>
            <td>
              <RowActions
                actions={[
                  { icon: FaHistory, label: "View History" },
                  { icon: FaDownload, label: "Download Receipt", tone: "primary" },
                  { icon: FaPaperPlane, label: "Send Reminder" },
                ]}
              />
            </td>
          </tr>
        )}
      />
    </section>
  </div>
);

const ReportsAnalyticsView = () => (
  <div className="accountant-view">
    <ViewHero
      eyebrow="Reports & Analytics"
      title="Reports & Analytics"
      description="Export reports, compare trends and review temple-wide revenue and expense analytics."
      right={
        <div className="accountant-exportGroup">
          <button type="button" className="accountant-secondaryButton">
            <FaFilePdf />
            Export PDF
          </button>
          <button type="button" className="accountant-secondaryButton">
            <FaFileExcel />
            Export Excel
          </button>
          <button type="button" className="accountant-primaryButton">
            <FaPrint />
            Print Report
          </button>
        </div>
      }
    />

    <section className="accountant-reportGrid">
      {reportCategories.map((label) => (
        <button key={label} type="button" className="accountant-reportCard">
          <span className="accountant-reportCard__label">{label}</span>
          <span className="accountant-reportCard__desc">Open report</span>
        </button>
      ))}
    </section>

    <section className="accountant-panels accountant-panels--top">
      <AccountantRevenueChart
        title="Revenue Growth"
        subtitle="Reports"
        points={reportRevenueGrowth}
        rangeLabel="This Year"
        summaryLabel="Growth"
        summaryValue="Rs 38,00,000"
        trendLabel="+16.5% from last year"
      />

      <AccountantDonutCard
        title="Donation Trends"
        subtitle="Reports"
        segments={reportDonationSegments}
        centerValue="45%"
        centerLabel="Donation share"
      />

      <AccountantDonutCard
        title="Collection Analysis"
        subtitle="Reports"
        segments={categorySegments}
        centerValue="Rs 25,000"
        centerLabel="Daily collection"
      />

      <AccountantDonutCard
        title="Expense Analysis"
        subtitle="Reports"
        segments={reportExpenseSegments}
        centerValue="20%"
        centerLabel="Utilities share"
      />
    </section>
  </div>
);

const NotificationsView = () => {
  const [activeTab, setActiveTab] = useState(notificationTabs[0]);
  const visibleRows =
    activeTab === "All Notifications"
      ? notificationRows
      : notificationRows.filter((row) => row.type === activeTab);

  return (
    <div className="accountant-view">
      <ViewHero
        eyebrow="Notification Center"
        title="Notifications"
        description="Track payment alerts, donation alerts and billing alerts from one location."
        right={
          <button type="button" className="accountant-primaryButton">
            <FaBell />
            Send Notification
          </button>
        }
      />

      <TabsRow tabs={notificationTabs} activeTab={activeTab} onChange={setActiveTab} />

      <Toolbar>
        <button type="button" className="accountant-secondaryButton">
          <FaCheckCircle />
          Mark Read
        </button>
        <button type="button" className="accountant-secondaryButton">
          <FaTrash />
          Delete
        </button>
        <button type="button" className="accountant-secondaryButton">
          <FaPaperPlane />
          Send Notification
        </button>
      </Toolbar>

      <section className="accountant-panel">
        <div className="accountant-panel__header">
          <div>
            <p className="accountant-panel__eyebrow">{activeTab}</p>
            <h3 className="accountant-panel__title">Notification Center</h3>
          </div>
        </div>

        <div className="accountant-notificationList">
          {visibleRows.map((row) => (
            <article className="accountant-notificationItem" key={`${row.title}-${row.date}`}>
              <div className="accountant-notificationItem__meta">
                <div className="accountant-notificationItem__icon" aria-hidden="true">
                  <FaBell />
                </div>
                <div>
                  <h4>{row.title}</h4>
                  <p>{row.message}</p>
                </div>
              </div>
              <div className="accountant-notificationItem__side">
                <StatusBadge value={row.status} />
                <span>{row.date}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

const ProfileView = ({ user }) => {
  const { updateUser, logoutUser } = useAuth();
  const userId = user?.id || user?._id;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dob: "",
    bloodGroup: "",
    emergencyContact: "",
  });
  
  // Password change states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProfile = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getEmployeeProfile(userId);
      if (data?.profile) {
        setProfile(data.profile);
        setEditForm({
          name: data.profile.name || "",
          email: data.profile.email || "",
          phone: data.profile.phone || "",
          address: data.profile.address || "",
          dob: data.profile.dob ? new Date(data.profile.dob).toISOString().split('T')[0] : "",
          bloodGroup: data.profile.bloodGroup || "",
          emergencyContact: data.profile.emergencyContact || "",
        });
      }
    } catch (err) {
      console.error("Failed to load profile details", err);
      setError("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!editForm.name.trim() || !editForm.email.trim()) {
      setError("Name and email are required.");
      return;
    }

    try {
      const res = await updateEmployeeProfile(userId, editForm);
      setMessage("Profile updated successfully!");
      setIsEditing(false);
      
      if (res?.profile) {
        setProfile(res.profile);
        updateUser({
          ...user,
          name: res.profile.name,
          email: res.profile.email,
          phone: res.profile.phone,
          photo: res.profile.photo,
        });
      }

      if (editForm.email.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
        alert("Email changed. Please log in again with your new email.");
        logoutUser();
        window.location.href = "/auth-login";
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError("All password fields are required.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    try {
      await changeEmployeePassword(userId, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setMessage("Password updated successfully! Please log in again with your new password.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setIsChangingPassword(false);
      
      setTimeout(() => {
        logoutUser();
        window.location.href = "/auth-login";
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    }
  };

  if (loading) {
    return (
      <div className="accountant-view flex items-center justify-center py-20">
        <p className="text-slate-500 font-semibold">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="accountant-view">
      <ViewHero
        eyebrow="Profile"
        title="Accountant Profile"
        description="Manage your profile information and security settings."
        right={
          !isEditing && !isChangingPassword ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="accountant-primaryButton"
            >
              <FaEdit /> Edit Profile
            </button>
          ) : null
        }
      />

      <div className="accountant-profileLayout">
        <section className="accountant-profileCard">
          <div className="accountant-profileAvatar">
            {profile?.photo ? (
              <img src={profile.photo} alt={profile.name} className="h-full w-full rounded-full object-cover" />
            ) : (
              <FaUser />
            )}
          </div>
          <h3>{profile?.name || user?.name}</h3>
          <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">
            {profile?.role || "Accountant"}
          </p>

          {message && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-800">
              {error}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4 text-left">
              <label className="block">
                <span className="text-xs font-bold text-slate-700">Full Name</span>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500"
                  required
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold text-slate-700">Email Address</span>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500"
                  required
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold text-slate-700">Phone Number</span>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#f28c18]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold text-slate-700">Date of Birth</span>
                <input
                  type="date"
                  value={editForm.dob}
                  onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                  className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#f28c18]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold text-slate-700">Blood Group</span>
                <input
                  type="text"
                  value={editForm.bloodGroup}
                  onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                  className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#f28c18]"
                  placeholder="e.g. O+"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold text-slate-700">Emergency Contact</span>
                <input
                  type="text"
                  value={editForm.emergencyContact}
                  onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                  className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#f28c18]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold text-slate-700">Address</span>
                <textarea
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#f28c18]"
                  rows="3"
                />
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-amber-600 py-2 text-sm font-bold text-white transition hover:bg-amber-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 rounded-xl bg-slate-100 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : isChangingPassword ? (
            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4 text-left">
              <label className="block">
                <span className="text-xs font-bold text-slate-700">Current Password</span>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#f28c18]"
                  required
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold text-slate-700">New Password</span>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#f28c18]"
                  required
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold text-slate-700">Confirm New Password</span>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#f28c18]"
                  required
                />
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-amber-600 py-2 text-sm font-bold text-white transition hover:bg-amber-700"
                >
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="flex-1 rounded-xl bg-slate-100 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="accountant-profileDetails">
              <ProfileField label="Name" value={profile?.name || user?.name} />
              <ProfileField label="Email" value={profile?.email || user?.email} />
              <ProfileField label="Phone" value={profile?.phone || "-"} />
              <ProfileField label="Blood Group" value={profile?.bloodGroup || "-"} />
              <ProfileField label="Date of Birth" value={profile?.dob ? new Date(profile.dob).toLocaleDateString("en-IN") : "-"} />
              <ProfileField label="Emergency Contact" value={profile?.emergencyContact || "-"} />
              <ProfileField label="Address" value={profile?.address || "-"} />
              <ProfileField label="Role" value={titleCase(profile?.role || user?.role)} />
            </div>
          )}
        </section>

        {!isEditing && !isChangingPassword && (
          <section className="accountant-profileActions">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="accountant-profileAction"
            >
              <FaEdit /> Edit Profile
            </button>
            <button
              type="button"
              onClick={() => setIsChangingPassword(true)}
              className="accountant-profileAction"
            >
              <FaLock /> Change Password
            </button>
          </section>
        )}
      </div>
    </div>
  );
};

const AccountantPageContent = ({ activeItem, user, currentDate, currentWeekday }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchBills();
      setBills(data);
    } catch (err) {
      console.error("Failed to load bills data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  switch (activeItem) {
    case "Donations":
      return <DonationsView bills={bills} loading={loading} />;
    case "Billing":
      return <BillingView bills={bills} loading={loading} />;
    case "Payments":
      return <PaymentsView bills={bills} loading={loading} />;
    case "Receipts":
      return <ReceiptsView bills={bills} loading={loading} />;
    case "Pooja Revenue":
      return <PoojaRevenueView bills={bills} loading={loading} />;
    case "Prasadam Sales":
      return <PrasadamSalesView bills={bills} loading={loading} />;
    case "Inventory Finance":
      return <InventoryFinanceView />;
    case "Devotee Payments":
      return <DevoteePaymentsView />;
    case "Reports & Analytics":
      return <ReportsAnalyticsView />;
    case "Notifications":
      return <NotificationsView />;
    case "Attendance":
      return (
        <div style={{ padding: "2rem" }}>
          <Attendance />
        </div>
      );
    case "Apply Leave":
      return (
        <div style={{ padding: "2rem" }}>
          <LeaveRequest />
        </div>
      );
    case "Profile":
      return <ProfileView user={user} />;
    case "Dashboard":
    default:
      return <DashboardView user={user} currentDate={currentDate} currentWeekday={currentWeekday} bills={bills} loading={loading} />;
  }
};

export default AccountantPageContent;
