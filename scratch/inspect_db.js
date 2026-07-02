const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load .env
dotenv.config({ path: path.join(__dirname, "../backend/.env") });

const User = require("../backend/src/models/User");
const Employee = require("../backend/src/models/Employee");

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const users = await User.find({ role: "cashier" });
    console.log("CASHIER USERS:");
    users.forEach(u => {
      console.log(`User: ID=${u._id}, Name=${u.name}, Email=${u.email}, Role=${u.role}`);
    });

    const employees = await Employee.find({ role: "cashier" });
    console.log("\nCASHIER EMPLOYEES:");
    employees.forEach(e => {
      console.log(`Employee: ID=${e._id}, Name=${e.name}, Email=${e.email}, Role=${e.role}, userId=${e.userId}`);
    });

    // Also look for user with email like cash@gmail
    const anyCash = await User.find({ email: /cash/i });
    console.log("\nUSERS WITH 'cash' IN EMAIL:");
    anyCash.forEach(u => {
      console.log(`User: ID=${u._id}, Name=${u.name}, Email=${u.email}`);
    });

    const anyCashEmp = await Employee.find({ email: /cash/i });
    console.log("\nEMPLOYEES WITH 'cash' IN EMAIL:");
    anyCashEmp.forEach(e => {
      console.log(`Employee: ID=${e._id}, Name=${e.name}, Email=${e.email}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
