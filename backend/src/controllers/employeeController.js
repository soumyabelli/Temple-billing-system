const Employee = require("../models/Employee");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ALLOWED_AUTH_ROLES = ["admin", "accountant", "cashier", "priest", "staff"];

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(String(email || "").trim());
const isValidDate = (value) => {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};
const isPastOrToday = (value) => {
  if (!isValidDate(value)) return false;
  const date = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date <= today;
};

// CREATE EMPLOYEE
exports.createEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      shift,
      department,
      gender,
      dob,
      bloodGroup,
      aadhaar,
      phone,
      address,
      emergencyContact,
      salary,
      joiningDate,
      employmentType,
      permissions,
      photo,
      documentUrl,
    } = req.body;

    const normalizedEmail = String(email || "").toLowerCase().trim();
    const normalizedRole = String(role || "").toLowerCase().trim();

    if (!name || !normalizedEmail || !password || !normalizedRole) {
      return res.status(400).json({ message: "Name, email, password and role are required." });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid email address." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    if (!ALLOWED_AUTH_ROLES.includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role. Please choose a valid employee role." });
    }

    if (dob && (!isValidDate(dob) || !isPastOrToday(dob))) {
      return res.status(400).json({ message: "Invalid date of birth." });
    }

    if (joiningDate && (!isValidDate(joiningDate) || !isPastOrToday(joiningDate))) {
      return res.status(400).json({ message: "Invalid joining date." });
    }

    if (dob && joiningDate && new Date(joiningDate) < new Date(dob)) {
      return res.status(400).json({ message: "Joining date cannot be earlier than date of birth." });
    }

    const existingEmployee = await Employee.findOne({ email: normalizedEmail });
    if (existingEmployee) {
      return res.status(400).json({ message: "Employee already exists." });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "A login account already exists for this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await Employee.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
      shift,
      department,
      gender,
      dob,
      bloodGroup,
      aadhaar,
      phone,
      address,
      emergencyContact,
      salary,
      joiningDate,
      employmentType,
      permissions,
      photo,
      documentUrl,
    });

    await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
      provider: "local",
      mustChangePassword: false,
    });

    res.status(201).json({ message: "Employee created successfully", employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// LOGIN
exports.loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(400).json({ message: "Employee not found" });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: employee._id, role: employee.role }, "temple_secret_key", { expiresIn: "7d" });
    res.json({ token, employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET ALL EMPLOYEES
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET EMPLOYEE BY ID
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// UPDATE EMPLOYEE
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const employee = await Employee.findByIdAndUpdate(id, updateData, { new: true });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "Employee updated successfully", employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// DELETE EMPLOYEE
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByIdAndDelete(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};