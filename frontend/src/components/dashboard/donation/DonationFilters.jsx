const DonationFilters = () => {
  return (
    <div className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl text-white">
      <h2 className="text-2xl font-semibold">Admin Filters</h2>
      <p className="mt-2 text-slate-400">Quickly slice donation data for approval, reporting, or category review.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <input
          type="text"
          placeholder="Search donor / receipt"
          className="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
        />
        <select className="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20">
          <option>All Donation Types</option>
          <option>Annadanam</option>
          <option>Temple Fund</option>
          <option>Festival Donation</option>
          <option>Sponsorship</option>
        </select>
        <select className="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20">
          <option>All Statuses</option>
          <option>Pending Verification</option>
          <option>Verified</option>
          <option>Refund Requested</option>
        </select>
        <button className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-400 px-5 py-3 font-semibold text-slate-950 transition hover:opacity-95">Apply Filters</button>
      </div>
    </div>
  );
};

export default DonationFilters;
