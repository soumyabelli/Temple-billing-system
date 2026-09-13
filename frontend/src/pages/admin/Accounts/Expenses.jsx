import React, { useState, useEffect } from "react";
import { FiSearch, FiFilter, FiDownload, FiChevronLeft, FiChevronRight, FiCalendar, FiRefreshCw } from "react-icons/fi";
import { BiTrendingDown, BiMoney, BiLibrary, BiCheckCircle } from "react-icons/bi";
import { toast } from "react-toastify";
import { getTransactions } from "../../../services/accountService";

const Expenses = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("All Expenses");
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("All Payment Methods");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const apiData = await getTransactions({ transactionType: "Debit" }).catch(() => []);
      
      // Load saved manual entries from localStorage (Debit vouchers created in ManualEntriesView)
      const savedManual = localStorage.getItem("templeManualEntries_v1");
      const manualEntries = savedManual ? JSON.parse(savedManual) : [];
      
      // Map manual entries to match transaction structure
      const formattedManual = manualEntries
        .filter((item) => !item.entryType || item.entryType === "Debit")
        .map((item) => ({
          _id: item.id,
          date: item.date,
          description: item.whereSpent || item.description,
          category: item.category || "General Expense",
          source: "Manual Entry",
          paymentMethod: item.paymentMethod || "Cash",
          billNo: item.id,
          amount: Number(item.amount) || 0,
          status: item.status === "Reflected on Debits" ? "Completed" : item.status || "Completed",
          receiptName: item.receiptName,
          receiptPreview: item.receiptPreview,
        }));

      // Combine API transactions & local manual entries seamlessly
      const combined = [...(apiData || []), ...formattedManual];
      setTransactions(combined);
    } catch (error) {
      toast.error("Failed to load expense transactions");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "All Expenses",
    "Inventory Purchase",
    "Salary",
    "Repairs",
    "Maintenance",
    "Electricity",
    "Water",
    "Cleaning",
    "Office",
    "Miscellaneous"
  ];

  const matchCategory = (t, cat) => {
    if (!cat || cat === "All Expenses") return true;
    const catLower = cat.toLowerCase().trim();
    const tCategory = (t.category || "").toLowerCase().trim();
    const tSource = (t.source || "").toLowerCase().trim();
    const tDesc = (t.description || "").toLowerCase().trim();

    if (tCategory.includes(catLower) || tSource.includes(catLower) || tDesc.includes(catLower)) return true;

    // Loose Synonyms & Mappings
    if (catLower === "salary" && (tCategory.includes("payroll") || tSource.includes("payroll") || tDesc.includes("staff") || tDesc.includes("wage"))) return true;
    if (catLower === "inventory purchase" && (tCategory.includes("inventory") || tSource.includes("inventory") || tDesc.includes("stock") || tDesc.includes("item"))) return true;
    if (catLower === "repairs" && (tCategory.includes("repair") || tSource.includes("repair") || tDesc.includes("fix"))) return true;
    if (catLower === "maintenance" && (tCategory.includes("maintenance") || tSource.includes("maintenance") || tDesc.includes("upkeep"))) return true;
    if (catLower === "cleaning" && (tCategory.includes("clean") || tSource.includes("clean") || tDesc.includes("sanitat"))) return true;

    return false;
  };

  // Live Filtered Transactions
  const filteredData = transactions.filter((t) => {
    const isCategoryMatch = matchCategory(t, filterCategory);
    const isPaymentMatch = paymentMethod === "All Payment Methods" || t.paymentMethod === paymentMethod;
    const isSearchMatch =
      !searchTerm.trim() ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.source?.toLowerCase().includes(searchTerm.toLowerCase());

    let isDateMatch = true;
    if (fromDate) {
      isDateMatch = isDateMatch && new Date(t.date) >= new Date(fromDate);
    }
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      isDateMatch = isDateMatch && new Date(t.date) <= end;
    }

    return isCategoryMatch && isPaymentMatch && isSearchMatch && isDateMatch;
  });

  // Dynamic Live Metrics based on filtered data
  const totalExpenses = filteredData.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const cashExpenses = filteredData.filter((t) => t.paymentMethod === "Cash").reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const bankExpenses = filteredData.filter((t) => t.paymentMethod === "Bank Transfer" || t.paymentMethod === "System" || t.paymentMethod === "UPI" || t.paymentMethod === "Card").reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const paidBills = filteredData.filter((t) => t.status === "Completed" || t.status === "Approved").length;

  const getCategoryCount = (cat) => {
    if (cat === "All Expenses") return transactions.length;
    return transactions.filter((t) => matchCategory(t, cat)).length;
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const handleExportCSV = () => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += `Expense Report - Category: ${filterCategory}\r\n`;
      csvContent += `Generated On: ${new Date().toLocaleString()}\r\n\r\n`;
      csvContent += "Date,Description,Category,Payment Method,Bill No,Amount (Rs),Status\r\n";

      filteredData.forEach((t) => {
        const dateStr = new Date(t.date).toLocaleDateString("en-GB");
        const billNo = `${(t.category || "EXP").substring(0, 3).toUpperCase()}/2026/${t._id ? t._id.substring(t._id.length - 3) : "000"}`;
        csvContent += `"${dateStr}","${t.description || t.source || "-"}","${t.category}","${t.paymentMethod || "System"}","${billNo}",${t.amount},"${t.status}"\r\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Expenses_${filterCategory.replace(/\s+/g, "_")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${filterCategory} expenses CSV`);
    } catch (err) {
      toast.error("Failed to export CSV");
    }
  };

  return (
    <div className="p-4 md:p-8 bg-[#faf9f7] dark:bg-[#0f172a] dark:text-slate-200 min-h-screen font-sans">
      {/* Top Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1d1b19] dark:text-slate-200">Expenses</h1>
          <p className="text-sm text-[#5c6675]">Accounts & Finance &gt; Expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchExpenses}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 cursor-pointer"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-amber-500/25 cursor-pointer"
          >
            <FiDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Category Tabs Bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => {
          const isSelected = filterCategory === cat;
          const count = getCategoryCount(cat);
          return (
            <button
              key={cat}
              onClick={() => {
                setFilterCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 border ${
                isSelected
                  ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white border-amber-500 shadow-md shadow-amber-500/30 scale-105"
                  : "bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700 hover:bg-amber-500/10 hover:border-amber-500/40"
              }`}
            >
              <span>{cat}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                  isSelected ? "bg-white/25 text-white" : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Date & Filter Controls Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6 bg-white/70 dark:bg-slate-900/70 p-4 rounded-2xl border border-white/80 dark:border-slate-800 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <FiCalendar className="text-amber-500 text-sm" />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            placeholder="From Date"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            placeholder="To Date"
          />
        </div>

        <select
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
          value={paymentMethod}
          onChange={(e) => {
            setPaymentMethod(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option>All Payment Methods</option>
          <option>Cash</option>
          <option>UPI</option>
          <option>Card</option>
          <option>Bank Transfer</option>
          <option>System</option>
        </select>

        <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 flex-grow max-w-md">
          <FiSearch className="text-slate-400 mr-2 text-sm" />
          <input
            type="text"
            placeholder="Search expenses by description or category..."
            className="bg-transparent border-none outline-none text-xs w-full text-slate-700 dark:text-slate-200 font-medium"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {(fromDate || toDate || paymentMethod !== "All Payment Methods" || searchTerm || filterCategory !== "All Expenses") && (
          <button
            type="button"
            onClick={() => {
              setFilterCategory("All Expenses");
              setPaymentMethod("All Payment Methods");
              setSearchTerm("");
              setFromDate("");
              setToDate("");
              setCurrentPage(1);
            }}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-500/10 px-3 py-2 rounded-xl transition cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Dynamic Live Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl border border-white/80 dark:border-slate-800 shadow-sm backdrop-blur-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
              {filterCategory === "All Expenses" ? "Total Expenses" : `${filterCategory} Expenses`}
            </p>
            <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
              ₹{totalExpenses.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center">
            <BiTrendingDown size={22} />
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl border border-white/80 dark:border-slate-800 shadow-sm backdrop-blur-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">Cash Expenses</p>
            <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
              ₹{cashExpenses.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <BiMoney size={22} />
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl border border-white/80 dark:border-slate-800 shadow-sm backdrop-blur-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">Bank / Online Expenses</p>
            <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
              ₹{bankExpenses.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BiLibrary size={22} />
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl border border-white/80 dark:border-slate-800 shadow-sm backdrop-blur-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">Paid Expenses</p>
            <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{paidBills}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <BiCheckCircle size={22} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-sm border border-white/80 dark:border-slate-800 overflow-hidden backdrop-blur-xl">
        <div className="px-6 py-4 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {filterCategory === "All Expenses" ? "Expense Transactions" : `${filterCategory} Transactions`}
          </h2>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {filteredData.length} records found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-xs uppercase font-bold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Description</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Payment Method</th>
                <th className="px-6 py-3.5">Bill No.</th>
                <th className="px-6 py-3.5 text-right">Amount (₹)</th>
                <th className="px-6 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-400 font-semibold">
                    Loading expenses...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-400 font-semibold">
                    No expense transactions found for {filterCategory}
                  </td>
                </tr>
              ) : (
                paginatedData.map((t) => (
                  <tr key={t._id} className="hover:bg-amber-500/5 transition">
                    <td className="px-6 py-3.5 whitespace-nowrap font-medium text-slate-700 dark:text-slate-200">
                      {new Date(t.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-900 dark:text-slate-100">{t.description || t.source || "-"}</td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                        {t.category || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-medium">{t.paymentMethod || "System"}</td>
                    <td className="px-6 py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {`${(t.category || "EXP").substring(0, 3).toUpperCase()}/2026/${t._id ? t._id.substring(t._id.length - 3) : "000"}`}
                    </td>
                    <td className="px-6 py-3.5 text-right font-extrabold text-slate-900 dark:text-slate-100">
                      ₹{(Number(t.amount) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          t.status === "Completed" || t.status === "Approved"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                            : t.status === "Pending Approval"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {t.status === "Completed" ? "Paid" : t.status === "Pending Approval" ? "Pending" : t.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
          </p>
          <div className="flex gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <FiChevronLeft size={16} />
            </button>
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === "number" && setCurrentPage(page)}
                disabled={page === "..."}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition ${
                  currentPage === page
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm"
                    : page === "..."
                    ? "text-slate-400 cursor-default"
                    : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
