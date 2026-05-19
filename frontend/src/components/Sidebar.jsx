import { sidebarItems } from "../data/sidebarData";
import { MdTempleBuddhist } from "react-icons/md";

const Sidebar = ({ activeItem = "Dashboard", onSelect }) => {
  return (
    <div className="w-[250px] h-screen bg-gradient-to-b from-[#f6e7cc] via-[#f2deba] to-[#edd8b0] shadow-lg fixed left-0 top-0 flex flex-col border-r border-[#e7d7ba]">
      <div className="px-4 pt-4 pb-3 border-b border-[#e5d5b8]/80">
        <div className="flex items-center gap-2 text-[#5f3a1f]">
          <div className="h-8 w-8 rounded-lg bg-white/65 flex items-center justify-center shrink-0">
            <MdTempleBuddhist size={20} />
          </div>
          <h1 className="text-[15px] leading-tight font-bold">
            Sri Shanti
            <br />
            Mahadev Mandir
          </h1>
        </div>
      </div>

      <div className="px-2 py-2 space-y-1 flex-1">
        {sidebarItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeItem === item.title;

          return (
            <button
              type="button"
              key={index}
              onClick={() => onSelect?.(item.title)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-[13px] text-left
              ${
                isActive
                  ? "bg-[#d9962f] text-white shadow"
                  : "text-[#372818] hover:bg-white/60"
              }`}
            >
              <Icon size={17} className="shrink-0" />
              <span className="font-medium leading-tight">{item.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
