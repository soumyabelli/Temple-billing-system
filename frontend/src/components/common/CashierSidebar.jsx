import { useState, useEffect } from "react";
import { MdTempleBuddhist, MdMenu } from "react-icons/md";
import { FaSignOutAlt } from "react-icons/fa";
import templeBg from "../../assets/temple-bg.jpg";
import { cashierSidebarItems } from "../../data/cashierSidebarData";

const CashierSidebar = ({
  activeItem,
  activePath,
  onSelect,
  onNavigate,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  onLogoutClick,
  unreadCount = 0,
  darkMode,
}) => {
  const [templeLogo, setTempleLogo] = useState(() => localStorage.getItem("templeLogo"));
  const [templeName, setTempleName] = useState(() => localStorage.getItem("templeName") || "Sri Shanti Mahadev Mandir");

  useEffect(() => {
    const handleUpdate = () => {
      setTempleLogo(localStorage.getItem("templeLogo"));
      setTempleName(localStorage.getItem("templeName") || "Sri Shanti Mahadev Mandir");
    };
    window.addEventListener("templeDataUpdated", handleUpdate);
    return () => window.removeEventListener("templeDataUpdated", handleUpdate);
  }, []);
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, setMobileOpen]);

  const isActivePath = (item) => {
    if (!activePath) return false;
    if (item.path === "/cashier") return activePath === "/cashier" || activePath === "/cashier/";
    return activePath === item.path || activePath.startsWith(`${item.path}/`);
  };

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-black/35 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col shadow-[4px_0_25px_rgba(170,120,40,0.12)] transition-all duration-300 ${
          collapsed ? "w-[92px]" : "w-[320px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 bg-cover bg-center shadow-[0_0_0_1px_rgba(228,190,142,0.55),0_28px_60px_rgba(104,62,30,0.14)] ${darkMode ? "border-[#293449] border-r" : "border-none"}`}
        style={{
          backgroundImage: darkMode
            ? `linear-gradient(180deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%), url(${templeBg})`
            : `linear-gradient(180deg, rgba(255, 247, 231, 0.93) 0%, rgba(255, 242, 216, 0.88) 42%, rgba(96, 59, 26, 0.76) 100%), url(${templeBg})`,
        }}
      >
        <div className={`border-b px-4 py-4 ${darkMode ? "border-[#2e3749]" : "border-[rgba(142,84,34,0.15)]"}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 overflow-hidden items-center justify-center rounded-2xl border border-[#f2cf95] bg-temple-100/80 text-[#8a4b00]">
                {templeLogo ? <img src={templeLogo} alt="Logo" className="w-full h-full object-cover" /> : <MdTempleBuddhist size={24} />}
              </div>
              {!collapsed ? (
                <div className="min-w-0">
                  <p className={`text-[18px] font-extrabold leading-tight ${darkMode ? "text-slate-100" : "text-slate-950"}`}>{templeName}</p>
                  <p className={`mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${darkMode ? "text-amber-400" : "text-[#8d5500]"}`}>Cashier Console</p>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              className="hidden h-9 w-9 items-center justify-center rounded-xl border border-[#efd2a3] bg-temple-100/90 text-[#8d5500] transition hover:bg-temple-100 lg:flex"
              aria-label="Toggle sidebar"
            >
              <MdMenu size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          <nav className="space-y-1.5">
            {cashierSidebarItems.map((item) => {
              const Icon = item.icon;
              const active = item.title === activeItem || isActivePath(item);
              const isLogout = item.title === "Logout";
              const isNotifications = item.title === "Notifications";
              const showBadge = isNotifications && unreadCount > 0;

              return (
                <button
                  key={item.title}
                  type="button"
                  title={item.title}
                  onClick={() => {
                    if (isLogout) {
                      onLogoutClick?.();
                      setMobileOpen(false);
                      return;
                    }
                    onSelect?.(item.title);
                    if (item.path) onNavigate?.(item.path);
                    setMobileOpen(false);
                  }}
                  className={`relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                    collapsed ? "justify-center px-3" : ""
                  } ${
                    isLogout
                  ? "mt-4 border border-[#f2c9c9] bg-[#fff2f2] text-[#9c1d1d] hover:bg-[#ffe7e7]"
                  : active
                      ? "bg-[#f28c18] text-white shadow-[0_8px_18px_rgba(242,140,24,0.24)]"
                      : darkMode ? "text-slate-200 hover:bg-slate-800" : "text-[#372818] hover:bg-temple-100/60"
                  }`}
                >
                  {active ? <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-temple-100" /> : null}
                  {isLogout ? <FaSignOutAlt size={18} className="shrink-0" /> : <Icon size={18} className="shrink-0" />}
                  {!collapsed ? <span className="text-lg font-medium leading-tight">{item.title}</span> : null}
                  {showBadge ? (
                    <span
                      className={`ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-extrabold ${
                        active ? "bg-temple-100 text-[#f28c18]" : "bg-[#f28c18] text-white"
                      }`}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>


      </aside>
    </>
  );
};

export default CashierSidebar;
