export default function Navbar({ children }) {
	return (
		<nav className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
			<div>
				<p className="text-sm font-semibold text-slate-900">Temple Billing System</p>
				<p className="text-xs text-slate-500">Navigation</p>
			</div>
			<div className="flex items-center gap-3">{children}</div>
		</nav>
	);
}
