import React, { useState, useEffect } from "react";
import { FaRupeeSign, FaLock, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaSyncAlt, FaHistory } from "react-icons/fa";
import { FiClock, FiCheckSquare } from "react-icons/fi";
import { getDashboardMetrics, submitCashClosing, getTransactions, getShiftSummary } from "../../services/accountService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CashierAccounts = () => {
  const [activeTab, setActiveTab] = useState("daily-cash-book");

  // States
  const [metrics, setMetrics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [shiftSummary, setShiftSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shiftLoading, setShiftLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states for Shift Closing (Cashier counts drawer cash)
  const [physicalCash, setPhysicalCash] = useState("");
  const [notes, setNotes] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [metricsRes, txRes] = await Promise.all([
        getDashboardMetrics(),
        getTransactions({ limit: 10 }).catch(() => [])
      ]);
      setMetrics(metricsRes);
      if (Array.isArray(txRes)) {
        setTransactions(txRes.slice(0, 10));
      }
    } catch (error) {
      console.error("Error loading metrics:", error);
      toast.error("Failed to load collection metrics");
    } finally {
      setLoading(false);
    }
  };

  const loadShiftData = async () => {
    setShiftLoading(true);
    try {
      const summary = await getShiftSummary();
      setShiftSummary(summary);
      
      // If there's already an existing closing today, populate values from it
      if (summary.existingClosing) {
        setPhysicalCash(summary.existingClosing.closingCash?.toString() || "");
        setNotes(summary.existingClosing.notes || "");
      } else {
        // Pre-fill physical cash with expected closing cash for convenience
        const expected = (Number(summary.openingCash) || 0) + (Number(summary.cashCollected) || 0);
        setPhysicalCash(expected.toString());
      }
    } catch (error) {
      console.error("Error loading shift summary:", error);
      toast.error("Failed to load shift closing summary");
    } finally {
      setShiftLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadShiftData();
  }, []);

  // Calculate live closing balance: Opening + Cash Collected
  // (Bank deposit is an Accountant responsibility, not done by Cashier during shift)
  const openingCash = Number(shiftSummary?.openingCash) || 0;
  const cashCollected = Number(shiftSummary?.cashCollected) || 0;
  const autoClosingBalance = Math.max(0, openingCash + cashCollected);

  const enteredPhysical = physicalCash === "" ? autoClosingBalance : Number(physicalCash);
  const discrepancy = enteredPhysical - autoClosingBalance;

  const handleClosingSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        openingCash, // Automatically determined by system
        cashDeposited: 0, // Handled by Accountant
        closingCash: enteredPhysical, // Auto closing balance or verified physical count
        notes: notes.trim()
      };
      const res = await submitCashClosing(payload);
      toast.success(res.message || "Shift closing automatically entered into accounts!");
      await loadShiftData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit cash closing");
    } finally {
      setSubmitting(false);
    }
  };

  const renderTransactionsTable = (data) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-800">
        <thead className="bg-slate-100 dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 text-slate-600">
          <tr>
            <th className="px-6 py-4 font-semibold">Date</th>
            <th className="px-6 py-4 font-semibold">Type</th>
            <th className="px-6 py-4 font-semibold">Source / Category</th>
            <th className="px-6 py-4 font-semibold">Amount</th>
            <th className="px-6 py-4 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No transactions found</td>
            </tr>
          ) : (
            data.map((t) => (
              <tr key={t._id} className="hover:bg-slate-50 dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700">
                <td className="px-6 py-4">{new Date(t.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${t.transactionType === "Credit" ? "bg-green-100 dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 text-green-700" : "bg-red-100 dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 text-red-700"}`}>
                    {t.transactionType}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium">{t.source}</p>
                  <p className="text-xs text-slate-500">{t.category}</p>
                </td>
                <td className="px-6 py-4 font-bold">₹{t.amount?.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${t.status === "Completed" ? "bg-green-100 dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 text-green-700" :
                    t.status === "Pending Approval" ? "bg-amber-100 dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 text-amber-700" :
                    "bg-red-100 dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 text-red-700"
                  }`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <ToastContainer position="top-right" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Cashier Accounts & Shift</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track live daily billing collections and automate shift closing balances directly into accounts.
          </p>
        </div>
        {activeTab === "cash-closing" && (
          <button
            onClick={loadShiftData}
            disabled={shiftLoading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors"
          >
            <FaSyncAlt className={shiftLoading ? "animate-spin" : ""} />
            Refresh Shift Data
          </button>
        )}
      </div>

      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700 pb-4 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveTab("daily-cash-book")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "daily-cash-book" ? "bg-amber-500 text-white shadow-sm" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900"}`}
        >
          Daily Collection Summary
        </button>
        <button
          onClick={() => {
            setActiveTab("cash-closing");
            loadShiftData();
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "cash-closing" ? "bg-amber-500 text-white shadow-sm" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900"}`}
        >
          Shift Closing & Accounts Entry
        </button>
      </div>

      <div className="bg-white dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 border border-slate-200 p-6 rounded-2xl shadow-lg min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <>
            {activeTab === "daily-cash-book" && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Today's Summary</h3>
                {metrics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-50 dark:bg-slate-800/60 border border-green-200 dark:border-green-800 p-6 rounded-2xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-lg">
                          <FaRupeeSign className="w-5 h-5" />
                        </div>
                        <h4 className="text-slate-600 dark:text-slate-300 font-medium">Total System Collection</h4>
                      </div>
                      <p className="text-3xl font-bold text-slate-800 dark:text-white">₹{metrics.todayIncome?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                )}
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">Recent Transactions</h4>
                  {renderTransactionsTable(transactions)}
                </div>
              </div>
            )}

            {activeTab === "cash-closing" && (
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Header Information Banner */}
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-4 rounded-xl flex items-start gap-3">
                  <FaInfoCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-900 dark:text-amber-200">
                    <p className="font-semibold mb-0.5">Automated Accounts Shift Closing</p>
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      Opening balance is automatically carried forward from your previous shift. At shift closing time, the closing balance is automatically calculated from billing receipts and posted to the Accounts ledger for Accountant verification.
                    </p>
                  </div>
                </div>

                {/* Existing Submission Status if already submitted today */}
                {shiftSummary?.existingClosing && (
                  <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FaCheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                          Shift Closing Already Recorded in Accounts Today
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Closing Balance: ₹{shiftSummary.existingClosing.closingCash?.toFixed(2)} | Status: <span className="font-bold underline">{shiftSummary.existingClosing.status}</span>
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                      {shiftSummary.existingClosing.status}
                    </span>
                  </div>
                )}

                {/* Shift Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Opening Balance */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 rounded-xl relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Opening Balance</span>
                      <span className="flex items-center gap-1 text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-medium">
                        <FaLock className="w-2.5 h-2.5" /> Auto-loaded
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">₹{openingCash.toFixed(2)}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Carried from previous closing</p>
                  </div>

                  {/* Card 2: Shift Cash Collected */}
                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/60 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-green-300">Shift Cash Collected</span>
                      <span className="text-[10px] bg-green-200 dark:bg-green-900/60 text-green-800 dark:text-green-200 px-1.5 py-0.5 rounded font-medium">
                        ⚡ Live
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">₹{cashCollected.toFixed(2)}</p>
                    <p className="text-[11px] text-green-600 dark:text-green-400 mt-1">
                      From {shiftSummary?.transactionsCount || 0} bills today
                    </p>
                  </div>

                  {/* Card 3: Digital Collections */}
                  <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300">Digital / UPI</span>
                      <span className="text-[10px] bg-purple-200 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 px-1.5 py-0.5 rounded font-medium">
                        Direct Bank
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      ₹{((shiftSummary?.upiCollected || 0) + (shiftSummary?.cardCollected || 0) + (shiftSummary?.bankTransferCollected || 0)).toFixed(2)}
                    </p>
                    <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-1">UPI, Cards & NetBanking</p>
                  </div>

                  {/* Card 4: System Closing Balance */}
                  <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-700 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">System Closing Cash</span>
                      <span className="text-[10px] bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 px-1.5 py-0.5 rounded font-medium">
                        Auto Accounts
                      </span>
                    </div>
                    <p className="text-2xl font-extrabold text-amber-900 dark:text-amber-200">₹{autoClosingBalance.toFixed(2)}</p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                      Opening + Cash Collected
                    </p>
                  </div>
                </div>

                {/* Form to Close Shift & Enter into Accounts */}
                <form onSubmit={handleClosingSubmit} className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl space-y-5">
                  <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
                    <h4 className="font-bold text-slate-800 dark:text-white text-base">Shift Reconciliation & Submission</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Confirm cash drawer reconciliation. Closing balance will be recorded directly into Accounts.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Read-Only Opening Cash Field */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center justify-between">
                        <span>1. Opening Cash (₹)</span>
                        <span className="text-[10px] text-slate-400 font-normal flex items-center gap-1">
                          <FaLock className="w-2.5 h-2.5" /> Auto-populated
                        </span>
                      </label>
                      <input
                        type="text"
                        disabled
                        value={`₹${openingCash.toFixed(2)} (Read-only)`}
                        className="w-full bg-slate-200/70 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-slate-700 dark:text-slate-300 font-semibold cursor-not-allowed"
                      />
                    </div>

                    {/* Read-Only Cash Collected Field */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center justify-between">
                        <span>2. Cash Collected from Bills (₹)</span>
                        <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">Auto-calculated</span>
                      </label>
                      <input
                        type="text"
                        disabled
                        value={`₹${cashCollected.toFixed(2)} (Read-only)`}
                        className="w-full bg-slate-200/70 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-green-700 dark:text-green-400 font-semibold cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Physical Cash Count / Verification */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center justify-between">
                      <span>3. Actual Cash in Drawer (Physical Count ₹)</span>
                      {discrepancy === 0 ? (
                        <span className="text-[11px] text-green-600 font-medium flex items-center gap-1">
                          <FaCheckCircle className="w-3 h-3" /> Exact Match (₹0.00)
                        </span>
                      ) : discrepancy < 0 ? (
                        <span className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                          <FaExclamationTriangle className="w-3 h-3" /> Shortage: -₹{Math.abs(discrepancy).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                          <FaInfoCircle className="w-3 h-3" /> Excess: +₹{discrepancy.toFixed(2)}
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      value={physicalCash}
                      onChange={(e) => setPhysicalCash(e.target.value)}
                      placeholder={autoClosingBalance.toString()}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-slate-800 dark:text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Auto-matched with System Closing Cash: <span className="font-semibold text-slate-700 dark:text-slate-200">₹{autoClosingBalance.toFixed(2)}</span>. Adjust only if physical drawer count differs.
                    </p>
                  </div>

                  {/* Notes & Discrepancy explanation */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Handover Notes / Discrepancy Reason <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows="2"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any handover notes or explain discrepancy if any..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Recording in Accounts...</span>
                        </>
                      ) : (
                        <>
                          <FaCheckCircle className="w-4 h-4" />
                          <span>{shiftSummary?.existingClosing ? "Update Today's Shift Closing in Accounts" : "Close Shift & Automatically Record in Accounts"}</span>
                        </>
                      )}
                    </button>
                    <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                      Upon submission, closing balance is recorded under Accounts and sent to Accountant for verification.
                    </p>
                  </div>
                </form>

                {/* Recent Shift Closings History */}
                {shiftSummary?.recentClosings && shiftSummary.recentClosings.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <FaHistory className="text-slate-600 dark:text-slate-400" />
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">Recent Shift Closings History</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Date</th>
                            <th className="px-4 py-3 font-semibold">Opening</th>
                            <th className="px-4 py-3 font-semibold">Collected</th>
                            <th className="px-4 py-3 font-semibold">Closing Balance</th>
                            <th className="px-4 py-3 font-semibold">Discrepancy</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {shiftSummary.recentClosings.map((c) => (
                            <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="px-4 py-3 font-medium">{new Date(c.date).toLocaleDateString()}</td>
                              <td className="px-4 py-3">₹{c.openingCash?.toFixed(2)}</td>
                              <td className="px-4 py-3 text-green-600 dark:text-green-400 font-medium">₹{c.cashCollected?.toFixed(2)}</td>
                              <td className="px-4 py-3 font-bold">₹{c.closingCash?.toFixed(2)}</td>
                              <td className="px-4 py-3">
                                {c.discrepancy === 0 ? (
                                  <span className="text-slate-500">₹0.00</span>
                                ) : c.discrepancy < 0 ? (
                                  <span className="text-red-600 font-semibold">-₹{Math.abs(c.discrepancy).toFixed(2)}</span>
                                ) : (
                                  <span className="text-blue-600 font-semibold">+₹{c.discrepancy.toFixed(2)}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  c.status === "Verified" ? "bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200" :
                                  c.status === "Disputed" ? "bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200" :
                                  "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200"
                                }`}>
                                  {c.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CashierAccounts;
