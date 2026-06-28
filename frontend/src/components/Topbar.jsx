import { FaBell } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { MdKeyboardArrowDown, MdLightMode, MdDarkMode, MdMenu } from "react-icons/md";

const Topbar = ({ darkMode, toggleDarkMode, onOpenMobileSidebar }) => {
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

        <div className={`relative ${darkMode ? "text-slate-200" : "text-[#6b4c2e]"}`}>
          <FaBell size={17} />
          <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">5</span>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-white/70 font-bold text-[#1f1f1f]">
            A
          </div>
          <div>
            <h3 className={`font-bold leading-tight ${darkMode ? "text-slate-100" : "text-[#1f1f1f]"}`}>Admin</h3>
            <p className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Super Admin</p>
          </div>
          <MdKeyboardArrowDown className={darkMode ? "text-slate-400" : "text-gray-400"} />
        </div>
      </div>
    </div>
  );
};

export default Topbar;
