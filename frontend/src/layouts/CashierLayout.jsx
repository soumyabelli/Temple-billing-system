import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import { MdMenu } from "react-icons/md";
import LogoutModal from "../components/LogoutModal";
import CashierSidebar from "../components/common/CashierSidebar";
import { useAuth } from "../context/AuthContext";
import { cashierSidebarItems } from "../data/cashierSidebarData";

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
  const { logoutUser } = useAuth();
  const [activeItem, setActiveItem] = useState(findActiveItem(location.pathname));
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

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
    <div className="min-h-screen bg-[#fff8ee] text-slate-950 transition-colors duration-300">
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
      />

      <main
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? "lg:pl-[92px]" : "lg:pl-[280px]"
        }`}
      >
        <div className="sticky top-0 z-20 border-b border-[#f3d7b0] bg-[#fff8ef]/95 px-4 py-3 backdrop-blur-xl md:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#f1d2a2] bg-white/90 text-[#8a5200] shadow-sm transition hover:bg-white lg:hidden"
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
              <div className="hidden rounded-full border border-[#f1d2a2] bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm md:block">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <button
                type="button"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#f1d2a2] bg-white/90 text-[#8a5200] shadow-sm transition hover:bg-white"
                aria-label="Notifications"
              >
                <FaBell size={16} />
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-[#f28c18]" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 md:px-6 md:py-6">
          {typeof children === "function" ? children({ activeItem }) : children || <Outlet />}
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
