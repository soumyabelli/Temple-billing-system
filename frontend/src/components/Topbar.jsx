import { FaBell, FaCog } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { MdKeyboardArrowDown } from "react-icons/md";

const Topbar = () => {
  return (
    <div className="h-[86px] bg-white border border-[#ece8e1] shadow-sm rounded-2xl flex items-center justify-between px-8">
      <div className="w-[350px] px-4 py-3 rounded-xl border border-[#ece8e1] flex items-center gap-3 text-gray-500">
        <FiSearch />
        <input
          type="text"
          placeholder="Search here..."
          className="w-full bg-transparent outline-none text-sm"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="relative text-[#6b4c2e]">
          <FaBell size={18} />
          <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
            5
          </span>
        </div>
        <FaCog size={18} className="text-[#6b4c2e]" />

        <div className="flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/100"
            alt=""
            className="w-11 h-11 rounded-full border border-[#ece8e1]"
          />

          <div>
            <h3 className="font-bold leading-tight">Admin</h3>
            <p className="text-sm text-gray-500">Super Admin</p>
          </div>
          <MdKeyboardArrowDown className="text-gray-400" />
        </div>

      </div>
    </div>
  );
};

export default Topbar;
