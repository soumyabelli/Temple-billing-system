const LowStock = ({ items = [] }) => {
  const lowStockItems = items.filter((item) => String(item.status || "").toLowerCase().includes("low"));

  if (!lowStockItems.length) {
    return <p className="mt-5 text-sm text-gray-500">No low stock alerts at the moment.</p>;
  }

  return (
    <div className="mt-5 space-y-3">
      {lowStockItems.map((item) => (
        <div key={item.name} className="flex items-center justify-between rounded-xl bg-rose-50 px-4 py-3">
          <span className="font-medium text-gray-700">{item.name}</span>
          <span className="font-bold text-rose-600">{item.stock ?? "Low"} left</span>
        </div>
      ))}
    </div>
  );
};

export default LowStock;
