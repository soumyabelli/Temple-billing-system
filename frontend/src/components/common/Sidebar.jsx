import { sidebarItems } from "../../data/sidebarData";
import { MdMenu, MdTempleBuddhist } from "react-icons/md";

const Sidebar = ({ activeItem, onSelect, collapsed, setCollapsed, mobileOpen, setMobileOpen, darkMode }) => {
  const baseItem = "relative w-full flex items-center gap-3 rounded-lg transition-all duration-300 text-left";

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
        className={`fixed top-0 left-0 h-screen z-40 border-r transition-all duration-300
        ${collapsed ? "w-[84px]" : "w-[254px]"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        ${darkMode ? "bg-[#1b2231] border-[#293449]" : "bg-gradient-to-b from-[#f6e7cc] via-[#f2deba] to-[#edd8b0] border-[#e7d7ba]"}`}
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

        <div className="px-2 py-2 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.title;

            return (
              <button
                key={item.title}
                type="button"
                onClick={() => {
                  onSelect(item.title);
                  setMobileOpen(false);
                }}
                className={`${baseItem} ${collapsed ? "px-2.5 py-2.5 justify-center" : "px-3 py-2"}
                  ${isActive
                    ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    : darkMode
                    ? "text-slate-200 hover:bg-white/10"
                    : "text-[#372818] hover:bg-white/60"
                  }`}
                title={item.title}
              >
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-white rounded-r" />}
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="font-medium text-[13px] leading-tight">{item.title}</span>}
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
