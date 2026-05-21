const express = require("express");

const router = express.Router();

const {
  createEmployee,
  loginEmployee,
  getEmployees,
} = require("../controllers/employeeController");

router.post("/create", createEmployee);

router.post("/login", loginEmployee);

router.get("/", getEmployees);

module.exports = router;