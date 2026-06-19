import { useEffect, useState } from "react";
import { FaLock, FaSave, FaUserCircle } from "react-icons/fa";
import templeBg from "../../assets/temple-bg.jpg";
import CashierPageShell from "../../components/cashier/CashierPageShell";
import { useAuth } from "../../context/AuthContext";
import {
  changeCashierPassword,
  loadCashierProfile,
  saveCashierProfile,
} from "../../services/cashierService";

const emptyProfile = {
  name: "",
  email: "",
  phone: "",
  address: "",
  bloodGroup: "",
  dob: "",
  emergencyContact: "",
  photo: "",
};

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(emptyProfile);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState("");

  const userId = user?.id || user?._id || "";

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await loadCashierProfile(userId);
      const loadedProfile = response?.profile || response?.data?.profile || null;
      const authUser = response?.authUser || response?.data?.authUser || {};
      const nextProfile = loadedProfile || {};

      setProfile(nextProfile);
      setProfileForm({
        name: nextProfile.name || authUser.name || user?.name || "",
        email: nextProfile.email || authUser.email || user?.email || "",
        phone: nextProfile.phone || "",
        address: nextProfile.address || "",
        bloodGroup: nextProfile.bloodGroup || "",
        dob: nextProfile.dob || "",
        emergencyContact: nextProfile.emergencyContact || "",
        photo: nextProfile.photo || "",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    loadProfile();
  }, [userId]);

  const stats = [
    {
      title: "Name",
      value: profileForm.name || user?.name || "Cashier",
      note: "Login profile",
      tone: "orange",
    },
    {
      title: "Email",
      value: profileForm.email || user?.email || "-",
      note: "Account contact",
      tone: "gold",
    },
    {
      title: "Role",
      value: profile?.role || user?.role || "cashier",
      note: "Access level",
      tone: "green",
    },
    {
      title: "Member Since",
      value: profile?.memberSince || new Date().getFullYear(),
      note: "Profile record",
      tone: "blue",
    },
  ];

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setMessage("Please enter the cashier name and email address.");
      return;
    }

    setSavingProfile(true);
    try {
      await saveCashierProfile(userId, {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
        address: profileForm.address.trim(),
        bloodGroup: profileForm.bloodGroup.trim(),
        dob: profileForm.dob || undefined,
        emergencyContact: profileForm.emergencyContact.trim(),
        photo: profileForm.photo.trim(),
      });
      setMessage("Profile updated successfully.");
      await loadProfile();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setMessage("Please complete the password change form.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      await changeCashierPassword(userId, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setMessage("Password changed successfully.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <CashierPageShell
      eyebrow="Profile"
      title="Cashier profile and security settings"
      description="Update your contact information and change the cashier password from one secure place."
      image={templeBg}
      imageAlt="Temple cashier profile"
      stats={stats}
      actions={
        <div className="inline-flex items-center gap-2 rounded-full border border-[#f0c58f] bg-white px-4 py-2 text-sm font-bold text-slate-900">
          <FaUserCircle className="text-[#f28c18]" />
          Personal workspace
        </div>
      }
    >
      {message ? (
        <div className="rounded-2xl border border-[#f4d0a3] bg-[#fff7eb] px-4 py-3 text-sm font-semibold text-[#8a5200]">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[22px] border border-[#f0d3a2] bg-white/95 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-950">Edit profile</h2>
              <p className="mt-1 text-sm font-medium text-slate-700">
                These fields sync with the cashier employee profile record.
              </p>
            </div>
            <FaSave className="text-[#f28c18]" />
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSaveProfile}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Name</span>
                <input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                  placeholder="Cashier name"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Email</span>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                  placeholder="cashier@email.com"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Phone</span>
                <input
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                  placeholder="Phone number"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Emergency contact</span>
                <input
                  value={profileForm.emergencyContact}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, emergencyContact: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                  placeholder="Emergency contact"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Blood group</span>
                <input
                  value={profileForm.bloodGroup}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, bloodGroup: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                  placeholder="O+ / A+"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Date of birth</span>
                <input
                  type="date"
                  value={profileForm.dob}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, dob: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-800">Address</span>
                <textarea
                  rows="4"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, address: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                  placeholder="Enter address"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-800">Photo URL</span>
                <input
                  value={profileForm.photo}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, photo: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                  placeholder="Profile image URL"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={savingProfile || loading}
              className="rounded-2xl bg-[#f28c18] px-5 py-3 text-base font-extrabold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </section>

        <section className="space-y-6">
          <div className="rounded-[22px] border border-[#f0d3a2] bg-white/95 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-950">Security</h2>
                <p className="mt-1 text-sm font-medium text-slate-700">Change the cashier login password here.</p>
              </div>
              <FaLock className="text-[#f28c18]" />
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleChangePassword}>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Current password</span>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                  placeholder="Current password"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">New password</span>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                  placeholder="New password"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Confirm password</span>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                  placeholder="Repeat new password"
                />
              </label>

              <button
                type="submit"
                disabled={savingPassword || loading}
                className="rounded-2xl border border-[#f0c58f] bg-white px-5 py-3 text-base font-extrabold text-slate-900 transition hover:bg-[#fff8ef] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {savingPassword ? "Updating..." : "Change Password"}
              </button>
            </form>
          </div>

          <div className="rounded-[22px] border border-[#f0d3a2] bg-white/95 p-5 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-950">Profile snapshot</h2>
            <div className="mt-4 rounded-[22px] border border-[#ead7bb] bg-[#fffaf4] p-4">
              <div className="flex items-start gap-4">
                <FaUserCircle className="text-5xl text-[#f28c18]" />
                <div className="min-w-0">
                  <p className="text-lg font-extrabold text-slate-950">{profileForm.name || user?.name || "Cashier"}</p>
                  <p className="mt-1 text-sm text-slate-700">{profileForm.email || user?.email || "-"}</p>
                  <p className="mt-1 text-sm text-slate-700">{profileForm.phone || "Phone not provided"}</p>
                  <p className="mt-1 text-sm text-slate-700">{profileForm.address || "Address not provided"}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </CashierPageShell>
  );
};

export default ProfilePage;
