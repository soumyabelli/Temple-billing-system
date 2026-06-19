import { useNavigate } from "react-router-dom";
import { FaBell, FaCalendarAlt, FaChevronDown } from "react-icons/fa";
import { useState } from "react";
import AccountantSidebar from "./components/AccountantSidebar";
import AccountantPageContent from "./components/AccountantPageContent";
import { useAuth } from "../../context/AuthContext";
import "./AccountantDashboard.css";

const formatCurrentDate = () =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

const formatWeekday = () =>
  new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
  }).format(new Date());

const AccountantDashboard = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();
  const [activeItem, setActiveItem] = useState("Dashboard");

  const displayName = user?.name || "Accountant";
  const initials = displayName.charAt(0).toUpperCase();
  const currentDate = formatCurrentDate();
  const currentWeekday = formatWeekday();

  const handleLogout = () => {
    logoutUser();
    alert("Logout Successful");
    navigate("/auth-login");
  };

  return (
    <div className="accountant-shell">
      <AccountantSidebar
        activeItem={activeItem}
        onSelectItem={setActiveItem}
        onLogout={handleLogout}
      />

      <main className="accountant-main">
        <header className="accountant-topbar">
          <div className="accountant-topbar__welcome">
            <span className="accountant-topbar__dot" aria-hidden="true">
              &bull;
            </span>
            <span>Welcome,</span>
            <strong>{displayName}</strong>
          </div>

          <div className="accountant-topbar__actions">
            <div className="accountant-topbar__date">
              <FaCalendarAlt />
              <span>{currentDate}</span>
              <span className="accountant-topbar__weekday">| {currentWeekday}</span>
            </div>

            <button type="button" className="accountant-topbar__iconButton" aria-label="Notifications">
              <FaBell />
              <span className="accountant-topbar__badge">5</span>
            </button>

            <div className="accountant-user">
              <div className="accountant-user__avatar">{initials}</div>
              <div className="accountant-user__meta">
                <strong>{displayName}</strong>
                <span>Accountant</span>
              </div>
              <FaChevronDown className="accountant-user__caret" />
            </div>
          </div>
        </header>

        <div className="accountant-content">
          <AccountantPageContent
            activeItem={activeItem}
            user={user}
            currentDate={currentDate}
            currentWeekday={currentWeekday}
          />
        </div>
      </main>
    </div>
  );
};

export default AccountantDashboard;
