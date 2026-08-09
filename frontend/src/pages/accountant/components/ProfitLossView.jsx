import React, { useState, useEffect } from "react";
import { getProfitLoss, getTransactions } from "../../../services/accountService";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {
  FaArrowUp,
  FaArrowDown,
  FaWallet,
  FaDownload,
  FaSyncAlt,
  FaFilter,
  FaChartPie,
  FaMoneyBillWave,
  FaReceipt,
} from "react-icons/fa";

const ProfitLossView = ({ hideHeader = false }) => {
  const [data, setData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    incomeBySource: {},
    expenseByCategory: {},
  });
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("all");

  const loadPL = async () => {
    setLoading(true);
    try {
      // 1. Fetch backend P&L data
      let apiPL = null;
      try {
        apiPL = await getProfitLoss();
      } catch (err) {
        console.warn("Backend P&L endpoint idle, building from transactions", err);
      }

      // 2. Fetch backend live transactions
      let backendTransactions = [];
      try {
        const txs = await getTransactions();
        if (Array.isArray(txs)) backendTransactions = txs;
      } catch (err) {
        console.warn("Backend transactions idle", err);
      }

      // 3. Fetch manual entries from localStorage
      const savedManual = localStorage.getItem("templeManualEntries_v1");
      const manualEntries = savedManual ? JSON.parse(savedManual) : [];

      // 4. Fetch manual expense vouchers from localStorage
      const savedExpenses = localStorage.getItem("templeManualExpenses_v1");
      const manualExpenses = savedExpenses ? JSON.parse(savedExpenses) : [];

      // Format manual records
      const formattedManual = [
        ...manualEntries.map((m) => ({
          date: m.date ? new Date(m.date) : new Date(),
          type: m.entryType || "Debit",
          source: m.source || "Manual Entry",
          category: m.category || m.whereSpent || "Manual Expense",
          amount: Number(m.amount || 0),
        })),
        ...manualExpenses.map((e) => ({
          date: e.date ? new Date(e.date) : new Date(),
          type: "Debit",
          source: "Manual Expense Voucher",
          category: e.category || e.whereSpent || "Expense Voucher",
          amount: Number(e.amount || 0),
        })),
      ];

      // Format backend records
      const formattedBackend = backendTransactions.map((t) => ({
        date: new Date(t.date || Date.now()),
        type: t.transactionType || (t.type === "Debit" ? "Debit" : "Credit"),
        source: t.source || "General Ledger",
        category: t.category || t.source || "General",
        amount: Number(t.amount || 0),
      }));

      const allLiveTransactions = [...formattedBackend, ...formattedManual];

      // Filter by Date Range if selected
      let filtered = allLiveTransactions;
      if (fromDate) {
        const start = new Date(fromDate);
        start.setHours(0, 0, 0, 0);
        filtered = filtered.filter((t) => new Date(t.date) >= start);
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        filtered = filtered.filter((t) => new Date(t.date) <= end);
      }

      // Aggregate Income & Expenses
      let totalIncome = 0;
      let totalExpense = 0;
      const incomeBySource = {};
      const expenseByCategory = {};

      filtered.forEach((t) => {
        const amt = Number(t.amount) || 0;
        if (t.type === "Credit") {
          totalIncome += amt;
          const src = t.source || "Other Income";
          incomeBySource[src] = (incomeBySource[src] || 0) + amt;
        } else if (t.type === "Debit") {
          totalExpense += amt;
          const cat = t.category || t.source || "General Expense";
          expenseByCategory[cat] = (expenseByCategory[cat] || 0) + amt;
        }
      });

      // Merge API baseline data if local transactions were incomplete
      if (apiPL) {
        if (apiPL.incomeBySource && Object.keys(incomeBySource).length === 0) {
          Object.assign(incomeBySource, apiPL.incomeBySource);
          totalIncome = Math.max(totalIncome, apiPL.totalIncome || 0);
        } else if (apiPL.incomeBySource) {
          // Fill missing sources from API if any
          Object.entries(apiPL.incomeBySource).forEach(([src, amt]) => {
            if (!incomeBySource[src]) {
              incomeBySource[src] = amt;
              totalIncome += amt;
            }
          });
        }

        if (apiPL.expenseByCategory && Object.keys(expenseByCategory).length === 0) {
          Object.assign(expenseByCategory, apiPL.expenseByCategory);
          totalExpense = Math.max(totalExpense, apiPL.totalExpense || 0);
        } else if (apiPL.expenseByCategory) {
          Object.entries(apiPL.expenseByCategory).forEach(([cat, amt]) => {
            if (!expenseByCategory[cat]) {
              expenseByCategory[cat] = amt;
              totalExpense += amt;
            }
          });
        }
      }

      setData({
        totalIncome,
        totalExpense,
        netProfit: totalIncome - totalExpense,
        incomeBySource,
        expenseByCategory,
      });
    } catch (error) {
      console.error("Error generating Profit & Loss data:", error);
      toast.error("Failed to calculate Profit & Loss metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPL();
  }, [fromDate, toDate]);

  const handlePresetChange = (preset) => {
    setSelectedPreset(preset);
    const now = new Date();
    if (preset === "today") {
      const todayStr = now.toISOString().split("T")[0];
      setFromDate(todayStr);
      setToDate(todayStr);
    } else if (preset === "thisMonth") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
      setFromDate(firstDay);
      setToDate(lastDay);
    } else if (preset === "fy2526") {
      setFromDate("2025-04-01");
      setToDate("2026-03-31");
    } else if (preset === "fy2627") {
      setFromDate("2026-04-01");
      setToDate("2027-03-31");
    } else {
      setFromDate("");
      setToDate("");
    }
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      // Header Banner
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(188, 108, 16);
      doc.text("Sri Shanti Mahadev Mandir", 14, 15);

      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);
      doc.text("Profit & Loss Financial Statement", 14, 22);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, 14, 27);
      doc.text(`Period Filter: ${fromDate || "All Time"} to ${toDate || "Present"}`, 14, 32);

      // Summary Card Box
      doc.setFillColor(250, 247, 242);
      doc.roundedRect(14, 36, 182, 20, 3, 3, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(22, 101, 52);
      doc.text(`Total Income: Rs ${data.totalIncome?.toLocaleString("en-IN")}`, 20, 48);

      doc.setTextColor(153, 27, 27);
      doc.text(`Total Expenses: Rs ${data.totalExpense?.toLocaleString("en-IN")}`, 80, 48);

      doc.setTextColor(180, 83, 9);
      doc.text(`Net Profit: Rs ${data.netProfit?.toLocaleString("en-IN")}`, 140, 48);

      // Income Table
      const incomeRows = Object.entries(data.incomeBySource || {}).map(([src, amt]) => [
        src,
        `Rs ${amt?.toLocaleString("en-IN")}`,
        `${data.totalIncome ? ((amt / data.totalIncome) * 100).toFixed(1) : 0}%`,
      ]);

      doc.autoTable({
        startY: 62,
        head: [["Income Source", "Amount", "Share (%)"]],
        body: incomeRows,
        theme: "striped",
        headStyles: { fillColor: [22, 101, 52], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 9, cellPadding: 3 },
      });

      // Expense Table
      const expenseRows = Object.entries(data.expenseByCategory || {}).map(([cat, amt]) => [
        cat,
        `Rs ${amt?.toLocaleString("en-IN")}`,
        `${data.totalExpense ? ((amt / data.totalExpense) * 100).toFixed(1) : 0}%`,
      ]);

      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : 120;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(50, 50, 50);
      doc.text("Expenses Breakdown by Category", 14, finalY);

      doc.autoTable({
        startY: finalY + 4,
        head: [["Expense Category", "Amount", "Share (%)"]],
        body: expenseRows,
        theme: "striped",
        headStyles: { fillColor: [153, 27, 27], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 9, cellPadding: 3 },
      });

      doc.save(`Temple_Profit_Loss_Statement_${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("P&L Financial Statement downloaded!");
    } catch (err) {
      console.error("PDF generation failed", err);
      toast.error("Failed to generate P&L PDF report");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex items-center gap-3 text-amber-800 font-bold text-lg">
          <FaSyncAlt className="animate-spin text-amber-600" /> Loading Live Profit & Loss Data...
        </div>
      </div>
    );
  }

  return (
    <div className={hideHeader ? "" : "min-h-screen bg-[#faf7f2] p-4 sm:p-6 lg:p-8 text-slate-800"}>
      {!hideHeader && (
        <div className="mb-6 rounded-3xl border border-amber-200/60 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-600/10 p-6 backdrop-blur-md shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#4a2b0f]">
                Profit & Loss
              </h1>
              <p className="mt-1 text-base font-medium text-[#7a4918]">
                Live financial overview of Income vs Expenses across all temple operations.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 rounded-2xl bg-amber-600 hover:bg-amber-700 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:scale-105"
              >
                <FaDownload /> Download Statement (PDF)
              </button>
              <button
                type="button"
                onClick={loadPL}
                className="flex items-center gap-2 rounded-2xl border border-amber-300 bg-temple-100 px-5 py-3 text-sm font-bold text-amber-900 shadow-sm hover:bg-amber-50 transition"
              >
                <FaSyncAlt /> Refresh Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FILTER TOOLBAR */}
      <div className="mb-6 rounded-3xl border border-white/80 bg-temple-100 p-6 shadow-md backdrop-blur-lg">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-slate-700">
            <FaFilter className="text-amber-600" /> Filter Financial Period
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Time" },
              { id: "today", label: "Today" },
              { id: "thisMonth", label: "This Month" },
              { id: "fy2526", label: "FY 2025-26" },
              { id: "fy2627", label: "FY 2026-27" },
            ].map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetChange(preset.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedPreset === preset.id
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setSelectedPreset("custom");
                setFromDate(e.target.value);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setSelectedPreset("custom");
                setToDate(e.target.value);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* TOP SUMMARY STAT CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-emerald-50/80 border border-emerald-200 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl text-lg">
                <FaArrowUp />
              </span>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">Total Income</h4>
            </div>
            <p className="text-3xl font-black text-emerald-950">Rs {data.totalIncome?.toLocaleString("en-IN")}</p>
          </div>
        </div>

        <div className="bg-red-50/80 border border-red-200 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2.5 bg-red-100 text-red-700 rounded-xl text-lg">
                <FaArrowDown />
              </span>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-red-800">Total Expenses</h4>
            </div>
            <p className="text-3xl font-black text-red-950">Rs {data.totalExpense?.toLocaleString("en-IN")}</p>
          </div>
        </div>

        <div className="bg-sky-50/80 border border-sky-200 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2.5 bg-sky-100 text-sky-700 rounded-xl text-lg">
                <FaWallet />
              </span>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-800">Net Profit / Loss</h4>
            </div>
            <p className={`text-3xl font-black ${data.netProfit >= 0 ? "text-emerald-900" : "text-red-900"}`}>
              Rs {data.netProfit?.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </section>

      {/* INCOME vs EXPENSE BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* INCOME BY SOURCE */}
        <section className="bg-temple-100 border border-emerald-100 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <FaMoneyBillWave className="text-emerald-600" /> Income by Source
            </h3>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
              {Object.keys(data.incomeBySource || {}).length} Sources
            </span>
          </div>

          <div className="space-y-5">
            {Object.entries(data.incomeBySource || {}).map(([source, amt]) => {
              const sharePct = data.totalIncome > 0 ? ((amt / data.totalIncome) * 100).toFixed(1) : 0;
              return (
                <div key={source} className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
                    <span className="font-bold text-slate-800">{source}</span>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-900">Rs {amt?.toLocaleString("en-IN")}</span>
                      <span className="text-xs text-emerald-700 ml-2 font-bold">({sharePct}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(5, sharePct))}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {Object.keys(data.incomeBySource || {}).length === 0 && (
              <p className="text-center py-6 text-sm font-semibold text-slate-400">No income recorded for this period.</p>
            )}
          </div>
        </section>

        {/* EXPENSES BY CATEGORY */}
        <section className="bg-temple-100 border border-red-100 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <FaReceipt className="text-red-600" /> Expenses by Category
            </h3>
            <span className="text-xs font-bold bg-red-100 text-red-800 px-3 py-1 rounded-full">
              {Object.keys(data.expenseByCategory || {}).length} Categories
            </span>
          </div>

          <div className="space-y-5">
            {Object.entries(data.expenseByCategory || {}).map(([cat, amt]) => {
              const sharePct = data.totalExpense > 0 ? ((amt / data.totalExpense) * 100).toFixed(1) : 0;
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
                    <span className="font-bold text-slate-800">{cat}</span>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-900">Rs {amt?.toLocaleString("en-IN")}</span>
                      <span className="text-xs text-red-700 ml-2 font-bold">({sharePct}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-red-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(5, sharePct))}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {Object.keys(data.expenseByCategory || {}).length === 0 && (
              <p className="text-center py-6 text-sm font-semibold text-slate-400">No expenses recorded for this period.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfitLossView;
