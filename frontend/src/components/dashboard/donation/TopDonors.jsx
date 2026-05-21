const donors = [
  {
    name: "Ramesh Kumar",
    amount: "₹50,000",
  },
  {
    name: "Priya Shetty",
    amount: "₹35,000",
  },
  {
    name: "Suresh Rao",
    amount: "₹28,000",
  },
];

const TopDonors = () => {
  return (
    <div className="bg-white rounded-3xl p-6 border shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Top Donors
      </h2>

      <div className="space-y-4">
        {donors.map((donor, index) => (
          <div
            key={index}
            className="
            flex items-center justify-between
            p-4 rounded-2xl bg-orange-50
          "
          >
            <div>
              <h3 className="font-semibold text-gray-800">
                {donor.name}
              </h3>
            </div>

            <p className="font-bold text-orange-600">
              {donor.amount}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopDonors;