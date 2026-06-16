import { useState } from "react";
import SectionCard from "../../../components/admin/employee/SectionCard";
import DonationPageShell from "../../../components/admin/donations/DonationPageShell";
import { addDonationType, clearDonationTypes, getDonationTypes, saveDonationTypes } from "../../../services/donationTypeService";

const DonationSettings = () => {
  const [types, setTypes] = useState(getDonationTypes());
  const [newType, setNewType] = useState("");

  const handleAddType = () => {
    const trimmedType = newType.trim();
    if (!trimmedType) return;
    const updated = addDonationType(trimmedType);
    setTypes(updated);
    setNewType("");
  };

  const handleRemoveType = (typeToRemove) => {
    setTypes((current) => current.filter((type) => type !== typeToRemove));
  };

  const handleSaveSettings = () => {
    saveDonationTypes(types);
    alert("Donation types saved successfully.");
  };

  const handleResetToDefaults = () => {
    clearDonationTypes();
    setTypes(getDonationTypes());
  };

  return (
    <DonationPageShell
      title="Donation Settings"
      subtitle="Configure categories, receipts, UPI IDs and donation gateway preferences."
      actions={
        <button onClick={handleSaveSettings} className="rounded-2xl bg-slate-900/90 px-5 py-3 font-semibold text-white transition hover:bg-slate-800">
          Save Settings
        </button>
      }
    >
      <SectionCard title="Donation Categories" subtitle="Create and manage donation types that appear in the Add Donation form." className="bg-white/95 text-slate-950">
        <div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
          <input
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="rounded-3xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-950 outline-none"
            placeholder="Add a new donation type"
          />
          <button
            onClick={handleAddType}
            className="rounded-3xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            Add Type
          </button>
        </div>

        <div className="mt-6 grid gap-3">
          {types.map((type) => (
            <div key={type} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-950">
              <span>{type}</span>
              <button onClick={() => handleRemoveType(type)} className="rounded-full bg-rose-500/10 px-3 py-1 text-rose-700 transition hover:bg-rose-500/20">
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={handleSaveSettings} className="rounded-3xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400">
            Save Donation Types
          </button>
          <button onClick={handleResetToDefaults} className="rounded-3xl border border-white/20 bg-white/10 px-5 py-3 text-white transition hover:bg-white/20">
            Reset Defaults
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Gateway & Receipt Settings" subtitle="Donation type choices are now persistent across the app." className="bg-white/95 text-slate-950">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-100 p-5">
            <p className="text-sm text-slate-600">Saved types</p>
            <p className="mt-3 text-slate-950">{types.length} categories configured</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-100 p-5">
            <p className="text-sm text-slate-600">Next steps</p>
            <p className="mt-3 text-slate-950">Open Add Donation and refresh to apply the updated categories.</p>
          </div>
        </div>
      </SectionCard>
    </DonationPageShell>
  );
};

export default DonationSettings;
