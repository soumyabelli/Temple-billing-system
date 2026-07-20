import React, { useState, useEffect } from "react";
import { getExpenseCategories, createExpenseCategory } from "../../../services/accountService";
import { toast } from "react-toastify";

const ExpenseCategories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getExpenseCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch expense categories", error);
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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Expense Categories Management</h2>

      <div className="bg-white dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/20 p-6 rounded-2xl shadow-xl">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Add New Category</h3>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Category Name (e.g. Utility Bills)"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Description (Optional)"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-6 rounded-lg shadow transition-colors disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/20 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-slate-800 dark:text-white">
          <thead className="bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/90">
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
                <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
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
  );
};

export default ExpenseCategories;
