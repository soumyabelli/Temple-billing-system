import { useEffect } from "react";
import { MdTempleBuddhist, MdMenu } from "react-icons/md";
import { FaSignOutAlt } from "react-icons/fa";
import templeSidebarImg from "../../assets/temple-sidebar.png";
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
}) => {
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
        className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-[#f0d7b2] bg-[#fff7eb] text-slate-950 shadow-[4px_0_25px_rgba(170,120,40,0.12)] transition-all duration-300 ${
          collapsed ? "w-[92px]" : "w-[280px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="border-b border-[#efd2a3] px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#f2cf95] bg-white/80 text-[#8a4b00]">
                <MdTempleBuddhist size={24} />
              </div>
              {!collapsed ? (
                <div className="min-w-0">
                  <p className="text-[15px] font-extrabold leading-tight text-slate-950">Sri Shanti Mahadev Mandir</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8d5500]">Cashier Console</p>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              className="hidden h-9 w-9 items-center justify-center rounded-xl border border-[#efd2a3] bg-white/90 text-[#8d5500] transition hover:bg-white lg:flex"
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
                      : "text-slate-950 hover:bg-white/90"
                  }`}
                >
                  {active ? <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white" /> : null}
                  {isLogout ? <FaSignOutAlt size={18} className="shrink-0" /> : <Icon size={18} className="shrink-0" />}
                  {!collapsed ? <span className="text-[15px] font-semibold leading-tight">{item.title}</span> : null}
                </button>
              );
            })}
          </nav>
        </div>

        <div className={`border-t border-[#efd2a3] p-3 ${collapsed ? "pb-4" : "pb-5"}`}>
          <div className="overflow-hidden rounded-[20px] border border-[#f0d9af] bg-white/80">
            <div
              className={`relative bg-cover bg-center ${collapsed ? "h-[96px]" : "h-[160px]"}`}
              style={{ backgroundImage: `url(${templeSidebarImg})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {!collapsed ? (
                <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-200">
                    Temple Workstation
                  </p>
                  <p className="mt-1 text-sm font-bold">Billing, bookings, donations and receipts.</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default CashierSidebar;
