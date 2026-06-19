import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { priestSidebarItems } from "../../data/priestSidebarData";
import { MdMenu, MdTempleBuddhist, MdKeyboardArrowDown } from "react-icons/md";
import templeSidebarImg from "../../assets/temple-sidebar.png";

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
  const baseItem = "relative w-full flex items-center gap-3 rounded-xl transition-all duration-300 text-left";

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
        className={`fixed top-0 left-0 h-screen z-40 border-r transition-all duration-300 ${
          collapsed ? "w-[84px]" : "w-[254px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 ${
          darkMode
            ? "bg-[#1e293b] border-slate-700 text-slate-100"
            : "bg-white border-[#ece8e1] text-[#372818]"
        } flex flex-col`}
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
                className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                  darkMode ? "bg-orange-500/20 text-orange-400" : "bg-orange-50 text-[#e07a22]"
                }`}
              >
                <MdTempleBuddhist size={22} />
              </div>
              {!collapsed && (
                <h1
                  className={`text-[14px] leading-tight font-bold tracking-wide ${
                    darkMode ? "text-slate-100" : "text-[#1d1b19]"
                  }`}
                >
                  Sri Shanti
                  <br />
                  Mahadev Mandir
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
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-white rounded-r-lg" />
                )}
                <Icon size={18} className="shrink-0" />
                {!collapsed && (
                  <span className="flex-1 text-[13px] font-semibold leading-tight tracking-wide">
                    {item.title}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Bottom Temple Background & Copyright */}
        <div
          className={`relative overflow-hidden shrink-0 mt-auto transition-all duration-300 ${
            collapsed ? "h-[80px]" : "h-[180px]"
          } border-t ${darkMode ? "border-slate-700" : "border-[#ece8e1]"}`}
        >
          {/* Temple Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: `url(${templeSidebarImg})`,
            }}
          />
          {/* Saffron Overlay on hover or active */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent z-10" />

          {/* Copyright content */}
          {!collapsed && (
            <div className="absolute bottom-0 inset-x-0 p-4 z-20 text-white select-none">
              <p className="text-[11px] leading-relaxed font-medium text-slate-200">
                © 2025 Sri Shanti Mahadev Mandir
              </p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-slate-300 font-normal">All rights reserved.</p>
                <span className="text-sm font-semibold text-orange-400">🕉️</span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="absolute inset-0 flex items-center justify-center z-20 text-white">
              <span className="text-lg text-orange-400 animate-pulse">🕉️</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default PriestSidebar;
