import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiUpload, FiChevronRight, FiSave } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import SectionCard from "../../../components/admin/employee/SectionCard";
import { departments, employeeRoles, shifts, empTypes } from "./employeeData";
import { createEmployee } from "../../../services/employeeService";

const steps = ["Personal Details", "Professional Details", "Account Details"];

const AddEmployee = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    gender: "Male",
    dob: "",
    bloodGroup: "O+",
    aadhaar: "",
    address: "",
    emergency: "",
    role: "priest",
    department: "Priest Services",
    salary: "",
    shift: "Morning",
    joiningDate: "",
    employmentType: "Full-time",
    email: "",
    password: "",
    permissions: "Standard",
    photo: null,
    document: null,
  });
  const [message, setMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const isValidEmail = (value) => /^\S+@\S+\.\S+$/.test(String(value || "").trim());
  const isValidDate = (value) => {
    if (!value) return false;
    const date = new Date(value);
    return !Number.isNaN(date.getTime());
  };
  const isPastOrToday = (value) => {
    const date = new Date(value);
    if (!isValidDate(value)) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date <= today;
  };

  const previewData = useMemo(
    () => ({
      name: form.name || "New Temple Employee",
      id: form.name ? "EMP" + String(form.name.length + 101).padStart(3, "0") : "EMP000",
      role: form.role,
      department: form.department,
      contact: form.emergency || "+91 90000 00000",
      photo: form.photo ? URL.createObjectURL(form.photo) : "https://i.pravatar.cc/120?img=32",
    }),
    [form.name, form.role, form.department, form.emergency, form.photo]
  );

  const handleChange = (field) => (event) => {
    const value = field === "photo" || field === "document" ? event.target.files[0] : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < steps.length - 1) setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!form.name.trim()) {
      setMessage({ type: "error", text: "Employee name is required." });
      return;
    }

    if (!form.email.trim() || !isValidEmail(form.email)) {
      setMessage({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    if (!form.password || form.password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long." });
      return;
    }

    if (!form.dob || !isValidDate(form.dob) || !isPastOrToday(form.dob)) {
      setMessage({ type: "error", text: "Please enter a valid date of birth." });
      return;
    }

    if (form.joiningDate && (!isValidDate(form.joiningDate) || !isPastOrToday(form.joiningDate))) {
      setMessage({ type: "error", text: "Please enter a valid joining date." });
      return;
    }

    if (form.dob && form.joiningDate) {
      const dobDate = new Date(form.dob);
      const joinDate = new Date(form.joiningDate);
      if (joinDate < dobDate) {
        setMessage({ type: "error", text: "Joining date cannot be earlier than date of birth." });
        return;
      }
    }

    setIsSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        department: form.department,
        shift: form.shift,
        gender: form.gender,
        dob: form.dob,
        bloodGroup: form.bloodGroup,
        aadhaar: form.aadhaar.trim(),
        address: form.address.trim(),
        emergencyContact: form.emergency.trim(),
        salary: form.salary.trim(),
        joiningDate: form.joiningDate,
        employmentType: form.employmentType,
        permissions: form.permissions,
        photo: "",
        documentUrl: "",
      };

      await createEmployee(payload);
      setMessage({ type: "success", text: "Employee created successfully." });
      setForm({
        name: "",
        gender: "Male",
        dob: "",
        bloodGroup: "O+",
        aadhaar: "",
        address: "",
        emergency: "",
        role: "priest",
        department: "Priest Services",
        salary: "",
        shift: "Morning",
        joiningDate: "",
        employmentType: "Full-time",
        email: "",
        password: "",
        permissions: "Standard",
        photo: null,
        document: null,
      });
      navigate("/admin/employees");
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Unable to save employee." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-white/15 bg-gradient-to-r from-[#2c1c4f] via-[#4c3a7d] to-[#8b67cf] p-6 text-white shadow-2xl shadow-violet-500/20 backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-amber-300/80">Employee Management</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">Add Employee</h1>
            <p className="max-w-2xl text-slate-200/90 mt-2">A premium onboarding experience with step-by-step form flow and live profile preview.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-3 font-semibold text-slate-950 shadow-xl shadow-amber-500/20 transition hover:-translate-y-0.5">
            <FiSave /> Save Draft
          </button>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-6">
          <SectionCard title="New Employee Registration" subtitle="Complete the onboarding steps with confidence." className="overflow-hidden">
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              {steps.map((label, index) => (
                <div key={label} className={`rounded-3xl border p-4 text-center transition ${index === step ? "border-amber-400 bg-amber-50 shadow-lg" : "border-slate-200 bg-white/90"}`}>
                  <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold ${index === step ? "bg-amber-400 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {index + 1}
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{label}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 0 && (
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block space-y-2 text-sm text-slate-700">
                    Full Name
                    <input value={form.name} onChange={handleChange("name")} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" required />
                  </label>
                  <label className="block space-y-2 text-sm text-slate-700">
                    Gender
                    <select value={form.gender} onChange={handleChange("gender")} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </label>
                  <label className="block space-y-2 text-sm text-slate-700">
                    Date of Birth
                    <input type="date" value={form.dob} onChange={handleChange("dob")} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                  </label>
                  <label className="block space-y-2 text-sm text-slate-700">
                    Blood Group
                    <select value={form.bloodGroup} onChange={handleChange("bloodGroup")} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none">
                      <option>O+</option>
                      <option>A+</option>
                      <option>B+</option>
                      <option>AB+</option>
                    </select>
                  </label>
                  <label className="block space-y-2 text-sm text-slate-700 md:col-span-2">
                    Aadhaar Number
                    <input value={form.aadhaar} onChange={handleChange("aadhaar")} placeholder="XXXX-XXXX-XXXX" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                  </label>
                  <label className="block space-y-2 text-sm text-slate-700 md:col-span-2">
                    Address
                    <textarea value={form.address} onChange={handleChange("address")} rows={3} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                  </label>
                  <label className="block space-y-2 text-sm text-slate-700 md:col-span-2">
                    Emergency Contact
                    <input value={form.emergency} onChange={handleChange("emergency")} placeholder="+91 90000 00000" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                  </label>
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block space-y-2 text-sm text-slate-700">
                    Role
                    <select value={form.role} onChange={handleChange("role")} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none">
                      {employeeRoles.map((roleOption) => (
                        <option key={roleOption.value} value={roleOption.value}>
                          {roleOption.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block space-y-2 text-sm text-slate-700">
                    Department
                    <select value={form.department} onChange={handleChange("department")} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none">
                      {departments.map((dept) => <option key={dept}>{dept}</option>)}
                    </select>
                  </label>
                  <label className="block space-y-2 text-sm text-slate-700">
                    Salary
                    <input value={form.salary} onChange={handleChange("salary")} placeholder="₹ 45,000" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                  </label>
                  <label className="block space-y-2 text-sm text-slate-700">
                    Shift
                    <select value={form.shift} onChange={handleChange("shift")} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none">
                      {shifts.map((shift) => <option key={shift}>{shift}</option>)}
                    </select>
                  </label>
                  <label className="block space-y-2 text-sm text-slate-700">
                    Joining Date
                    <input type="date" value={form.joiningDate} onChange={handleChange("joiningDate")} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                  </label>
                  <label className="block space-y-2 text-sm text-slate-700">
                    Employment Type
                    <select value={form.employmentType} onChange={handleChange("employmentType")} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none">
                      {empTypes.map((type) => <option key={type}>{type}</option>)}
                    </select>
                  </label>
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block space-y-2 text-sm text-slate-700">
                    Email
                    <input type="email" value={form.email} onChange={handleChange("email")} placeholder="employee@temple.org" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                  </label>
                  <label className="block space-y-2 text-sm text-slate-700">
                    Password
                    <input type="password" value={form.password} onChange={handleChange("password")} placeholder="Create a strong password" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                  </label>
                  <label className="block space-y-2 text-sm text-slate-700 md:col-span-2">
                    Permissions
                    <select value={form.permissions} onChange={handleChange("permissions")} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none">
                      <option>Standard</option>
                      <option>Manager</option>
                      <option>Supervisor</option>
                    </select>
                  </label>
                  <label className="block space-y-2 text-sm text-slate-700 md:col-span-2">
                    Upload Profile Photo
                    <div className="flex items-center gap-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4">
                      <input type="file" accept="image/*" onChange={handleChange("photo")} className="hidden" id="photo-upload" />
                      <label htmlFor="photo-upload" className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-100">
                        <FiUpload /> Choose photo
                      </label>
                      <span className="text-sm text-slate-500">PNG, JPG up to 5MB</span>
                    </div>
                  </label>
                  <label className="block space-y-2 text-sm text-slate-700 md:col-span-2">
                    Upload Documents
                    <div className="flex items-center gap-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4">
                      <input type="file" onChange={handleChange("document")} className="hidden" id="doc-upload" />
                      <label htmlFor="doc-upload" className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-100">
                        <FiUpload /> Attach file
                      </label>
                      <span className="text-sm text-slate-500">PDF or DOCX</span>
                    </div>
                  </label>
                </div>
              )}

              {message && <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700">{message.text}</div>}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button type="button" onClick={handlePrev} disabled={step === 0} className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50">
                  Back
                </button>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={handleNext} disabled={step === steps.length - 1} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
                    Continue
                    <FiChevronRight />
                  </button>
                  <button type="submit" className="rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg hover:bg-amber-500 transition">
                    Save Employee
                  </button>
                </div>
              </div>
            </form>
          </SectionCard>
        </div>

        <SectionCard title="Live Preview" subtitle="Review the employee profile before onboarding." className="h-full">
          <div className="space-y-6 rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-inner shadow-slate-200/30">
            <div className="flex items-center gap-4">
              <img src={previewData.photo} alt="Preview" className="h-20 w-20 rounded-3xl object-cover border border-slate-200" />
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Employee ID</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">{previewData.id}</h3>
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Name</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{previewData.name}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-slate-500">Role</p>
                  <p className="mt-1 font-semibold text-slate-900">{previewData.role}</p>
                </div>
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-slate-500">Department</p>
                  <p className="mt-1 font-semibold text-slate-900">{previewData.department}</p>
                </div>
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Contact</p>
                <p className="mt-1 font-semibold text-slate-900">{previewData.contact}</p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default AddEmployee;
