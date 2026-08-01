const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

// Account Heads
router.get("/account-heads", authenticate, authorizeRoles("admin", "accountant"), accountController.getAccountHeads);
router.post("/account-heads", authenticate, authorizeRoles("accountant"), accountController.createAccountHead);

// Transactions
router.get("/transactions", authenticate, authorizeRoles("admin", "accountant"), accountController.getTransactions);
router.get("/register", authenticate, authorizeRoles("admin", "accountant"), accountController.getRegister);
router.post("/manual-expense", authenticate, authorizeRoles("accountant"), accountController.createManualExpense);
router.put("/expense/:id/approve", authenticate, authorizeRoles("accountant"), accountController.approveExpense);
router.post("/bank-interest", authenticate, authorizeRoles("accountant"), accountController.addBankInterest);

// Dashboard & Reports
router.get("/dashboard-metrics", authenticate, authorizeRoles("admin", "accountant", "cashier"), accountController.getDashboardMetrics);
router.get("/profit-loss", authenticate, authorizeRoles("admin", "accountant"), accountController.getProfitLoss);
router.get("/monthly-report", authenticate, authorizeRoles("admin", "accountant"), accountController.getMonthlyReport);
router.get("/annual-report", authenticate, authorizeRoles("admin", "accountant"), accountController.getAnnualReport);

// Cash Closing
router.get("/cash-closing", authenticate, authorizeRoles("admin", "accountant", "cashier"), accountController.getCashClosings);
router.post("/cash-closing", authenticate, authorizeRoles("cashier", "accountant"), accountController.submitCashClosing);
router.put("/cash-closing/:id/verify", authenticate, authorizeRoles("accountant"), accountController.verifyCashClosing);

module.exports = router;
