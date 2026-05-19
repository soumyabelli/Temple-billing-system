import { sidebarItems } from "../data/sidebarData";
import { MdTempleBuddhist } from "react-icons/md";
import templeBg from "../assets/temple-bg.jpg";

const Sidebar = () => {
  return (
    <div className="w-[250px] h-screen bg-gradient-to-b from-[#f6e7cc] via-[#f2deba] to-[#edd8b0] shadow-lg fixed left-0 top-0 flex flex-col border-r border-[#e7d7ba]">
      <div className="p-6">
        <div className="flex items-center gap-3 text-[#5f3a1f]">
          <div className="h-9 w-9 rounded-lg bg-white/65 flex items-center justify-center">
            <MdTempleBuddhist size={24} />
          </div>
          <h1 className="text-[18px] leading-tight font-bold">
            Sri Shanti
            <br />
            Mahadev Mandir
          </h1>
        </div>
      </div>

      <div className="flex-1 px-3 pb-3 space-y-2 overflow-auto">
        {sidebarItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 text-[16px]
              ${
                index === 0
                  ? "bg-[#d9962f] text-white shadow"
                  : "text-[#372818] hover:bg-white/60"
              }`}
            >
              <Icon size={22} />
              <span className="font-medium leading-none">{item.title}</span>
            </div>
          );
        })}
      </div>

      <div
        className="h-80 bg-cover bg-center"
        style={{ backgroundImage: `url('${templeBg}')` }}
      />
    </div>
  );
};

export default Sidebar;
