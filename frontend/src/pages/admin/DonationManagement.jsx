import DonationStats from "../../components/dashboard/donation/DonationStats";
import DonationCharts from "../../components/dashboard/donation/DonationCharts";
import DonationFilters from "../../components/dashboard/donation/DonationFilters";
import DonationTable from "../../components/dashboard/donation/DonationTable";
import RecentDonations from "../../components/dashboard/donation/RecentDonations";
import TopDonors from "../../components/dashboard/donation/TopDonors";

const DonationManagement = () => {
  return (
    <div className="space-y-6 mt-5">
      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-r from-[#2f0f4f] via-[#5e2d97] to-[#c78918] p-8 text-white shadow-2xl shadow-violet-900/25">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),transparent_34%)]" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.32em] text-amber-200/80">Donation Command Center</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">Admin Donation Overview</h1>
            <p className="mt-4 text-slate-200/85 text-lg">High-level donation intelligence for administrators: reports, category performance, donor health, verification workflows and donation-type governance.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button className="rounded-3xl bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-200">View Reports</button>
            <button className="rounded-3xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20">Open Verification</button>
          </div>
        </div>
      </div>

      <DonationStats />

      <div className="grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
        <DonationCharts />

        <div className="grid gap-6">
          <DonationFilters />
          <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl text-white">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Admin Focus</p>
            <h2 className="mt-3 text-2xl font-semibold">What the admin sees</h2>
            <ul className="mt-5 space-y-3 text-slate-300">
              <li>• Donation collection trends across campaigns, festivals and UPI flows.</li>
              <li>• Pending verification, refund requests and receipt status.</li>
              <li>• Donation types, sponsorship programs and donor segmentation.</li>
              <li>• High-value donors, category targets and compliance-ready exports.</li>
            </ul>
          </div>
        </div>
      </div>

      <DonationTable />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RecentDonations />
        <TopDonors />
      </div>
    </div>
  );
};

export default DonationManagement;
