const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { isDbConnected } = require("../config/db");
const {
  findUserByEmail: findFileUserByEmail,
  createUser: createFileUser,
} = require("../store/fileUserStore");

const ALLOWED_ROLES = ["admin", "accountant", "cashier", "priest", "staff", "devotee"];

const sanitizeUser = (userDoc) => ({
  id: userDoc._id?.toString?.() || userDoc.id,
  name: userDoc.name,
  email: userDoc.email,
  role: userDoc.role,
});

const findUserByEmail = async (email) => {
  if (isDbConnected()) {
    return User.findOne({ email });
  }
  return findFileUserByEmail(email);
};

const createUserRecord = async ({ name, email, password, role }) => {
  if (isDbConnected()) {
    return User.create({ name, email, password, role });
  }
  return createFileUser({ name, email, password, role });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedEmail = String(email || "").toLowerCase().trim();
    const normalizedRole = String(role || "").toLowerCase().trim();

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password and role are required" });
    }

    if (!ALLOWED_ROLES.includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUserRecord({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
    });

    return res.status(201).json({
      message: "Registration successful",
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || "").toLowerCase().trim();

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(400).json({ message: "User not registered. Please register first." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id?.toString?.() || user.id, role: user.role }, process.env.JWT_SECRET || "dev-secret", {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
