import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaCheckCircle, FaClock, FaSearch } from "react-icons/fa";
import templeBg from "../../assets/temple-bg.jpg";
import CashierPageShell from "../../components/cashier/CashierPageShell";
import {
  createBooking,
  fetchBills,
  fetchBookings,
  formatCurrency,
  formatDateTime,
  isToday,
  sumBy,
} from "../../services/cashierService";
import { getPoojaTypes } from "../../services/poojaTypeService";
import { useNotifications } from "../../context/NotificationContext";

const emptyForm = {
  devoteeName: "",
  devoteeEmail: "",
  devoteePhone: "",
  service: "",
  datetime: "",
  amount: "",
  paymentMethod: "Cash",
  notes: "",
};

const statusStyles = {
  Pending: "bg-[#fff1d7] text-[#9a5a00]",
  Confirmed: "bg-[#def7e3] text-[#166534]",
  Rejected: "bg-[#fee2e2] text-[#b91c1c]",
  Cancelled: "bg-[#fee2e2] text-[#b91c1c]",
};

const buildMinDateTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 15);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const BookingPayments = () => {
  const navigate = useNavigate();
  const { loadNotifications } = useNotifications();
  const [poojaTypes, setPoojaTypes] = useState(getPoojaTypes());
  const [bookings, setBookings] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [form, setForm] = useState(() => {
    const initialService = getPoojaTypes()[0];
    return {
      ...emptyForm,
      service: initialService?.name || "",
      amount: initialService?.price || "",
      datetime: buildMinDateTime(),
    };
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingRows, billRows] = await Promise.allSettled([fetchBookings(), fetchBills()]);
      setBookings(bookingRows.status === "fulfilled" ? bookingRows.value : []);
      setBills(billRows.status === "fulfilled" ? billRows.value : []);
    } catch (error) {
      setBookings([]);
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const syncPoojaTypes = () => setPoojaTypes(getPoojaTypes());
    const onStorage = (event) => {
      if (event.key === "poojaTypes") {
        syncPoojaTypes();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!poojaTypes.length) return;
    setForm((prev) => {
      const selected = poojaTypes.find((type) => type.name === prev.service) || poojaTypes[0];
      if (!selected) return prev;
      const nextService = prev.service && poojaTypes.some((type) => type.name === prev.service) ? prev.service : selected.name;
      const nextAmount = prev.amount ? prev.amount : selected.price;
      if (nextService === prev.service && String(nextAmount) === String(prev.amount || "")) {
        return prev;
      }
      return {
        ...prev,
        service: nextService,
        amount: nextAmount,
      };
    });
  }, [poojaTypes]);

  const billMap = useMemo(() => {
    const map = new Map();
    bills.forEach((bill) => {
      if (bill?.sourceId) {
        map.set(String(bill.sourceId), bill);
      }
    });
    return map;
  }, [bills]);

  const filteredBookings = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...bookings]
      .filter((booking) => {
        const matchesStatus = statusFilter === "All" || (booking.status || "Pending") === statusFilter;
        const matchesQuery =
          !q ||
          [booking.devoteeName, booking.devoteeEmail, booking.devoteePhone, booking.service, booking.paymentMethod]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(q));
        return matchesStatus && matchesQuery;
      })
      .sort((a, b) => new Date(b.createdAt || b.datetime || 0) - new Date(a.createdAt || a.datetime || 0));
  }, [bookings, query, statusFilter]);

  const stats = useMemo(
    () => [
      {
        title: "Today Bookings",
        value: bookings.filter((booking) => isToday(booking.createdAt)).length,
        note: `${bookings.filter((booking) => isToday(booking.createdAt) && (booking.status || "Pending") === "Pending").length} pending`,
        tone: "orange",
      },
      {
        title: "Total Value",
        value: formatCurrency(sumBy(bookings, (booking) => booking.amount)),
        note: `${bookings.length} bookings stored`,
        tone: "gold",
      },
      {
        title: "Confirmed",
        value: bookings.filter((booking) => (booking.status || "Pending") === "Confirmed").length,
        note: "Approved by counter",
        tone: "green",
      },
      {
        title: "Pending",
        value: bookings.filter((booking) => (booking.status || "Pending") === "Pending").length,
        note: "Awaiting approval",
        tone: "blue",
      },
    ],
    [bookings]
  );

  const handleServiceSelect = (service) => {
    setForm((prev) => ({
      ...prev,
      service: service.name,
      amount: service.price || prev.amount,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!form.devoteeName.trim() || !form.service.trim() || !form.datetime || Number(form.amount) <= 0) {
      setMessage("Please fill devotee name, service, date/time and amount.");
      return;
    }

    setSaving(true);
    try {
      await createBooking({
        devoteeName: form.devoteeName.trim(),
        devoteeEmail: form.devoteeEmail.trim() || undefined,
        devoteePhone: form.devoteePhone.trim() || undefined,
        service: form.service.trim(),
        datetime: form.datetime,
        amount: Number(form.amount),
        paymentMethod: form.paymentMethod,
        notes: form.notes.trim(),
        status: "Pending",
      });

      setForm({
        ...emptyForm,
        service: poojaTypes[0]?.name || "",
        amount: poojaTypes[0]?.price || "",
        datetime: buildMinDateTime(),
      });
      setMessage("Pooja booking saved successfully. The history and bill ledger were updated.");
      await loadData();
      loadNotifications().catch(() => {});
    } catch (error) {
      setMessage(error.response?.data?.error || error.response?.data?.message || "Failed to save booking.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CashierPageShell
      eyebrow="Pooja Bookings"
      image={templeBg}
      imageAlt="Temple pooja booking counter"
      stats={stats}
      actions={
        <>
          <button
            type="button"
            onClick={loadData}
            className="rounded-full border border-[#f0c58f] bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-[#fff8ef]"
          >
            Refresh History
          </button>
          <button
            type="button"
            onClick={() => navigate("/cashier/billing")}
            className="rounded-full bg-[#f28c18] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-95"
          >
            Open Billing
          </button>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[22px] border border-[#f0d3a2] bg-white/95 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-950">Admin added services</h2>
              <p className="mt-1 text-sm font-medium text-slate-700">
                Tap a service below to auto-fill the booking form and amount.
              </p>
            </div>
            <FaCalendarAlt className="text-[#f28c18]" size={22} />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {poojaTypes.map((type) => {
              const active = form.service === type.name;
              return (
                <button
                  key={type.name}
                  type="button"
                  onClick={() => handleServiceSelect(type)}
                  className={`rounded-[18px] border p-4 text-left transition ${
                    active
                      ? "border-[#f28c18] bg-[#fff4e6] shadow-[0_10px_24px_rgba(242,140,24,0.15)]"
                      : "border-[#f1dfc0] bg-[#fffaf4] hover:bg-[#fff7ec]"
                  }`}
                >
                  <p className="text-base font-extrabold text-slate-950">{type.name}</p>
                  <p className="mt-2 text-sm font-semibold text-[#8a5200]">{formatCurrency(type.price)}</p>
                </button>
              );
            })}
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Devotee name</span>
                <input
                  value={form.devoteeName}
                  onChange={(e) => setForm((prev) => ({ ...prev, devoteeName: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                  placeholder="Enter devotee name"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Phone number</span>
                <input
                  value={form.devoteePhone}
                  onChange={(e) => setForm((prev) => ({ ...prev, devoteePhone: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                  placeholder="+91 98765 43210"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Email</span>
                <input
                  type="email"
                  value={form.devoteeEmail}
                  onChange={(e) => setForm((prev) => ({ ...prev, devoteeEmail: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                  placeholder="devotee@email.com"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Service</span>
                <select
                  value={form.service}
                  onChange={(e) => {
                    const selected = poojaTypes.find((type) => type.name === e.target.value);
                    setForm((prev) => ({
                      ...prev,
                      service: e.target.value,
                      amount: selected?.price || prev.amount,
                    }));
                  }}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                >
                  {poojaTypes.map((type) => (
                    <option key={type.name} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Date and time</span>
                <input
                  type="datetime-local"
                  min={buildMinDateTime()}
                  value={form.datetime}
                  onChange={(e) => setForm((prev) => ({ ...prev, datetime: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Amount</span>
                <input
                  type="number"
                  min="1"
                  value={form.amount}
                  onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                  placeholder="0"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Payment mode</span>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => setForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                >
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Card</option>
                  <option>Bank Transfer</option>
                  <option>Net Banking</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">Notes</span>
              <textarea
                rows="4"
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                placeholder="Optional notes for the counter or priest"
              />
            </label>

            {message ? (
              <div className="rounded-2xl border border-[#f4d0a3] bg-[#fff7eb] px-4 py-3 text-sm font-semibold text-[#8a5200]">
                {message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-[#f28c18] px-5 py-3 text-base font-extrabold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Pooja Booking"}
            </button>
          </form>
        </section>

        <section className="rounded-[22px] border border-[#f0d3a2] bg-white/95 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-950">Booking history</h2>
              <p className="mt-1 text-sm font-medium text-slate-700">
                Saved bookings and matching bill receipts appear here.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <FaSearch />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search devotee"
                className="w-[170px] rounded-full border border-[#ead7bb] bg-[#fffaf4] px-3 py-2 outline-none focus:border-[#f28c18]"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {["All", "Pending", "Confirmed", "Rejected", "Cancelled"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                  statusFilter === status
                    ? "border-[#f28c18] bg-[#fff1df] text-[#8a5200]"
                    : "border-[#ead7bb] bg-white text-slate-700 hover:bg-[#fff8ef]"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-[#fff7eb] text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-bold">Receipt</th>
                  <th className="px-4 py-3 font-bold">Devotee</th>
                  <th className="px-4 py-3 font-bold">Service</th>
                  <th className="px-4 py-3 font-bold">Date</th>
                  <th className="px-4 py-3 font-bold">Amount</th>
                  <th className="px-4 py-3 font-bold">Payment</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                      Loading bookings...
                    </td>
                  </tr>
                ) : filteredBookings.length ? (
                  filteredBookings.map((booking) => {
                    const bill = billMap.get(String(booking._id));
                    return (
                      <tr key={booking._id} className="border-b border-[#f2e7d7]">
                        <td className="px-4 py-3 font-bold text-slate-950">{bill?.referenceNo || `BK-${String(booking._id).slice(-6).toUpperCase()}`}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{booking.devoteeName}</td>
                        <td className="px-4 py-3">{booking.service}</td>
                        <td className="px-4 py-3 text-slate-700">{formatDateTime(booking.datetime || booking.createdAt)}</td>
                        <td className="px-4 py-3 font-bold text-slate-950">{formatCurrency(booking.amount)}</td>
                        <td className="px-4 py-3">{booking.paymentMethod || "Cash"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${statusStyles[booking.status || "Pending"] || statusStyles.Pending}`}>
                            {(booking.status || "Pending") === "Confirmed" ? <FaCheckCircle /> : <FaClock />}
                            {booking.status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                      No bookings found. Add a pooja booking from the form on the left.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </CashierPageShell>
  );
};

export default BookingPayments;
