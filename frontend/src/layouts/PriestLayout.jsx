import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PriestSidebar from "../components/common/PriestSidebar";
import PriestTopbar from "../components/common/PriestTopbar";
import LogoutModal from "../components/LogoutModal";
import { useAuth } from "../context/AuthContext";
import { priestSidebarItems } from "../data/priestSidebarData";

const findActiveItem = (path) => {
  const matched = priestSidebarItems.find(
    (item) => item.path === path || item.subItems?.some((sub) => sub.path === path)
  );
  return matched ? matched.title : "Dashboard";
};

const PriestLayout = ({ children, onLogoutClick }) => {
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
    <div
      className={`${
        darkMode ? "bg-[#0f172a]" : "bg-[#f5f3ef]"
      } min-h-screen transition-colors duration-300`}
    >
      <PriestSidebar
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

      <div
        className={`transition-all duration-300 p-4 md:p-5 ${
          collapsed ? "lg:ml-[84px]" : "lg:ml-[254px]"
        }`}
      >
        <PriestTopbar
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode((prev) => !prev)}
          onOpenMobileSidebar={() => setMobileOpen(true)}
        />

        <main className="mt-6">
          {typeof children === "function" ? children({ activeItem, darkMode }) : children}
        </main>
      </div>

      {showLogout && (
        <LogoutModal
          onClose={() => setShowLogout(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default PriestLayout;

