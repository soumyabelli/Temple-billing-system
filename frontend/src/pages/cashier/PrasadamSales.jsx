import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaClock, FaSearch, FaShoppingBasket, FaStar } from "react-icons/fa";
import templeBg from "../../assets/temple-bg.jpg";
import CashierPageShell from "../../components/cashier/CashierPageShell";
import {
  createPrasadamOrder,
  fetchBills,
  fetchPrasadamOrders,
  formatCurrency,
  formatDateTime,
  isToday,
  sumBy,
} from "../../services/cashierService";
import { getPrasadamTypes } from "../../services/prasadamTypeService";

const emptyForm = {
  devoteeName: "",
  devoteeEmail: "",
  devoteePhone: "",
  itemName: "",
  quantity: 1,
  paymentMethod: "UPI",
};

const statusStyles = {
  Placed: "bg-[#fff1d7] text-[#9a5a00]",
  Preparing: "bg-[#eef4ff] text-[#234ea5]",
  Ready: "bg-[#e8f7ee] text-[#166534]",
  Delivered: "bg-[#def7e3] text-[#166534]",
  Cancelled: "bg-[#fee2e2] text-[#b91c1c]",
};

const PrasadamSales = () => {
  const navigate = useNavigate();
  const [prasadamTypes, setPrasadamTypes] = useState(getPrasadamTypes());
  const [orders, setOrders] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [form, setForm] = useState(() => {
    const initial = getPrasadamTypes()[0];
    return {
      ...emptyForm,
      itemName: initial?.name || "",
    };
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [orderRows, billRows] = await Promise.allSettled([fetchPrasadamOrders(), fetchBills()]);
      setOrders(orderRows.status === "fulfilled" ? orderRows.value : []);
      setBills(billRows.status === "fulfilled" ? billRows.value : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const onStorage = (event) => {
      if (event.key === "prasadamTypes") {
        setPrasadamTypes(getPrasadamTypes());
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!prasadamTypes.length) return;
    setForm((prev) => {
      const selected = prasadamTypes.find((item) => item.name === prev.itemName) || prasadamTypes[0];
      if (!selected) return prev;
      const nextItem = prev.itemName && prasadamTypes.some((item) => item.name === prev.itemName) ? prev.itemName : selected.name;
      if (prev.itemName === nextItem) return prev;
      return { ...prev, itemName: nextItem };
    });
  }, [prasadamTypes]);

  const billMap = useMemo(() => {
    const map = new Map();
    bills.forEach((bill) => {
      if (bill?.sourceId) map.set(String(bill.sourceId), bill);
    });
    return map;
  }, [bills]);

  const selectedType = useMemo(
    () => prasadamTypes.find((type) => type.name === form.itemName) || prasadamTypes[0],
    [prasadamTypes, form.itemName]
  );

  const totalAmount = useMemo(() => {
    const unitPrice = Number(selectedType?.price || 0);
    return unitPrice * Number(form.quantity || 0);
  }, [form.quantity, selectedType]);

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...orders]
      .filter((order) => {
        const matchesStatus = statusFilter === "All" || (order.status || "Placed") === statusFilter;
        const matchesQuery =
          !q ||
          [order.devoteeName, order.email, order.phone, order.itemName, order.paymentMethod]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(q));
        return matchesStatus && matchesQuery;
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [orders, query, statusFilter]);

  const stats = useMemo(
    () => [
      {
        title: "Today Orders",
        value: orders.filter((order) => isToday(order.createdAt)).length,
        note: `${orders.filter((order) => isToday(order.createdAt) && (order.status || "Placed") === "Placed").length} newly placed`,
        tone: "orange",
      },
      {
        title: "Total Sales",
        value: formatCurrency(sumBy(orders, (order) => order.amount || order.totalPrice)),
        note: `${orders.length} orders stored`,
        tone: "gold",
      },
      {
        title: "Delivered",
        value: orders.filter((order) => (order.status || "Placed") === "Delivered").length,
        note: "Completed counter pickups",
        tone: "green",
      },
      {
        title: "Placed",
        value: orders.filter((order) => (order.status || "Placed") === "Placed").length,
        note: "Awaiting kitchen prep",
        tone: "blue",
      },
    ],
    [orders]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!form.devoteeName.trim() || !form.itemName.trim() || Number(form.quantity) <= 0) {
      setMessage("Please enter devotee name, prasadam item and quantity.");
      return;
    }

    const unitPrice = Number(selectedType?.price || 0);
    if (!unitPrice) {
      setMessage("The selected prasadam item does not have a valid price.");
      return;
    }

    setSaving(true);
    try {
      await createPrasadamOrder({
        devoteeName: form.devoteeName.trim(),
        email: form.devoteeEmail.trim() || undefined,
        phone: form.devoteePhone.trim() || undefined,
        itemName: form.itemName.trim(),
        quantity: Number(form.quantity),
        unitPrice,
        paymentMethod: form.paymentMethod,
      });

      setForm({
        ...emptyForm,
        itemName: prasadamTypes[0]?.name || "",
      });
      setMessage("Prasadam order saved successfully. The bill and history were updated.");
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.error || error.response?.data?.message || "Failed to save prasadam order.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CashierPageShell
      eyebrow="Prasadam Sales"
      title="Sell prasadam items with admin-approved prices"
      description="Pick the prasadam types added by admin, capture devotee details and store the order history with its bill receipt."
      image={templeBg}
      imageAlt="Temple prasadam sales counter"
      stats={stats}
      actions={
        <>
          <button
            type="button"
            onClick={loadData}
            className="rounded-full border border-[#f0c58f] bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-[#fff8ef]"
          >
            Refresh Orders
          </button>
          <button
            type="button"
            onClick={() => navigate("/cashier/receipts")}
            className="rounded-full bg-[#f28c18] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-95"
          >
            View Receipts
          </button>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[22px] border border-[#f0d3a2] bg-white/95 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-950">Admin added prasadam types</h2>
              <p className="mt-1 text-sm font-medium text-slate-700">
                Select the item card to auto-fill the order form.
              </p>
            </div>
            <FaShoppingBasket className="text-[#f28c18]" size={22} />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {prasadamTypes.map((type) => {
              const active = form.itemName === type.name;
              return (
                <button
                  key={type.name}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, itemName: type.name }))}
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
                <span className="mb-2 block text-sm font-bold text-slate-800">Prasadam item</span>
                <select
                  value={form.itemName}
                  onChange={(e) => setForm((prev) => ({ ...prev, itemName: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                >
                  {prasadamTypes.map((type) => (
                    <option key={type.name} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Quantity</span>
                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                  placeholder="1"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Payment mode</span>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => setForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                >
                  <option>UPI</option>
                  <option>Cash</option>
                  <option>Card</option>
                  <option>Net Banking</option>
                </select>
              </label>
              <div className="rounded-2xl border border-[#f1dfc0] bg-[#fffaf4] px-4 py-3">
                <p className="text-sm font-bold text-slate-800">Total amount</p>
                <p className="mt-2 text-2xl font-extrabold text-slate-950">{formatCurrency(totalAmount)}</p>
                <p className="mt-1 text-xs font-medium text-[#8a5200]">
                  Unit price: {formatCurrency(selectedType?.price || 0)}
                </p>
              </div>
            </div>

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
              {saving ? "Saving..." : "Save Prasadam Order"}
            </button>
          </form>
        </section>

        <section className="rounded-[22px] border border-[#f0d3a2] bg-white/95 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-950">Order history</h2>
              <p className="mt-1 text-sm font-medium text-slate-700">
                Saved orders and matching bill references appear here.
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
            {["All", "Placed", "Preparing", "Ready", "Delivered", "Cancelled"].map((status) => (
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
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-[#fff7eb] text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-bold">Receipt</th>
                  <th className="px-4 py-3 font-bold">Devotee</th>
                  <th className="px-4 py-3 font-bold">Item</th>
                  <th className="px-4 py-3 font-bold">Qty</th>
                  <th className="px-4 py-3 font-bold">Amount</th>
                  <th className="px-4 py-3 font-bold">Payment</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                      Loading prasadam orders...
                    </td>
                  </tr>
                ) : filteredOrders.length ? (
                  filteredOrders.map((order) => {
                    const bill = billMap.get(String(order._id));
                    return (
                      <tr key={order._id} className="border-b border-[#f2e7d7]">
                        <td className="px-4 py-3 font-bold text-slate-950">{bill?.referenceNo || `PR-${String(order._id).slice(-6).toUpperCase()}`}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{order.devoteeName}</td>
                        <td className="px-4 py-3">{order.itemName}</td>
                        <td className="px-4 py-3">{order.quantity}</td>
                        <td className="px-4 py-3 font-bold text-slate-950">{formatCurrency(order.amount || order.totalPrice)}</td>
                        <td className="px-4 py-3">{order.paymentMethod || "UPI"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${statusStyles[order.status || "Placed"] || statusStyles.Placed}`}>
                            {(order.status || "Placed") === "Placed" ? <FaClock /> : <FaStar />}
                            {order.status || "Placed"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{formatDateTime(order.createdAt)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                      No prasadam orders found. Add a new order from the form on the left.
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

export default PrasadamSales;
