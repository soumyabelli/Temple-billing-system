import React, { useState, useEffect } from "react";
import { MdOutlineSearch, MdOutlineFilterAlt, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { getAllBookings } from "../../services/bookingService";

const formatCurrency = (value) => `₹ ${Number(value || 0).toLocaleString()}`;

const statusTheme = {
  Confirmed: "bg-[#e8f6e9] text-[#187a3b]",
  Pending: "bg-[#fff1df] text-[#ea580c]",
  Completed: "bg-[#e9efff] text-[#2454c9]",
  Cancelled: "bg-[#fde8e8] text-[#a12525]",
};

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await getAllBookings({
        page,
        limit,
        search: query,
        status: statusFilter,
        dateRange: dateFilter
      });
      setBookings(response.bookings || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Failed to load all bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, statusFilter, dateFilter]);

  // Handle search with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      loadData();
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  return (
    <div className="mt-5 space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[42px] leading-tight font-bold text-[#15141f]">All Pooja Bookings</h1>
          <p className="mt-1 text-[20px] text-[#5d6674]">View complete booking history and detailed records.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#ece8e1] bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-11 items-center gap-2 rounded-xl border border-[#ece8e1] bg-[#faf9f7] px-3 text-[#858b96]">
              <MdOutlineSearch size={20} />
              <input 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                className="w-[240px] bg-transparent text-[15px] text-[#242938] outline-none placeholder:text-[#9ca3af]" 
                placeholder="Search ID, Name or Pooja..." 
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-11 rounded-xl border border-[#ece8e1] bg-[#faf9f7] px-3 text-[15px] text-[#4b5563] outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              className="h-11 rounded-xl border border-[#ece8e1] bg-[#faf9f7] px-3 text-[15px] text-[#4b5563] outline-none"
            >
              <option value="">All Time</option>
              <option value="Today">Today</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="This Month">This Month</option>
            </select>
          </div>
        </div>

        <div className="overflow-auto min-h-[400px]">
          <table className="w-full min-w-[920px] text-[15px]">
            <thead className="bg-[#faf9f7] text-[#2b3240]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Booking ID</th>
                <th className="px-4 py-3 text-left font-semibold">Devotee</th>
                <th className="px-4 py-3 text-left font-semibold">Pooja</th>
                <th className="px-4 py-3 text-left font-semibold">Booking Date</th>
                <th className="px-4 py-3 text-left font-semibold">Pooja Date</th>
                <th className="px-4 py-3 text-left font-semibold">Slot</th>
                <th className="px-4 py-3 text-left font-semibold">Amount</th>
                <th className="px-4 py-3 text-left font-semibold">Payment</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-gray-500">Loading bookings...</td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-gray-500">No bookings found.</td>
                </tr>
              ) : (
                bookings.map((row) => (
                  <tr key={row._id} className="border-t border-[#f0ece6] text-[#2f3645]">
                    <td className="px-4 py-3">BK{String(row._id).slice(-6).toUpperCase()}</td>
                    <td className="px-4 py-3 font-medium">{row.devoteeName || row.customerName}</td>
                    <td className="px-4 py-3">{row.service}</td>
                    <td className="px-4 py-3">{new Date(row.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{row.datetime ? new Date(row.datetime).toLocaleDateString() : "-"}</td>
                    <td className="px-4 py-3">{row.datetime ? new Date(row.datetime).toLocaleTimeString() : "-"}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(row.amount)}</td>
                    <td className="px-4 py-3">{row.paymentMethod || "UPI"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-lg px-2.5 py-1 text-[13px] font-semibold ${statusTheme[row.status] || statusTheme.Pending}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-[#f0ece6] pt-4">
            <span className="text-sm text-[#5d6674]">
              Page <span className="font-semibold text-[#15141f]">{page}</span> of <span className="font-semibold text-[#15141f]">{totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="flex items-center gap-1 rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-sm font-medium text-[#374151] hover:bg-[#f9fafb] disabled:opacity-50"
              >
                <MdChevronLeft size={18} /> Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="flex items-center gap-1 rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-sm font-medium text-[#374151] hover:bg-[#f9fafb] disabled:opacity-50"
              >
                Next <MdChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllBookings;
