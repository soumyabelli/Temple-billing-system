import { useState } from "react";
import Sidebar from "../components/common/Sidebar";
import Topbar from "../components/common/Topbar";

const AdminLayout = ({
  children,
  onLogoutClick,
}) => {

  const [activeItem, setActiveItem] = useState("Dashboard");

  const [collapsed, setCollapsed] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(false);

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
        onSelect={setActiveItem}
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

          toggleDarkMode={() =>
            setDarkMode((prev) => !prev)
          }

          onOpenMobileSidebar={() =>
            setMobileOpen(true)
          }
        />

        {
          typeof children === "function"
            ? children({
                activeItem,
                darkMode,
              })
            : children
        }

      </div>

    </div>
  );
};

export default AdminLayout;