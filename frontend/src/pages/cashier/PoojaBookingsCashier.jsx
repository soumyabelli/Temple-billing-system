import { useEffect, useMemo, useState } from "react";
import { FaCalendarAlt, FaHeart, FaInfoCircle, FaRegClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { getPoojaTypes } from "../../services/poojaTypeService";
import { createDevoteeBooking, getDevoteeBookings, markNotificationAsRead } from "../../services/devoteeService";
import { getDevoteeNotifications } from "../../services/devoteeService";

// Service layer abstraction (UI will stay unchanged when backend pooja catalog is added)
async function getPoojaServices() {
  // Temporary source: localStorage based `poojaTypeService.js`
  return getPoojaTypes();
}

const formatDateTimeLocalValue = (d) => {
  // yyyy-MM-ddTHH:mm
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const parseDateTimeLocalToISO = (value) => {
  // value: yyyy-MM-ddTHH:mm
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
};

const formatDisplayDateTime = (isoOrDate) => {
  try {
    const d = new Date(isoOrDate);
    if (Number.isNaN(d.getTime())) return isoOrDate ? String(isoOrDate) : "--";
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "--";
  }
};

const getMobileValidity = (value) => {
  // very light validation: 10 digits (Indian)
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return true; // optional
  return digits.length >= 10 && digits.length <= 15;
};

// NOTE: This page must NOT use CashierShell, because CashierDashboard owns the sidebar
// and we want the sidebar background to remain identical when switching menu items.

const CashierPoojaBookings = () => {

  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  const email = user?.email ? String(user.email).toLowerCase() : "";

  const [poojaServices, setPoojaServices] = useState([]);
  const [selectedPoojaName, setSelectedPoojaName] = useState("");

  const [dateTime, setDateTime] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    return formatDateTimeLocalValue(d);
  });
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [contactNumber, setContactNumber] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const unreadCount = useMemo(() => notifications.filter((n) => n && n.read === false).length, [notifications]);

  const selectedPooja = useMemo(() => {
    return poojaServices.find((p) => p.name === selectedPoojaName) || null;
  }, [poojaServices, selectedPoojaName]);

  const minDateTime = useMemo(() => {
    const d = new Date();
    // disable past: round up to next 5 minutes
    d.setSeconds(0, 0);
    d.setMinutes(d.getMinutes() + 5);
    return formatDateTimeLocalValue(d);
  }, []);

  const loadPoojas = async () => {
    const list = await getPoojaServices();
    const active = Array.isArray(list)
      ? list
      : [];

    // normalize to required fields
    const normalized = active
      .map((p) => ({
        _id: p?._id || p?.id || p?.name,
        name: p?.name,
        price: Number(p?.price) || 0,
        description: p?.description || "",
        status: p?.status || "active",
      }))
      .filter((p) => p.name && p.price > 0);

    setPoojaServices(normalized);

    if (!selectedPoojaName && normalized.length) {
      setSelectedPoojaName(normalized[0].name);
    }
  };

  const loadBookings = async () => {
    setLoadingBookings(true);
    try {
      const data = await getDevoteeBookings(email);
      const list = data?.bookings || data || [];
      setBookings(Array.isArray(list) ? list : []);
    } catch {
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const data = await getDevoteeNotifications(email);
      const list = data?.notifications || data?.notifications || data || [];
      setNotifications(Array.isArray(list) ? list : []);
    } catch {
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    // fetch services + my bookings + notifications
    loadPoojas();
    loadBookings();
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bookingSummary = useMemo(() => {
    const iso = parseDateTimeLocalToISO(dateTime);
    return {
      service: selectedPooja?.name || "--",
      date: iso ? formatDisplayDateTime(iso) : "--",
      amount: selectedPooja ? `₹ ${selectedPooja.price}` : "--",
      payment: paymentMethod || "--",
    };
  }, [selectedPooja, dateTime, paymentMethod]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedPooja) {
      setError("Please select a pooja service.");
      return;
    }

    const iso = parseDateTimeLocalToISO(dateTime);
    if (!iso) {
      setError("Please choose a valid date & time.");
      return;
    }

    const mobileOk = getMobileValidity(contactNumber);
    if (!mobileOk) {
      setError("Please enter a valid contact number.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        devoteeName: user?.name || "Cashier",
        devoteeEmail: email,
        devoteePhone: contactNumber || undefined,
        service: selectedPooja.name,
        datetime: iso,
        amount: selectedPooja.price,
        paymentMethod,
        contactNumber: contactNumber || undefined,
        notes: notes || undefined,
      };

      await createDevoteeBooking(payload);

      // Refresh bookings + notifications (real-time-ish)
      await loadBookings();
      await loadNotifications();

      // Keep form selection, but reset notes
      setNotes("");
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Failed to create booking.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    // best-effort: mark first batch as read
    const unread = notifications.filter((n) => n && n.read === false);
    if (!unread.length) return;

    try {
      await Promise.all(
        unread.slice(0, 20).map((n) => markNotificationAsRead(n._id || n.id))
      );
    } catch {
      // ignore
    }
    await loadNotifications();
  };

  return (
    <div style={{ padding: 0 }}>
      <div style={{ display: "flex", gap: 18, alignItems: "stretch" }}>
        {/* Left: Booking form 70% */}
        <div style={{ flex: 7, minWidth: 0 }}>
          <div className="cashier-booking-page">
            <div className="bbm-hero-card">
              <div>
                <h2 className="bbm-hero-title">🛕 Pooja Bookings</h2>
                <p className="bbm-hero-sub">Book services for devotees with a temple-first experience.</p>
              </div>
            </div>

            <form className="bbm-grid" onSubmit={handleSubmit}>
              <div className="bbm-form-card">
                <div className="bbm-card-header">
                  <h3>Booking Form</h3>
                  <span className="bbm-badge">Light Orange Temple Theme</span>
                </div>

                {error ? (
                  <div className="bbm-error">
                    <FaInfoCircle />
                    <span>{error}</span>
                  </div>
                ) : null}

                <div className="bbm-field">
                  <label>Service</label>
                  <select
                    value={selectedPoojaName}
                    onChange={(e) => setSelectedPoojaName(e.target.value)}
                    disabled={!poojaServices.length || loading}
                  >
                    {poojaServices.length ? (
                      poojaServices.map((p) => (
                        <option key={p._id || p.name} value={p.name}>
                          {p.name} ₹ {p.price}	
                        </option>
                      ))
                    ) : (
                      <option value="">No active poojas</option>
                    )}
                  </select>
                </div>

                <div className="bbm-field">
                  <label>Date & Time</label>
                  <input
                    type="datetime-local"
                    value={dateTime}
                    min={minDateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                  />
                </div>

                <div className="bbm-field">
                  <label>Amount</label>
                  <input type="text" value={selectedPooja ? `₹ ${selectedPooja.price}` : "--"} readOnly />
                </div>

                <div className="bbm-field">
                  <label>Payment Method</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                </div>

                <div className="bbm-field">
                  <label>Contact Number (Optional)</label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="Enter mobile number"
                  />
                </div>

                <div className="bbm-field">
                  <label>Notes (Optional)</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                </div>

                <button className="bbm-submit" type="submit" disabled={loading || !poojaServices.length}>
                  {loading ? "Booking..." : "Book Pooja"}
                </button>

                <div className="bbm-hint">
                  <FaRegClock /> Future dates only. Past dates are disabled.
                </div>
              </div>

              {/* Right inside form card area (30%) */}
              <div className="bbm-sidebar-card">
                <div className="bbm-sidebar-section">
                  <div className="bbm-sidebar-title">
                    <FaHeart /> Popular Pooja Services
                  </div>

                  {poojaServices.length ? (
                    <div className="bbm-pooja-list">
                      {poojaServices.map((p) => {
                        const active = p.name === selectedPoojaName;
                        return (
                          <button
                            key={p._id || p.name}
                            type="button"
                            className={`bbm-pooja-item ${active ? "is-selected" : ""}`}
                            onClick={() => setSelectedPoojaName(p.name)}
                          >
                            <div className="bbm-pooja-name">{p.name}</div>
                            <div className="bbm-pooja-price">₹ {p.price}</div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bbm-empty">No poojas available.</div>
                  )}
                </div>

                <div className="bbm-sidebar-section">
                  <div className="bbm-sidebar-title">Booking Summary</div>
                  <div className="bbm-summary">
                    <div className="bbm-summary-row">
                      <span className="k">Service</span>
                      <span className="v">{bookingSummary.service}</span>
                    </div>
                    <div className="bbm-summary-row">
                      <span className="k">Date</span>
                      <span className="v">{bookingSummary.date}</span>
                    </div>
                    <div className="bbm-summary-row">
                      <span className="k">Amount</span>
                      <span className="v">{bookingSummary.amount}</span>
                    </div>
                    <div className="bbm-summary-row">
                      <span className="k">Payment</span>
                      <span className="v">{bookingSummary.payment}</span>
                    </div>
                  </div>
                </div>

                <div className="bbm-sidebar-section">
                  <div className="bbm-sidebar-title">Notifications</div>
                  <div className="bbm-notif-top">
                    <span className="bbm-notif-badge">Unread: {unreadCount}</span>
                    <button type="button" className="bbm-mark-btn" onClick={handleMarkAllRead}>
                      Mark all read
                    </button>
                  </div>
                </div>
              </div>
            </form>

            <div className="bbm-history-card">
              <div className="bbm-card-header">
                <h3>My Booking History</h3>
                <span className="bbm-badge">{loadingBookings ? "Loading..." : `${bookings.length} bookings`}</span>
              </div>

              {bookings.length ? (
                <div className="bbm-history-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Pooja Name</th>
                        <th>Date & Time</th>
                        <th>Amount</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b._id || b.id}>
                          <td>{b._id || b.id || "--"}</td>
                          <td>{b.service || "--"}</td>
                          <td>{formatDisplayDateTime(b.datetime)}</td>
                          <td>₹ {b.amount ?? "--"}</td>
                          <td>{b.paymentMethod || "--"}</td>
                          <td>
                            <span className={`bbm-status ${String(b.status || "Pending").toLowerCase()}`}>{b.status || "Pending"}</span>
                          </td>
                          <td>{formatDisplayDateTime(b.createdAt || b.created)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bbm-empty">No bookings found.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inline styles for this page to keep theme consistent without touching global dashboard CSS heavily */}
      <style>{`
        .cashier-booking-page{ background:transparent; }
        .bbm-hero-card{
          background:#FFFFFF;
          border-radius:24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          padding:22px 24px;
          margin-bottom:16px;
          border:1px solid rgba(255,140,0,0.15);
        }
        .bbm-hero-title{ color:#3D2B1F; font-family: 'Cinzel', serif; font-size:28px; font-weight:800; }
        .bbm-hero-sub{ color:#6B5B4D; margin-top:6px; font-size:14px; }

        .bbm-grid{ display:grid; grid-template-columns: 70% 30%; gap:16px; }
        @media(max-width: 1100px){ .bbm-grid{ grid-template-columns:1fr; } }

        .bbm-form-card{
          background:#FFFFFF;
          border-radius:22px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          border:1px solid rgba(255,140,0,0.15);
          padding:18px;
        }

        .bbm-sidebar-card{
          background:transparent;
          display:flex;
          flex-direction:column;
          gap:16px;
        }

        .bbm-sidebar-section{
          background:#FFFFFF;
          border-radius:22px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          border:1px solid rgba(255,140,0,0.15);
          padding:16px;
        }

        .bbm-card-header{ display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
        .bbm-card-header h3{ font-size:16px; font-weight:800; color:#3D2B1F; }
        .bbm-badge{ background:#FFF7ED; border:1px solid #FFEDD5; color:#EA580C; font-weight:800; font-size:11px; padding:4px 10px; border-radius:999px; }

        .bbm-field{ margin-bottom:12px; }
        .bbm-field label{ display:block; font-size:12px; font-weight:800; color:#6B5B4D; margin-bottom:6px; }
        .bbm-field input, .bbm-field select, .bbm-field textarea{
          width:100%;
          border:1px solid #F1E2C7;
          background:#FFF;
          border-radius:14px;
          padding:10px 12px;
          outline:none;
          font-size:13px;
          color:#3D2B1F;
        }

        .bbm-submit{
          width:100%;
          border:none;
          background:#0F766E;
          color:#FFF;
          font-weight:900;
          padding:12px 14px;
          border-radius:16px;
          cursor:pointer;
          box-shadow: 0 8px 20px rgba(15,118,110,0.18);
          margin-top:8px;
        }
        .bbm-submit:disabled{ opacity:0.6; cursor:not-allowed; }

        .bbm-hint{ margin-top:10px; font-size:12px; color:#6B5B4D; display:flex; gap:8px; align-items:center; }

        .bbm-pooja-list{ display:flex; flex-direction:column; gap:10px; }
        .bbm-pooja-item{
          width:100%;
          text-align:left;
          border:1px solid rgba(255,140,0,0.18);
          background:#FFFDF8;
          border-radius:16px;
          padding:12px;
          cursor:pointer;
          transition: all .2s ease;
          display:flex;
          justify-content:space-between;
          align-items:center;
        }
        .bbm-pooja-item:hover{ transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.06); }
        .bbm-pooja-item.is-selected{
          border-color:#FF8A00;
          background:#FFF3E0;
          box-shadow: 0 10px 25px rgba(255,138,0,0.18);
        }
        .bbm-pooja-name{ font-weight:900; color:#3D2B1F; }
        .bbm-pooja-price{ color:#EA580C; font-weight:900; }

        .bbm-summary{ display:flex; flex-direction:column; gap:10px; margin-top:6px; }
        .bbm-summary-row{ display:flex; justify-content:space-between; gap:12px; }
        .bbm-summary-row .k{ font-size:12px; color:#6B5B4D; font-weight:700; }
        .bbm-summary-row .v{ font-size:12px; color:#3D2B1F; font-weight:900; text-align:right; }

        .bbm-notif-top{ display:flex; justify-content:space-between; align-items:center; gap:10px; }
        .bbm-notif-badge{ background:#FFF7ED; border:1px solid #FFEDD5; color:#EA580C; border-radius:999px; padding:6px 10px; font-weight:900; font-size:12px; }
        .bbm-mark-btn{ border:none; background:rgba(15,118,110,0.1); color:#0F766E; font-weight:900; padding:8px 10px; border-radius:14px; cursor:pointer; }

        .bbm-history-card{
          margin-top:16px;
          background:#FFFFFF;
          border-radius:22px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          border:1px solid rgba(255,140,0,0.15);
          padding:18px;
        }

        .bbm-history-table{ overflow-x:auto; }
        .bbm-history-table table{ width:100%; border-collapse:collapse; min-width:780px; }
        .bbm-history-table th{ text-align:left; font-size:12px; color:#6B5B4D; padding:10px 10px; border-bottom:1px solid #F1E2C7; }
        .bbm-history-table td{ font-size:12px; color:#3D2B1F; padding:12px 10px; border-bottom:1px solid #F8EEE0; }

        .bbm-status{ font-weight:900; font-size:11px; padding:6px 10px; border-radius:999px; display:inline-block; }
        .bbm-status.pending{ background:#FEF3C7; color:#D97706; }
        .bbm-status.approved{ background:#DCFCE7; color:#15803D; }
        .bbm-status.rejected{ background:#FEF2F2; color:#991B1B; }
        .bbm-status.completed{ background:#EFF6FF; color:#2563EB; }

        .bbm-empty{ color:#6B5B4D; font-weight:800; padding:18px 8px; }
        .bbm-error{ display:flex; gap:10px; align-items:center; background:#FEF2F2; border:1px solid #FCA5A5; color:#991B1B; padding:10px 12px; border-radius:16px; margin-bottom:12px; font-weight:900; font-size:13px; }
      `}</style>
    </div>
  );
};

export default CashierPoojaBookings;



