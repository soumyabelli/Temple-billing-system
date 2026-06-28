const express = require("express");

const router = express.Router();

const {
  createEmployee,
  loginEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  getEmployeeProfileByUserId,
  updateEmployeeProfileByUserId,
  changeEmployeePasswordByUserId,
  deleteEmployee,
} = require("../controllers/employeeManagementController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/create", authenticate, authorizeRoles("admin"), createEmployee);
router.post("/login", loginEmployee);
router.get("/profile/:userId", authenticate, getEmployeeProfileByUserId);
router.put("/profile/:userId", authenticate, updateEmployeeProfileByUserId);
router.put("/profile/:userId/password", authenticate, changeEmployeePasswordByUserId);
router.get("/", authenticate, authorizeRoles("admin"), getEmployees);
router.get("/:id", authenticate, authorizeRoles("admin"), getEmployeeById);
router.put("/:id", authenticate, authorizeRoles("admin"), updateEmployee);
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteEmployee);

module.exports = router;
