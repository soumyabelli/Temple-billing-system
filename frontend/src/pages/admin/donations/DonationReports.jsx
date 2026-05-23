import SectionCard from "../../../components/admin/employee/SectionCard";
import DonationPageShell from "../../../components/admin/donations/DonationPageShell";

const reportTypes = [
  "Daily Report",
  "Monthly Revenue",
  "Festival Summary",
  "Sponsorship Report",
  "Donor Tax Report",
];

const DonationReports = () => {
  return (
    <DonationPageShell
      title="Donation Reports"
      subtitle="Generate PDF, Excel and CSV reports for temple finance, festivals and donors."
    >
      <SectionCard title="Available Reports" subtitle="Export reports for accounting, tax and festival planning." className="grid gap-4 lg:grid-cols-2">
        {reportTypes.map((type) => (
          <div key={type} className="rounded-3xl border border-white/10 bg-slate-950/10 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-slate-100 font-semibold">{type}</p>
              <button className="rounded-full bg-amber-400 px-4 py-2 text-slate-950 text-sm font-semibold">Export</button>
            </div>
          </div>
        ))}
      </SectionCard>
    </DonationPageShell>
  );
};

export default DonationReports;
