import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sidebarItems } from "../../data/sidebarData";
import { MdMenu, MdTempleBuddhist, MdKeyboardArrowDown } from "react-icons/md";

const Sidebar = ({ activeItem, activePath, onSelect, onNavigate, collapsed, setCollapsed, mobileOpen, setMobileOpen, darkMode, onLogoutClick }) => {
  const [openGroup, setOpenGroup] = useState(null);
  const baseItem = "relative w-full flex items-center gap-3 rounded-lg transition-all duration-300 text-left";

  useEffect(() => {
    const activeGroup = sidebarItems.find((item) => item.subItems?.some((sub) => activePath === sub.path || activePath.startsWith(sub.path)));
    if (activeGroup) {
      setOpenGroup(activeGroup.title);
    }
  }, [activePath]);

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/35 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen z-40 border-r transition-all duration-300 ${collapsed ? "w-[84px]" : "w-[254px]"} ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 ${darkMode ? "bg-[#1b2231] border-[#293449]" : "bg-gradient-to-b from-[#f6e7cc] via-[#f2deba] to-[#edd8b0] border-[#e7d7ba]"} flex flex-col`}
      >
        <div className={`px-3 ${collapsed ? "pt-3 pb-2" : "pt-4 pb-3"} border-b ${darkMode ? "border-[#2e3749]" : "border-[#e5d5b8]/80"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${darkMode ? "bg-white/10 text-amber-300" : "bg-white/65 text-[#5f3a1f]"}`}>
                <MdTempleBuddhist size={20} />
              </div>
              {!collapsed && (
                <h1 className={`text-[14px] leading-tight font-bold ${darkMode ? "text-[#f7efe0]" : "text-[#5f3a1f]"}`}>
                  Sri Shanti
                  <br />
                  Mahadev Mandir
                </h1>
              )}
            </div>

            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className={`hidden lg:flex h-8 w-8 items-center justify-center rounded-md ${darkMode ? "text-slate-200 hover:bg-white/10" : "text-[#5f3a1f] hover:bg-white/70"}`}
              aria-label="Toggle sidebar"
            >
              <MdMenu size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.title === activeItem || (item.subItems && item.subItems.some((sub) => sub.path === activePath));
            const showSubItems = item.subItems && openGroup === item.title;

            return (
              <div key={item.title} className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    if (item.title === "Logout") {
                      if (onLogoutClick) {
                        onLogoutClick();
                      }
                    } else {
                      if (item.subItems) {
  setOpenGroup(
    openGroup === item.title ? null : item.title
  );
}
                      if (item.path) {
                        onNavigate(item.path);
                      }
                      onSelect(item.title);
                    }
                    setMobileOpen(false);
                  }}
                  className={`${baseItem} ${collapsed ? "px-2.5 py-2.5 justify-center" : "px-3 py-2"} ${isActive ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]" : darkMode ? "text-slate-200 hover:bg-white/10" : "text-[#372818] hover:bg-white/60"}`}
                  title={item.title}
                >
                  {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-white rounded-r" />}
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && <span className="flex-1 text-[13px] font-medium leading-tight">{item.title}</span>}
                  {!collapsed && item.subItems && <MdKeyboardArrowDown className={`transition ${showSubItems ? "rotate-180" : ""}`} />}
                </button>

                {item.subItems && (
                  <AnimatePresence initial={false}>
                    {showSubItems && !collapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-1 overflow-hidden px-4"
                      >
                        {item.subItems.map((sub) => {
                          const isSubActive = sub.path === activePath;
                          return (
                            <button
                              key={sub.title}
                              type="button"
                              onClick={() => {
                                onNavigate(sub.path);
                                onSelect(item.title);
                                setMobileOpen(false);
                              }}
                              className={`w-full rounded-2xl px-3 py-2 text-left text-sm transition ${isSubActive ? "bg-white/20 text-white" : darkMode ? "text-slate-300 hover:bg-white/10" : "text-slate-700 hover:bg-slate-100"}`}
                            >
                              {sub.title}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
