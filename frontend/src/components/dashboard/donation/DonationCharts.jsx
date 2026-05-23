const DonationCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <div className="bg-white rounded-3xl p-6 border shadow-sm h-80">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Monthly Donations
        </h2>

        <div className="h-full flex items-center justify-center text-gray-400">
          Chart Coming Soon
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border shadow-sm h-80">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Donation Categories
        </h2>

        <div className="h-full flex items-center justify-center text-gray-400">
          Pie Chart Coming Soon
        </div>
      </div>

    </div>
  );
};

export default DonationCharts;