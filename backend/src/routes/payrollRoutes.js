const express = require("express");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getPayrollDashboard,
  payEmployeePayroll,
  getPerformanceDashboard,
} = require("../controllers/payrollController");

const router = express.Router();

router.get("/dashboard", authenticate, authorizeRoles("admin", "accountant"), getPayrollDashboard);
router.get("/performance", authenticate, authorizeRoles("admin", "accountant"), getPerformanceDashboard);
router.post("/:employeeId/pay", authenticate, authorizeRoles("admin", "accountant"), payEmployeePayroll);

module.exports = router;
