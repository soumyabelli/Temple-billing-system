import { useEffect, useMemo, useState } from "react";
import { FaDownload, FaReceipt, FaSearch } from "react-icons/fa";
import templeBg from "../../assets/temple-bg.jpg";
import CashierPageShell from "../../components/cashier/CashierPageShell";
import {
  fetchBills,
  formatCurrency,
  formatDateTime,
  getBillReference,
  inferBillType,
} from "../../services/cashierService";

const receiptTabs = ["All", "Pooja Booking", "Donation", "Prasadam Sale", "Other"];

const receiptTone = {
  "Pooja Booking": "bg-[#eef4ff] text-[#234ea5]",
  Donation: "bg-[#e8f7ee] text-[#166534]",
  "Prasadam Sale": "bg-[#fff1d7] text-[#9a5a00]",
  Other: "bg-[#f4f4f5] text-[#334155]",
};

const ReceiptsPage = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("All");

  const loadBills = async () => {
    setLoading(true);
    try {
      const rows = await fetchBills();
      setBills(rows);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, []);

  const sections = useMemo(() => {
    const grouped = { "Pooja Booking": [], Donation: [], "Prasadam Sale": [], Other: [] };
    bills.forEach((bill, index) => {
      const type = inferBillType(bill);
      const key = grouped[type] ? type : "Other";
      grouped[key].push({ bill, index });
    });
    return grouped;
  }, [bills]);

  const filteredBills = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...bills]
      .filter((bill) => {
        const type = inferBillType(bill);
        const matchesType = tab === "All" || type === tab;
        const matchesQuery =
          !q ||
          [bill.referenceNo, bill.devoteeName, bill.sevaType, bill.paymentMode, bill.billType, bill.status]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(q));
        return matchesType && matchesQuery;
      })
      .sort((a, b) => new Date(b.billDate || b.createdAt || 0) - new Date(a.billDate || a.createdAt || 0));
  }, [bills, query, tab]);

  const stats = [
    {
      title: "All Receipts",
      value: bills.length,
      note: "Combined ledger entries",
      tone: "orange",
    },
    {
      title: "Pooja Receipts",
      value: sections["Pooja Booking"].length,
      note: "Booking history",
      tone: "gold",
    },
    {
      title: "Donation Receipts",
      value: sections.Donation.length,
      note: "Donation history",
      tone: "green",
    },
    {
      title: "Prasadam Receipts",
      value: sections["Prasadam Sale"].length,
      note: "Prasadam sales",
      tone: "blue",
    },
  ];

  const handleDownloadCsv = () => {
    const rows = [
      ["Receipt", "Devotee", "Type", "Service", "Amount", "Payment", "Status", "Date"],
      ...filteredBills.map((bill, index) => [
        getBillReference(bill, index),
        bill.devoteeName,
        inferBillType(bill),
        bill.sevaType,
        bill.amount,
        bill.paymentMode,
        bill.status,
        formatDateTime(bill.billDate || bill.createdAt),
      ]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cashier-receipts.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <CashierPageShell
      eyebrow="Receipts"
      title="Split cashier receipts into pooja, donation and prasadam sections"
      description="Every bill created from the cashier counter appears here with its receipt number, category and payment details."
      image={templeBg}
      imageAlt="Temple receipts ledger"
      stats={stats}
      actions={
        <>
          <button
            type="button"
            onClick={loadBills}
            className="rounded-full border border-[#f0c58f] bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-[#fff8ef]"
          >
            Refresh Receipts
          </button>
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="rounded-full bg-[#f28c18] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-95"
          >
            Download CSV
          </button>
        </>
      }
    >
      <section className="rounded-[22px] border border-[#f0d3a2] bg-white/95 p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950">Receipt sections</h2>
            <p className="mt-1 text-sm font-medium text-slate-700">
              Use the tabs to switch between pooja, donation and prasadam receipts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-sm text-slate-700">
              <FaSearch />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search receipt"
                className="w-[180px] bg-transparent outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-2 rounded-2xl border border-[#ead7bb] bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-[#fff8ef]"
            >
              <FaDownload /> Export
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {receiptTabs.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                tab === item
                  ? "border-[#f28c18] bg-[#fff1df] text-[#8a5200]"
                  : "border-[#ead7bb] bg-white text-slate-700 hover:bg-[#fff8ef]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[22px] border border-[#f0d3a2] bg-white/95 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-950">Receipt ledger</h2>
              <p className="mt-1 text-sm font-medium text-slate-700">
                Searchable bill register with all saved cashier receipts.
              </p>
            </div>
            <FaReceipt className="text-[#f28c18]" />
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
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
                      Loading receipts...
                    </td>
                  </tr>
                ) : filteredBills.length ? (
                  filteredBills.map((bill, index) => {
                    const type = inferBillType(bill);
                    return (
                      <tr key={bill._id || bill.referenceNo || index} className="border-b border-[#f2e7d7]">
                        <td className="px-4 py-3 font-bold text-slate-950">{getBillReference(bill, index)}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{bill.devoteeName}</td>
                        <td className="px-4 py-3">{type}</td>
                        <td className="px-4 py-3">{bill.sevaType}</td>
                        <td className="px-4 py-3 font-bold text-slate-950">{formatCurrency(bill.amount)}</td>
                        <td className="px-4 py-3">{bill.paymentMode || "-"}</td>
                        <td className="px-4 py-3 text-slate-700">{formatDateTime(bill.billDate || bill.createdAt)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                              receiptTone[type] || receiptTone.Other
                            }`}
                          >
                            {bill.status || "Paid"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                      No receipts found for the selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[22px] border border-[#f0d3a2] bg-white/95 p-5 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-950">Receipt summary</h2>
            <div className="mt-4 space-y-3 text-sm">
              {stats.map((item) => (
                <div key={item.title} className="flex items-center justify-between rounded-2xl bg-[#fff8ef] px-4 py-3">
                  <span className="font-medium text-slate-600">{item.title}</span>
                  <span className="font-extrabold text-slate-950">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[22px] border border-[#f0d3a2] bg-white/95 p-5 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-950">Grouped sections</h2>
            <div className="mt-4 space-y-3">
              {receiptTabs
                .filter((item) => item !== "All")
                .map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-2xl bg-[#fff8ef] px-4 py-3 text-sm">
                    <span className="font-semibold text-slate-700">{item}</span>
                    <span className="font-bold text-slate-950">{sections[item]?.length || 0}</span>
                  </div>
                ))}
            </div>
          </section>
        </aside>
      </div>
    </CashierPageShell>
  );
};

export default ReceiptsPage;
