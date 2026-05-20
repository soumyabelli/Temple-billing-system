const items = [
  { name: "Ghee Bottles", left: 8 },
  { name: "Camphor Packs", left: 5 },
  { name: "Agarbatti Boxes", left: 11 },
  { name: "Coconut Stock", left: 7 },
];

const LowStock = () => {
  return (
    <div className="mt-5 space-y-3">
      {items.map((item) => (
        <div key={item.name} className="flex items-center justify-between rounded-xl bg-rose-50 px-4 py-3">
          <span className="font-medium text-gray-700">{item.name}</span>
          <span className="font-bold text-rose-600">{item.left} left</span>
        </div>
      ))}
    </div>
  );
};

export default LowStock;
