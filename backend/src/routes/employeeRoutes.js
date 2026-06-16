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
} = require("../controllers/employeeController");

router.post("/create", createEmployee);
router.post("/login", loginEmployee);
router.get("/profile/:userId", getEmployeeProfileByUserId);
router.put("/profile/:userId", updateEmployeeProfileByUserId);
router.put("/profile/:userId/password", changeEmployeePasswordByUserId);
router.get("/", getEmployees);
router.get("/:id", getEmployeeById);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

module.exports = router;
