import React, { useState } from "react";
import { addBankInterest } from "../../../services/accountService";
import { toast } from "react-toastify";

const BankInterest = () => {
  const [formData, setFormData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await addBankInterest({ ...formData, amount: Number(formData.amount) });
      toast.success("Bank Interest recorded successfully!");
      setFormData({ amount: "", date: new Date().toISOString().split("T")[0], description: "" });
    } catch (error) {
      toast.error("Failed to record bank interest.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Record Bank Interest</h2>

      <div className="bg-white dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/20 p-6 rounded-2xl shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-white mb-1">Amount (₹)</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Enter interest amount"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-white mb-1">Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-white mb-1">Description (Optional)</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="E.g., Q3 Savings Interest"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {loading ? "Recording..." : "Record Interest"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BankInterest;
