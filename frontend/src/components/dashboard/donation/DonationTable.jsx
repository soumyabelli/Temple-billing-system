const donations = [
  {
    name: "Ramesh Kumar",
    category: "Annadanam",
    amount: "₹5,000",
    date: "20 May 2026",
    status: "Success",
  },
  {
    name: "Priya Shetty",
    category: "Temple Fund",
    amount: "₹10,000",
    date: "19 May 2026",
    status: "Success",
  },
  {
    name: "Suresh Rao",
    category: "Festival Donation",
    amount: "₹2,500",
    date: "18 May 2026",
    status: "Pending",
  },
];

const DonationTable = () => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Donation Records
        </h2>

        <button
          className="
          bg-orange-500
          hover:bg-orange-600
          text-white
          px-5
          py-2
          rounded-xl
          transition
        "
        >
          + Add Donation
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-4">Donor</th>
              <th className="text-left py-4">Category</th>
              <th className="text-left py-4">Amount</th>
              <th className="text-left py-4">Date</th>
              <th className="text-left py-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {donations.map((donation, index) => (
              <tr
                key={index}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="py-4">{donation.name}</td>
                <td>{donation.category}</td>
                <td className="font-semibold text-orange-600">
                  {donation.amount}
                </td>
                <td>{donation.date}</td>

                <td>
                  <span
                    className={`
                    px-3 py-1 rounded-full text-sm
                    ${
                      donation.status === "Success"
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                    }
                  `}
                  >
                    {donation.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DonationTable;