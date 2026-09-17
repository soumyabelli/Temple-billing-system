import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
  FaCalendarAlt,
  FaCalendarCheck,
  FaCheck,
  FaTimes,
  FaExchangeAlt,
  FaPlus,
  FaChevronDown,
  FaChevronUp,
  FaInfoCircle,
  FaClock,
  FaUserCheck,
  FaExclamationTriangle,
  FaHourglassHalf,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import "./UnifiedLeaveManagement.css";

const API_BASE = "http://localhost:5000/api";

const LEAVE_TYPES = [
  "General",
  "Sick Leave",
  "Casual Leave",
  "Festival Leave",
  "Emergency Leave",
];

const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
  const fromLabel = from.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const toLabel = to.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return `${fromLabel} - ${toLabel}`;
};

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

const UnifiedLeaveManagement = ({
  role: roleProp,
  darkMode: darkModeProp,
  initialApplyOpen = false,
}) => {
  const { user } = useAuth();
  let themeContext = null;
  try {
    themeContext = useTheme();
  } catch (e) {
    // optional if outside ThemeProvider
  }

  const isDarkMode =
    darkModeProp !== undefined
      ? darkModeProp
      : themeContext?.darkMode || false;

  // Determine current normalized role
  const effectiveRole = String(
    roleProp || user?.role || "staff"
  )
    .trim()
    .toLowerCase();

  // Duty transfer is mandatory for priest, accountant, cashier; optional for staff
  const isDutyTransferMandatory = ["priest", "accountant", "cashier"].includes(
    effectiveRole
  );

  const [activeTab, setActiveTab] = useState("leaves"); // "leaves" | "incoming"
  const [isApplyOpen, setIsApplyOpen] = useState(initialApplyOpen);

  // Leave data
  const [leaves, setLeaves] = useState([]);
  const [incomingTransfers, setIncomingTransfers] = useState([]);
  const [substitutes, setSubstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingSubstitutes, setLoadingSubstitutes] = useState(false);

  // Form State
  const [form, setForm] = useState({
    leaveType: "General",
    reason: "",
    fromDate: "",
    toDate: "",
    transferDuty: isDutyTransferMandatory, // Default to true if mandatory
    substituteId: "",
    substituteName: "",
    substituteRole: effectiveRole,
    substituteEmail: "",
  });

  const [errors, setErrors] = useState({});

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingTransferId, setRejectingTransferId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const currentUserId = user?.id || user?._id || "";
  const currentUserEmail = user?.email || "";

  // Fetch all leaves and incoming transfers for the user
  const fetchData = useCallback(async () => {
    if (!currentUserId && !currentUserEmail) return;
    try {
      setLoading(true);
      const [leavesRes, transfersRes] = await Promise.all([
        axios.get(`${API_BASE}/leaves/${currentUserId}?email=${encodeURIComponent(currentUserEmail)}`),
        axios.get(
          `${API_BASE}/leaves/transfers/incoming/${currentUserId}?email=${encodeURIComponent(
            currentUserEmail
          )}`
        ),
      ]);

      setLeaves(Array.isArray(leavesRes.data) ? leavesRes.data : []);
      setIncomingTransfers(
        Array.isArray(transfersRes.data) ? transfersRes.data : []
      );
    } catch (err) {
      console.error("Error fetching leave data:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, currentUserEmail]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch available substitutes whenever role or dates change
  useEffect(() => {
    const fetchSubstitutes = async () => {
      try {
        setLoadingSubstitutes(true);
        const queryParams = new URLSearchParams({
          role: effectiveRole,
          excludeId: currentUserId,
          excludeEmail: currentUserEmail,
        });

        if (form.fromDate) queryParams.append("fromDate", form.fromDate);
        if (form.toDate) queryParams.append("toDate", form.toDate);

        const res = await axios.get(
          `${API_BASE}/leaves/available-substitutes?${queryParams.toString()}`
        );
        const candidateList = Array.isArray(res.data) ? res.data : [];
        setSubstitutes(candidateList);

        // If previously selected substitute is now not available or not in list, keep or warn
        if (form.substituteId) {
          const selectedCandidate = candidateList.find(
            (c) => c.id === form.substituteId || c.employeeId === form.substituteId
          );
          if (selectedCandidate && !selectedCandidate.available) {
            setErrors((prev) => ({
              ...prev,
              substituteId: `${selectedCandidate.name} is on approved leave for these dates. Please choose another substitute.`,
            }));
          }
        }
      } catch (err) {
        console.error("Error loading substitutes:", err);
      } finally {
        setLoadingSubstitutes(false);
      }
    };

    fetchSubstitutes();
  }, [effectiveRole, form.fromDate, form.toDate, currentUserId, currentUserEmail]);

  // Quota statistics calculation
  const stats = useMemo(() => {
    const totalQuota = 14;
    const approvedDays = leaves
      .filter((l) => l.status === "Approved")
      .reduce((acc, l) => acc + getDays(l.fromDate, l.toDate), 0);

    const pendingCount = leaves.filter((l) => l.status === "Pending").length;
    const remaining = Math.max(0, totalQuota - approvedDays);

    return {
      totalQuota,
      used: approvedDays,
      remaining,
      pending: pendingCount,
    };
  }, [leaves]);

  const pendingIncomingTransfersCount = useMemo(() => {
    return incomingTransfers.filter((t) => t.transferStatus === "Pending").length;
  }, [incomingTransfers]);

  // Form field change handler
  const handleFieldChange = (key, value) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };

      // If user selected a substitute from dropdown
      if (key === "substituteId") {
        const found = substitutes.find(
          (s) => s.id === value || s.employeeId === value
        );
        if (found) {
          updated.substituteName = found.name;
          updated.substituteEmail = found.email;
          updated.substituteRole = found.role;
        } else {
          updated.substituteName = "";
          updated.substituteEmail = "";
        }
      }

      return updated;
    });

    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  // Validation
  const validateForm = () => {
    const errs = {};
    const today = getLocalDateKey();
    const now = new Date();

    if (!form.leaveType) {
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
      errs.fromDate =
        "Same-day leave request is closed after 10:00 AM. Please select tomorrow or a later date.";
    }

    if (!form.toDate) {
      errs.toDate = "To Date is required.";
    } else if (form.fromDate && form.toDate < form.fromDate) {
      errs.toDate = "To Date cannot be before From Date.";
    }

    // Duty Transfer validation
    if (isDutyTransferMandatory) {
      if (!form.substituteId) {
        errs.substituteId = `Transfer duty is mandatory for ${effectiveRole}. Please select an available substitute.`;
      } else {
        const selected = substitutes.find(
          (s) => s.id === form.substituteId || s.employeeId === form.substituteId
        );
        if (selected && !selected.available) {
          errs.substituteId = `${selected.name} is on approved leave during this period. Please select an available substitute.`;
        }
      }
    } else if (form.transferDuty && !form.substituteId) {
      errs.substituteId =
        "Please select a substitute staff member or uncheck the transfer duty option.";
    }

    return errs;
  };

  // Submit Leave Request
  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const payload = {
        leaveType: form.leaveType,
        reason: form.reason.trim(),
        fromDate: form.fromDate,
        toDate: form.toDate,
        staffId: currentUserId,
        staffName: user?.name || "Employee",
        staffEmail: currentUserEmail,
        role: effectiveRole,
        transferDuty: isDutyTransferMandatory ? true : Boolean(form.transferDuty),
        substituteId: form.substituteId || undefined,
        substituteName: form.substituteName || undefined,
        substituteRole: form.substituteRole || undefined,
        substituteEmail: form.substituteEmail || undefined,
      };

      const res = await axios.post(`${API_BASE}/leaves/apply`, payload);

      if (res.data?.quotaExceeded) {
        alert(res.data.message);
      } else {
        alert(
          form.substituteName
            ? `Leave applied successfully! Duty transfer request sent to ${form.substituteName}.`
            : "Leave applied successfully!"
        );
      }

      // Reset form
      setForm({
        leaveType: "General",
        reason: "",
        fromDate: "",
        toDate: "",
        transferDuty: isDutyTransferMandatory,
        substituteId: "",
        substituteName: "",
        substituteRole: effectiveRole,
        substituteEmail: "",
      });

      setIsApplyOpen(false);
      fetchData();
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to submit leave application."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Accept or Reject an incoming duty transfer
  const handleTransferResponse = async (leaveId, action, reason = "") => {
    try {
      setActionLoading(true);
      await axios.put(`${API_BASE}/leaves/transfers/${leaveId}/respond`, {
        action,
        reason,
      });

      alert(
        action === "Accepted"
          ? "Duty transfer request accepted successfully!"
          : "Duty transfer request rejected."
      );

      setRejectModalOpen(false);
      setRejectingTransferId(null);
      setRejectReason("");
      fetchData();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to respond to duty transfer request."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const minDateAllowed = getMinAllowedFromDate();
  const calculatedDays = getDays(form.fromDate, form.toDate);

  return (
    <div
      className={`unified-leave-container ${isDarkMode ? "dark" : ""}`}
      id="unified-leave-management"
    >
      {/* Top Header */}
      <div className="ulm-header">
        <div className="ulm-header-info">
          <h1>
            <FaCalendarAlt style={{ color: "#ea580c" }} />
            Leave & Duty Management
            <span className="ulm-role-badge">{effectiveRole}</span>
          </h1>
          <p>
            Submit leave requests, manage duty transfers with fellow{" "}
            {effectiveRole}s, and monitor balance.
          </p>
        </div>
        <div>
          <button
            type="button"
            className="ulm-btn-primary"
            onClick={() => setIsApplyOpen((prev) => !prev)}
          >
            {isApplyOpen ? (
              <>
                <FaChevronUp /> Hide Apply Form
              </>
            ) : (
              <>
                <FaPlus /> Apply for Leave
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quota Summary Cards */}
      <div className="ulm-stats-grid">
        <div className="ulm-stat-card">
          <div className="ulm-stat-icon total">
            <FaCalendarAlt />
          </div>
          <div className="ulm-stat-details">
            <h3>{stats.totalQuota}</h3>
            <p>Annual Quota (12+2)</p>
          </div>
        </div>

        <div className="ulm-stat-card">
          <div className="ulm-stat-icon used">
            <FaClock />
          </div>
          <div className="ulm-stat-details">
            <h3>{stats.used}</h3>
            <p>Used Leaves (Days)</p>
          </div>
        </div>

        <div className="ulm-stat-card">
          <div className="ulm-stat-icon remaining">
            <FaCalendarCheck />
          </div>
          <div className="ulm-stat-details">
            <h3>{stats.remaining}</h3>
            <p>Remaining Balance</p>
          </div>
        </div>

        <div className="ulm-stat-card">
          <div className="ulm-stat-icon pending">
            <FaHourglassHalf />
          </div>
          <div className="ulm-stat-details">
            <h3>{stats.pending}</h3>
            <p>Pending Admin Requests</p>
          </div>
        </div>
      </div>

      {/* Collapsible / Toggleable Apply Leave Card */}
      {isApplyOpen && (
        <div className="ulm-form-card">
          <div className="ulm-form-header">
            <h2>
              <FaPlus style={{ color: "#ea580c" }} /> Apply for Leave
            </h2>
            <button
              type="button"
              className="ulm-btn-outline"
              onClick={() => setIsApplyOpen(false)}
            >
              Cancel
            </button>
          </div>

          <div className="ulm-alert-box info">
            <FaInfoCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Same-Day Leave Policy:</strong> Same-day leave
              applications are only permitted before <strong>10:00 AM</strong>.
              {new Date().getHours() >= 10
                ? " Today's same-day window is closed. Please select tomorrow or a later date."
                : " Same-day applications are currently open until 10:00 AM."}
            </div>
          </div>

          <form onSubmit={handleSubmitLeave}>
            <div className="ulm-grid-2">
              <div className="ulm-field-group">
                <label htmlFor="leaveType">
                  Leave Type <span className="ulm-required-tag">* Required</span>
                </label>
                <select
                  id="leaveType"
                  className="ulm-select"
                  value={form.leaveType}
                  onChange={(e) => handleFieldChange("leaveType", e.target.value)}
                  disabled={submitting}
                >
                  {LEAVE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.leaveType && (
                  <span className="ulm-field-error">{errors.leaveType}</span>
                )}
              </div>

              <div className="ulm-field-group">
                <label htmlFor="leaveReason">
                  Reason <span className="ulm-required-tag">* Min 10 characters</span>
                </label>
                <input
                  id="leaveReason"
                  type="text"
                  className="ulm-input"
                  placeholder="e.g., Personal family function, urgent medical need..."
                  value={form.reason}
                  onChange={(e) => handleFieldChange("reason", e.target.value)}
                  disabled={submitting}
                />
                {errors.reason && (
                  <span className="ulm-field-error">{errors.reason}</span>
                )}
              </div>
            </div>

            <div className="ulm-grid-2">
              <div className="ulm-field-group">
                <label htmlFor="fromDate">
                  From Date <span className="ulm-required-tag">* Required</span>
                </label>
                <input
                  id="fromDate"
                  type="date"
                  className="ulm-input"
                  min={minDateAllowed}
                  value={form.fromDate}
                  onChange={(e) => {
                    handleFieldChange("fromDate", e.target.value);
                    if (form.toDate && form.toDate < e.target.value) {
                      handleFieldChange("toDate", "");
                    }
                  }}
                  disabled={submitting}
                />
                {errors.fromDate && (
                  <span className="ulm-field-error">{errors.fromDate}</span>
                )}
              </div>

              <div className="ulm-field-group">
                <label htmlFor="toDate">
                  To Date <span className="ulm-required-tag">* Required</span>
                </label>
                <input
                  id="toDate"
                  type="date"
                  className="ulm-input"
                  min={form.fromDate || minDateAllowed}
                  value={form.toDate}
                  onChange={(e) => handleFieldChange("toDate", e.target.value)}
                  disabled={submitting}
                />
                {errors.toDate && (
                  <span className="ulm-field-error">{errors.toDate}</span>
                )}
              </div>
            </div>

            {calculatedDays > 0 && (
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#ea580c",
                  marginBottom: 16,
                }}
              >
                📅 Requested Duration: {calculatedDays} day
                {calculatedDays > 1 ? "s" : ""}
              </div>
            )}

            {/* Transfer Duty Box */}
            <div className="ulm-transfer-duty-card">
              <div className="ulm-transfer-header">
                <div className="ulm-transfer-title">
                  <FaExchangeAlt /> Transfer Duty Option
                </div>
                {isDutyTransferMandatory ? (
                  <span className="ulm-required-tag">
                    * Mandatory for {effectiveRole}
                  </span>
                ) : (
                  <label className="ulm-transfer-checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.transferDuty}
                      onChange={(e) =>
                        handleFieldChange("transferDuty", e.target.checked)
                      }
                      disabled={submitting}
                    />
                    Enable Duty Transfer
                  </label>
                )}
              </div>

              <div className="ulm-transfer-sub-notice">
                {isDutyTransferMandatory ? (
                  <span>
                    As a <strong>{effectiveRole}</strong>, assigning an active{" "}
                    <strong>{effectiveRole}</strong> substitute is mandatory so
                    temple operations continue uninterrupted. The substitute
                    will receive your transfer request to accept or reject.
                  </span>
                ) : (
                  <span>
                    Optional: Transfer your daily responsibilities to an available{" "}
                    <strong>{effectiveRole}</strong> while you are away.
                  </span>
                )}
              </div>

              {(isDutyTransferMandatory || form.transferDuty) && (
                <div className="ulm-field-group" style={{ marginTop: 10 }}>
                  <label htmlFor="substituteSelect">
                    Select Available {effectiveRole.charAt(0).toUpperCase() + effectiveRole.slice(1)} Colleague
                    <span className="ulm-required-tag">
                      {isDutyTransferMandatory ? "* Mandatory" : "* Required when enabled"}
                    </span>
                  </label>

                  <select
                    id="substituteSelect"
                    className="ulm-select"
                    value={form.substituteId}
                    onChange={(e) =>
                      handleFieldChange("substituteId", e.target.value)
                    }
                    disabled={submitting || loadingSubstitutes}
                  >
                    <option value="">
                      {loadingSubstitutes
                        ? "Loading available colleagues..."
                        : `-- Choose an available ${effectiveRole} --`}
                    </option>
                    {substitutes.map((colleague) => (
                      <option
                        key={colleague.id || colleague.employeeId}
                        value={colleague.id}
                        disabled={!colleague.available}
                      >
                        {colleague.name} ({colleague.email || colleague.employeeId || "Staff"}) -{" "}
                        {colleague.available ? "✅ Available" : `❌ ${colleague.reason}`}
                      </option>
                    ))}
                  </select>

                  {errors.substituteId && (
                    <span className="ulm-field-error">
                      {errors.substituteId}
                    </span>
                  )}

                  {form.substituteName && (
                    <div className="ulm-selected-substitute-pill">
                      <FaUserCheck /> Request will be delivered to:{" "}
                      <strong>{form.substituteName}</strong> (
                      {form.substituteEmail || effectiveRole})
                    </div>
                  )}

                  {substitutes.length === 0 && !loadingSubstitutes && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "#dc2626",
                        marginTop: 6,
                        fontWeight: 600,
                      }}
                    >
                      ⚠️ No other active {effectiveRole}s found in the system.
                      Please contact temple administration.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button
                type="submit"
                className="ulm-btn-primary"
                disabled={submitting}
              >
                {submitting ? "Submitting Leave..." : "Submit Leave Application"}
              </button>
              <button
                type="button"
                className="ulm-btn-outline"
                onClick={() => setIsApplyOpen(false)}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs for Navigation */}
      <div className="ulm-tabs">
        <button
          type="button"
          className={`ulm-tab-btn ${activeTab === "leaves" ? "active" : ""}`}
          onClick={() => setActiveTab("leaves")}
        >
          <FaCalendarAlt />
          My Leave Requests
          <span className="ulm-tab-badge">{leaves.length}</span>
        </button>

        <button
          type="button"
          className={`ulm-tab-btn ${activeTab === "incoming" ? "active" : ""}`}
          onClick={() => setActiveTab("incoming")}
        >
          <FaExchangeAlt />
          Incoming Duty Transfers
          <span
            className={`ulm-tab-badge ${
              pendingIncomingTransfersCount > 0 ? "highlight" : ""
            }`}
          >
            {pendingIncomingTransfersCount > 0
              ? `${pendingIncomingTransfersCount} New`
              : incomingTransfers.length}
          </span>
        </button>
      </div>

      {/* Tab 1: My Leave Requests Table */}
      {activeTab === "leaves" && (
        <div className="ulm-table-card">
          <div className="ulm-table-responsive">
            <table className="ulm-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Reason</th>
                  <th>Period</th>
                  <th>Days</th>
                  <th>Duty Transfer</th>
                  <th>Admin Status</th>
                  <th>Admin Remarks</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div className="ulm-empty-state">
                        <FaCalendarAlt className="ulm-empty-state-icon" />
                        <h3>No Leave Requests Submitted</h3>
                        <p>
                          You have not submitted any leave applications yet.
                          Click "+ Apply for Leave" to create one.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave) => {
                    const days = getDays(leave.fromDate, leave.toDate);
                    const hasTransfer = Boolean(leave.transferDuty);

                    return (
                      <tr key={leave._id}>
                        <td>
                          <strong>{leave.leaveType || "General"}</strong>
                        </td>
                        <td style={{ maxWidth: 220 }}>
                          <div
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={leave.reason}
                          >
                            {leave.reason}
                          </div>
                        </td>
                        <td>{formatPeriod(leave.fromDate, leave.toDate)}</td>
                        <td>
                          <strong>{days}</strong> day{days > 1 ? "s" : ""}
                        </td>
                        <td>
                          {hasTransfer ? (
                            <div>
                              <span
                                className={`ulm-badge ${String(
                                  leave.transferStatus || "pending"
                                ).toLowerCase()}`}
                              >
                                {leave.transferStatus || "Pending"}
                              </span>
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "#64748b",
                                  marginTop: 3,
                                  fontWeight: 600,
                                }}
                              >
                                Assigned: {leave.substituteName || "Colleague"}
                              </div>
                              {leave.transferStatus === "Rejected" &&
                                leave.transferRejectReason && (
                                  <div
                                    style={{
                                      fontSize: 11,
                                      color: "#dc2626",
                                      marginTop: 2,
                                    }}
                                  >
                                    Note: {leave.transferRejectReason}
                                  </div>
                                )}
                            </div>
                          ) : (
                            <span className="ulm-badge none">None</span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`ulm-badge ${String(
                              leave.status || "pending"
                            ).toLowerCase()}`}
                          >
                            {leave.status || "Pending"}
                          </span>
                        </td>
                        <td style={{ color: "#64748b" }}>
                          {leave.adminReason || "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Incoming Duty Transfers */}
      {activeTab === "incoming" && (
        <div>
          {incomingTransfers.length === 0 ? (
            <div className="ulm-table-card">
              <div className="ulm-empty-state">
                <FaExchangeAlt className="ulm-empty-state-icon" />
                <h3>No Incoming Duty Transfers</h3>
                <p>
                  No colleagues have transferred duties to you at this time.
                  When someone requests you as a substitute, it will appear
                  here.
                </p>
              </div>
            </div>
          ) : (
            <div className="ulm-incoming-grid">
              {incomingTransfers.map((req) => {
                const days = getDays(req.fromDate, req.toDate);
                const isPending = req.transferStatus === "Pending";
                const isAccepted = req.transferStatus === "Accepted";
                const isRejected = req.transferStatus === "Rejected";

                return (
                  <div key={req._id} className="ulm-transfer-card">
                    <div>
                      <div className="ulm-tc-header">
                        <div className="ulm-tc-user">
                          <div className="ulm-tc-avatar">
                            {(req.staffName || "C").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="ulm-tc-name">
                              {req.staffName || "Colleague"}
                            </h4>
                            <p className="ulm-tc-meta">
                              {req.role || effectiveRole} •{" "}
                              {req.staffEmail || "Staff"}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`ulm-badge ${String(
                            req.transferStatus || "pending"
                          ).toLowerCase()}`}
                        >
                          {req.transferStatus || "Pending"}
                        </span>
                      </div>

                      <div className="ulm-tc-body">
                        <div className="ulm-tc-row">
                          <FaCalendarAlt style={{ color: "#ea580c" }} />
                          <span>
                            <strong>Period:</strong>{" "}
                            {formatPeriod(req.fromDate, req.toDate)} ({days}{" "}
                            day{days > 1 ? "s" : ""})
                          </span>
                        </div>
                        <div className="ulm-tc-row">
                          <FaInfoCircle style={{ color: "#2563eb" }} />
                          <span>
                            <strong>Leave Type:</strong>{" "}
                            {req.leaveType || "General"}
                          </span>
                        </div>
                        <div className="ulm-tc-reason">
                          <strong>Colleague's Reason:</strong> {req.reason}
                        </div>

                        {isRejected && req.transferRejectReason && (
                          <div
                            style={{
                              fontSize: 12,
                              color: "#dc2626",
                              fontWeight: 600,
                              marginTop: 4,
                            }}
                          >
                            Rejection Note: {req.transferRejectReason}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions if Pending */}
                    {isPending ? (
                      <div className="ulm-tc-actions">
                        <button
                          type="button"
                          className="ulm-btn-accept"
                          disabled={actionLoading}
                          onClick={() =>
                            handleTransferResponse(req._id, "Accepted")
                          }
                        >
                          <FaCheck /> Accept Duty
                        </button>
                        <button
                          type="button"
                          className="ulm-btn-reject"
                          disabled={actionLoading}
                          onClick={() => {
                            setRejectingTransferId(req._id);
                            setRejectReason("");
                            setRejectModalOpen(true);
                          }}
                        >
                          <FaTimes /> Reject
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#64748b",
                          fontWeight: 600,
                          textAlign: "right",
                          marginTop: 8,
                        }}
                      >
                        Resolved on:{" "}
                        {req.transferResolvedAt
                          ? new Date(req.transferResolvedAt).toLocaleDateString(
                              "en-IN"
                            )
                          : "Done"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="ulm-modal-overlay">
          <div className="ulm-modal">
            <h3>Reject Duty Transfer</h3>
            <p>
              Please enter a brief reason for declining this duty transfer
              request so your colleague and admin are notified:
            </p>
            <textarea
              className="ulm-textarea"
              rows="3"
              placeholder="e.g., Already scheduled for morning homam duties, personal commitment..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="ulm-modal-actions">
              <button
                type="button"
                className="ulm-btn-outline"
                disabled={actionLoading}
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectingTransferId(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ulm-btn-reject"
                disabled={actionLoading}
                onClick={() =>
                  handleTransferResponse(
                    rejectingTransferId,
                    "Rejected",
                    rejectReason
                  )
                }
              >
                {actionLoading ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedLeaveManagement;
