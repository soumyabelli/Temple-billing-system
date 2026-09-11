import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { FiX, FiSave } from "react-icons/fi";
import {
  employeeRoles,
  roleDepartmentMap,
  departmentDutyMap,
  departmentLocationMap,
  dutyLocations,
  shiftOptions,
} from "../../../pages/admin/employee/employeeData";
import { updateEmployee } from "../../../services/employeeService";

const bankOptions = [
  "",
  "State Bank of India (SBI)",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Punjab National Bank (PNB)",
  "Canara Bank",
  "Bank of Baroda",
  "Union Bank of India",
  "Kotak Mahindra Bank",
  "IndusInd Bank",
  "Other",
];

const inputClass =
  "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 px-4 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200";
const optionClass =
  "bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100";

const EditEmployeeModal = ({ employee, onClose, onSave }) => {
  const [form, setForm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [poojas, setPoojas] = useState([]);

  useEffect(() => {
    const fetchPoojas = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await axios.get("http://localhost:5000/api/admin/poojas", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) setPoojas(res.data.poojas);
      } catch (err) {
        console.error("Failed to fetch poojas", err);
      }
    };
    fetchPoojas();
  }, []);

  useEffect(() => {
    if (employee) {
      const initialRole = (employee.role || "staff").toLowerCase();
      const validDepts = roleDepartmentMap[initialRole] || [];

      let currentDept = employee.department || "";
      if (
        !currentDept ||
        (!validDepts.includes(currentDept) && !departmentDutyMap[currentDept])
      ) {
        currentDept = validDepts[0] || "Priest Services";
      }

      const duties = departmentDutyMap[currentDept] || [];
      const existingDuty =
        employee.defaultDuty ||
        employee.currentDuty?.dutyName ||
        duties[0] ||
        "";

      // Normalize shift: handle shorthand like "Morning" or "Day"
      const rawShift =
        employee.defaultShift ||
        employee.shift ||
        employee.currentDuty?.shift ||
        "Morning (06:00 AM - 02:00 PM)";
      let resolvedShift = rawShift;
      if (rawShift === "Morning")
        resolvedShift = "Morning (06:00 AM - 02:00 PM)";
      else if (rawShift === "Day")
        resolvedShift = "Day (09:00 AM - 05:00 PM)";
      else if (rawShift === "Evening")
        resolvedShift = "Evening (02:00 PM - 10:00 PM)";
      else if (rawShift === "Night")
        resolvedShift = "Night (10:00 PM - 06:00 AM)";
      else if (rawShift === "Early Morning")
        resolvedShift = "Early Morning (04:00 AM - 10:00 AM)";

      const locs = departmentLocationMap[currentDept] || dutyLocations;
      const existingLocation =
        employee.dutyLocation ||
        employee.currentDuty?.dutyLocation ||
        locs[0] ||
        "Main Temple Hall";

      setForm({
        name: employee.name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        address: employee.address || "",
        gender: employee.gender || "Male",
        dob: employee.dob ? String(employee.dob).split("T")[0] : "",
        bloodGroup: employee.bloodGroup || "",
        aadhaar: employee.aadhaar || "",
        emergencyContact: employee.emergencyContact || "",
        role: initialRole,
        department: currentDept,
        employmentType: employee.employmentType || "Full Time",
        status: employee.status || "Active",
        joiningDate: employee.joiningDate
          ? String(employee.joiningDate).split("T")[0]
          : "",
        salary:
          employee.salary !== undefined && employee.salary !== null
            ? employee.salary
            : "",
        defaultShift: resolvedShift,
        defaultDuty: existingDuty,
        dutyLocation: existingLocation,
        weeklyOff: employee.weeklyOff || "",
        bankName: employee.bankName || "",
        accountNumber: employee.accountNumber || "",
        eligiblePoojas: Array.isArray(employee.eligiblePoojas)
          ? employee.eligiblePoojas
          : [],
      });
    }
  }, [employee]);

  // Available departments for the selected role
  const availableDepartments = useMemo(() => {
    const roleKey = (form?.role || "staff").toLowerCase();
    const depts = roleDepartmentMap[roleKey] || [];
    if (form?.department && !depts.includes(form.department)) {
      return [form.department, ...depts];
    }
    return depts;
  }, [form?.role, form?.department]);

  // Available duties for the selected department
  const availableDuties = useMemo(() => {
    if (!form?.department) return [];
    if (
      departmentDutyMap[form.department] &&
      departmentDutyMap[form.department].length > 0
    ) {
      return departmentDutyMap[form.department];
    }
    const lower = form.department.toLowerCase();
    const foundKey = Object.keys(departmentDutyMap).find(
      (k) => k.toLowerCase() === lower
    );
    if (foundKey) return departmentDutyMap[foundKey];

    // Fallbacks based on role so duty options are never blank
    if (form.role === "cashier") {
      return [
        "Cash Collection",
        "Receipt Issuing",
        "Bill Generation",
        "Counter Support",
        "Donation Recording",
        "Payment Processing",
      ];
    }
    if (form.role === "priest") {
      return [
        "Morning Pooja",
        "Evening Aarti",
        "Abhishekam",
        "Daily Rituals",
        "Special Rituals",
      ];
    }
    if (form.role === "accountant") {
      return [
        "Daily Accounts Entry",
        "Monthly Reconciliation",
        "Audit Support",
        "Ledger Maintenance",
        "Financial Reporting",
      ];
    }
    return [
      "General Duty",
      "Support Service",
      "Counter Management",
      "Maintenance",
    ];
  }, [form?.department, form?.role]);

  // Available locations for the department
  const availableLocations = useMemo(() => {
    if (!form?.department) return dutyLocations;
    const locs = departmentLocationMap[form.department];
    if (locs && locs.length > 0) return locs;
    return dutyLocations;
  }, [form?.department]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "role") {
        const roleKey = value.toLowerCase();
        const departments = roleDepartmentMap[roleKey] || [];
        const newDept = departments[0] || "";
        const duties = departmentDutyMap[newDept] || [];
        const locs = departmentLocationMap[newDept] || dutyLocations;
        updated.department = newDept;
        updated.defaultDuty = duties[0] || "";
        updated.dutyLocation = locs[0] || dutyLocations[0] || "";
      }
      if (name === "department") {
        const duties = departmentDutyMap[value] || [];
        const locs = departmentLocationMap[value] || dutyLocations;
        updated.defaultDuty = duties[0] || "";
        if (locs.length > 0 && !locs.includes(updated.dutyLocation)) {
          updated.dutyLocation = locs[0];
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address ? form.address.trim() : "",
        gender: form.gender,
        dob: form.dob || undefined,
        bloodGroup: form.bloodGroup,
        aadhaar: form.aadhaar?.trim() ? form.aadhaar.trim() : undefined,
        emergencyContact: form.emergencyContact.trim(),
        role: form.role,
        department: form.department,
        employmentType: form.employmentType,
        status: form.status,
        joiningDate: form.joiningDate || undefined,
        salary:
          form.salary !== "" &&
          form.salary !== null &&
          form.salary !== undefined
            ? Number(form.salary)
            : 0,
        defaultShift: form.defaultShift,
        defaultDuty: form.defaultDuty,
        dutyLocation: form.dutyLocation,
        weeklyOff: form.weeklyOff,
        bankName: form.bankName ? form.bankName.trim() : "",
        accountNumber: form.accountNumber ? form.accountNumber.trim() : "",
        eligiblePoojas: form.role === "priest" ? form.eligiblePoojas : [],
      };

      await updateEmployee(employee._id, payload);
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update employee.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!form) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="flex h-full max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl bg-temple-100 dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 p-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-200">
              Edit Employee
            </h2>
            <p className="text-sm text-slate-500">
              Update details for {employee.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-600">
              {error}
            </div>
          )}

          <form id="editEmployeeForm" onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Personal Details */}
            <section>
              <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-200">
                Personal Details
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={form.emergencyContact}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Male" className={optionClass}>Male</option>
                    <option value="Female" className={optionClass}>Female</option>
                    <option value="Other" className={optionClass}>Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={form.dob}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={form.bloodGroup}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="" className={optionClass}>Select Blood Group</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                      <option key={bg} value={bg} className={optionClass}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Aadhaar Number
                  </label>
                  <input
                    type="text"
                    name="aadhaar"
                    value={form.aadhaar}
                    onChange={handleChange}
                    placeholder="12-digit Aadhaar"
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Residential Address
                  </label>
                  <textarea
                    rows={2}
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Enter residential address"
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* 2. Professional Details */}
            <section>
              <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-200">
                Professional Details
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={`${inputClass} font-semibold`}
                  >
                    <option value="Active" className={optionClass}>Active</option>
                    <option value="Inactive" className={optionClass}>Inactive</option>
                    <option value="On Leave" className={optionClass}>On Leave</option>
                    <option value="Suspended" className={optionClass}>Suspended</option>
                    <option value="Resigned" className={optionClass}>Resigned</option>
                    <option value="Retired" className={optionClass}>Retired</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Role
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {employeeRoles.map((r) => (
                      <option key={r.value} value={r.value} className={optionClass}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Department
                  </label>
                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {availableDepartments.map((dep) => (
                      <option key={dep} value={dep} className={optionClass}>
                        {dep}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={form.joiningDate}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Employment Type
                  </label>
                  <select
                    name="employmentType"
                    value={form.employmentType}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Full Time" className={optionClass}>Full Time</option>
                    <option value="Part Time" className={optionClass}>Part Time</option>
                    <option value="Contract" className={optionClass}>Contract</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Salary
                  </label>
                  <input
                    type="number"
                    name="salary"
                    value={form.salary}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Default Shift
                  </label>
                  <select
                    name="defaultShift"
                    value={form.defaultShift}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="" className={optionClass}>Select Shift</option>
                    {shiftOptions.map((s) => {
                      const val = typeof s === "object" ? (s.value || s.label) : s;
                      const label = typeof s === "object" ? (s.label || s.value) : s;
                      return (
                        <option key={val} value={val} className={optionClass}>
                          {label}
                        </option>
                      );
                    })}
                    {form.defaultShift &&
                      !shiftOptions.some(
                        (s) => (typeof s === "object" ? s.value : s) === form.defaultShift
                      ) && (
                        <option value={form.defaultShift} className={optionClass}>
                          {form.defaultShift}
                        </option>
                      )}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Default Duty
                  </label>
                  <select
                    name="defaultDuty"
                    value={form.defaultDuty}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="" className={optionClass}>Select Duty</option>
                    {availableDuties.map((duty) => (
                      <option key={duty} value={duty} className={optionClass}>
                        {duty}
                      </option>
                    ))}
                    {form.defaultDuty && !availableDuties.includes(form.defaultDuty) && (
                      <option value={form.defaultDuty} className={optionClass}>
                        {form.defaultDuty}
                      </option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Duty Location
                  </label>
                  <select
                    name="dutyLocation"
                    value={form.dutyLocation}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="" className={optionClass}>Select Location</option>
                    {availableLocations.map((loc) => (
                      <option key={loc} value={loc} className={optionClass}>
                        {loc}
                      </option>
                    ))}
                    {form.dutyLocation && !availableLocations.includes(form.dutyLocation) && (
                      <option value={form.dutyLocation} className={optionClass}>
                        {form.dutyLocation}
                      </option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Weekly Off
                  </label>
                  <select
                    name="weeklyOff"
                    value={form.weeklyOff}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="" className={optionClass}>Select Day</option>
                    {[
                      "Sunday",
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                    ].map((day) => (
                      <option key={day} value={day} className={optionClass}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                {form.role === "priest" && (
                  <div className="col-span-full">
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Eligible Poojas
                    </label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {poojas.map((pooja) => (
                        <label
                          key={pooja._id}
                          className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={form.eligiblePoojas.includes(pooja._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm((prev) => ({
                                  ...prev,
                                  eligiblePoojas: [
                                    ...prev.eligiblePoojas,
                                    pooja._id,
                                  ],
                                }));
                              } else {
                                setForm((prev) => ({
                                  ...prev,
                                  eligiblePoojas: prev.eligiblePoojas.filter(
                                    (id) => id !== pooja._id
                                  ),
                                }));
                              }
                            }}
                            className="accent-violet-600 w-4 h-4"
                          />
                          {pooja.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 3. Account Details */}
            <section>
              <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-200">
                Bank Account Details
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Bank Name
                  </label>
                  <select
                    name="bankName"
                    value={form.bankName}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {bankOptions.map((opt) => (
                      <option key={opt} value={opt} className={optionClass}>
                        {opt || "Select Bank"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Account Number
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={form.accountNumber}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </section>
          </form>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-700 p-6 bg-slate-50/50 dark:bg-[#0f172a] dark:text-slate-200 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="editEmployeeForm"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"} <FiSave size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
