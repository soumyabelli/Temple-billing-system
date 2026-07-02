const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../backend/.env") });

const User = require("../backend/src/models/User");
const Employee = require("../backend/src/models/Employee");

const findUserAndEmployeeByUserId = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    console.log("No User found for ID:", userId);
    const employee = await Employee.findById(userId);
    if (!employee) {
      console.log("No Employee found for ID:", userId);
      return {};
    }

    const linkedUser = await User.findOne({ email: employee.email });
    return { user: linkedUser, employee };
  }

  console.log("Found User:", user.email, "Role:", user.role);

  let employee = await Employee.findOne({ email: user.email });
  if (!employee) {
    console.log("No Employee found for email:", user.email, ". Attempting auto-create...");
    if (["admin", "priest", "accountant", "cashier", "staff"].includes(user.role)) {
      const employeeId = "EMP-" + String(user._id).slice(-6).toUpperCase();
      employee = new Employee({
        employeeId,
        userId: user._id,
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        salary: 0,
        joiningDate: new Date(),
      });
      try {
        await employee.save();
        console.log("Auto-created Employee successfully!");
      } catch (err) {
        console.error("Error saving employee:", err.message);
      }
    } else {
      console.log("User role is not an allowed staff role for auto-creation:", user.role);
    }
  } else {
    console.log("Found existing Employee:", employee.email);
  }
  return { user, employee };
};

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const result = await findUserAndEmployeeByUserId("6a0be2efa854afffa5947260");
    console.log("Result: User email =", result.user?.email, "Employee email =", result.employee?.email);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
