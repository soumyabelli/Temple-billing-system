import { useEffect, useState } from "react";
<<<<<<< HEAD
import { useLocation, useNavigate } from "react-router-dom";
=======
import { Outlet, useLocation, useNavigate } from "react-router-dom";
>>>>>>> 1a512012f6af945a370c9e9129f3773ce078e50c
import Sidebar from "../components/common/Sidebar";
import Topbar from "../components/common/Topbar";
import LogoutModal from "../components/LogoutModal";
import { useAuth } from "../context/AuthContext";
import { cashierSidebarItems } from "../data/cashierSidebarData";

const findActiveItem = (path) => {
  const matched = cashierSidebarItems.find((item) => item.path === path || item.subItems?.some((sub) => sub.path === path));
  return matched ? matched.title : "Dashboard";
};

<<<<<<< HEAD
const CashierLayout = ({ children, onLogoutClick }) => {
=======
const CashierLayout = ({ onLogoutClick }) => {
>>>>>>> 1a512012f6af945a370c9e9129f3773ce078e50c
  const location = useLocation();
  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const [activeItem, setActiveItem] = useState(findActiveItem(location.pathname));
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
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
    <div className={`min-h-screen transition-colors duration-300`}>
      <Sidebar
        items={cashierSidebarItems}
        activeItem={activeItem}
        activePath={location.pathname}
        onSelect={setActiveItem}
        onNavigate={(path) => navigate(path)}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        darkMode={darkMode}
        onLogoutClick={handleSidebarLogoutClick}
      />

<<<<<<< HEAD
      <div className={`transition-all duration-300 p-4 md:p-5 ${collapsed ? "lg:ml-[84px]" : "lg:ml-[254px]"}`}>
        <Topbar
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode((prev) => !prev)}
          onOpenMobileSidebar={() => setMobileOpen(true)}
        />

        {typeof children === "function" ? children({ activeItem, darkMode }) : children}
      </div>

=======
      <div className={`flex transition-all duration-300 ${collapsed ? "lg:ml-[84px]" : "lg:ml-[254px]"}`}>
        <div className="flex-1 p-4 md:p-5">
          <Topbar
            darkMode={darkMode}
            toggleDarkMode={() => setDarkMode((prev) => !prev)}
            onOpenMobileSidebar={() => setMobileOpen(true)}
          />

          <Outlet />
        </div>
      </div>


>>>>>>> 1a512012f6af945a370c9e9129f3773ce078e50c
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
