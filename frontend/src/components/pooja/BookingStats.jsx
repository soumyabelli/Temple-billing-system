const BookingStats = ({ total = 0, confirmed = 0, pending = 0 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="rounded-xl bg-orange-50 px-4 py-3">
        <p className="text-sm text-gray-600">Total</p>
        <p className="text-2xl font-bold text-[#1f1f1f]">{total}</p>
      </div>
      <div className="rounded-xl bg-green-50 px-4 py-3">
        <p className="text-sm text-gray-600">Confirmed</p>
        <p className="text-2xl font-bold text-green-700">{confirmed}</p>
      </div>
      <div className="rounded-xl bg-yellow-50 px-4 py-3">
        <p className="text-sm text-gray-600">Pending</p>
        <p className="text-2xl font-bold text-yellow-700">{pending}</p>
      </div>
    </div>
  );
};

export default BookingStats;
