import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Topbar from "../components/common/Topbar";
import { sidebarItems } from "../data/sidebarData";

const findActiveItem = (path) => {
  const matched = sidebarItems.find((item) => item.path === path || item.subItems?.some((sub) => sub.path === path));
  return matched ? matched.title : "Dashboard";
};

const AdminLayout = ({ children, onLogoutClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState(findActiveItem(location.pathname));
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setActiveItem(findActiveItem(location.pathname));
  }, [location.pathname]);

  return (
    <div
      className={`${
        darkMode
          ? "bg-[#0f172a]"
          : "bg-[#f5f3ef]"
      } min-h-screen transition-colors duration-300`}
    >
      <Sidebar
        activeItem={activeItem}
        activePath={location.pathname}
        onSelect={setActiveItem}
        onNavigate={(path) => navigate(path)}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        darkMode={darkMode}
        onLogoutClick={onLogoutClick}
      />

      <div
        className={`transition-all duration-300 p-4 md:p-5 ${
          collapsed
            ? "lg:ml-[84px]"
            : "lg:ml-[254px]"
        }`}
      >
        <Topbar
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode((prev) => !prev)}
          onOpenMobileSidebar={() => setMobileOpen(true)}
        />

        {typeof children === "function" ? children({ activeItem, darkMode }) : children}
      </div>
    </div>
  );
};

export default AdminLayout;
