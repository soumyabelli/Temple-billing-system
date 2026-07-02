import { useState } from "react";
import { FaCheckCircle, FaUserPlus } from "react-icons/fa";
import templeBg from "../../assets/temple-bg.jpg";
import CashierPageShell from "../../components/cashier/CashierPageShell";
import { registerDevotee } from "../../services/cashierService";
import { useNotifications } from "../../context/NotificationContext";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  place: "",
  password: "",
  confirmPassword: "",
};

const normalizeEmail = (email) => String(email || "").trim().toLowerCase().replace(/@temple\.local$/, "@gmail.com");

const RegisterDevoteesPage = () => {
  const { loadNotifications } = useNotifications();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [recent, setRecent] = useState(() => {
    try {
      const stored = localStorage.getItem("recentDevotees");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.place.trim() || !form.address.trim() || !form.password || !form.confirmPassword) {
      setMessage("Please fill all required fields (Name, Email, Phone, Place/City, Address, Password).");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(form.email.trim())) {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.phone.trim())) {
      setMessage("Phone number must be exactly 10 digits (numbers only).");
      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(form.place.trim())) {
      setMessage("Place/City must contain characters/letters and spaces only.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      await registerDevotee({
        name: form.name.trim(),
        email: normalizeEmail(form.email),
        phone: form.phone.trim(),
        address: form.address.trim(),
        place: form.place.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: "devotee",
      });

      const newDevotee = {
        name: form.name.trim(),
        email: normalizeEmail(form.email),
        phone: form.phone.trim(),
        place: form.place.trim(),
      };

      setRecent((current) => {
        const updated = [newDevotee, ...current].slice(0, 5);
        localStorage.setItem("recentDevotees", JSON.stringify(updated));
        return updated;
      });

      setForm(emptyForm);
      setMessage("Devotee registered successfully. They can now log in with the new account.");
      loadNotifications().catch(() => {});
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to register devotee.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CashierPageShell
      eyebrow="Register Devotees"
      image={templeBg}
      imageAlt="Temple devotee registration"
      actions={
        <div className="inline-flex items-center gap-2 rounded-full border border-[#f0c58f] bg-white px-4 py-2 text-sm font-bold text-slate-900">
          <FaUserPlus className="text-[#f28c18]" />
          Full registration form
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[22px] border border-[#f0d3a2] bg-white/95 p-5 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-950">New devotee registration</h2>
          <p className="mt-1 text-sm font-medium text-slate-700">
            Fill every required field so the devotee account is ready for bookings and donations.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Full name</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                  placeholder="Enter full name"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Email address</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                  placeholder="devotee@email.com"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Phone number</span>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                  placeholder="+91 98765 43210"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Place / city</span>
                <input
                  value={form.place}
                  onChange={(e) => setForm((prev) => ({ ...prev, place: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                  placeholder="Enter place or city"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-800">Address</span>
                <textarea
                  rows="4"
                  value={form.address}
                  onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                  placeholder="Enter complete postal address"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Password</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                  placeholder="Create password"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Confirm password</span>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                  placeholder="Repeat password"
                />
              </label>
            </div>

            {message ? (
              <div className="rounded-2xl border border-[#f4d0a3] bg-[#fff7eb] px-4 py-3 text-sm font-semibold text-[#8a5200]">
                {message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-[#f28c18] px-5 py-3 text-base font-extrabold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Registering..." : "Register Devotee"}
            </button>
          </form>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[22px] border border-[#f0d3a2] bg-white/95 p-5 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-950">What gets saved</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="rounded-2xl bg-[#fff8ef] px-4 py-3">Name, email, phone, address and place.</div>
              <div className="rounded-2xl bg-[#fff8ef] px-4 py-3">A devotee login account with the role set to devotee.</div>
              <div className="rounded-2xl bg-[#fff8ef] px-4 py-3">Ready for bookings, donations and receipt history.</div>
            </div>
          </section>

          <section className="rounded-[22px] border border-[#f0d3a2] bg-white/95 p-5 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-950">Recent registrations</h2>
            <div className="mt-4 space-y-3">
              {recent.length ? (
                recent.map((item) => (
                  <div key={`${item.email}-${item.phone}`} className="rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-950">{item.name}</p>
                        <p className="mt-1 text-sm text-slate-700">{item.email}</p>
                      </div>
                      <FaCheckCircle className="text-[#16a34a]" />
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{item.phone || "-"}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.place || "Place not provided"}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-[#fff8ef] px-4 py-3 text-sm text-slate-700">
                  No devotee registrations yet.
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </CashierPageShell>
  );
};

export default RegisterDevoteesPage;
