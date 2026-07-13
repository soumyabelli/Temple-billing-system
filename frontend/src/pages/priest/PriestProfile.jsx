import { useCallback, useEffect, useState } from "react";
import { FiSave } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import {
  changeEmployeePassword,
  getEmployeeProfile,
  updateEmployeeProfile,
} from "../../services/employeeService";
import "../staff/StaffDashboard.css"; // Reuse staff profile CSS

const BLOOD_GROUPS = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
const STAFF_PROFILE_EDITABLE_FIELDS = ["name", "email", "bloodGroup", "dob", "phone", "emergencyContact", "address", "photo", "bankName", "accountNumber"];

const bankOptions = [
  "State Bank of India (SBI)",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Punjab National Bank (PNB)",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "Kotak Mahindra Bank",
  "IndusInd Bank",
  "Other",
];

const buildEditableProfilePayload = (profile = {}) =>
  STAFF_PROFILE_EDITABLE_FIELDS.reduce((payload, field) => {
    payload[field] = profile[field] ?? "";
    return payload;
  }, {});

const getStaffProfileDetails = (profile = {}) => {
  const details = [
    { label: "Role", value: profile.role || "-" },
    { label: "Status", value: profile.status || "-" },
    { label: "Gender", value: profile.gender || "-" },
    { label: "Aadhaar", value: profile.aadhaar || "-" },
    { label: "Joining Date", value: profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString("en-IN") : "-" },
    { label: "Shift", value: profile.currentDuty?.shift || profile.defaultShift || profile.shift || "-" },
    { label: "Department", value: profile.department || "-" },
    { label: "Employment Type", value: profile.employmentType || "-" },
    { label: "Salary", value: profile.salary || "-" },
    { label: "Veda Shakha", value: profile.vedaShakha || "-" },
    { label: "Specializations", value: profile.specializations?.length ? profile.specializations.join(", ") : "-" },
    { label: "Languages", value: profile.languages?.length ? profile.languages.join(", ") : "-" },
  ];
  return details.filter(d => d.value !== "-" && d.value !== "");
};

const toProfileForm = (profile = {}) => ({
  name: profile.name || "",
  email: profile.email || "",
  role: profile.role || "priest",
  gender: profile.gender || "Male",
  dob: profile.dob || "",
  bloodGroup: profile.bloodGroup || "O+",
  aadhaar: profile.aadhaar || "",
  phone: profile.phone || "",
  emergencyContact: profile.emergencyContact || "",
  address: profile.address || "",
  photo: profile.photo || "",
  bankName: profile.bankName || "",
  accountNumber: profile.accountNumber || "",
});

const PriestProfile = () => {
  const { user, updateUser } = useAuth();
  const priestId = user?.id || user?._id;
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [staff, setStaff] = useState(null);

  const [profileForm, setProfileForm] = useState(toProfileForm());
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fetchProfileData = useCallback(async () => {
    if (!priestId) return;
    try {
      setProfileLoading(true);
      setProfileMessage("");
      const response = await getEmployeeProfile(priestId);
      setStaff(response.profile);
      setProfileForm(toProfileForm(response.profile));
      if (response.authUser && updateUser) {
        updateUser(response.authUser);
      }
    } catch (apiError) {
      setProfileMessage(apiError.response?.data?.message || "Failed to load profile details");
    } finally {
      setProfileLoading(false);
    }
  }, [priestId, updateUser]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleProfileInputChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfilePhotoChange = (file) => {
    if (!file) {
      setProfileForm((prev) => ({ ...prev, photo: "" }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfileForm((prev) => ({ ...prev, photo: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setProfileMessage("Name and email are required");
      return;
    }
    if (!profileForm.bankName || profileForm.bankName.trim() === "") {
      setProfileMessage("Bank Name is required");
      return;
    }
    const acc = profileForm.accountNumber ? profileForm.accountNumber.trim() : "";
    if (!acc || !/^[0-9]{9,18}$/.test(acc)) {
      setProfileMessage("Valid Account Number (9-18 digits) is required");
      return;
    }

    try {
      setProfileSaving(true);
      setProfileMessage("");
      const response = await updateEmployeeProfile(priestId, buildEditableProfilePayload(profileForm));
      setStaff(response.profile);
      setProfileForm(toProfileForm(response.profile));
      if (response.authUser && updateUser) {
        updateUser(response.authUser);
      }
      setProfileMessage("Profile updated successfully");
    } catch (apiError) {
      setProfileMessage(apiError.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordMessage("Please fill all password fields");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage("New password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("New passwords do not match");
      return;
    }

    try {
      setPasswordSaving(true);
      setPasswordMessage("");
      await changeEmployeePassword(priestId, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMessage("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (apiError) {
      setPasswordMessage(apiError.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="staff-dashboard-page" style={{ minHeight: "auto", background: "none", padding: 0, width: "100%", display: "block" }}>
      <section className="profile-settings-page" style={{ maxWidth: "100%", margin: 0, padding: 0 }}>
        <div className="profile-settings-header">
          <div>
            <h2>Profile Settings</h2>
            <p className="profile-section-intro">
              Update your personal details here. Employment details below stay synced with admin changes.
            </p>
          </div>
          <button type="button" onClick={fetchProfileData} disabled={profileLoading}>
            {profileLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="profile-settings-grid">
          <div className="table-card">
            <h3 className="section-title">My Personal Details</h3>
            <p className="section-subtitle">You can update your own contact details, photo, and login email here.</p>
            <form onSubmit={handleProfileSave} className="leave-form">
              <div className="date-grid">
                <div>
                  <label htmlFor="profile-name">Full Name</label>
                  <input
                    id="profile-name"
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => handleProfileInputChange("name", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="profile-email">Email</label>
                  <input
                    id="profile-email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => handleProfileInputChange("email", e.target.value)}
                  />
                </div>
              </div>

              <div className="profile-photo-upload">
                <div className="profile-photo-preview">
                  {profileForm.photo ? (
                    <img src={profileForm.photo} alt={profileForm.name || "Profile preview"} />
                  ) : (
                    <span>{(profileForm.name || staff?.name || "S").charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="profile-photo-upload-content">
                  <label htmlFor="profile-photo">Profile Picture</label>
                  <input
                    id="profile-photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleProfilePhotoChange(e.target.files?.[0])}
                  />
                  <p>Optional. Upload a JPG or PNG so admin can see your photo in employee details.</p>
                </div>
              </div>

              <div className="date-grid">
                <div>
                  <label htmlFor="profile-blood">Blood Group</label>
                  <select
                    id="profile-blood"
                    value={profileForm.bloodGroup}
                    onChange={(e) => handleProfileInputChange("bloodGroup", e.target.value)}
                  >
                    {BLOOD_GROUPS.map((bloodGroup) => (
                      <option key={bloodGroup} value={bloodGroup}>
                        {bloodGroup}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="profile-dob">Date of Birth</label>
                  <input
                    id="profile-dob"
                    type="date"
                    value={profileForm.dob}
                    onChange={(e) => handleProfileInputChange("dob", e.target.value)}
                  />
                </div>
              </div>

              <div className="date-grid">
                <div>
                  <label htmlFor="profile-phone">Phone</label>
                  <input
                    id="profile-phone"
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => handleProfileInputChange("phone", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="profile-emergency">Emergency Contact</label>
                  <input
                    id="profile-emergency"
                    type="text"
                    value={profileForm.emergencyContact}
                    onChange={(e) => handleProfileInputChange("emergencyContact", e.target.value)}
                  />
                </div>
              </div>

              <label htmlFor="profile-address">Address</label>
              <textarea
                id="profile-address"
                rows="3"
                value={profileForm.address}
                onChange={(e) => handleProfileInputChange("address", e.target.value)}
              />

              <div className="date-grid" style={{ marginTop: "1rem" }}>
                <div>
                  <label htmlFor="profile-bankName">Bank Name</label>
                  <select
                    id="profile-bankName"
                    value={profileForm.bankName}
                    onChange={(e) => handleProfileInputChange("bankName", e.target.value)}
                  >
                    <option value="" disabled>Select Bank</option>
                    {bankOptions.map((bank) => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="profile-accountNumber">Account Number</label>
                  <input
                    id="profile-accountNumber"
                    type="text"
                    value={profileForm.accountNumber}
                    onChange={(e) => handleProfileInputChange("accountNumber", e.target.value)}
                  />
                </div>
              </div>

              {profileMessage ? <p className="profile-note">{profileMessage}</p> : null}

              <div className="form-actions">
                <button type="submit" disabled={profileSaving}>
                  <FiSave />
                  {profileSaving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>

            <div className="profile-admin-details">
              <div className="profile-admin-details-head">
                <div>
                  <h4>Admin Managed Details</h4>
                  <p>These values are read-only here and stay in sync with the employee record.</p>
                </div>
              </div>
              <div className="profile-info-grid">
                {getStaffProfileDetails(staff || {}).map((detail, index) => (
                  <div key={index} className="profile-info-card">
                    <span>{detail.label}</span>
                    <strong>{detail.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="table-card">
            <h3 className="section-title">Change Password</h3>
            <p className="section-subtitle">Update your login password securely.</p>
            <form onSubmit={handlePasswordSave} className="leave-form">
              <div>
                <label htmlFor="current-password">Current Password</label>
                <input
                  id="current-password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="new-password">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="confirm-password">Confirm New Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>
              {passwordMessage ? <p className="profile-note">{passwordMessage}</p> : null}
              <div className="form-actions" style={{ marginTop: "1rem" }}>
                <button type="submit" disabled={passwordSaving}>
                  <FiSave />
                  {passwordSaving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PriestProfile;
