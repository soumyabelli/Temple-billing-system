const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { isDbConnected } = require("../config/db");
const {
  findUserByEmail: findFileUserByEmail,
  findUserById: findFileUserById,
  createUser: createFileUser,
  updateUser: updateFileUser,
  getAllUsers: getAllFileUsers,
} = require("../store/fileUserStore");
const { createStaffNotification } = require("../utils/notificationService");

const ALLOWED_ROLES = ["admin", "accountant", "cashier", "priest", "staff", "devotee"];

const getEmailCandidates = (email) => {
  const normalizedEmail = String(email || "").toLowerCase().trim();
  if (!normalizedEmail) return [];

  const candidates = new Set([normalizedEmail]);

  if (normalizedEmail.endsWith("@gmail.com")) {
    candidates.add(normalizedEmail.replace(/@gmail\.com$/, "@gamail.com"));
    candidates.add(normalizedEmail.replace(/@gmail\.com$/, "@gamil.com"));
  }

  if (normalizedEmail.endsWith("@gamail.com")) {
    candidates.add(normalizedEmail.replace(/@gamail\.com$/, "@gmail.com"));
  }

  if (normalizedEmail.endsWith("@gamil.com")) {
    candidates.add(normalizedEmail.replace(/@gamil\.com$/, "@gmail.com"));
  }

  return [...candidates];
};

const sanitizeUser = (userDoc) => ({
  id: userDoc._id?.toString?.() || userDoc.id,
  name: userDoc.name,
  email: userDoc.email,
  phone: userDoc.phone || "",
  address: userDoc.address || "",
  place: userDoc.place || "",
  role: userDoc.role,
  createdAt: userDoc.createdAt || userDoc.createdAt?.toISOString?.() || undefined,
  mustChangePassword: Boolean(userDoc.mustChangePassword),
});

const findUserByEmail = async (email) => {
  const emailCandidates = getEmailCandidates(email);

  if (isDbConnected()) {
    return User.findOne({ email: { $in: emailCandidates } });
  }

  for (const candidate of emailCandidates) {
    const user = await findFileUserByEmail(candidate);
    if (user) {
      return user;
    }
  }

  return null;
};

const createUserRecord = async ({ name, email, password, role, phone, address, place }) => {
  if (isDbConnected()) {
    return User.create({ name, email, password, role, phone, address, place, provider: "local" });
  }
  return createFileUser({ name, email, password, role, phone, address, place, provider: "local" });
};

const updateUserRecord = async (id, updates) => {
  if (isDbConnected()) {
    return User.findByIdAndUpdate(id, updates, { new: true });
  }
  return updateFileUser(id, updates);
};

const findUserById = async (id) => {
  if (isDbConnected()) {
    return User.findById(id);
  }
  return findFileUserById(id);
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone, address, place, role } = req.body;
    const normalizedEmail = String(email || "").toLowerCase().trim();
    const normalizedRole = String(role || "").toLowerCase().trim();

    // Validate required fields
    if (!name || !email || !password || !confirmPassword || !phone) {
      return res.status(400).json({ message: "Name, email, password, confirm password, and phone number are required" });
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    if (normalizedRole !== "devotee") {
      return res.status(403).json({ message: "Only devotee can self-register. Other roles are admin-assigned." });
    }

    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUserRecord({
      name,
      email: normalizedEmail,
      phone: phone.trim(),
      address: address ? address.trim() : "",
      place: place ? place.trim() : "",
      password: hashedPassword,
      role: normalizedRole,
    });

    // Notify cashier role about new devotee registration
    createStaffNotification({
      title: "🙏 New Devotee Registered",
      message: `Devotee "${name}" (${phone}) has been registered successfully and can now log in.`,
      audienceRole: "cashier",
      category: "registration",
    }).catch(() => {});

    return res.status(201).json({
      message: "Registration successful",
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const issueAuthResponse = (res, user, message = "Login successful") => {
  const token = jwt.sign({ id: user._id?.toString?.() || user.id, role: user.role }, process.env.JWT_SECRET || "dev-secret", {
    expiresIn: "7d",
  });

  return res.status(200).json({
    message,
    token,
    user: sanitizeUser(user),
  });
};

const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const normalizedEmail = String(email || "").toLowerCase().trim();
    const normalizedRole = String(role || "").toLowerCase().trim();

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      if (normalizedRole && normalizedRole !== "devotee") {
        return res.status(400).json({
          message: "Account not found for selected role. Please contact admin for role-assigned credentials.",
        });
      }
      return res.status(400).json({ message: "User not registered. Please register as devotee." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    if (normalizedRole && user.role !== normalizedRole) {
      return issueAuthResponse(res, user, `Login successful as '${user.role}'. Selected role '${normalizedRole}' was ignored.`);
    }

    return issueAuthResponse(res, user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUsersForAdmin = async (req, res) => {
  try {
    let users = [];
    if (isDbConnected()) {
      users = await User.find()
        .select("-password -resetPasswordToken -resetPasswordExpiresAt")
        .sort({ createdAt: -1 });
    } else {
      users = await getAllFileUsers();
    }
    const sanitizedUsers = users.map(sanitizeUser);
    return res.status(200).json(sanitizedUsers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedEmail = String(email || "").toLowerCase().trim();
    const normalizedRole = String(role || "").toLowerCase().trim();

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password and role are required" });
    }

    if (!ALLOWED_ROLES.includes(normalizedRole) || normalizedRole === "devotee") {
      return res.status(400).json({ message: "Admin can assign only non-devotee roles" });
    }

    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let user;
    if (isDbConnected()) {
      user = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: normalizedRole,
        provider: "local",
        mustChangePassword: false,
      });
    } else {
      user = await createFileUser({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: normalizedRole,
        provider: "local",
        mustChangePassword: false,
      });
    }

    return res.status(201).json({ message: "User created by admin", user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await updateUserRecord(user._id?.toString?.() || user.id, {
      password: hashedPassword,
      mustChangePassword: false,
    });

    return issueAuthResponse(res, updatedUser, "Password changed successfully");
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const normalizedEmail = String(req.body.email || "").toLowerCase().trim();
    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(24).toString("hex");
    const resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await updateUserRecord(user._id?.toString?.() || user.id, { resetPasswordToken: resetToken, resetPasswordExpiresAt });

    return res.status(200).json({
      message: "Reset token generated",
      resetToken,
      expiresAt: resetPasswordExpiresAt.toISOString(),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    const normalizedEmail = String(email || "").toLowerCase().trim();
    if (!normalizedEmail || !token || !newPassword) {
      return res.status(400).json({ message: "Email, token and new password are required" });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isExpired = !user.resetPasswordExpiresAt || new Date(user.resetPasswordExpiresAt).getTime() < Date.now();
    if (user.resetPasswordToken !== token || isExpired) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateUserRecord(user._id?.toString?.() || user.id, {
      password: hashedPassword,
      mustChangePassword: false,
      resetPasswordToken: null,
      resetPasswordExpiresAt: null,
    });

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const googleLogin = async (req, res) => {
  try {
    const normalizedEmail = String(req.body.email || "").toLowerCase().trim();
    const name = String(req.body.name || "Devotee");
    if (!normalizedEmail) {
      return res.status(400).json({ message: "Google email is required" });
    }

    let user = await findUserByEmail(normalizedEmail);
    if (!user) {
      const randomPassword = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10);
      if (isDbConnected()) {
        user = await User.create({
          name,
          email: normalizedEmail,
          password: randomPassword,
          role: "devotee",
          provider: "google",
          mustChangePassword: false,
        });
      } else {
        user = await createFileUser({
          name,
          email: normalizedEmail,
          password: randomPassword,
          role: "devotee",
          provider: "google",
          mustChangePassword: false,
        });
      }
    } else if (user.role !== "devotee") {
      return res.status(403).json({ message: "Google login is only allowed for devotee accounts" });
    }

    return issueAuthResponse(res, user, "Google login successful");
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  createUserByAdmin,
  getUsersForAdmin,
  changePassword,
  forgotPassword,
  resetPassword,
  googleLogin,
};
