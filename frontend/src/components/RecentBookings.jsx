const RecentBookings = () => {
  return (
    <div className="mt-6 space-y-4">
      <div className="flex justify-between">
        <span>Archana</span>
        <span className="text-green-600">Confirmed</span>
      </div>

      <div className="flex justify-between">
        <span>Abhisheka</span>
        <span className="text-yellow-600">Pending</span>
      </div>

      <div className="flex justify-between">
        <span>Special Seva</span>
        <span className="text-green-600">Confirmed</span>
      </div>
    </div>
  );
};

export default RecentBookings;
