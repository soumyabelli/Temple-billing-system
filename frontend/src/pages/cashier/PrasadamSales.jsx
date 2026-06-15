const prasadamItems = [
	{ item: "Laddu", qty: 120, amount: "₹2,700" },
	{ item: "Pulihora", qty: 85, amount: "₹1,250" },
	{ item: "Pongal", qty: 64, amount: "₹980" },
];

export default function PrasadamSales() {
	return (
		<div className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
			<div className="mx-auto max-w-5xl space-y-6">
				<div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
					<p className="text-sm uppercase tracking-[0.25em] text-orange-600">Cashier</p>
					<h1 className="mt-2 text-3xl font-semibold">Prasadam Sales</h1>
					<p className="mt-2 text-slate-600">Monitor daily prasadam sales and quantities sold.</p>
				</div>

				<div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
					<table className="min-w-full divide-y divide-slate-200 text-left text-sm">
						<thead className="bg-slate-50 text-slate-500">
							<tr>
								<th className="px-4 py-3 font-medium">Item</th>
								<th className="px-4 py-3 font-medium">Quantity</th>
								<th className="px-4 py-3 font-medium">Amount</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 bg-white">
							{prasadamItems.map((item) => (
								<tr key={item.item}>
									<td className="px-4 py-3 font-medium text-slate-900">{item.item}</td>
									<td className="px-4 py-3 text-slate-700">{item.qty}</td>
									<td className="px-4 py-3 text-slate-700">{item.amount}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
