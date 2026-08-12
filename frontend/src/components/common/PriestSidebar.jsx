import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { priestSidebarItems } from "../../data/priestSidebarData";
import { MdMenu, MdTempleBuddhist, MdKeyboardArrowDown } from "react-icons/md";
import templeBg from "../../assets/temple-bg.jpg";

const PriestSidebar = ({
  activeItem,
  activePath,
  onSelect,
  onNavigate,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  darkMode,
  onLogoutClick,
}) => {
  const [templeLogo, setTempleLogo] = useState(() => localStorage.getItem("templeLogo"));
  const [templeName, setTempleName] = useState(() => localStorage.getItem("templeName") || "Sri Shanti Mahadev Mandir");
  const baseItem = "relative w-full flex items-center gap-3 rounded-xl transition-all duration-300 text-left";

  useEffect(() => {
    const handleUpdate = () => {
      setTempleLogo(localStorage.getItem("templeLogo"));
      setTempleName(localStorage.getItem("templeName") || "Sri Shanti Mahadev Mandir");
    };
    window.addEventListener("templeDataUpdated", handleUpdate);
    return () => window.removeEventListener("templeDataUpdated", handleUpdate);
  }, []);

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 border-r transition-all duration-300 ${
          collapsed ? "w-[84px]" : "w-[280px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 ${
          darkMode ? "border-[#293449]" : "border-none"
        } flex flex-col bg-cover bg-center shadow-[0_0_0_1px_rgba(228,190,142,0.55),0_28px_60px_rgba(104,62,30,0.14)]`}
        style={{
          backgroundImage: darkMode
            ? `linear-gradient(180deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%), url(${templeBg})`
            : `linear-gradient(180deg, rgba(255, 247, 231, 0.93) 0%, rgba(255, 242, 216, 0.88) 42%, rgba(96, 59, 26, 0.76) 100%), url(${templeBg})`,
        }}
      >
        {/* Sidebar Header/Logo */}
        <div
          className={`px-4 ${
            collapsed ? "pt-4 pb-3" : "pt-5 pb-4"
          } border-b ${darkMode ? "border-slate-700" : "border-[#ece8e1]"}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`h-9 w-9 overflow-hidden rounded-lg flex items-center justify-center shrink-0 ${
                  darkMode ? "bg-orange-500/20 text-orange-400" : "bg-orange-50 text-[#e07a22]"
                }`}
              >
                {templeLogo ? <img src={templeLogo} alt="Logo" className="w-full h-full object-cover" /> : <MdTempleBuddhist size={22} />}
              </div>
              {!collapsed && (
                <h1
                  className={`text-[18px] leading-tight font-bold tracking-wide ${
                    darkMode ? "text-slate-100" : "text-[#1d1b19]"
                  }`}
                >
                  {templeName}
                </h1>
              )}
            </div>

            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className={`hidden lg:flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                darkMode ? "text-slate-300 hover:bg-slate-800" : "text-[#5f3a1f] hover:bg-slate-100"
              }`}
              aria-label="Toggle sidebar"
            >
              <MdMenu size={18} />
            </button>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-1.5 scrollbar-thin">
          {priestSidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.title === activeItem ||
              item.path === activePath ||
              (item.path !== "/priest" && activePath.startsWith(item.path));

            return (
              <button
                key={item.title}
                type="button"
                onClick={() => {
                  if (item.title === "Logout") {
                    if (onLogoutClick) {
                      onLogoutClick();
                    }
                  } else {
                    if (item.path) {
                      onNavigate(item.path);
                    }
                    onSelect(item.title);
                  }
                  setMobileOpen(false);
                }}
                className={`${baseItem} ${
                  collapsed ? "px-3 py-3 justify-center" : "px-4 py-2.5"
                } ${
                  isActive
                    ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-[0_4px_12px_rgba(234,88,12,0.25)]"
                    : darkMode
                    ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                    : "text-[#5c544d] hover:bg-orange-50/55 hover:text-orange-600"
                }`}
                title={item.title}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-temple-100 rounded-r-lg" />
                )}
                <Icon size={18} className="shrink-0" />
                {!collapsed && (
                  <span className="flex-1 text-lg font-medium leading-tight tracking-wide">
                    {item.title}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </aside>
    </>
  );
};

export default PriestSidebar;
