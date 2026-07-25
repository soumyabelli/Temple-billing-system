const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env vars
dotenv.config({ path: path.join(__dirname, "../.env") });

const AccountHead = require("../src/models/AccountHead");

const accountHeads = [
  // Income Heads
  { name: "Pooja Income", type: "Income" },
  { name: "Donation Income", type: "Income" },
  { name: "Hundi Collection", type: "Income" },
  { name: "Annadanam Donation", type: "Income" },
  { name: "Room Booking Income", type: "Income" },
  { name: "Prasadam Sales", type: "Income" },
  { name: "Temple Material Charges", type: "Income" },
  { name: "Festival Income", type: "Income" },
  { name: "Interest Income", type: "Income" },

  // Expense Heads
  { name: "Inventory Purchase", type: "Expense" },
  { name: "Repair Expense", type: "Expense" },
  { name: "Electricity", type: "Expense" },
  { name: "Water Bill", type: "Expense" },
  { name: "Staff Salary", type: "Expense" },
  { name: "Cleaning Expense", type: "Expense" },
  { name: "Kitchen Expense", type: "Expense" },
  { name: "Office Expense", type: "Expense" },
  { name: "Maintenance Expense", type: "Expense" },
  { name: "Asset Purchase", type: "Expense" },
  { name: "Miscellaneous Expense", type: "Expense" },
];

const seedAccountHeads = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected...");

    // Delete existing account heads to prevent duplicates in dev/seed stage?
    // Let's just use upsert or ignore if exists, to be safe.
    for (const head of accountHeads) {
      await AccountHead.findOneAndUpdate(
        { name: head.name },
        { $set: head },
        { upsert: true, new: true }
      );
    }
    
    console.log("Account Heads Seeded Successfully");
    process.exit();
  } catch (err) {
    console.error("Error seeding account heads:", err);
    process.exit(1);
  }
};

seedAccountHeads();
