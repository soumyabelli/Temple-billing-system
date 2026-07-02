import { useEffect, useMemo, useState } from "react";
import templeBg from "../../assets/temple-bg.jpg";
import CashierPageShell from "../../components/cashier/CashierPageShell";
import {
  createBill,
  createCashierNotification,
  fetchBills,
  formatCurrency,
  formatDateTime,
  getBillReference,
  inferBillType,
  sumBy,
  toDateKey,
  isToday,
} from "../../services/cashierService";

const emptyForm = {
  devoteeName: "",
  sevaType: "",
  amount: "",
  paymentMode: "Cash",
  billType: "Other",
  notes: "",
};

const billTypeOptions = ["All", "Pooja Booking", "Donation", "Prasadam Sale", "Other"];

const BillingPage = () => {
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState([]);
  const [query, setQuery] = useState("");
  const [billTypeFilter, setBillTypeFilter] = useState("All");
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadBills = async () => {
    setLoading(true);
    try {
      const rows = await fetchBills();
      setBills(rows);
    } catch (error) {
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, []);

  const filteredBills = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bills.filter((bill) => {
      const inferredType = inferBillType(bill);
      const matchesType = billTypeFilter === "All" || inferredType === billTypeFilter;
      const matchesQuery =
        !q ||
        [bill.referenceNo, bill.devoteeName, bill.sevaType, bill.paymentMode, bill.billType]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q));
      return matchesType && matchesQuery;
    });
  }, [bills, billTypeFilter, query]);

  const totals = useMemo(
    () => ({
      today: sumBy(bills.filter((bill) => isToday(bill.billDate)), (bill) => bill.amount),
      total: sumBy(bills, (bill) => bill.amount),
      pooja: sumBy(bills.filter((bill) => inferBillType(bill) === "Pooja Booking"), (bill) => bill.amount),
      donation: sumBy(bills.filter((bill) => inferBillType(bill) === "Donation"), (bill) => bill.amount),
      prasadam: sumBy(bills.filter((bill) => inferBillType(bill) === "Prasadam Sale"), (bill) => bill.amount),
    }),
    [bills]
  );

  const stats = [
    { title: "Today's Bills", value: bills.filter((bill) => isToday(bill.billDate)).length, note: formatCurrency(totals.today), tone: "orange" },
    { title: "Ledger Total", value: formatCurrency(totals.total), note: `${bills.length} bill entries`, tone: "gold" },
    { title: "Pooja Bills", value: formatCurrency(totals.pooja), note: "Bookings captured", tone: "blue" },
    { title: "Donation Bills", value: formatCurrency(totals.donation), note: "Donation counter", tone: "green" },
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!form.devoteeName.trim() || !form.sevaType.trim() || Number(form.amount) <= 0) {
      setMessage("Please enter devotee name, service and a valid amount.");
      return;
    }

    setSaving(true);
    try {
      await createBill({
        devoteeName: form.devoteeName.trim(),
        sevaType: form.sevaType.trim(),
        amount: Number(form.amount),
        paymentMode: form.paymentMode,
        billType: form.billType,
        notes: form.notes.trim(),
        referenceNo: `MB-${Date.now().toString().slice(-6)}`,
        status: "Paid",
      });

      await createCashierNotification({
        title: "Bill Recorded",
        message: `${form.devoteeName.trim()} bill was added to the cashier ledger.`,
        audienceRole: "cashier",
        broadcast: true,
        category: "billing",
      }).catch(() => null);

      setForm(emptyForm);
      setMessage("Bill saved successfully.");
      await loadBills();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to save bill.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CashierPageShell
      eyebrow="Billing"
      image={templeBg}
      imageAlt="Temple billing register"
      stats={stats}
      actions={
        <>
          <button
            type="button"
            onClick={loadBills}
            className="rounded-full border border-[#f0c58f] bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-[#fff8ef]"
          >
            Refresh Bills
          </button>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
        <section className="rounded-[22px] border border-[#f0d3a2] bg-white/95 p-5 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-950">Create manual bill</h2>
          <p className="mt-1 text-sm font-medium text-slate-600">Use this for miscellaneous temple charges, adjustments or offline entries.</p>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Devotee name</label>
              <input
                value={form.devoteeName}
                onChange={(e) => setForm((prev) => ({ ...prev, devoteeName: e.target.value }))}
                className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-sm outline-none focus:border-[#f28c18]"
                placeholder="Enter devotee name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Service / purpose</label>
              <input
                value={form.sevaType}
                onChange={(e) => setForm((prev) => ({ ...prev, sevaType: e.target.value }))}
                className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-sm outline-none focus:border-[#f28c18]"
                placeholder="Pooja, donation, prasadam or other"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Amount</label>
                <input
                  type="number"
                  min="1"
                  value={form.amount}
                  onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-sm outline-none focus:border-[#f28c18]"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Payment mode</label>
                <select
                  value={form.paymentMode}
                  onChange={(e) => setForm((prev) => ({ ...prev, paymentMode: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-sm outline-none focus:border-[#f28c18]"
                >
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Card</option>
                  <option>Bank Transfer</option>
                  <option>Net Banking</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Bill category</label>
              <select
                value={form.billType}
                onChange={(e) => setForm((prev) => ({ ...prev, billType: e.target.value }))}
                className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-sm outline-none focus:border-[#f28c18]"
              >
                <option value="Other">Other</option>
                <option value="Pooja Booking">Pooja Booking</option>
                <option value="Donation">Donation</option>
                <option value="Prasadam Sale">Prasadam Sale</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Notes</label>
              <textarea
                rows="4"
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-sm outline-none focus:border-[#f28c18]"
                placeholder="Optional internal notes"
              />
            </div>

            {message ? (
              <div className="rounded-2xl border border-[#f4d0a3] bg-[#fff7eb] px-4 py-3 text-sm font-semibold text-[#8a5200]">
                {message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-[#f28c18] px-4 py-3 text-sm font-extrabold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Bill"}
            </button>
          </form>
        </section>

        <section className="rounded-[22px] border border-[#f0d3a2] bg-white/95 p-5 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-950">Bill register</h2>
              <p className="mt-1 text-sm font-medium text-slate-600">Search and filter the full cashier ledger.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search devotee, receipt or service"
                className="rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-sm outline-none focus:border-[#f28c18]"
              />
              <select
                value={billTypeFilter}
                onChange={(e) => setBillTypeFilter(e.target.value)}
                className="rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-sm outline-none focus:border-[#f28c18]"
              >
                {billTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-[#fff7eb] text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-bold">Receipt</th>
                  <th className="px-4 py-3 font-bold">Devotee</th>
                  <th className="px-4 py-3 font-bold">Type</th>
                  <th className="px-4 py-3 font-bold">Service</th>
                  <th className="px-4 py-3 font-bold">Amount</th>
                  <th className="px-4 py-3 font-bold">Payment</th>
                  <th className="px-4 py-3 font-bold">Date</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                      Loading bills...
                    </td>
                  </tr>
                ) : filteredBills.length ? (
                  filteredBills
                    .sort((a, b) => new Date(b.billDate || b.createdAt || 0) - new Date(a.billDate || a.createdAt || 0))
                    .map((bill, index) => (
                      <tr key={bill._id || bill.referenceNo || index} className="border-b border-[#f2e7d7]">
                        <td className="px-4 py-3 font-bold text-slate-950">{getBillReference(bill, index)}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{bill.devoteeName}</td>
                        <td className="px-4 py-3">{inferBillType(bill)}</td>
                        <td className="px-4 py-3">{bill.sevaType}</td>
                        <td className="px-4 py-3 font-bold text-slate-950">{formatCurrency(bill.amount)}</td>
                        <td className="px-4 py-3">{bill.paymentMode || "-"}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDateTime(bill.billDate || bill.createdAt)}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full bg-[#fff1d6] px-3 py-1 text-xs font-bold text-[#8a5200]">
                            {bill.status || "Paid"}
                          </span>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                      No bills match the current filter.
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

export default BillingPage;
