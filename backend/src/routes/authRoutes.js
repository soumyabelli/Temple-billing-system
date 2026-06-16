const express = require("express");
const {
  registerUser,
  loginUser,
  createUserByAdmin,
  changePassword,
  forgotPassword,
  resetPassword,
  googleLogin,
  getUsersForAdmin,
} = require("../controllers/authController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google-login", googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", authenticate, changePassword);
router.post("/admin/create-user", authenticate, authorizeRoles("admin"), createUserByAdmin);
router.get("/admin/users", authenticate, authorizeRoles("admin"), getUsersForAdmin);

module.exports = router;
