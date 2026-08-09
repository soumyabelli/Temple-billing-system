import "./LeaveRequest.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
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
  marginTop: "-5px",
  paddingLeft: "4px",
};

const parseDate = (value) => {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getDays = (fromDate, toDate) => {
  const from = parseDate(fromDate);
  const to = parseDate(toDate);
  if (!from || !to || to < from) return 0;
  const oneDayMs = 24 * 60 * 60 * 1000;
  return Math.floor((to - from) / oneDayMs) + 1;
};

const formatPeriod = (fromDate, toDate) => {
  const from = parseDate(fromDate);
  const to = parseDate(toDate);
  if (!from || !to) return `${fromDate || "-"} to ${toDate || "-"}`;
  const fromLabel = from.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const toLabel = to.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  return `${fromLabel} - ${toLabel}`;
};

const LeaveRequest = ({ darkMode, onBack }) => {
  const navigate = useNavigate();
  const { user: staff } = useAuth();
  const todayStr = getLocalDateKey();
  const [form, setForm] = useState({
    leaveType: "General",
    reason: "",
    fromDate: "",
    toDate: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getMinAllowedFromDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;

    if (now.getHours() >= 10) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tYear = tomorrow.getFullYear();
      const tMonth = String(tomorrow.getMonth() + 1).padStart(2, "0");
      const tDay = String(tomorrow.getDate()).padStart(2, "0");
      return `${tYear}-${tMonth}-${tDay}`;
    }
    return todayStr;
  };

  const validate = () => {
    const today = getLocalDateKey();
    const now = new Date();
    const errs = {};
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
      errs.fromDate = `From Date cannot be in the past (${today}).`;
    } else if (form.fromDate === today && now.getHours() >= 10) {
      errs.fromDate = "Same-day leave request is closed after 10:00 AM. Please select tomorrow or a future date.";
    }
    if (!form.toDate) {
      errs.toDate = "To Date is required.";
    } else if (form.fromDate && form.toDate < form.fromDate) {
      errs.toDate = "To Date cannot be before From Date.";
    }
    return errs;
  };

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
      const res = await axios.post("http://localhost:5000/api/leaves/apply", {
        ...form,
        reason: form.reason.trim(),
        staffId: staff?.id || staff?._id,
        staffName: staff?.name || "Staff",
      });
      if (res.data.quotaExceeded) {
        alert(res.data.message);
      } else {
        alert("Leave Applied Successfully");
      }
      setForm({ leaveType: "General", reason: "", fromDate: "", toDate: "" });
      if (onBack) {
        onBack();
      } else {
        navigate("/cashier/leave-requests");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to apply for leave.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const minDateAllowed = getMinAllowedFromDate();

  return (
    <div className={`leave-container ${darkMode ? "dark" : ""}`} style={{ width: "100%", display: "block" }}>
        <section className="apply-leave-page">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h2>Apply Leave</h2>
            <button 
              type="button"
              onClick={() => {
                if (onBack) onBack();
                else navigate("/cashier/leave-requests");
              }}
              style={{
                background: "transparent",
                color: darkMode ? "#9ca3af" : "#63584d",
                border: "1px solid",
                borderColor: darkMode ? "#4b5563" : "#ddd3c6",
                borderRadius: "10px",
                padding: "8px 16px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Back to Leave Requests
            </button>
          </div>
          <p>Submit your leave request to admin.</p>

          <div style={{
            padding: "12px 16px",
            borderRadius: "10px",
            backgroundColor: new Date().getHours() >= 10 ? "#fff3cd" : "#e0f2fe",
            color: new Date().getHours() >= 10 ? "#856404" : "#0369a1",
            border: new Date().getHours() >= 10 ? "1px solid #ffeeba" : "1px solid #bae6fd",
            marginBottom: "18px",
            fontSize: "13px",
            fontWeight: "600"
          }}>
            ⏰ <strong>Notice:</strong> Same-day leave applications are only permitted before <strong>10:00 AM</strong>. {new Date().getHours() >= 10 ? "Same-day leave for today is closed. Please select tomorrow or a later date." : "Same-day application is currently open until 10:00 AM."}
          </div>

          <form onSubmit={handleSubmit} className="leave-form">
            <div>
              <label htmlFor="leaveType">Leave Type</label>
              <select
                id="leaveType"
                value={form.leaveType}
                disabled={isSubmitting}
                onChange={(e) => field("leaveType", e.target.value)}
              >
                {LEAVE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.leaveType && <p style={errorStyle}>{errors.leaveType}</p>}
            </div>
            <div>
              <label htmlFor="reason">Reason</label>
              <input
                id="reason"
                type="text"
                placeholder="Reason (min 10 characters)"
                value={form.reason}
                disabled={isSubmitting}
                onChange={(e) => field("reason", e.target.value)}
              />
              {errors.reason && <p style={errorStyle}>{errors.reason}</p>}
            </div>
            <div className="date-grid">
              <div>
                <label htmlFor="fromDate">From Date</label>
                <input
                  id="fromDate"
                  type="date"
                  value={form.fromDate}
                  min={minDateAllowed}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    field("fromDate", e.target.value);
                    if (form.toDate && form.toDate < e.target.value) {
                      field("toDate", "");
                    }
                  }}
                />
                {errors.fromDate && <p style={errorStyle}>{errors.fromDate}</p>}
              </div>
              <div>
                <label htmlFor="toDate">To Date</label>
                <input
                  id="toDate"
                  type="date"
                  value={form.toDate}
                  min={form.fromDate || minDateAllowed}
                  disabled={isSubmitting}
                  onChange={(e) => field("toDate", e.target.value)}
                />
                {errors.toDate && <p style={errorStyle}>{errors.toDate}</p>}
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Send Leave Request"}
              </button>
            </div>
          </form>
        </section>
    </div>
  );
};

export default LeaveRequest;
