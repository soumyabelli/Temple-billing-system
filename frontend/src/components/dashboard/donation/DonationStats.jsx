import {
  FaDonate,
  FaRupeeSign,
  FaUsers,
  FaHandHoldingHeart,
} from "react-icons/fa";

const stats = [
  {
    title: "Total Donations",
    value: "₹4,85,000",
    icon: <FaDonate />,
    accent: "from-violet-900 to-violet-700",
  },
  {
    title: "Today's Collection",
    value: "₹25,400",
    icon: <FaRupeeSign />,
    accent: "from-amber-500 to-orange-400",
  },
  {
    title: "Top Donors",
    value: "124",
    icon: <FaUsers />,
    accent: "from-sky-600 to-cyan-500",
  },
  {
    title: "Sponsors",
    value: "38",
    icon: <FaHandHoldingHeart />,
    accent: "from-emerald-500 to-teal-400",
  },
];

const DonationStats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((item, index) => (
        <div
          key={index}
          className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{item.title}</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">{item.value}</h2>
            </div>

            <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${item.accent} text-white flex items-center justify-center text-2xl`}>
              {item.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DonationStats;