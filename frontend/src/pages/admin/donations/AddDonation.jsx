import { useEffect, useState } from "react";
import axios from "axios";
import SectionCard from "../../../components/admin/employee/SectionCard";
import DonationPageShell from "../../../components/admin/donations/DonationPageShell";
import { getDonationTypes } from "../../../services/donationTypeService";

const paymentMethods = ["Cash", "UPI", "Debit Card", "Credit Card", "Net Banking"];

const AddDonation = () => {
  const [donorName, setDonorName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [categories, setCategories] = useState(getDonationTypes());
  const [category, setCategory] = useState(categories[0] || "General");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(paymentMethods[1]);
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadDonationTypes = () => {
    const savedTypes = getDonationTypes();
    setCategories(savedTypes);
    setCategory((current) => (savedTypes.includes(current) ? current : savedTypes[0] || "General"));
  };

  useEffect(() => {
    loadDonationTypes();
    const handleStorage = (event) => {
      if (event.key === "donationTypes") {
        loadDonationTypes();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!donorName.trim() || !amount.trim()) {
      alert("Please enter donor name and amount.");
      return;
    }

    try {
      setIsSaving(true);
      const res = await axios.post("http://localhost:5000/api/donations", {
        donorName,
        contactNumber,
        amount,
        category,
        paymentMethod: method,
        transactionId,
        notes,
      });

      if (res.data?.success) {
        alert("Donation saved successfully.");
        setDonorName("");
        setContactNumber("");
        setAmount("");
        setCategory(categories[0] || "General");
        setMethod(paymentMethods[1]);
        setTransactionId("");
        setNotes("");
      } else {
        alert(res.data?.message || "Unable to save donation.");
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Donation save failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DonationPageShell
      title="Add Donation"
      subtitle="Create a premium temple donation entry with receipt previews, validation and transaction capture."
      actions={
        <button className="rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-200">
          Generate Receipt
        </button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <SectionCard title="Donation Entry Form" subtitle="Fill donor details, donation type and payment information." className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-slate-700">
              Donor Name
              <input
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                placeholder="Enter donor name"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Contact Number
              <input
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                placeholder="+91 98765 43210"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Donation Type
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex-1 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                >
                  {categories.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={loadDonationTypes}
                  className="rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 transition hover:bg-slate-900"
                >
                  Refresh Types
                </button>
              </div>
            </label>
            <label className="block text-sm text-slate-700">
              Amount
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                placeholder="₹ 12,500"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-slate-700">
              Payment Method
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
              >
                {paymentMethods.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-slate-700">
              UPI Transaction ID
              <input
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                placeholder="UPI123456789"
              />
            </label>
          </div>

          <label className="block text-sm text-slate-700">
            Notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
              rows="4"
              placeholder="Donation notes, sponsorship details or receipt remarks."
            />
          </label>

          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="rounded-3xl bg-amber-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save Donation"}
          </button>
        </SectionCard>

        <SectionCard title="Live Preview" subtitle="This donation entry will generate a receipt and verification flow." className="space-y-5">
          <div className="rounded-[28px] border border-white/10 bg-slate-950/10 p-5 text-slate-50">
            <div className="flex items-center justify-between">
              <span className="text-sm uppercase tracking-[0.3em] text-amber-200/80">Donation Receipt</span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-slate-950">Draft</span>
            </div>
            <div className="mt-6 space-y-3">
              <p className="text-sm text-slate-400">Donor: {donorName || "Ramesh Kumar"}</p>
              <p className="text-sm text-slate-400">Amount: {amount ? amount : "₹5,000"}</p>
              <p className="text-sm text-slate-400">Type: {category}</p>
              <p className="text-sm text-slate-400">Payment: {method}</p>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-950/10 p-5">
            <p className="text-sm text-slate-300">Support Material</p>
            <div className="mt-4 grid gap-3">
              <button className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left text-sm text-slate-200">Upload QR image</button>
              <button className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left text-sm text-slate-200">Upload payment screenshot</button>
            </div>
          </div>
        </SectionCard>
      </div>
    </DonationPageShell>
  );
};

export default AddDonation;
