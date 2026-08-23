import React, { useState, useEffect } from "react";
import { getExpenseCategories, createExpenseCategory, getDashboardMetrics } from "../../../services/accountService";
import { toast } from "react-toastify";
import { FaRupeeSign } from "react-icons/fa";
import { FiTrendingUp, FiTrendingDown, FiClock, FiAlertCircle } from "react-icons/fi";

const ExpenseCategories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    todayIncome: 0,
    todayExpense: 0,
    todayProfit: 0,
    cashInHand: 0,
    pendingPayments: 0,
  });

  useEffect(() => {
    fetchCategories();
    fetchMetrics();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getExpenseCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch expense categories", error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const data = await getDashboardMetrics();
      setMetrics(data);
    } catch (error) {
      console.error("Failed to fetch dashboard metrics", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return toast.error("Name is required");

    try {
      setLoading(true);
      await createExpenseCategory({ name, description });
      toast.success("Category created successfully!");
      setName("");
      setDescription("");
      fetchCategories();
    } catch (error) {
      toast.error("Failed to create category");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Accounts Dashboard & Heads</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div className="bg-temple-100 dark:bg-temple-100/10 backdrop-blur-md border border-slate-200 dark:border-white/20 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 dark:text-white/80 font-medium">Today's Income</h3>
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FiTrendingUp className="text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{formatCurrency(metrics.todayIncome)}</p>
        </div>

        <div className="bg-temple-100 dark:bg-temple-100/10 backdrop-blur-md border border-slate-200 dark:border-white/20 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 dark:text-white/80 font-medium">Today's Expense</h3>
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
              <FiTrendingDown className="text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{formatCurrency(metrics.todayExpense)}</p>
        </div>

        <div className="bg-temple-100 dark:bg-temple-100/10 backdrop-blur-md border border-slate-200 dark:border-white/20 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 dark:text-white/80 font-medium">Today's Profit</h3>
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <FaRupeeSign className="text-lg" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{formatCurrency(metrics.todayProfit)}</p>
        </div>

        <div className="bg-temple-100 dark:bg-temple-100/10 backdrop-blur-md border border-slate-200 dark:border-white/20 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 dark:text-white/80 font-medium">Cash In Hand</h3>
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
              <FiClock className="text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{formatCurrency(metrics.cashInHand)}</p>
        </div>

        <div className="bg-temple-100 dark:bg-temple-100/10 backdrop-blur-md border border-slate-200 dark:border-white/20 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 dark:text-white/80 font-medium">Pending Approvals</h3>
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
              <FiAlertCircle className="text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{metrics.pendingPayments}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-temple-100 dark:bg-temple-100/10 backdrop-blur-md border border-slate-200 dark:border-white/20 p-6 rounded-2xl shadow-xl h-fit">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Add New Category</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-temple-100/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Category Name (e.g. Utility Bills)"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-temple-100/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Description (Optional)"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-6 rounded-lg shadow transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-temple-100 dark:bg-temple-100/10 backdrop-blur-md border border-slate-200 dark:border-white/20 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-200 dark:border-white/10">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Existing Categories</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-800 dark:text-white">
              <thead className="bg-slate-100 dark:bg-temple-100/10 text-slate-600 dark:text-white/90">
                <tr>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Description</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-slate-500 dark:text-white/60">No categories found</td>
                  </tr>
                ) : (
                  categories.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-temple-100/5 transition-colors">
                      <td className="px-6 py-4 font-medium">{c.name}</td>
                      <td className="px-6 py-4">{c.description || "-"}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCategories;
