import React, { useState, useEffect } from "react";
import { getExpenseCategories, createManualExpense } from "../../../services/accountService";
import { toast } from "react-toastify";

const ManualEntriesView = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    category: "",
    amount: "",
    description: "",
    paymentMethod: "Cash"
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getExpenseCategories();
        // Assuming we only want manual expense/income heads
        setCategories(cats);
        if (cats.length > 0) setForm(f => ({ ...f, category: cats[0].name }));
      } catch (err) {
        toast.error("Failed to load account heads");
      }
    };
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createManualExpense(form);
      toast.success("Manual entry created successfully!");
      setForm({ ...form, amount: "", description: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create entry");
    }
  };

  return (
    <div className="accountant-view">
      <section className="accountant-view__hero">
        <div>
          <h1>Manual Entries</h1>
          <p>Create manual ledger entries (e.g., Maintenance, Salary, Bank Interest).</p>
        </div>
      </section>

      <section className="accountant-panel mt-6 max-w-2xl mx-auto">
        <div className="accountant-panel__header">
          <h3 className="accountant-panel__title">New Manual Entry</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Account Head</label>
            <select
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 outline-none"
            >
              {categories.map(c => (
                <option key={c._id} value={c.name}>{c.name} ({c.type})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount (Rs)</label>
            <input
              type="number"
              required
              min="1"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
            <select
              required
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 outline-none"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description / Notes</label>
            <textarea
              required
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 outline-none"
            />
          </div>
          <button type="submit" className="accountant-primaryButton w-full mt-4">
            Submit Entry
          </button>
        </form>
      </section>
    </div>
  );
};

export default ManualEntriesView;
