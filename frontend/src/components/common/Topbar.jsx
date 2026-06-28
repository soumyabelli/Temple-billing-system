import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { MdKeyboardArrowDown, MdLightMode, MdDarkMode, MdMenu } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";

const Topbar = ({ darkMode, toggleDarkMode, onOpenMobileSidebar }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  const avatarSrc = user?.photo || "";
  const avatarInitial = (user?.name || "Admin").charAt(0).toUpperCase();
  const displayName = user?.name || "Admin";
  const displayRole = user?.role === "admin"
    ? "Super Admin"
    : user?.role
      ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}`
    : "Super Admin";

  useEffect(() => {
    const loadNotifications = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      const adminId = user?._id || user?.id || storedUser?._id || storedUser?.id;
      if (!adminId) {
        setNotificationCount(0);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/notifications/admin/${adminId}`);
        const notifications = Array.isArray(response.data) ? response.data : [];
        setNotificationCount(notifications.filter((item) => !item.read && !item.viewed).length);
      } catch (error) {
        setNotificationCount(0);
      }
    };

    loadNotifications();
  }, [user]);

  return (
    <div className={`h-[78px] rounded-2xl flex items-center justify-between px-4 md:px-6 sticky top-4 z-20 backdrop-blur-md border
      ${darkMode ? "bg-[#1f2937]/70 border-white/10" : "bg-white/30 border-white/40 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"}`}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className={`lg:hidden h-10 w-10 rounded-xl border flex items-center justify-center ${darkMode ? "border-white/10 text-slate-100" : "border-[#ece8e1] text-[#6b4c2e] bg-white/70"}`}
        >
          <MdMenu size={20} />
        </button>

        <div className={`w-[220px] md:w-[340px] px-4 py-2.5 rounded-xl border flex items-center gap-3 ${darkMode ? "border-white/10 text-slate-300 bg-white/5" : "border-[#ece8e1] text-gray-500 bg-white/70"}`}>
          <FiSearch />
          <input type="text" placeholder="Search here..." className="w-full bg-transparent outline-none text-sm" />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <button type="button" onClick={toggleDarkMode} className={`h-10 w-10 rounded-xl border flex items-center justify-center ${darkMode ? "border-white/10 text-amber-300" : "border-[#ece8e1] bg-white/70 text-[#6b4c2e]"}`}>
          {darkMode ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
        </button>

        <button
          type="button"
          onClick={() => navigate("/admin/notifications")}
          className={`relative rounded-xl p-2 transition ${darkMode ? "text-slate-200 hover:bg-white/10" : "text-[#6b4c2e] hover:bg-white/70"}`}
          aria-label="Open admin notifications"
        >
          <FaBell size={17} />
          {notificationCount > 0 ? (
            <span className="absolute -top-1 -right-1 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          ) : null}
        </button>

        <div className="hidden sm:flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full border border-white/30 bg-white/70">
            {avatarSrc ? (
              <img src={avatarSrc} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <div className={`grid h-full w-full place-items-center text-sm font-bold ${darkMode ? "text-slate-100" : "text-[#1f1f1f]"}`}>
                {avatarInitial}
              </div>
            )}
          </div>
          <div>
            <h3 className={`font-bold leading-tight ${darkMode ? "text-slate-100" : "text-[#1f1f1f]"}`}>{displayName}</h3>
            <p className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>{displayRole}</p>
          </div>
          <MdKeyboardArrowDown className={darkMode ? "text-slate-400" : "text-gray-400"} />
        </div>
      </div>
    </div>
  );
};

export default Topbar;
