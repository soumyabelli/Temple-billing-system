import React from "react";

const RecentDonations = ({ donations = [] }) => {
  const recent = [...donations]
    .sort((a, b) => new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime())
    .slice(0, 5);

  return (
    <div className="rounded-[32px] border border-amber-200/60 bg-temple-100 dark:bg-[#0f172a] p-6 shadow-md backdrop-blur-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-200">Recent Donation Activity</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">Live verified donation inflows from the temple database ledger.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Inflows
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {recent.map((donation, index) => {
          const isCollected = donation.status === "Collected" || donation.status === "Completed";
          const isCash = donation.paymentMethod === "Cash";
          const txnId = isCash
            ? "Offline Payment"
            : (donation.transactionId || donation.razorpayPaymentId || (donation.razorpayOrderId ? donation.razorpayOrderId.replace(/^order_/, "pay_") : "Online"));

          return (
            <div key={`${donation._id || donation.id}-${index}`} className="rounded-2xl border border-amber-200/60 bg-white dark:bg-[#0f172a] p-4 shadow-xs hover:shadow-sm transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-extrabold text-slate-900 dark:text-slate-200">{donation.donorName || donation.donor || "Devotee Donor"}</p>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">{txnId}</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-amber-700">{donation.amount ? `₹${Number(donation.amount).toLocaleString("en-IN")}` : "₹0"}</span>
                  <div className="mt-0.5">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                      isCollected
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                        : "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                    }`}>
                      {isCollected ? "Collected" : "Not Collected"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-md bg-amber-50 dark:bg-slate-800 px-2 py-0.5 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-slate-700">{donation.category || "General"}</span>
                  <span className={`rounded-md px-2 py-0.5 border ${isCash ? "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700" : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"}`}>
                    {donation.paymentMethod || "UPI"}
                  </span>
                </div>
                <span>{(donation.createdAt || donation.date) ? new Date(donation.createdAt || donation.date).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recently"}</span>
              </div>
            </div>
          );
        })}
        {recent.length === 0 && <p className="text-slate-400 font-semibold py-4 text-center">No recent donations recorded yet.</p>}
      </div>
    </div>
  );
};

export default RecentDonations;
