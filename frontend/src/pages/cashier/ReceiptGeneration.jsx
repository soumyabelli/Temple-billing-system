const sampleReceipts = [
	{
		id: "RCPT-24018",
		name: "Ananya Sharma",
		purpose: "Donation",
		amount: "₹2,500",
		status: "Generated",
	},
	{
		id: "RCPT-24019",
		name: "Ravi Patel",
		purpose: "Pooja Booking",
		amount: "₹1,100",
		status: "Pending",
	},
	{
		id: "RCPT-24020",
		name: "Meera Iyer",
		purpose: "Prasadam",
		amount: "₹350",
		status: "Generated",
	},
];

export default function ReceiptGenerationPage() {
	return (
		<div className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
			<div className="mx-auto max-w-6xl space-y-6">
				<div className="rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 text-white shadow-xl">
					<p className="text-sm uppercase tracking-[0.25em] text-white/80">Cashier Tools</p>
					<div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
						<div>
							<h1 className="text-3xl font-semibold md:text-4xl">Receipt Generation</h1>
							<p className="mt-2 max-w-2xl text-white/90">
								Generate, review, and print temple payment receipts from a single workspace.
							</p>
						</div>
						<button
							type="button"
							onClick={() => window.print()}
							className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-orange-700 shadow-lg transition hover:bg-orange-50"
						>
							Print page
						</button>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-3">
					<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
						<p className="text-sm font-medium text-slate-500">Today&apos;s receipts</p>
						<p className="mt-2 text-3xl font-semibold text-slate-900">18</p>
					</div>
					<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
						<p className="text-sm font-medium text-slate-500">Pending receipts</p>
						<p className="mt-2 text-3xl font-semibold text-slate-900">4</p>
					</div>
					<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
						<p className="text-sm font-medium text-slate-500">Amount processed</p>
						<p className="mt-2 text-3xl font-semibold text-slate-900">₹46,350</p>
					</div>
				</div>

				<div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
					<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<h2 className="text-xl font-semibold">Recent receipts</h2>
								<p className="text-sm text-slate-500">Track the latest generated and pending receipts.</p>
							</div>
							<input
								type="search"
								placeholder="Search receipt, devotee, or purpose"
								className="w-full rounded-full border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-orange-400 sm:w-80"
							/>
						</div>

						<div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
							<table className="min-w-full divide-y divide-slate-200 text-left text-sm">
								<thead className="bg-slate-50 text-slate-500">
									<tr>
										<th className="px-4 py-3 font-medium">Receipt ID</th>
										<th className="px-4 py-3 font-medium">Name</th>
										<th className="px-4 py-3 font-medium">Purpose</th>
										<th className="px-4 py-3 font-medium">Amount</th>
										<th className="px-4 py-3 font-medium">Status</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100 bg-white">
									{sampleReceipts.map((receipt) => (
										<tr key={receipt.id}>
											<td className="px-4 py-3 font-medium text-slate-900">{receipt.id}</td>
											<td className="px-4 py-3 text-slate-700">{receipt.name}</td>
											<td className="px-4 py-3 text-slate-700">{receipt.purpose}</td>
											<td className="px-4 py-3 text-slate-700">{receipt.amount}</td>
											<td className="px-4 py-3">
												<span
													className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
														receipt.status === "Generated"
															? "bg-emerald-100 text-emerald-700"
															: "bg-amber-100 text-amber-700"
													}`}
												>
													{receipt.status}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					<div className="space-y-6">
						<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
							<h2 className="text-xl font-semibold">Generate receipt</h2>
							<p className="mt-1 text-sm text-slate-500">Use this area to prepare a new receipt before printing or sharing.</p>

							<div className="mt-5 space-y-4">
								<div>
									<label className="mb-2 block text-sm font-medium text-slate-700">Reference number</label>
									<input
										type="text"
										defaultValue="RCPT-24021"
										className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-400"
									/>
								</div>
								<div>
									<label className="mb-2 block text-sm font-medium text-slate-700">Recipient name</label>
									<input
										type="text"
										placeholder="Enter devotee or payer name"
										className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-400"
									/>
								</div>
								<div>
									<label className="mb-2 block text-sm font-medium text-slate-700">Amount</label>
									<input
										type="text"
										placeholder="₹0.00"
										className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-400"
									/>
								</div>
								<div>
									<label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
									<textarea
										rows="4"
										placeholder="Optional receipt notes"
										className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-400"
									/>
								</div>
								<button
									type="button"
									className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
								>
									Save receipt draft
								</button>
							</div>
						</div>

						<div className="rounded-3xl border border-dashed border-orange-300 bg-orange-50 p-6 text-orange-950">
							<h3 className="text-lg font-semibold">Printing tip</h3>
							<p className="mt-2 text-sm leading-relaxed text-orange-900/80">
								After generating a receipt, use the print action to produce a hard copy for the devotee or cash register record.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const COLORS = {
  orange: "#FF9933",
  gold: "#D4AF37",
  cream: "#FFF8E7",
};

function formatINR(n) {
  const num = typeof n === "string" ? Number(n) : n;
  if (Number.isNaN(num)) return "₹ 0";
  return `₹ ${num.toLocaleString("en-IN")}`;
}

function formatDate(d) {
  if (!d) return "-";
  const dt = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function buildReceiptNo(rawId, idx) {
  const suffix = rawId ? String(rawId).slice(-6) : String(idx + 1).padStart(6, "0");
  return `RCT-${suffix}`;
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function makeReceiptHtml(receipt) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${receipt.receiptNo} - Temple Receipt</title>
<style>
  body{ font-family: Arial, Helvetica, sans-serif; padding:24px; color:#2d1608; }
  h1{ margin:0 0 6px; font-size:22px; }
  .sub{ color:#7a4a16; margin:0 0 18px; font-size:13px; }
  .card{ border:1px solid rgba(212,175,55,0.45); background:#fff8e7; padding:16px; border-radius:14px; }
  .row{ display:flex; justify-content:space-between; gap:16px; margin:6px 0; font-size:14px; }
  .label{ color:#7a4a16; font-weight:600; }
  .value{ font-weight:700; }
  .tbl{ width:100%; border-collapse:collapse; margin-top:14px; }
  .tbl td{ border-top:1px solid rgba(0,0,0,0.08); padding:8px 6px; font-size:14px; }
  .muted{ color:#7a4a16; }
  .pill{ display:inline-block; padding:4px 10px; border-radius:999px; border:1px solid rgba(212,175,55,0.45); background:rgba(255,153,51,0.10); font-weight:700; }
</style>
</head>
<body>
  <h1>Sri Shanti Mahadev Mandir</h1>
  <p class="sub">Temple Billing System - Receipt</p>
  <div class="card">
    <div class="row"><div class="label">Receipt No.</div><div class="value">${receipt.receiptNo}</div></div>
    <div class="row"><div class="label">Date</div><div class="value">${receipt.dateText}</div></div>
    <div class="row"><div class="label">Devotee</div><div class="value">${receipt.devoteeName}</div></div>
    <div class="row"><div class="label">Type</div><div class="value">${receipt.type}</div></div>
    <div class="row"><div class="label">Amount</div><div class="value">${receipt.amountText}</div></div>
    <div class="row"><div class="label">Payment Method</div><div class="value">${receipt.paymentMethod}</div></div>
    <div class="row"><div class="label">Status</div><div class="value"><span class="pill">${receipt.status}</span></div></div>
  </div>
</body>
</html>`;
}

export default function ReceiptGeneration() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [rawRows, setRawRows] = useState([]);

  // table state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  const receipts = useMemo(() => {
    const normalized = (rawRows || []).map((r, idx) => {
      const receiptNo = r.receiptNo || r.receiptNumber || r.receiptNumberNo || r.receipt_id || buildReceiptNo(r._id || r.id, idx);
      const dateText = formatDate(r.date || r.createdAt || r.transactionDate);
      const amountVal = typeof r.amount === "number" ? r.amount : Number(r.amount);

      return {
        receiptNo,
        devoteeName: r.devoteeName || r.name || r.customerName || "-",
        type: r.type || r.category || r.serviceType || r.receiptType || "-",
        amount: Number.isNaN(amountVal) ? 0 : amountVal,
        paymentMethod: r.paymentMethod || r.method || r.payMethod || "-",
        dateText,
        date: r.date || r.createdAt || r.transactionDate || null,
        status: r.status || (r.paymentStatus ? r.paymentStatus : "Completed"),
        _id: r._id || r.id || null,
        raw: r,
        idx,
      };
    });

    return normalized;
  }, [rawRows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return receipts.filter((r) => {
      const matchesSearch =
        !q ||
        [r.receiptNo, r.devoteeName, r.type, r.paymentMethod, r.status].some((x) => String(x).toLowerCase().includes(q));
      const matchesStatus = statusFilter === "All" || r.status === statusFilter;
      const matchesType = typeFilter === "All" || r.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [receipts, search, statusFilter, typeFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortDir === "asc" ? 1 : -1;

    const cmp = (a, b) => {
      if (sortKey === "amount") return (a.amount - b.amount) * dir;
      if (sortKey === "receiptNo") return a.receiptNo.localeCompare(b.receiptNo) * dir;
      if (sortKey === "type") return String(a.type).localeCompare(String(b.type)) * dir;
      if (sortKey === "status") return String(a.status).localeCompare(String(b.status)) * dir;
      // date
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return (da - db) * dir;
    };

    arr.sort(cmp);
    return arr;
  }, [filtered, sortDir, sortKey]);

  const paged = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    return {
      rows: sorted.slice(start, start + pageSize),
      total: sorted.length,
      totalPages,
      page: safePage,
    };
  }, [sorted, page, pageSize]);

  const allStatuses = useMemo(() => {
    const set = new Set(receipts.map((r) => r.status).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [receipts]);

  const allTypes = useMemo(() => {
    const set = new Set(receipts.map((r) => r.type).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [receipts]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("/api/receipts", {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });
        const data = res.data;
        const rows = Array.isArray(data) ? data : (data?.receipts || data?.rows || []);
        if (mounted) setRawRows(rows);
      } catch (e) {
        // dummy data fallback
        if (!mounted) return;
        const dummy = [
          {
            _id: "r1",
            receiptNo: "RCT-100245",
            devoteeName: "Ramesh Kumar",
            type: "Pooja",
            amount: 1100,
            paymentMethod: "UPI",
            date: new Date().toISOString(),
            status: "Paid",
          },
          {
            _id: "r2",
            receiptNo: "RCT-100246",
            devoteeName: "Lakshmi Devi",
            type: "Donation",
            amount: 2500,
            paymentMethod: "Cash",
            date: new Date(Date.now() - 86400000).toISOString(),
            status: "Completed",
          },
          {
            _id: "r3",
            receiptNo: "RCT-100247",
            devoteeName: "Suresh Reddy",
            type: "Prasadam",
            amount: 520,
            paymentMethod: "Card",
            date: new Date(Date.now() - 2 * 86400000).toISOString(),
            status: "Completed",
          },
        ];
        setRawRows(dummy);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleExportCSV = () => {
    const headers = [
      "Receipt No",
      "Devotee Name",
      "Type",
      "Amount",
      "Payment Method",
      "Date",
      "Status",
    ];

    const rows = sorted.map((r) => [
      r.receiptNo,
      r.devoteeName,
      r.type,
      r.amount,
      r.paymentMethod,
      r.dateText,
      r.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
      .join("\n");

    downloadTextFile("receipts.csv", csv);
  };

  const handleExportPDF = () => {
    // Simple fallback: export as HTML file that can be printed to PDF.
    const htmlRows = sorted
      .map(
        (r) =>
          `<tr>
            <td>${r.receiptNo}</td>
            <td>${r.devoteeName}</td>
            <td>${r.type}</td>
            <td>${formatINR(r.amount)}</td>
            <td>${r.paymentMethod}</td>
            <td>${r.dateText}</td>
            <td>${r.status}</td>
          </tr>`
      )
      .join("");

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Receipts Export</title>
<style>
  body{ font-family: Arial, Helvetica, sans-serif; padding:24px; }
  h1{ margin:0 0 8px; }
  table{ width:100%; border-collapse:collapse; margin-top:16px; }
  th, td{ border:1px solid rgba(0,0,0,0.12); padding:8px; font-size:13px; }
  th{ background:#FFF0D5; }
</style>
</head>
<body>
  <h1>Temple Receipts</h1>
  <div style="color:#7a4a16; font-size:13px;">Exported ${new Date().toLocaleString()}</div>
  <table>
    <thead>
      <tr>
        <th>Receipt No</th>
        <th>Devotee Name</th>
        <th>Type</th>
        <th>Amount</th>
        <th>Payment Method</th>
        <th>Date</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>${htmlRows}</tbody>
  </table>
  <script>window.onload=()=>window.print()</script>
</body>
</html>`;

    downloadTextFile("receipts.pdf.html", html);
  };

  const handleViewReceipt = (receipt) => {
    const win = window.open("", "_blank", "noopener,noreferrer");
    if (!win) return;

    const receiptView = {
      receiptNo: receipt.receiptNo,
      devoteeName: receipt.devoteeName,
      type: receipt.type,
      amountText: formatINR(receipt.amount),
      paymentMethod: receipt.paymentMethod,
      dateText: receipt.dateText,
      status: receipt.status,
    };

    win.document.open();
    win.document.write(makeReceiptHtml(receiptView));
    win.document.close();
  };

  const handleDownloadReceiptPDF = (receipt) => {
    // Fallback: download HTML that can be printed to PDF.
    const html = makeReceiptHtml({
      receiptNo: receipt.receiptNo,
      devoteeName: receipt.devoteeName,
      type: receipt.type,
      amountText: formatINR(receipt.amount),
      paymentMethod: receipt.paymentMethod,
      dateText: receipt.dateText,
      status: receipt.status,
    });
    downloadTextFile(`${receipt.receiptNo}.receipt.html`, html);
  };

  const handlePrintReceipt = (receipt) => {
    const receiptView = {
      receiptNo: receipt.receiptNo,
      devoteeName: receipt.devoteeName,
      type: receipt.type,
      amountText: formatINR(receipt.amount),
      paymentMethod: receipt.paymentMethod,
      dateText: receipt.dateText,
      status: receipt.status,
    };

    const html = makeReceiptHtml(receiptView);
    const win = window.open("", "_blank", "noopener,noreferrer");
    if (!win) return;
    win.document.open();
    win.document.write(html + `<script>window.onload=()=>window.print()</script>`);
    win.document.close();
  };

  const SkeletonRow = () => (
    <tr className="border-t border-[#ead6c0]">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="p-3">
          <div className="h-4 bg-[#f3e8d2] rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );

  return (
    <div className="w-full">
      <div className="rounded-[20px] bg-white/90 border border-[#ead6c0] shadow-sm p-5 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:justify-between">
          <div>
            <h1 className="text-[1.6rem] md:text-[2rem] font-extrabold text-[#2d1608]">Receipts</h1>
            <p className="text-sm md:text-base text-[#7a4a16] font-semibold">View, search, download and print receipts</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="rounded-[16px] border border-[#ead6c0] bg-[#FFF8E7] px-3 py-2 text-sm font-bold text-[#8B5A0B] hover:bg-white transition"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={handleExportPDF}
              className="rounded-[16px] border border-[#ead6c0] bg-[#FFF8E7] px-3 py-2 text-sm font-bold text-[#8B5A0B] hover:bg-white transition"
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-[#8B5A0B] mb-1">Search</label>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Receipt no., devotee, type, status..."
              className="w-full rounded-[16px] border border-[#ead6c0] bg-white px-4 py-3 outline-none text-sm text-[#2d1608]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#8B5A0B] mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-[16px] border border-[#ead6c0] bg-white px-4 py-3 outline-none text-sm text-[#2d1608]"
            >
              {allStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#8B5A0B] mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-[16px] border border-[#ead6c0] bg-white px-4 py-3 outline-none text-sm text-[#2d1608]"
            >
              {allTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#8B5A0B] mb-1">Sort</label>
            <div className="flex gap-2">
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
                className="w-1/2 rounded-[16px] border border-[#ead6c0] bg-white px-3 py-3 outline-none text-sm text-[#2d1608]"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="receiptNo">Receipt No</option>
                <option value="type">Type</option>
                <option value="status">Status</option>
              </select>
              <button
                type="button"
                onClick={() => setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))}
                className="w-1/2 rounded-[16px] border border-[#ead6c0] bg-[#FFF8E7] px-3 py-3 text-sm font-bold text-[#8B5A0B] hover:bg-white transition"
              >
                {sortDir === "asc" ? "Asc" : "Desc"}
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="bg-[#FFF0D5]">
              <tr className="text-left text-sm text-[#7a4a16] font-extrabold">
                <th className="p-3">Receipt No.</th>
                <th className="p-3">Devotee Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Payment Method</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-[#7a4a16] font-semibold">
                    No receipts found.
                  </td>
                </tr>
              ) : (
                paged.rows.map((r) => (
                  <tr key={r.receiptNo} className="border-t border-[#ead6c0]">
                    <td className="p-3 font-bold text-[#2d1608]">{r.receiptNo}</td>
                    <td className="p-3 text-[#2d1608] font-semibold">{r.devoteeName}</td>
                    <td className="p-3 text-[#2d1608] font-semibold">{r.type}</td>
                    <td className="p-3 font-extrabold text-[#8B5A0B]">{formatINR(r.amount)}</td>
                    <td className="p-3 text-[#2d1608] font-semibold">{r.paymentMethod}</td>
                    <td className="p-3 text-[#2d1608] font-semibold">{r.dateText}</td>
                    <td className="p-3">
                      <span
                        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold border border-[#ead6c0] bg-[#FFF8E7] text-[#8B5A0B]"
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewReceipt(r)}
                          className="rounded-[14px] border border-[#ead6c0] bg-white px-3 py-2 text-xs font-extrabold text-[#8B5A0B] hover:bg-[#FFF8E7] transition"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadReceiptPDF(r)}
                          className="rounded-[14px] border border-[#ead6c0] bg-white px-3 py-2 text-xs font-extrabold text-[#8B5A0B] hover:bg-[#FFF8E7] transition"
                        >
                          Download PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePrintReceipt(r)}
                          className="rounded-[14px] bg-[#FF9933] px-3 py-2 text-xs font-extrabold text-white hover:opacity-95 transition"
                        >
                          Print
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-sm font-semibold text-[#7a4a16]">
            Showing <span className="font-extrabold">{paged.rows.length}</span> of <span className="font-extrabold">{paged.total}</span> receipts
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-[16px] border border-[#ead6c0] bg-white px-3 py-3 text-sm font-bold text-[#2d1608]"
            >
              {[5, 10, 20, 50].map((s) => (
                <option key={s} value={s}>
                  {s} / page
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={paged.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-[16px] border border-[#ead6c0] bg-white px-4 py-3 text-sm font-extrabold text-[#8B5A0B] disabled:opacity-50"
            >
              Prev
            </button>

            <div className="px-3 py-2 text-sm font-extrabold text-[#2d1608]">
              Page {paged.page} / {paged.totalPages}
            </div>

            <button
              type="button"
              disabled={paged.page >= paged.totalPages}
              onClick={() => setPage((p) => Math.min(paged.totalPages, p + 1))}
              className="rounded-[16px] border border-[#ead6c0] bg-white px-4 py-3 text-sm font-extrabold text-[#8B5A0B] disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-[16px] border border-[#fca5a5] bg-[#fef2f2] px-4 py-3 text-sm font-semibold text-[#b91c1c]">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
}

