const todayTransactions = [
	{ id: "TX-1001", source: "Donation", amount: "₹2,500", status: "Paid" },
	{ id: "TX-1002", source: "Booking", amount: "₹1,100", status: "Paid" },
	{ id: "TX-1003", source: "Prasadam", amount: "₹350", status: "Pending" },
];

export default function TodayTransactions() {
	return (
		<div className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
			<div className="mx-auto max-w-5xl space-y-6">
				<div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
					<p className="text-sm uppercase tracking-[0.25em] text-orange-600">Cashier</p>
					<h1 className="mt-2 text-3xl font-semibold">Today&apos;s Transactions</h1>
				</div>

				<div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
					<table className="min-w-full divide-y divide-slate-200 text-left text-sm">
						<thead className="bg-slate-50 text-slate-500">
							<tr>
								<th className="px-4 py-3 font-medium">Transaction ID</th>
								<th className="px-4 py-3 font-medium">Source</th>
								<th className="px-4 py-3 font-medium">Amount</th>
								<th className="px-4 py-3 font-medium">Status</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 bg-white">
							{todayTransactions.map((transaction) => (
								<tr key={transaction.id}>
									<td className="px-4 py-3 font-medium text-slate-900">{transaction.id}</td>
									<td className="px-4 py-3 text-slate-700">{transaction.source}</td>
									<td className="px-4 py-3 text-slate-700">{transaction.amount}</td>
									<td className="px-4 py-3 text-slate-700">{transaction.status}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
