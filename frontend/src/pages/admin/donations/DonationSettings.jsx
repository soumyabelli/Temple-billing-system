import SectionCard from "../../../components/admin/employee/SectionCard";
import DonationPageShell from "../../../components/admin/donations/DonationPageShell";

const DonationSettings = () => {
  return (
    <DonationPageShell
      title="Donation Settings"
      subtitle="Configure categories, receipts, UPI IDs and donation gateway preferences."
      actions={
        <button className="rounded-2xl bg-slate-900/90 px-5 py-3 font-semibold text-white transition hover:bg-slate-800">
          Save Settings
        </button>
      }
    >
      <SectionCard title="Configuration Panels" subtitle="Temple donation system settings for a premium ERP experience." className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-950/10 p-5">
          <p className="text-sm text-slate-400">Donation Categories</p>
          <p className="mt-3 text-white">Annadanam, Temple Fund, Festival Donation, Sponsorship</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/10 p-5">
          <p className="text-sm text-slate-400">UPI & Payment Setup</p>
          <p className="mt-3 text-white">Google Pay, PhonePe, Paytm, BHIM UPI and bank transfer</p>
        </div>
      </SectionCard>
      <SectionCard title="Receipt & Gateway Settings" subtitle="Receipts, QR codes and notification defaults." className="space-y-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-slate-200">
          <p className="text-sm text-amber-200">Receipt prefix:</p>
          <p className="mt-2 text-white">TEMPLE-REC</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-slate-200">
          <p className="text-sm text-amber-200">Notification default:</p>
          <p className="mt-2 text-white">Email and SMS enabled</p>
        </div>
      </SectionCard>
    </DonationPageShell>
  );
};

export default DonationSettings;
