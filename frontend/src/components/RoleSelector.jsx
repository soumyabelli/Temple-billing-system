const roles = [
  "Admin",
  "Accountant",
  "Cashier",
  "Priest",
  "Staff",
  "Devotee",
];

const RoleSelector = () => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {roles.map((role) => (
        <button
          key={role}
          className="
          bg-white/90
          hover:bg-gradient-to-r
          hover:from-orange-400
          hover:to-amber-400
          text-black
          hover:text-white
          font-semibold
          py-4
          rounded-2xl
          transition-all
          duration-300
          shadow-lg
          hover:scale-105
          border border-white/40
          "
        >
          {role}
        </button>
      ))}
    </div>
  );
};

export default RoleSelector;