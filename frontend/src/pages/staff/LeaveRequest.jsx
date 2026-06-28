import "./LeaveRequest.css";

import { useState } from "react";

import axios from "axios";

const staff = JSON.parse(localStorage.getItem("user"));

// Build YYYY-MM-DD from the browser's LOCAL clock — never use toISOString()
const getLocalDateKey = (date = new Date()) => {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day   = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const LEAVE_TYPES = [
  "General",
  "Sick Leave",
  "Casual Leave",
  "Festival Leave",
  "Emergency Leave",
];

const errorStyle = {
  color: "red",
  fontSize: "12px",
  marginTop: "-10px",
  paddingLeft: "4px",
};

const LeaveRequest = () => {
  const todayStr = getLocalDateKey();

  const [form, setForm] = useState({
    leaveType: "General",
    reason: "",
    fromDate: "",
    toDate: "",
  });

  const [errors, setErrors]            = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const today = getLocalDateKey(); // recalculate at submit time in case date changed
    const errs  = {};

    if (!form.leaveType || !form.leaveType.trim()) {
      errs.leaveType = "Leave Type is required.";
    }

    const trimmedReason = (form.reason || "").trim();
    if (!trimmedReason) {
      errs.reason = "Reason is required.";
    } else if (trimmedReason.length < 10) {
      errs.reason = "Reason must be at least 10 characters.";
    }

    if (!form.fromDate) {
      errs.fromDate = "From Date is required.";
    } else if (form.fromDate < today) {
      errs.fromDate = `From Date cannot be before today (${today}).`;
    }

    if (!form.toDate) {
      errs.toDate = "To Date is required.";
    } else if (form.fromDate && form.toDate < form.fromDate) {
      errs.toDate = "To Date cannot be before From Date.";
    }

    return errs;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await axios.post("http://localhost:5000/api/leaves/apply", {
        ...form,
        reason:    form.reason.trim(),
        staffId:   staff?.id   || staff?._id,
        staffName: staff?.name || "Staff",
      });

      alert("Leave Applied Successfully");
      setForm({ leaveType: "General", reason: "", fromDate: "", toDate: "" });
    } catch (err) {
      const serverMsg =
        err.response?.data?.message || "Failed to apply for leave. Please try again.";
      alert(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Field helper ────────────────────────────────────────────────────────────
  const field = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="leave-container">
      <form onSubmit={handleSubmit}>

        <h2>Apply Leave</h2>

        {/* Leave Type */}
        <select
          value={form.leaveType}
          disabled={isSubmitting}
          onChange={(e) => field("leaveType", e.target.value)}
        >
          {LEAVE_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {errors.leaveType && <p style={errorStyle}>{errors.leaveType}</p>}

        {/* Reason */}
        <input
          type="text"
          placeholder="Reason (min 10 characters)"
          value={form.reason}
          disabled={isSubmitting}
          onChange={(e) => field("reason", e.target.value)}
        />
        {errors.reason && <p style={errorStyle}>{errors.reason}</p>}

        {/* From Date — min is today (local timezone) */}
        <input
          type="date"
          value={form.fromDate}
          min={todayStr}
          disabled={isSubmitting}
          onChange={(e) => {
            field("fromDate", e.target.value);
            // reset toDate if it has become invalid
            if (form.toDate && form.toDate < e.target.value) {
              field("toDate", "");
            }
          }}
        />
        {errors.fromDate && <p style={errorStyle}>{errors.fromDate}</p>}

        {/* To Date — min is fromDate, or today if fromDate not yet selected */}
        <input
          type="date"
          value={form.toDate}
          min={form.fromDate || todayStr}
          disabled={isSubmitting}
          onChange={(e) => field("toDate", e.target.value)}
        />
        {errors.toDate && <p style={errorStyle}>{errors.toDate}</p>}

        <button disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Leave"}
        </button>

      </form>
    </div>
  );
};

export default LeaveRequest;
