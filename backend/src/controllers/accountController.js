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
    const { financialYear, source, transactionType, startDate, endDate, status, limit } = req.query;
    let query = {};
    if (financialYear) query.financialYear = financialYear;
    if (source) query.source = source;
    if (transactionType) query.transactionType = transactionType;
    if (status) query.status = status;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $lte: end };
    }
    
    let queryBuilder = AccountTransaction.find(query).sort({ date: -1 }).populate("recordedBy", "name email");
    if (limit) {
      queryBuilder = queryBuilder.limit(parseInt(limit, 10));
    }
    const transactions = await queryBuilder;
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions", error: error.message });
  }
};

exports.getRegister = async (req, res) => {
  try {
    const { startDate, endDate, source, status, page = 1, limit = 50 } = req.query;
    let query = { status: "Completed" };
    
    if (source) query.source = source;
    if (status) query.status = status;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $lte: end };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const transactions = await AccountTransaction.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("recordedBy", "name email");
      
    const total = await AccountTransaction.countDocuments(query);

    res.status(200).json({
      transactions,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      totalTransactions: total,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch register", error: error.message });
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
    const { financialYear, fromDate, toDate } = req.query;
    let query = { status: "Completed" };
    if (financialYear) query.financialYear = financialYear;

    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) query.date.$gte = new Date(fromDate);
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const transactions = await AccountTransaction.find(query);
    
    let income = 0;
    let expense = 0;
    let incomeBySource = {};
    let expenseByCategory = {};

    transactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.transactionType === "Credit") {
        income += amt;
        const src = t.source || "General";
        incomeBySource[src] = (incomeBySource[src] || 0) + amt;
      } else if (t.transactionType === "Debit") {
        expense += amt;
        const cat = t.category || "General";
        expenseByCategory[cat] = (expenseByCategory[cat] || 0) + amt;
      }
    });

    res.status(200).json({
      financialYear,
      fromDate,
      toDate,
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
    const { financialYear, fromDate, toDate } = req.query;
    let query = { status: "Completed" };
    if (financialYear) query.financialYear = financialYear;

    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) query.date.$gte = new Date(fromDate);
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const transactions = await AccountTransaction.find(query);
    
    const monthlyData = Array.from({ length: 12 }, () => ({ income: 0, expense: 0, netBalance: 0 }));

    transactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      const monthIndex = new Date(t.date).getMonth(); // 0-11
      if (t.transactionType === "Credit") {
        monthlyData[monthIndex].income += amt;
      } else if (t.transactionType === "Debit") {
        monthlyData[monthIndex].expense += amt;
      }
      monthlyData[monthIndex].netBalance = monthlyData[monthIndex].income - monthlyData[monthIndex].expense;
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
  // Defer to getProfitLoss
  this.getProfitLoss(req, res);
};

// --- Cash Closing ---
exports.getShiftSummary = async (req, res) => {
  try {
    const targetDate = req.query.date ? new Date(req.query.date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Auto-fetch Opening Cash from the latest previous CashClosing record
    const lastClosing = await CashClosing.findOne({
      status: { $ne: "Disputed" },
      date: { $lt: targetDate }
    }).sort({ date: -1, createdAt: -1 });

    let autoOpeningCash = 0;
    if (lastClosing) {
      autoOpeningCash = Number(lastClosing.closingCash) || 0;
    } else {
      const anyLast = await CashClosing.findOne({
        status: { $ne: "Disputed" }
      }).sort({ createdAt: -1 });
      if (anyLast && anyLast.date < targetDate) {
        autoOpeningCash = Number(anyLast.closingCash) || 0;
      }
    }

    // 2. Fetch today's transactions recorded by this cashier
    const transactionFilter = {
      transactionType: "Credit",
      status: "Completed",
      date: { $gte: targetDate, $lte: endOfDay }
    };
    if (req.user && req.user.role === "cashier") {
      transactionFilter.$or = [
        { recordedBy: req.user.id },
        { recordedBy: null },
        { cashierId: req.user.id }
      ];
    }

    const transactions = await AccountTransaction.find(transactionFilter);

    let cashCollected = 0;
    let upiCollected = 0;
    let cardCollected = 0;
    let bankTransferCollected = 0;

    transactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.paymentMethod === "Cash") cashCollected += amt;
      else if (t.paymentMethod === "UPI") upiCollected += amt;
      else if (t.paymentMethod === "Card") cardCollected += amt;
      else if (t.paymentMethod === "Bank Transfer") bankTransferCollected += amt;
    });

    const totalSystemCollection = cashCollected + upiCollected + cardCollected + bankTransferCollected;
    const expectedClosingCash = autoOpeningCash + cashCollected;

    // 3. Check if today's shift closing has already been submitted by this cashier
    const closingFilter = {
      date: { $gte: targetDate, $lte: endOfDay }
    };
    if (req.user && req.user.role === "cashier") {
      closingFilter.recordedBy = req.user.id;
    }
    const existingClosing = await CashClosing.findOne(closingFilter)
      .populate("recordedBy", "name email")
      .populate("verifiedBy", "name email");

    // 4. Fetch recent shift closings for this cashier
    const recentClosingsQuery = {};
    if (req.user && req.user.role === "cashier") {
      recentClosingsQuery.recordedBy = req.user.id;
    }
    const recentClosings = await CashClosing.find(recentClosingsQuery)
      .sort({ date: -1, createdAt: -1 })
      .limit(5)
      .populate("verifiedBy", "name");

    res.status(200).json({
      openingCash: autoOpeningCash,
      cashCollected,
      upiCollected,
      cardCollected,
      bankTransferCollected,
      totalSystemCollection,
      expectedClosingCash,
      transactionsCount: transactions.length,
      existingClosing,
      recentClosings,
      targetDate
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shift summary", error: error.message });
  }
};

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
    let { openingCash, cashDeposited, closingCash, notes, date } = req.body;
    
    // Auto-calculate collections for today for this cashier
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const transactionQuery = {
      transactionType: "Credit",
      status: "Completed",
      date: { $gte: targetDate, $lte: endOfDay }
    };
    if (req.user && req.user.role === "cashier") {
      transactionQuery.$or = [
        { recordedBy: req.user.id },
        { recordedBy: null },
        { cashierId: req.user.id }
      ];
    }

    const transactions = await AccountTransaction.find(transactionQuery);

    let cashCollected = 0;
    let upiCollected = 0;
    let cardCollected = 0;
    let bankTransferCollected = 0;

    transactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.paymentMethod === "Cash") cashCollected += amt;
      else if (t.paymentMethod === "UPI") upiCollected += amt;
      else if (t.paymentMethod === "Card") cardCollected += amt;
      else if (t.paymentMethod === "Bank Transfer") bankTransferCollected += amt;
    });

    const totalSystemCollection = cashCollected + upiCollected + cardCollected + bankTransferCollected;

    // Automatic Opening Cash from previous closing if not provided
    if (openingCash === undefined || openingCash === null || openingCash === "") {
      const lastClosing = await CashClosing.findOne({
        status: { $ne: "Disputed" },
        date: { $lt: targetDate }
      }).sort({ date: -1, createdAt: -1 });

      if (lastClosing) {
        openingCash = Number(lastClosing.closingCash) || 0;
      } else {
        const anyLast = await CashClosing.findOne({ status: { $ne: "Disputed" } }).sort({ createdAt: -1 });
        openingCash = (anyLast && anyLast.date < targetDate) ? Number(anyLast.closingCash) || 0 : 0;
      }
    } else {
      openingCash = Number(openingCash) || 0;
    }

    const deposit = Number(cashDeposited) || 0;

    // Expected Closing = Opening Cash + Cash Collected - Cash Deposited
    const expectedClosing = openingCash + cashCollected - deposit;

    // If closingCash is not manually provided, automatically set it to expectedClosing (automatic entry in accounts!)
    if (closingCash === undefined || closingCash === null || closingCash === "") {
      closingCash = expectedClosing;
    } else {
      closingCash = Number(closingCash);
    }

    const discrepancy = closingCash - expectedClosing;

    // Check if an existing closing for this cashier and date exists
    let closing = await CashClosing.findOne({
      recordedBy: req.user.id,
      date: { $gte: targetDate, $lte: endOfDay }
    });

    if (closing) {
      // Update existing record
      closing.openingCash = openingCash;
      closing.cashCollected = cashCollected;
      closing.upiCollected = upiCollected;
      closing.cardCollected = cardCollected;
      closing.bankTransferCollected = bankTransferCollected;
      closing.totalSystemCollection = totalSystemCollection;
      closing.cashDeposited = deposit;
      closing.closingCash = closingCash;
      closing.discrepancy = discrepancy;
      if (notes !== undefined) closing.notes = notes;
      closing.status = "Pending Verification";
      await closing.save();
    } else {
      closing = new CashClosing({
        date: targetDate,
        openingCash,
        cashCollected,
        upiCollected,
        cardCollected,
        bankTransferCollected,
        totalSystemCollection,
        cashDeposited: deposit,
        closingCash,
        discrepancy,
        notes,
        recordedBy: req.user.id,
        status: "Pending Verification"
      });
      await closing.save();
    }

    await logAudit(
      req.user.id,
      "Submitted Shift Closing",
      "Accounts & Finance",
      `Submitted shift closing with discrepancy Rs ${discrepancy}. Expected Cash: ${expectedClosing}, Actual: ${closingCash}`,
      req.ip
    );

    res.status(201).json({ message: "Shift closing automatically entered into accounts successfully", closing });
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
