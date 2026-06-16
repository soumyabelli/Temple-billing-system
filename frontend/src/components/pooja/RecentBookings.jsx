const RecentBookings = ({ bookings = [] }) => {
  const displayedBookings = bookings.slice(0, 5);

  const getStatusClass = (status) => {
    if (status === "Confirmed") return "text-green-600";
    if (status === "Pending") return "text-yellow-600";
    if (status === "Cancelled" || status === "Rejected") return "text-rose-600";
    return "text-slate-600";
  };

  if (!displayedBookings.length) {
    return <p className="mt-6 text-sm text-gray-500">No recent bookings available.</p>;
  }

  return (
    <div className="mt-6 space-y-4">
      {displayedBookings.map((booking) => (
        <div key={booking._id || booking.id || `${booking.service}-${booking.datetime}`} className="rounded-2xl border border-[#ece8e1] p-4 bg-slate-50">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-800">{booking.service}</p>
              <p className="text-sm text-slate-500">{booking.devoteeName}</p>
            </div>
            <div className={`font-semibold ${getStatusClass(booking.status)}`}>{booking.status}</div>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
            <span>{booking.datetime ? new Date(booking.datetime).toLocaleDateString() : "No date"}</span>
            <span>{booking.amount ? `₹${booking.amount}` : "₹0"}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentBookings;
