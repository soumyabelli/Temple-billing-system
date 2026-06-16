import { useMemo, useState } from "react";

const DonationFilters = ({ categories, onApplyFilters }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Donation Types");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");

  const statusOptions = [
    "All Statuses",
    "Completed",
    "Pending",
    "Failed",
  ];

  const categoryOptions = useMemo(
    () => ["All Donation Types", ...(categories || [])],
    [categories]
  );

  const handleApply = () => {
    onApplyFilters({
      searchTerm,
      category: selectedCategory,
      status: selectedStatus,
    });
  };

  return (
    <div className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl text-white">
      <h2 className="text-2xl font-semibold">Donation Filters</h2>
      <p className="mt-2 text-slate-400">Slice live donation data by donor, type and status.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          type="text"
          placeholder="Search donor / receipt"
          className="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
        >
          {categoryOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <button
          onClick={handleApply}
          className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-400 px-5 py-3 font-semibold text-slate-950 transition hover:opacity-95"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default DonationFilters;
