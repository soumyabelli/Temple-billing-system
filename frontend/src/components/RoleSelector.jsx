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
    <div className="grid grid-cols-3 gap-3">
      {roles.map((role) => (
        <button
          key={role}
          className="border rounded-xl p-3 hover:bg-orange-100 hover:border-orange-500 transition"
        >
          {role}
        </button>
      ))}
    </div>
  );
};

export default RoleSelector;