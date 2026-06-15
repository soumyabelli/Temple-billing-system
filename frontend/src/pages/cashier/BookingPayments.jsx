const bookingRows = [
	{ id: "BK-1021", devotee: "Ananya Sharma", service: "Special Pooja", amount: "₹1,100", status: "Paid" },
	{ id: "BK-1022", devotee: "Ravi Patel", service: "Archana", amount: "₹550", status: "Pending" },
	{ id: "BK-1023", devotee: "Meera Iyer", service: "Annadanam", amount: "₹2,500", status: "Paid" },
];

export default function BookingPayments() {
	return (
		<div className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
			<div className="mx-auto max-w-5xl space-y-6">
				<div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
					<p className="text-sm uppercase tracking-[0.25em] text-orange-600">Cashier</p>
					<h1 className="mt-2 text-3xl font-semibold">Booking Payments</h1>
					<p className="mt-2 text-slate-600">Review temple booking payments and their current status.</p>
				</div>

				<div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
					<table className="min-w-full divide-y divide-slate-200 text-left text-sm">
						<thead className="bg-slate-50 text-slate-500">
							<tr>
								<th className="px-4 py-3 font-medium">Booking ID</th>
								<th className="px-4 py-3 font-medium">Devotee</th>
								<th className="px-4 py-3 font-medium">Service</th>
								<th className="px-4 py-3 font-medium">Amount</th>
								<th className="px-4 py-3 font-medium">Status</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 bg-white">
							{bookingRows.map((row) => (
								<tr key={row.id}>
									<td className="px-4 py-3 font-medium text-slate-900">{row.id}</td>
									<td className="px-4 py-3 text-slate-700">{row.devotee}</td>
									<td className="px-4 py-3 text-slate-700">{row.service}</td>
									<td className="px-4 py-3 text-slate-700">{row.amount}</td>
									<td className="px-4 py-3 text-slate-700">{row.status}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
