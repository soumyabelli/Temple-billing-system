const DonationFilters = () => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <input
          type="text"
          placeholder="Search donor..."
          className="
          border
          rounded-xl
          px-4
          py-3
          outline-none
          focus:ring-2
          focus:ring-orange-400
        "
        />

        <select
          className="
          border
          rounded-xl
          px-4
          py-3
          outline-none
        "
        >
          <option>All Categories</option>
          <option>Annadanam</option>
          <option>Temple Fund</option>
          <option>Festival Donation</option>
        </select>

        <input
          type="date"
          className="border rounded-xl px-4 py-3"
        />

        <button
          className="
          bg-orange-500
          text-white
          rounded-xl
          hover:bg-orange-600
          transition
        "
        >
          Apply Filters
        </button>

      </div>
    </div>
  );
};

export default DonationFilters;