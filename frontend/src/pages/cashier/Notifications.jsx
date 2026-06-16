const notifications = [
	{ id: 1, title: "Donation receipt ready", detail: "Receipt RCPT-24018 was generated successfully.", time: "2 min ago" },
	{ id: 2, title: "Booking payment pending", detail: "Booking BK-1022 still needs confirmation.", time: "12 min ago" },
	{ id: 3, title: "Cashier shift update", detail: "Morning counter handover completed.", time: "1 hour ago" },
];

export default function Notifications() {
	return (
		<div className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
			<div className="mx-auto max-w-4xl space-y-6">
				<div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
					<p className="text-sm uppercase tracking-[0.25em] text-orange-600">Cashier</p>
					<h1 className="mt-2 text-3xl font-semibold">Notifications</h1>
				</div>

				<div className="space-y-4">
					{notifications.map((notification) => (
						<article key={notification.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
							<div className="flex items-start justify-between gap-4">
								<div>
									<h2 className="font-semibold text-slate-900">{notification.title}</h2>
									<p className="mt-1 text-sm text-slate-600">{notification.detail}</p>
								</div>
								<span className="text-xs text-slate-400">{notification.time}</span>
							</div>
						</article>
					))}
				</div>
			</div>
		</div>
	);
}
