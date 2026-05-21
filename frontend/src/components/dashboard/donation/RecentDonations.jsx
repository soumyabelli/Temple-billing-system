const RecentDonations = () => {
  return (
    <div className="bg-white rounded-3xl p-6 border shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Recent Donations
      </h2>

      <div className="space-y-4">

        <div className="p-4 rounded-2xl bg-gray-50">
          <p className="font-semibold">₹5,000 donated</p>
          <span className="text-gray-500 text-sm">
            5 minutes ago
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-gray-50">
          <p className="font-semibold">₹10,000 donated</p>
          <span className="text-gray-500 text-sm">
            20 minutes ago
          </span>
        </div>

      </div>
    </div>
  );
};

export default RecentDonations;