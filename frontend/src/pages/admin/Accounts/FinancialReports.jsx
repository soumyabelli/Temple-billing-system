import React, { useState, useEffect, useCallback } from "react";
import { getMonthlyReport, getAnnualReport } from "../../../services/accountService";
import { useAuth } from "../../../context/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FiDownload, FiCalendar, FiFilter, FiRefreshCw, FiTrendingUp, FiTrendingDown, FiDollarSign } from "react-icons/fi";
import { toast } from "react-toastify";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

// Helper functions for date formatting
const getFirstDayOfCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
};

const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateForDisplay = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const FinancialReports = () => {
  const { user } = useAuth();
  const role = user?.role;
  const [isExporting, setIsExporting] = useState(false);
  const [monthlyData, setMonthlyData] = useState([]);
  const [annualData, setAnnualData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Date Range state default to current month
  const [fromDate, setFromDate] = useState(getFirstDayOfCurrentMonth());
  const [toDate, setToDate] = useState(getTodayDate());
  const [activePreset, setActivePreset] = useState("currentMonth");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = { fromDate, toDate };
      const [monthlyRes, annualRes] = await Promise.all([
        getMonthlyReport(params).catch(() => []),
        getAnnualReport(params).catch(() => null)
      ]);

      // Load saved manual entries from localStorage
      const savedManual = localStorage.getItem("templeManualEntries_v1");
      const manualEntries = savedManual ? JSON.parse(savedManual) : [];
      
      // Filter manual entries by date range
      const filteredManual = manualEntries.filter((item) => {
        if (!item.date) return true;
        const itemDate = new Date(item.date);
        if (isNaN(itemDate.getTime())) return true;
        if (fromDate && itemDate < new Date(fromDate)) return false;
        if (toDate) {
          const end = new Date(toDate);
          end.setHours(23, 59, 59, 999);
          if (itemDate > end) return false;
        }
        return true;
      });

      let manualExpenseTotal = 0;
      let manualIncomeTotal = 0;
      const manualExpenseByCategory = {};

      filteredManual.forEach((item) => {
        const amt = Number(item.amount) || 0;
        const isDebit = !item.entryType || item.entryType === "Debit";
        if (isDebit) {
          manualExpenseTotal += amt;
          const cat = item.category || item.whereSpent || "Manual Expense";
          manualExpenseByCategory[cat] = (manualExpenseByCategory[cat] || 0) + amt;
        } else {
          manualIncomeTotal += amt;
        }
      });

      // Update annual report totals
      const baseAnnual = annualRes || {
        totalIncome: 0,
        totalExpense: 0,
        netProfit: 0,
        incomeBySource: {},
        expenseByCategory: {}
      };

      const combinedAnnual = {
        ...baseAnnual,
        totalIncome: (baseAnnual.totalIncome || 0) + manualIncomeTotal,
        totalExpense: (baseAnnual.totalExpense || 0) + manualExpenseTotal,
        netProfit: ((baseAnnual.totalIncome || 0) + manualIncomeTotal) - ((baseAnnual.totalExpense || 0) + manualExpenseTotal),
        expenseByCategory: {
          ...(baseAnnual.expenseByCategory || {}),
        }
      };

      Object.entries(manualExpenseByCategory).forEach(([cat, val]) => {
        combinedAnnual.expenseByCategory[cat] = (combinedAnnual.expenseByCategory[cat] || 0) + val;
      });

      // Update monthly chart data if applicable
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      let combinedMonthly = Array.isArray(monthlyRes) && monthlyRes.length === 12
        ? monthlyRes.map(m => ({ ...m }))
        : monthNames.map(m => ({ month: m, income: 0, expense: 0, netBalance: 0 }));

      filteredManual.forEach((item) => {
        const amt = Number(item.amount) || 0;
        const itemDate = new Date(item.date);
        if (!isNaN(itemDate.getTime())) {
          const mIdx = itemDate.getMonth();
          const isDebit = !item.entryType || item.entryType === "Debit";
          if (isDebit) {
            combinedMonthly[mIdx].expense += amt;
          } else {
            combinedMonthly[mIdx].income += amt;
          }
          combinedMonthly[mIdx].netBalance = combinedMonthly[mIdx].income - combinedMonthly[mIdx].expense;
        }
      });

      setMonthlyData(combinedMonthly);
      setAnnualData(combinedAnnual);
    } catch (error) {
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Preset handlers
  const handlePresetCurrentMonth = () => {
    setFromDate(getFirstDayOfCurrentMonth());
    setToDate(getTodayDate());
    setActivePreset("currentMonth");
  };

  const handlePresetLastMonth = () => {
    const now = new Date();
    const prevMonthFirst = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthLast = new Date(now.getFullYear(), now.getMonth(), 0);

    const format = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    setFromDate(format(prevMonthFirst));
    setToDate(format(prevMonthLast));
    setActivePreset("lastMonth");
  };

  const handlePresetThisYear = () => {
    const year = new Date().getFullYear();
    setFromDate(`${year}-01-01`);
    setToDate(getTodayDate());
    setActivePreset("thisYear");
  };

  const handlePresetAllTime = () => {
    setFromDate("");
    setToDate("");
    setActivePreset("allTime");
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.setTextColor(40, 40, 40);
      doc.text("Temple Billing - Financial Audit Report", 14, 20);
      
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      const rangeText = fromDate && toDate 
        ? `Report Period: ${formatDateForDisplay(fromDate)} to ${formatDateForDisplay(toDate)}`
        : "Report Period: All Time";
      doc.text(rangeText, 14, 28);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 34);
      
      if (annualData) {
        doc.setFontSize(14);
        doc.setTextColor(20, 20, 20);
        doc.text("Financial Highlights & Summary", 14, 46);
        
        doc.setFontSize(11);
        doc.setTextColor(0, 128, 0); 
        doc.text(`Total Income: Rs ${(annualData.totalIncome || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 14, 56);
        
        doc.setTextColor(200, 0, 0); 
        doc.text(`Total Expense: Rs ${(annualData.totalExpense || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 14, 64);
        
        doc.setTextColor(0, 102, 204); 
        doc.text(`Net Balance / Profit: Rs ${(annualData.netProfit || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 14, 72);
      }

      const tableColumn = ["Month", "Income (Rs)", "Expense (Rs)", "Net Balance (Rs)"];
      const tableRows = (monthlyData || []).map(row => [
        row.month,
        (row.income || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
        (row.expense || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
        (row.netBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })
      ]);

      autoTable(doc, {
        startY: 84,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [217, 119, 6], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 5 },
      });

      let finalY = doc.lastAutoTable.finalY;

      if (annualData) {
        doc.setFontSize(14);
        doc.setTextColor(20, 20, 20);
        doc.text("Income Sources Breakdown", 14, finalY + 15);

        const incomeColumns = ["Income Source", "Amount (Rs)"];
        const incomeRows = Object.entries(annualData.incomeBySource || {}).map(([key, val]) => [
          key,
          (val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })
        ]);

        autoTable(doc, {
          startY: finalY + 20,
          head: [incomeColumns],
          body: incomeRows,
          theme: 'grid',
          headStyles: { fillColor: [16, 185, 129], textColor: 255 },
          styles: { fontSize: 10, cellPadding: 4 },
        });

        let finalY2 = doc.lastAutoTable.finalY;

        doc.setFontSize(14);
        doc.setTextColor(20, 20, 20);
        doc.text("Expense Categories Breakdown", 14, finalY2 + 15);

        const expenseColumns = ["Expense Category", "Amount (Rs)"];
        const expenseRows = Object.entries(annualData.expenseByCategory || {}).map(([key, val]) => [
          key,
          (val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })
        ]);

        autoTable(doc, {
          startY: finalY2 + 20,
          head: [expenseColumns],
          body: expenseRows,
          theme: 'grid',
          headStyles: { fillColor: [239, 68, 68], textColor: 255 },
          styles: { fontSize: 10, cellPadding: 4 },
        });
      }

      doc.save(`Financial_Report_${fromDate || "All"}_to_${toDate || "Time"}.pdf`);
      toast.success("Financial Audit Report PDF Downloaded Successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += `Financial Report Period: ${fromDate || "All"} to ${toDate || "All"}\r\n`;
      csvContent += `Generated On: ${new Date().toLocaleString()}\r\n\r\n`;

      if (annualData) {
        csvContent += `Total Income,Rs ${annualData.totalIncome || 0}\r\n`;
        csvContent += `Total Expense,Rs ${annualData.totalExpense || 0}\r\n`;
        csvContent += `Net Profit / Balance,Rs ${annualData.netProfit || 0}\r\n\r\n`;
      }

      csvContent += "Month,Income (Rs),Expense (Rs),Net Balance (Rs)\r\n";
      (monthlyData || []).forEach(row => {
        csvContent += `${row.month},${row.income || 0},${row.expense || 0},${row.netBalance || 0}\r\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Financial_Report_${fromDate || "All"}_to_${toDate || "Time"}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV Report Downloaded Successfully");
    } catch (err) {
      toast.error("Failed to export CSV");
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-slate-900/95 dark:text-slate-200 dark:border-slate-700 p-3.5 rounded-xl shadow-xl border border-amber-200/50 backdrop-blur-md">
          <p className="font-bold text-slate-800 dark:text-slate-200 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
              {entry.name}: ₹{(entry.value || 0).toLocaleString("en-IN")}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-slate-900/95 dark:text-slate-200 dark:border-slate-700 p-3.5 rounded-xl shadow-xl border border-amber-200/50 backdrop-blur-md">
          <p className="font-bold text-slate-800 dark:text-slate-200">{payload[0].name}</p>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1">
            ₹{(payload[0].value || 0).toLocaleString("en-IN")}
          </p>
        </div>
      );
    }
    return null;
  };

  // Format data for Pie Charts
  const incomePieData = annualData ? Object.entries(annualData.incomeBySource || {}).map(([key, val]) => ({ name: key, value: val })).filter(item => item.value > 0) : [];
  const expensePieData = annualData ? Object.entries(annualData.expenseByCategory || {}).map(([key, val]) => ({ name: key, value: val })).filter(item => item.value > 0) : [];

  return (
    <div className="p-4 md:p-8 bg-[#faf9f7] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 min-h-screen font-sans">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Financial Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Accounts & Finance &gt; Reports
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer"
          >
            <FiDownload /> Export CSV
          </button>
          <button 
            type="button"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-amber-500/25 hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <FiDownload /> {isExporting ? "Exporting PDF..." : "Export Audit PDF"}
          </button>
        </div>
      </div>

      {/* Date Range Filter Bar */}
      <div className="rounded-2xl border border-white/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5 shadow-sm backdrop-blur-xl mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-sm">
            <FiFilter className="text-amber-500 text-lg" />
            <span>Report Date Range Filter</span>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePresetCurrentMonth}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePreset === "currentMonth"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-500/10 hover:text-amber-600"
              }`}
            >
              Current Month
            </button>
            <button
              type="button"
              onClick={handlePresetLastMonth}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePreset === "lastMonth"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-500/10 hover:text-amber-600"
              }`}
            >
              Last Month
            </button>
            <button
              type="button"
              onClick={handlePresetThisYear}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePreset === "thisYear"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-500/10 hover:text-amber-600"
              }`}
            >
              This Year
            </button>
            <button
              type="button"
              onClick={handlePresetAllTime}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePreset === "allTime"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-500/10 hover:text-amber-600"
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end pt-2 border-t border-amber-200/40 dark:border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
              <FiCalendar className="text-amber-500" /> From Date:
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setActivePreset("custom");
              }}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
              <FiCalendar className="text-amber-500" /> To Date:
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setActivePreset("custom");
              }}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="flex gap-2 sm:col-span-2 md:col-span-1 lg:col-span-2">
            <button
              type="button"
              onClick={fetchData}
              className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs px-4 py-2.5 shadow-md shadow-amber-500/20 hover:scale-105 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} /> Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Summary Highlight Cards */}
      {annualData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="rounded-2xl border border-white/80 dark:border-slate-800 bg-gradient-to-br from-emerald-500/10 via-white/70 to-emerald-500/5 dark:from-emerald-950/30 dark:via-slate-900/60 dark:to-slate-900 p-5 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Total Income
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <FiTrendingUp className="text-lg" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
              ₹{(annualData.totalIncome || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {fromDate && toDate ? `${formatDateForDisplay(fromDate)} – ${formatDateForDisplay(toDate)}` : "All Time Collections"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/80 dark:border-slate-800 bg-gradient-to-br from-rose-500/10 via-white/70 to-rose-500/5 dark:from-rose-950/30 dark:via-slate-900/60 dark:to-slate-900 p-5 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                Total Expense
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400">
                <FiTrendingDown className="text-lg" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
              ₹{(annualData.totalExpense || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {fromDate && toDate ? `${formatDateForDisplay(fromDate)} – ${formatDateForDisplay(toDate)}` : "All Time Expenses"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/80 dark:border-slate-800 bg-gradient-to-br from-amber-500/10 via-white/70 to-amber-500/5 dark:from-amber-950/30 dark:via-slate-900/60 dark:to-slate-900 p-5 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                Net Profit / Balance
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <FiDollarSign className="text-lg" />
              </div>
            </div>
            <p className={`mt-2 text-2xl font-extrabold ${(annualData.netProfit || 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              ₹{(annualData.netProfit || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Net balance for selected range
            </p>
          </div>

          <div className="rounded-2xl border border-white/80 dark:border-slate-800 bg-gradient-to-br from-blue-500/10 via-white/70 to-blue-500/5 dark:from-blue-950/30 dark:via-slate-900/60 dark:to-slate-900 p-5 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                Selected Period
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <FiCalendar className="text-lg" />
              </div>
            </div>
            <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
              {fromDate ? formatDateForDisplay(fromDate) : "Start"}
              <span className="text-amber-500 mx-1">→</span>
              {toDate ? formatDateForDisplay(toDate) : "End"}
            </p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Active Date Filter
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-600 dark:text-slate-300 font-semibold bg-white/60 dark:bg-slate-900/60 rounded-3xl backdrop-blur-xl">
          <FiRefreshCw className="animate-spin text-3xl mx-auto text-amber-500 mb-2" />
          Loading report charts and analytical data...
        </div>
      ) : (
        <>
          {/* Row 1: Monthly Bar Chart */}
          <div className="bg-white/80 dark:bg-slate-900/80 p-6 rounded-3xl shadow-sm border border-white/80 dark:border-slate-800 mb-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Monthly Income vs Expense
              </h3>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-amber-500/10 dark:bg-amber-400/10 px-3 py-1 rounded-full border border-amber-500/20">
                Bar Chart Overview
              </span>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(value) => `₹${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 2: Breakdown Pie Charts */}
          {annualData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/80 dark:bg-slate-900/80 p-6 rounded-3xl shadow-sm border border-white/80 dark:border-slate-800 backdrop-blur-xl">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">
                  Income Sources Distribution
                </h3>
                <div className="h-[300px] w-full flex items-center justify-center">
                  {incomePieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={incomePieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                        >
                          {incomePieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<PieTooltip />} />
                        <Legend layout="vertical" verticalAlign="middle" align="right" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 italic">No income data available for selected period.</p>
                  )}
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 p-6 rounded-3xl shadow-sm border border-white/80 dark:border-slate-800 backdrop-blur-xl">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">
                  Expense Categories Distribution
                </h3>
                <div className="h-[300px] w-full flex items-center justify-center">
                  {expensePieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expensePieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                        >
                          {expensePieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<PieTooltip />} />
                        <Legend layout="vertical" verticalAlign="middle" align="right" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 italic">No expense data available for selected period.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FinancialReports;
