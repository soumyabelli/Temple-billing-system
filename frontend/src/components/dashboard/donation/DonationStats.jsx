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
  },
  {
    title: "Today's Collection",
    value: "₹25,400",
    icon: <FaRupeeSign />,
  },
  {
    title: "Top Donors",
    value: "124",
    icon: <FaUsers />,
  },
  {
    title: "Sponsors",
    value: "38",
    icon: <FaHandHoldingHeart />,
  },
];

const DonationStats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((item, index) => (
        <div
          key={index}
          className="
          bg-white
          rounded-3xl
          p-6
          border
          shadow-sm
          hover:shadow-xl
          transition-all
          duration-300
        "
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">{item.title}</p>

              <h2 className="text-3xl font-bold text-gray-800 mt-2">
                {item.value}
              </h2>
            </div>

            <div
              className="
              w-14 h-14
              rounded-2xl
              bg-orange-100
              text-orange-600
              flex items-center justify-center
              text-2xl
            "
            >
              {item.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DonationStats;