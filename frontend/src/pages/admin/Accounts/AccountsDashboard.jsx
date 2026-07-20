import React, { useState, useEffect } from "react";
import { getDashboardMetrics } from "../../../services/accountService";
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiClock, FiAlertCircle } from "react-icons/fi";

const AccountsDashboard = () => {
  const [metrics, setMetrics] = useState({
    todayIncome: 0,
    todayExpense: 0,
    todayProfit: 0,
    cashInHand: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const data = await getDashboardMetrics();
      setMetrics(data);
    } catch (error) {
      console.error("Failed to fetch dashboard metrics", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  if (loading) {
    return <div className="p-6 text-slate-800 dark:text-white text-center">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Accounts Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/20 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 dark:text-white/80 font-medium">Today's Income</h3>
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FiTrendingUp className="text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{formatCurrency(metrics.todayIncome)}</p>
        </div>

        <div className="bg-white dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/20 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 dark:text-white/80 font-medium">Today's Expense</h3>
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
              <FiTrendingDown className="text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{formatCurrency(metrics.todayExpense)}</p>
        </div>

        <div className="bg-white dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/20 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 dark:text-white/80 font-medium">Today's Profit</h3>
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <FiDollarSign className="text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{formatCurrency(metrics.todayProfit)}</p>
        </div>

        <div className="bg-white dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/20 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 dark:text-white/80 font-medium">Cash In Hand</h3>
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
              <FiDollarSign className="text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{formatCurrency(metrics.cashInHand)}</p>
        </div>

        <div className="bg-white dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/20 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 dark:text-white/80 font-medium">Pending Approvals</h3>
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
              <FiAlertCircle className="text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{metrics.pendingPayments}</p>
        </div>
      </div>
      
      {/* Charts can be added here later */}
    </div>
  );
};

export default AccountsDashboard;
