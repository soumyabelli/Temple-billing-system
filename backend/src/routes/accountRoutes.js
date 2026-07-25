const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

// Account Heads
router.get("/account-heads", authenticate, accountController.getAccountHeads);
router.post("/account-heads", authenticate, accountController.createAccountHead);

// Transactions
router.get("/transactions", authenticate, accountController.getTransactions);
router.post("/manual-expense", authenticate, accountController.createManualExpense);
router.put("/expense/:id/approve", authenticate, accountController.approveExpense);
router.post("/bank-interest", authenticate, accountController.addBankInterest);

// Dashboard & Reports
router.get("/dashboard-metrics", authenticate, accountController.getDashboardMetrics);
router.get("/profit-loss", authenticate, accountController.getProfitLoss);
router.get("/monthly-report", authenticate, accountController.getMonthlyReport);
router.get("/annual-report", authenticate, accountController.getAnnualReport);

// Cash Closing
router.get("/cash-closing", authenticate, accountController.getCashClosings);
router.post("/cash-closing", authenticate, accountController.submitCashClosing);
router.put("/cash-closing/:id/verify", authenticate, accountController.verifyCashClosing);

module.exports = router;
