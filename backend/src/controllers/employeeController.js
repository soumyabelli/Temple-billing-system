const Employee = require("../models/Employee");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


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
    } = req.body;

    // CHECK EXISTING
    const existingEmployee = await Employee.findOne({
      email,
    });

    if (existingEmployee) {
      return res.status(400).json({
        message: "Employee already exists",
      });
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // CREATE
    const employee = await Employee.create({
      name,
      email,
      password: hashedPassword,
      role,
      shift,
      department,
    });

    res.status(201).json({
      message: "Employee created successfully",
      employee,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// LOGIN
exports.loginEmployee = async (req, res) => {
  try {

    const { email, password } = req.body;

    const employee = await Employee.findOne({
      email,
    });

    if (!employee) {
      return res.status(400).json({
        message: "Employee not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      employee.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    // JWT TOKEN
    const token = jwt.sign(
      {
        id: employee._id,
        role: employee.role,
      },
      "temple_secret_key",
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      employee,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET ALL EMPLOYEES
exports.getEmployees = async (req, res) => {
  try {

    const employees = await Employee.find();

    res.json(employees);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};