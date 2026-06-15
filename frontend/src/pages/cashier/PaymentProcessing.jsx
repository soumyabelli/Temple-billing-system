const paymentSteps = ["Verify booking", "Capture amount", "Generate receipt", "Mark complete"];

export default function PaymentProcessing() {
	return (
		<div className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
			<div className="mx-auto max-w-5xl space-y-6">
				<div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
					<p className="text-sm uppercase tracking-[0.25em] text-orange-600">Cashier</p>
					<h1 className="mt-2 text-3xl font-semibold">Payment Processing</h1>
					<p className="mt-2 text-slate-600">Track the payment workflow from verification to receipt generation.</p>
				</div>

				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					{paymentSteps.map((step, index) => (
						<div key={step} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
							<p className="text-xs uppercase tracking-[0.2em] text-slate-400">Step {index + 1}</p>
							<h2 className="mt-2 text-lg font-semibold text-slate-900">{step}</h2>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
