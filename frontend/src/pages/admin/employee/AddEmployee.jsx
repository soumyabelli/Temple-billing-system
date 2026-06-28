import { useEffect, useMemo, useState } from "react";
import { FiUpload, FiChevronRight, FiSave, FiUser, FiBriefcase, FiLock, FiCopy } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import SectionCard from "../../../components/admin/employee/SectionCard";
import {
  employeeRoles,
  roleDepartmentMap,
  departmentDutyMap,
  dutyLocations,
  shiftOptions,
} from "./employeeData";
import { createEmployee } from "../../../services/employeeService";

const initialForm = {
  // Step 1 – Personal Details
  name: "",
  email: "",
  phone: "",
  address: "",
  photo: null,
  gender: "Male",
  dob: "",
  employeeType: "Full Time",
  salary: "",
  joiningDate: "",
  emergencyContact: "",
  aadhar: "",
  // Step 2 – Professional Details
  role: "priest",
  department: "Priest Services",
  defaultShift: "Morning",
  defaultDuty: "",
  dutyLocation: "Main Temple Hall",
  // Step 3 – Account Details
};

const draftKey = "adminEmployeeDraft";

const isValidEmail = (v) => /^\S+@\S+\.\S+$/.test(String(v || "").trim());
const isValidPhone = (v) => /^\+?[0-9]{10,15}$/.test(String(v || "").replace(/[\s-]/g, ""));
const isValidDate = (v) => {
  if (!v) return false;
  return !Number.isNaN(new Date(v).getTime());
};
const isPastOrToday = (v) => {
  if (!isValidDate(v)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(v) <= today;
};

const isAdult = (dob) => {
  if (!dob) return false;

  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 18;
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const steps = [
  { label: "Personal Details", icon: <FiUser /> },
  { label: "Professional Details", icon: <FiBriefcase /> },
  { label: "Account Details", icon: <FiLock /> },
];

const AddEmployee = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [credentials, setCredentials] = useState(null);

  // Departments list derived from selected role
  const departmentList = useMemo(() => roleDepartmentMap[form.role] || [], [form.role]);

  // Duty options derived from selected department
  const dutyList = useMemo(() => departmentDutyMap[form.department] || [], [form.department]);

  // When role changes → reset department to first available
  useEffect(() => {
    const depts = roleDepartmentMap[form.role] || [];
    const firstDept = depts[0] || "";
    const duties = departmentDutyMap[firstDept] || [];
    setForm((prev) => ({
      ...prev,
      department: firstDept,
      defaultDuty: duties[0] || "",
    }));
  }, [form.role]);

  // When department changes → reset duty to first available
  useEffect(() => {
    const duties = departmentDutyMap[form.department] || [];
    setForm((prev) => ({ ...prev, defaultDuty: duties[0] || "" }));
  }, [form.department]);

  // Load draft on mount
  useEffect(() => {
    try {
      const draft = localStorage.getItem(draftKey);
      if (draft) setForm(JSON.parse(draft));
    } catch (_) {}
  }, []);

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(draftKey, JSON.stringify(form));
      setMessage({ type: "success", text: "Draft saved locally." });
    } catch (_) {
      setMessage({ type: "error", text: "Unable to save draft." });
    }
  };

  const handleChange = (field) => (event) => {
    const value = field === "photo" ? event.target.files[0] : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Validate current step before advancing
    if (step === 0) {
      if (!form.name.trim()) return setMessage({ type: "error", text: "Employee name is required." });
      if (!form.email.trim() || !isValidEmail(form.email))
        return setMessage({ type: "error", text: "Please enter a valid email address." });
      if (!form.phone.trim() || !isValidPhone(form.phone))
        return setMessage({ type: "error", text: "Please enter a valid phone number (10 digits)." });
      if (!form.emergencyContact ||!isValidPhone(form.emergencyContact)) {
        return setMessage({ type: "error", text: "Enter valid emergency contact number.",});}
      if (!/^[0-9]{12}$/.test(form.aadhar)) {
        return setMessage({ type: "error", text: "Aadhaar number must be 12 digits.",});}
      if (!form.dob ||!isValidDate(form.dob) ||!isPastOrToday(form.dob)) {
          return setMessage({ type: "error", text: "Please enter a valid date of birth.",});
       }
      if (!isAdult(form.dob)) {
        return setMessage({ type: "error", text: "Employees must be at least 18 years old.",});
      }
      if (form.photo && form.photo.size > 5 * 1024 * 1024) {
        return setMessage({ type: "error", text: "Profile photo must be 5 MB or smaller." });
      }
    }
    if (step === 1) {
  if (!form.salary || Number(form.salary) <= 0) {
    return setMessage({
      type: "error",
      text: "Salary must be greater than 0.",
    });
  }

  if (!form.joiningDate) {
    return setMessage({
      type: "error",
      text: "Joining Date is required, Please put the joining date.",
    });
  }

  const dobDate = new Date(form.dob);
const joiningDate = new Date(form.joiningDate);

const eighteenthBirthday = new Date(dobDate);

eighteenthBirthday.setFullYear(
  eighteenthBirthday.getFullYear() + 18
);

if (joiningDate < eighteenthBirthday) {
  return setMessage({
    type: "error",
    text:
      "Joining Date must be after employee turns 18 years old.",
  });
}

  if (joiningDate > new Date()) {
    return setMessage({
      type: "error",
      text: "Joining Date cannot be a future date.",
    });
  }

  if (!form.department) {
    return setMessage({
      type: "error",
      text: "Please select a department.",
    });
  }

  if (!form.defaultDuty) {
    return setMessage({
      type: "error",
      text: "Please select a default duty.",
    });
  }
}
    setMessage(null);
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setMessage(null);
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    setIsSaving(true);
    try {
      const photoDataUrl = await readFileAsDataUrl(form.photo);
      const payload = {
  name: form.name.trim(),
  email: form.email.trim(),
  phone: form.phone.trim(),
  address: form.address.trim(),

  gender: form.gender,
  dob: form.dob,

  employeeType: form.employeeType,
  salary: Number(form.salary),
  joiningDate: form.joiningDate,
  emergencyContact: form.emergencyContact,
  aadhaar: form.aadhar,

  role: form.role,
  department: form.department,
  defaultShift: form.defaultShift,
  defaultDuty: form.defaultDuty,
  dutyLocation: form.dutyLocation,
  currentDuty: {
    dutyName: form.defaultDuty,
    shift: form.defaultShift,
    dutyLocation: form.dutyLocation,
    reportingTime: "",
    workingHours: "",
    supervisor: "Admin",
    priority: "Medium",
  },

  photo: photoDataUrl,
};
      const response = await createEmployee(payload);
      setCredentials(response.credentials);
      setMessage({ type: "success", text: "Employee created successfully. Login credentials are ready." });
      setForm(initialForm);
      localStorage.removeItem(draftKey);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Unable to save employee." });
    } finally {
      setIsSaving(false);
    }
  };

  const copyCredentials = async () => {
    if (!credentials) return;
    await navigator.clipboard.writeText(
      [
        `Employee ID: ${credentials.employeeId}`,
        `Username: ${credentials.username}`,
        `Temporary Password: ${credentials.temporaryPassword}`,
      ].join("\n")
    );
    setMessage({ type: "success", text: "Credentials copied to clipboard." });
  };

  const photoPreview = form.photo ? URL.createObjectURL(form.photo) : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-[32px] border border-white/15 bg-gradient-to-r from-[#2c1c4f] via-[#4c3a7d] to-[#8b67cf] p-6 text-white shadow-2xl shadow-violet-500/20 backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-amber-300/80">Employee Management</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">Add Employee</h1>
            <p className="max-w-2xl text-slate-200/90 mt-2">
              Onboard a new temple employee in three simple steps.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-3 font-semibold text-slate-950 shadow-xl shadow-amber-500/20 transition hover:-translate-y-0.5"
          >
            <FiSave /> Save Draft
          </button>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.3fr_0.9fr]">
        {/* Form Card */}
        <SectionCard title="New Employee Registration" subtitle="Complete the onboarding steps below." className="overflow-hidden">
          {/* Step Indicator */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {steps.map(({ label, icon }, index) => (
              <div
                key={label}
                className={`rounded-3xl border p-4 text-center transition ${
                  index === step
                    ? "border-amber-400 bg-amber-50 shadow-lg"
                    : index < step
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-slate-200 bg-white/90"
                }`}
              >
                <div
                  className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold ${
                    index === step
                      ? "bg-amber-400 text-white"
                      : index < step
                      ? "bg-emerald-400 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {index < step ? "✓" : index + 1}
                </div>
                <p className="text-sm font-semibold text-slate-800">{label}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ── Step 1: Personal Details ── */}
            {step === 0 && (
              <div className="grid gap-5 md:grid-cols-2">
                {/* Employee Name */}
                <label className="block space-y-2 text-sm text-slate-700">
                  Employee Name <span className="text-rose-500">*</span>
                  <input
                    value={form.name}
                    onChange={handleChange("name")}
                    placeholder="e.g., Ramesh Kumar"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-400 transition"
                    required
                  />
                </label>

                {/* Email */}
                <label className="block space-y-2 text-sm text-slate-700">
                  Email <span className="text-rose-500">*</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    placeholder="employee@temple.org"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-400 transition"
                    required
                  />
                </label>

                {/* Phone Number */}
                <label className="block space-y-2 text-sm text-slate-700">
                  Phone Number <span className="text-rose-500">*</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    placeholder="+91 90000 00000"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-400 transition"
                    required
                  />
                </label>

                {/* Gender */}
                <label className="block space-y-2 text-sm text-slate-700">
                  Gender
                  <select
                    value={form.gender}
                    onChange={handleChange("gender")}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-400 transition"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </label>

                {/* Date of Birth */}
                <label className="block space-y-2 text-sm text-slate-700">
                  Date of Birth <span className="text-rose-500">*</span>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={handleChange("dob")}
                    max={
                      new Date(
                        new Date().setFullYear(
                          new Date().getFullYear() - 18
                        )
                      )
                    .toISOString()
                    .split("T")[0]
                    }
                  />
                </label>

                {/*Emergency Contact*/}
                <label className="block space-y-2 text-sm text-slate-700">
                  Emergency Contact *
                  <input
                    type="tel"
                    value={form.emergencyContact}
                    onChange={handleChange("emergencyContact")}
                    placeholder="Emergency Contact Number"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
                  />
                </label>

                {/* Aadhar Number */}
                <label className="block space-y-2 text-sm text-slate-700">
                  Aadhaar Number *
                  <input
                    type="text"
                    maxLength={12}
                    value={form.aadhar}
                    onChange={handleChange("aadhar")}
                    placeholder="123456789012"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
                  />
                </label>

                {/* Address */}
                <label className="block space-y-2 text-sm text-slate-700 md:col-span-2">
                  Address
                  <textarea
                    value={form.address}
                    onChange={handleChange("address")}
                    rows={3}
                    placeholder="Full residential address"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-400 transition"
                  />
                </label>

                {/* Photo Upload */}
                <label className="block space-y-2 text-sm text-slate-700 md:col-span-2">
                  Profile Photo
                  <div className="flex items-center gap-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4">
                    {photoPreview && (
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="h-14 w-14 rounded-2xl object-cover border border-slate-200"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleChange("photo")}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-100 transition"
                    >
                      <FiUpload /> {form.photo ? "Change Photo" : "Choose Photo"}
                    </label>
                    <span className="text-sm text-slate-500">PNG, JPG up to 5 MB</span>
                  </div>
                </label>
              </div>
            )}

            {/* ── Step 2: Professional Details ── */}
            {step === 1 && (
              <div className="grid gap-5 md:grid-cols-2">
                {/* Role */}
                <label className="block space-y-2 text-sm text-slate-700">
                  Role <span className="text-rose-500">*</span>
                  <select
                    value={form.role}
                    onChange={handleChange("role")}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-400 transition"
                  >
                    {employeeRoles.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Department — auto-updates when role changes */}
                <label className="block space-y-2 text-sm text-slate-700">
                  Department <span className="text-rose-500">*</span>
                  <select
                    value={form.department}
                    onChange={handleChange("department")}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-400 transition"
                  >
                    {departmentList.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">Auto-loaded based on selected role</p>
                </label>

                {/* Employee Type */}
                <label className="block space-y-2 text-sm text-slate-700">
                  Employee Type *
                  <select
                    value={form.employeeType}
                    onChange={handleChange("employeeType")}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Contract">Contract</option>
                  </select>
                </label>

                {/* Salary */}
                <label className="block space-y-2 text-sm text-slate-700">
                  Monthly Salary *
                  <input
                    type="number"
                    min="1"
                    value={form.salary}
                    onChange={handleChange("salary")}
                    placeholder="25000"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
                  />
                </label>

                {/* Joining Date */}
                <label className="block space-y-2 text-sm text-slate-700">
                  Joining Date *
                  <input
  type="date"
  value={form.joiningDate}
  onChange={handleChange("joiningDate")}
  min={
    form.dob
      ? new Date(
          new Date(form.dob).setFullYear(
            new Date(form.dob).getFullYear() + 18
          )
        )
          .toISOString()
          .split("T")[0]
      : ""
  }
  max={new Date().toISOString().split("T")[0]}
  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
/>
                </label>

                {/* Default Shift */}
                <label className="block space-y-2 text-sm text-slate-700">
                  Default Shift <span className="text-rose-500">*</span>
                  <select
                    value={form.defaultShift}
                    onChange={handleChange("defaultShift")}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-400 transition"
                  >
                    {shiftOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Default Duty — auto-updates when department changes */}
                <label className="block space-y-2 text-sm text-slate-700">
                  Default Duty <span className="text-rose-500">*</span>
                  <select
                    value={form.defaultDuty}
                    onChange={handleChange("defaultDuty")}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-400 transition"
                  >
                    {dutyList.map((duty) => (
                      <option key={duty} value={duty}>
                        {duty}
                      </option>
                    ))}
                    {dutyList.length === 0 && <option value="">No duties configured</option>}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">Auto-loaded based on selected department</p>
                </label>

                {/* Duty Location */}
                <label className="block space-y-2 text-sm text-slate-700 md:col-span-2">
                  Duty Location <span className="text-rose-500">*</span>
                  <select
                    value={form.dutyLocation}
                    onChange={handleChange("dutyLocation")}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-400 transition"
                  >
                    {dutyLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Auto-assignment info banner */}
                <div className="md:col-span-2 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4">
                  <p className="text-sm font-semibold text-amber-800 mb-2">✦ What happens after save?</p>
                  <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                    <li>Employee Profile is created automatically</li>
                    <li>Default Shift, Duty &amp; Location are assigned</li>
                    <li>Login account and role dashboard are activated</li>
                    <li>Temporary password is generated automatically</li>
                  </ul>
                </div>
              </div>
            )}

            {/* ── Step 3: Account Details ── */}
            {step === 2 && (
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block space-y-2 text-sm text-slate-700 md:col-span-2">
                  <span className="font-medium">Login Email</span>
                  <div className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600 text-sm">
                    {form.email || "—"}
                  </div>
                  <p className="text-xs text-slate-400">Email entered in Step 1 will be used as login</p>
                </label>
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 md:col-span-2">
                  Employee ID, username, login account, and temporary password will be generated automatically after Save Employee.
                </div>

                {/* Summary Review */}
                <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                  <p className="text-sm font-semibold text-slate-700 mb-3">Review Before Saving</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-500 text-xs">Name</p>
                      <p className="font-semibold text-slate-800">{form.name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Gender</p>
                      <p className="font-semibold text-slate-800">{form.gender}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Role</p>
                      <p className="font-semibold text-slate-800 capitalize">{form.role}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Department</p>
                      <p className="font-semibold text-slate-800">{form.department}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Employee Type</p>
                      <p className="font-semibold text-slate-800">{form.employeeType}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Salary</p>
                      <p className="font-semibold text-slate-800">₹{form.salary}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Joining Date</p>
                      <p className="font-semibold text-slate-800">{form.joiningDate}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Emergency Contact</p>
                      <p className="font-semibold text-slate-800">{form.emergencyContact}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Aadhaar</p>
                      <p className="font-semibold text-slate-800">{form.aadhar}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Default Shift</p>
                      <p className="font-semibold text-slate-800">{form.defaultShift}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Default Duty</p>
                      <p className="font-semibold text-slate-800">{form.defaultDuty || "—"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-500 text-xs">Duty Location</p>
                      <p className="font-semibold text-slate-800">{form.dutyLocation}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Message */}
            {message && (
              <div
                className={`rounded-3xl p-4 text-sm ${
                  message.type === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={step === 0}
                className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>
              <div className="flex items-center gap-3">
                {step < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
                  >
                    Continue <FiChevronRight />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg hover:bg-amber-500 transition disabled:opacity-60"
                  >
                    {isSaving ? "Saving…" : "Save Employee"}
                  </button>
                )}
              </div>
            </div>
          </form>
        </SectionCard>

        {/* Live Preview Card */}
        <SectionCard title="Live Preview" subtitle="Profile preview updates as you type." className="h-full">
          <div className="space-y-5 rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-inner shadow-slate-200/30">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="h-20 w-20 rounded-3xl object-cover border border-slate-200" />
              ) : (
                <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                  {form.name ? form.name[0].toUpperCase() : "?"}
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">Employee</p>
                <h3 className="mt-1 text-xl font-bold text-slate-900">{form.name || "New Employee"}</h3>
                <p className="text-sm text-slate-500 capitalize">{form.role}</p>
              </div>
            </div>

            <div className="space-y-3">
              <InfoRow label="Email" value={form.email || "—"} />
              <InfoRow label="Phone" value={form.phone || "—"} />
              <InfoRow label="Gender" value={form.gender} />
              <InfoRow label="Date of Birth" value={form.dob || "—"} />
              <div className="border-t border-slate-200 pt-3 space-y-3">
                <InfoRow label="Department" value={form.department || "—"} highlight />
                <InfoRow label="Default Shift" value={form.defaultShift} highlight />
                <InfoRow label="Default Duty" value={form.defaultDuty || "—"} highlight />
                <InfoRow label="Duty Location" value={form.dutyLocation || "—"} highlight />
              </div>
            </div>

            {/* Status Badge */}
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <div>
                <p className="text-xs text-emerald-700 font-semibold">Status: Assigned</p>
                <p className="text-xs text-emerald-600 mt-0.5">Attendance check-in will be enabled after save</p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
      {credentials && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">Employee Created</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">Login credentials</h3>
            <div className="mt-5 space-y-3 rounded-3xl bg-slate-50 p-4 text-sm">
              <InfoRow label="Employee ID" value={credentials.employeeId} highlight />
              <InfoRow label="Username" value={credentials.username} highlight />
              <InfoRow label="Temporary Password" value={credentials.temporaryPassword} highlight />
            </div>
            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={copyCredentials}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900"
              >
                <FiCopy /> Copy Credentials
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/employees")}
                className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-950"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Small helper component for preview rows
const InfoRow = ({ label, value, highlight }) => (
  <div className={`rounded-2xl px-4 py-3 ${highlight ? "bg-violet-50" : "bg-white"} shadow-sm`}>
    <p className="text-xs text-slate-400">{label}</p>
    <p className={`mt-0.5 text-sm font-semibold ${highlight ? "text-violet-800" : "text-slate-800"}`}>{value}</p>
  </div>
);

export default AddEmployee;
