const AccountHead = require("../models/AccountHead");

const seedAccountHeads = async () => {
  const standardHeads = [
    { name: "Donation Income", type: "Income", description: "All general and event donations" },
    { name: "Pooja Income", type: "Income", description: "Income from pooja bookings and sevas" },
    { name: "Prasadam Income", type: "Income", description: "Income from prasadam sales" },
    { name: "Room Income", type: "Income", description: "Income from accommodation/room bookings" },
    { name: "Bank Interest", type: "Income", description: "Interest received from bank accounts" },
    { name: "Temple Material Income", type: "Income", description: "Income from temple materials provided" },
    { name: "Other Income", type: "Income", description: "Miscellaneous income" },
    { name: "Inventory Purchase", type: "Expense", description: "Purchases of inventory/stock" },
    { name: "Salary Expense", type: "Expense", description: "Employee salaries and payroll" },
    { name: "Repair & Maintenance", type: "Expense", description: "Repairs for assets and general maintenance" },
    { name: "Utilities", type: "Expense", description: "Electricity, water, and other utilities" },
    { name: "Cleaning", type: "Expense", description: "Cleaning and sanitation expenses" },
    { name: "Refunds", type: "Expense", description: "Refunds issued to devotees" },
    { name: "Miscellaneous Expense", type: "Expense", description: "Other expenses" },
  ];

  try {
    for (const head of standardHeads) {
      const exists = await AccountHead.findOne({ name: head.name });
      if (!exists) {
        await AccountHead.create(head);
        console.log(`[Account Seeder] Created account head: ${head.name}`);
      }
    }
  } catch (error) {
    console.error("[Account Seeder] Failed to seed account heads:", error);
  }
};

module.exports = { seedAccountHeads };
