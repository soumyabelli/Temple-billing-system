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
