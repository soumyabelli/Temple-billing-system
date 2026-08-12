import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import { MdMenu } from "react-icons/md";
import LogoutModal from "../components/LogoutModal";
import CashierSidebar from "../components/common/CashierSidebar";
import { useAuth } from "../context/AuthContext";
import { cashierSidebarItems } from "../data/cashierSidebarData";
import { useNotifications } from "../context/NotificationContext";
import { useTheme } from "../context/ThemeContext";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { FaSignOutAlt } from "react-icons/fa";

const findActiveItem = (path) => {
  const matched = cashierSidebarItems.find((item) => {
    if (!path) return false;
    if (item.path === "/cashier") return path === "/cashier" || path === "/cashier/";
    return item.path === path || path.startsWith(`${item.path}/`);
  });
  return matched ? matched.title : "Dashboard";
};

const CashierLayout = ({ children, onLogoutClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logoutUser, user } = useAuth();
  const { unreadCount } = useNotifications();
  const avatarSrc = user?.photo || "";
  const avatarInitial = (user?.name || "C").charAt(0).toUpperCase();
  const [activeItem, setActiveItem] = useState(findActiveItem(location.pathname));
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    setActiveItem(findActiveItem(location.pathname));
  }, [location.pathname]);

  const handleLogout = () => {
    logoutUser();
    setShowLogout(false);
    navigate("/login");
  };

  const handleSidebarLogoutClick = () => {
    if (onLogoutClick) {
      onLogoutClick();
      return;
    }
    setShowLogout(true);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-[#0f172a] text-slate-100" : "bg-[#fff8ee] text-slate-950"}`}>
      <CashierSidebar
        activeItem={activeItem}
        activePath={location.pathname}
        onSelect={setActiveItem}
        onNavigate={(path) => navigate(path)}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onLogoutClick={handleSidebarLogoutClick}
        unreadCount={unreadCount}
        darkMode={darkMode}
      />

      <main
        className={`min-h-screen transition-all duration-300 ${collapsed ? "lg:pl-[92px]" : "lg:pl-[320px]"
          }`}
      >
        <div className={`sticky top-0 z-20 border-b px-4 py-3 backdrop-blur-xl md:px-6 transition-colors duration-300 ${darkMode ? "border-slate-800 bg-[#0f172a]/95" : "border-[#f3d7b0] bg-[#fff8ef]/95"}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#f1d2a2] bg-temple-100/90 text-[#8a5200] shadow-sm transition hover:bg-temple-100 lg:hidden"
                aria-label="Open cashier menu"
              >
                <MdMenu size={22} />
              </button>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#a35f00]">Temple Cashier</p>
                <h1 className="truncate text-lg font-extrabold text-slate-950 md:text-[1.35rem]">
                  {activeItem}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleDarkMode}
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors ${
                  darkMode
                    ? "border-slate-700 bg-slate-800 text-amber-300 hover:bg-slate-700"
                    : "border-[#f1d2a2] bg-temple-100 text-[#8a5200] hover:bg-[#fff8ee]"
                }`}
                aria-label="Toggle theme"
              >
                {darkMode ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
              </button>
              <div 
                className={`hidden h-11 w-11 overflow-hidden rounded-2xl border shadow-sm md:block cursor-pointer transition-colors ${darkMode ? "border-slate-700 bg-slate-800" : "border-[#f1d2a2] bg-temple-100 hover:bg-[#fff8ee]"}`}
                onClick={() => navigate("/cashier/profile")}
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt={user?.name || "Cashier"} className="h-full w-full object-cover" />
                ) : (
                  <div className={`grid h-full w-full place-items-center text-sm font-bold ${darkMode ? "text-slate-300" : "text-[#8a5200]"}`}>
                    {avatarInitial}
                  </div>
                )}
              </div>
              <div className={`hidden rounded-full border px-4 py-2 text-sm font-semibold shadow-sm md:block transition-colors ${darkMode ? "border-slate-700 bg-slate-800 text-slate-300" : "border-[#f1d2a2] bg-temple-100 text-slate-900"}`}>
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <button
                type="button"
                onClick={() => navigate("/cashier/notifications")}
                className={`relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm transition hover:bg-temple-100 ${darkMode ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700" : "border-[#f1d2a2] bg-temple-100/90 text-[#8a5200]"}`}
                aria-label="Notifications"
                id="cashier-bell-btn"
              >
                <FaBell size={16} />
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#f28c18] text-[10px] font-extrabold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : (
                  <span className={`absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 ${darkMode ? "border-slate-800 bg-slate-600" : "border-white bg-slate-300"}`} />
                )}
              </button>
              <button
                type="button"
                onClick={handleSidebarLogoutClick}
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors ${
                  darkMode
                    ? "border-slate-700 bg-slate-800 text-rose-400 hover:bg-slate-700"
                    : "border-[#f1d2a2] bg-temple-100 text-rose-500 hover:bg-[#fff8ee]"
                }`}
                aria-label="Logout"
              >
                <FaSignOutAlt size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 md:px-6 md:py-6">
          {typeof children === "function" ? children({ activeItem }) : children}
          <Outlet />
        </div>
      </main>

      {showLogout && (
        <LogoutModal
          onClose={() => setShowLogout(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default CashierLayout;

