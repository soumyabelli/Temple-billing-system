import { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../../services/priestService";
import { FiUser, FiPhone, FiMapPin, FiAward, FiBook, FiSave } from "react-icons/fi";

const PriestProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    phone: "",
    address: "",
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile(data);
      setFormData({
        phone: data.phone || "",
        address: data.address || "",
      });
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await updateProfile(formData);
      setSuccess("Profile updated successfully");
      loadProfile();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading profile...</div>;
  if (!profile) return <div className="p-10 text-center text-rose-500">Failed to load profile.</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500">Manage your personal information and temple credentials.</p>
      </div>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</div>}
      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">{success}</div>}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Read-only Credentials */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-4xl mb-4 border-4 border-white shadow-md">
              {profile.photo ? <img src={profile.photo} alt="Profile" className="h-full w-full rounded-full object-cover" /> : <FiUser />}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
            <p className="text-sm font-medium text-amber-600 mb-4">{profile.vedaShakha || "Priest"}</p>
            <div className="w-full text-left text-sm text-slate-600 space-y-3">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Employee ID</span>
                <span className="font-mono font-medium">{profile.employeeId.slice(-6).toUpperCase()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Experience</span>
                <span className="font-medium">{profile.experience}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Joined</span>
                <span className="font-medium">{profile.joiningDate}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4"><FiAward className="text-amber-500" /> Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {profile.specializations?.map((spec, i) => (
                <span key={i} className="inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-100">
                  {spec}
                </span>
              ))}
              {(!profile.specializations || profile.specializations.length === 0) && <span className="text-sm text-slate-500">None added</span>}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4"><FiBook className="text-amber-500" /> Languages Known</h3>
            <div className="flex flex-wrap gap-2">
              {profile.languages?.map((lang, i) => (
                <span key={i} className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {lang}
                </span>
              ))}
              {(!profile.languages || profile.languages.length === 0) && <span className="text-sm text-slate-500">None added</span>}
            </div>
          </div>
        </div>

        {/* Right Column: Editable Info */}
        <div className="md:col-span-2">
          <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-5">
              <h3 className="font-bold text-slate-900">Personal Information</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 outline-none"
                  />
                  <p className="mt-1 text-xs text-slate-500">Email cannot be changed.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Residential Address</label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-3 text-slate-400" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your full address"
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
                >
                  <FiSave /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriestProfile;
