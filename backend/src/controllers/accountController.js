const AccountTransaction = require("../models/AccountTransaction");
const AccountHead = require("../models/AccountHead");
const CashClosing = require("../models/CashClosing");
const { logAudit } = require("./auditLogController");

// --- Account Heads ---
exports.getAccountHeads = async (req, res) => {
  try {
    const heads = await AccountHead.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json(heads);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch account heads", error: error.message });
  }
};

exports.createAccountHead = async (req, res) => {
  try {
    const { name, type, description } = req.body;
    const head = new AccountHead({ name, type, description, createdBy: req.user.id });
    await head.save();
    res.status(201).json(head);
  } catch (error) {
    res.status(500).json({ message: "Failed to create account head", error: error.message });
  }
};

// --- Transactions ---
exports.getTransactions = async (req, res) => {
  try {
    const { financialYear, source, transactionType, startDate, endDate, status } = req.query;
    let query = {};
    if (financialYear) query.financialYear = financialYear;
    if (source) query.source = source;
    if (transactionType) query.transactionType = transactionType;
    if (status) query.status = status;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    const transactions = await AccountTransaction.find(query).sort({ date: -1 }).populate("recordedBy", "name email");
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions", error: error.message });
  }
};

exports.createManualExpense = async (req, res) => {
  try {
    const { category, amount, description, financialYear, paymentMethod } = req.body;
    const transaction = new AccountTransaction({
      transactionType: "Debit",
      source: "Manual Entry",
      category,
      amount,
      description,
      financialYear,
      paymentMethod: paymentMethod || "Cash",
      status: "Pending Approval",
      recordedBy: req.user.id
    });
    await transaction.save();
    res.status(201).json({ message: "Manual expense submitted for approval", transaction });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit expense", error: error.message });
  }
};

exports.approveExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "Approved" or "Rejected"
    
    const transaction = await AccountTransaction.findById(id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    if (transaction.status !== "Pending Approval") return res.status(400).json({ message: "Transaction is not pending approval" });

    transaction.status = status;
    transaction.approvedBy = req.user.id;
    await transaction.save();
    
    await logAudit(
      req.user.id,
      `${status === "Approved" ? "Approved" : "Rejected"} Expense`,
      "Accounts & Finance",
      `${status === "Approved" ? "Approved" : "Rejected"} expense: ${transaction.category} for Rs ${transaction.amount}`,
      req.ip
    );

    res.status(200).json({ message: `Expense ${status}`, transaction });
  } catch (error) {
    res.status(500).json({ message: "Failed to update expense status", error: error.message });
  }
};

exports.addBankInterest = async (req, res) => {
  try {
    const { amount, bankName, referenceNumber, financialYear, receivedDate } = req.body;
    const transaction = new AccountTransaction({
      transactionType: "Credit",
      source: "Bank Interest",
      category: "Bank Interest",
      amount,
      bankName,
      description: `Ref: ${referenceNumber}`,
      financialYear,
      date: receivedDate || new Date(),
      paymentMethod: "Bank Transfer",
      status: "Completed",
      recordedBy: req.user.id
    });
    await transaction.save();
    res.status(201).json({ message: "Bank interest added successfully", transaction });
  } catch (error) {
    res.status(500).json({ message: "Failed to add bank interest", error: error.message });
  }
};

// --- Dashboards & Reports ---
exports.getDashboardMetrics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayTransactions, allCompleted] = await Promise.all([
      AccountTransaction.find({ date: { $gte: today }, status: "Completed" }),
      AccountTransaction.find({ status: "Completed" })
    ]);

    let todayIncome = 0;
    let todayExpense = 0;
    
    todayTransactions.forEach(t => {
      if (t.transactionType === "Credit") todayIncome += t.amount;
      if (t.transactionType === "Debit") todayExpense += t.amount;
    });

    let totalIncome = 0;
    let totalExpense = 0;
    allCompleted.forEach(t => {
      if (t.transactionType === "Credit") totalIncome += t.amount;
      if (t.transactionType === "Debit") totalExpense += t.amount;
    });

    const pendingPaymentsCount = await AccountTransaction.countDocuments({ status: "Pending Approval" });

    res.status(200).json({
      todayIncome,
      todayExpense,
      todayProfit: todayIncome - todayExpense,
      cashInHand: totalIncome - totalExpense,
      pendingPayments: pendingPaymentsCount
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch metrics", error: error.message });
  }
};

exports.getProfitLoss = async (req, res) => {
  try {
    const { financialYear } = req.query;
    let query = { status: "Completed" };
    if (financialYear) query.financialYear = financialYear;

    const transactions = await AccountTransaction.find(query);
    
    let income = 0;
    let expense = 0;
    let incomeBySource = {};
    let expenseByCategory = {};

    transactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.transactionType === "Credit") {
        income += amt;
        incomeBySource[t.source] = (incomeBySource[t.source] || 0) + amt;
      } else if (t.transactionType === "Debit") {
        expense += amt;
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + amt;
      }
    });

    res.status(200).json({
      financialYear,
      totalIncome: income,
      totalExpense: expense,
      netProfit: income - expense,
      incomeBySource,
      expenseByCategory
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to calculate P&L", error: error.message });
  }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const { financialYear } = req.query;
    let query = { status: "Completed" };
    if (financialYear) query.financialYear = financialYear;

    const transactions = await AccountTransaction.find(query);
    
    const monthlyData = Array.from({ length: 12 }, () => ({ income: 0, expense: 0 }));

    transactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      const monthIndex = new Date(t.date).getMonth(); // 0-11
      if (t.transactionType === "Credit") {
        monthlyData[monthIndex].income += amt;
      } else if (t.transactionType === "Debit") {
        monthlyData[monthIndex].expense += amt;
      }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedData = monthlyData.map((data, idx) => ({
      month: monthNames[idx],
      ...data
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate monthly report", error: error.message });
  }
};

exports.getAnnualReport = async (req, res) => {
  // Can be implemented similarly or just defer to P&L
  this.getProfitLoss(req, res);
};

// --- Cash Closing ---
exports.getCashClosings = async (req, res) => {
  try {
    const closings = await CashClosing.find().sort({ date: -1 }).populate("recordedBy", "name").populate("verifiedBy", "name");
    res.status(200).json(closings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cash closings", error: error.message });
  }
};

exports.submitCashClosing = async (req, res) => {
  try {
    const { openingCash, cashCollected, cashDeposited, closingCash, notes, date } = req.body;
    
    // Calculate discrepancy (opening + collected - deposited should equal closing)
    const expectedClosing = Number(openingCash) + Number(cashCollected) - Number(cashDeposited);
    const discrepancy = Number(closingCash) - expectedClosing;

    const closing = new CashClosing({
      date: date || new Date(),
      openingCash,
      cashCollected,
      cashDeposited,
      closingCash,
      discrepancy,
      notes,
      recordedBy: req.user.id
    });
    
    await closing.save();

    await logAudit(
      req.user.id,
      "Submitted Shift Closing",
      "Accounts & Finance",
      `Submitted cash closing with closing cash Rs ${closingCash} and discrepancy Rs ${discrepancy}`,
      req.ip
    );

    res.status(201).json({ message: "Cash closing submitted successfully", closing });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit cash closing", error: error.message });
  }
};

exports.verifyCashClosing = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "Verified" or "Disputed"
    
    const closing = await CashClosing.findById(id);
    if (!closing) return res.status(404).json({ message: "Cash closing not found" });

    closing.status = status;
    closing.verifiedBy = req.user.id;
    await closing.save();
    
    res.status(200).json({ message: `Cash closing ${status}`, closing });
  } catch (error) {
    res.status(500).json({ message: "Failed to verify cash closing", error: error.message });
  }
};
