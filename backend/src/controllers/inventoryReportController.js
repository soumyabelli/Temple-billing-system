const InventoryItem = require("../models/InventoryItem");
const InventoryLog = require("../models/InventoryLog");
const RestockHistory = require("../models/RestockHistory");

const getDashboardMetrics = async (req, res) => {
  try {
    const items = await InventoryItem.find();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let expiringCount = 0; 
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);
    
    let totalDamaged = 0;

    items.forEach(item => {
      totalValue += item.availableStock * (item.lastPurchasePrice || 0);
      if (item.availableStock === 0) outOfStockCount++;
      else if (item.availableStock <= (item.reorderLevel || item.minimumStock)) lowStockCount++;
      
      if (item.expiryDate && item.expiryDate <= next30Days) expiringCount++;
      totalDamaged += item.damagedStock;
    });

    const todaysRestocks = await RestockHistory.find({ date: { $gte: today } });
    const todaysPurchasesCount = todaysRestocks.length;
    
    const todaysLogs = await InventoryLog.find({ date: { $gte: today }, action: "Consumed" });
    const todaysConsumptionCount = todaysLogs.length;

    res.json({
      success: true,
      metrics: {
        totalItems: items.length,
        totalValue,
        lowStockCount,
        outOfStockCount,
        expiringCount,
        damagedItems: totalDamaged,
        todaysPurchases: todaysPurchasesCount,
        todaysConsumption: todaysConsumptionCount,
        pendingRequests: 0 
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getInventoryReports = async (req, res) => {
  try {
    const { type } = req.query; // daily, weekly, monthly, annual, valuation
    const today = new Date();
    
    if (type === "valuation") {
      const items = await InventoryItem.find();
      const report = items.map(item => ({
        name: item.name,
        category: item.category,
        stock: item.availableStock,
        unit: item.unit,
        price: item.lastPurchasePrice || 0,
        totalValue: item.availableStock * (item.lastPurchasePrice || 0)
      }));
      return res.json({ success: true, report });
    }

    let startDate = new Date();
    if (type === "daily") startDate.setHours(0,0,0,0);
    else if (type === "weekly") startDate.setDate(today.getDate() - 7);
    else if (type === "monthly") startDate.setMonth(today.getMonth() - 1);
    else if (type === "annual") startDate.setFullYear(today.getFullYear() - 1);

    const logs = await InventoryLog.find({ date: { $gte: startDate } })
      .populate("item", "name category")
      .populate("user", "name role");

    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getItemDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await InventoryItem.findById(id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    const purchaseHistory = await RestockHistory.find({ item: id }).sort({ date: -1 });
    const stockMovement = await InventoryLog.find({ item: id }).sort({ date: -1 }).populate("user", "name role");
    
    const AccountTransaction = require("../models/AccountTransaction");
    const restockIds = purchaseHistory.map(r => r._id);
    const financialTransactions = await AccountTransaction.find({
      $or: [
        { referenceModel: "InventoryItem", referenceId: id },
        { referenceModel: "RestockHistory", referenceId: { $in: restockIds } }
      ]
    }).sort({ date: -1 });

    res.json({
      success: true,
      item,
      purchaseHistory,
      stockMovement,
      financialTransactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardMetrics,
  getInventoryReports,
  getItemDetails
};
