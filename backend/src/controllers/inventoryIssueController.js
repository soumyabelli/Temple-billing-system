const InventoryIssue = require("../models/InventoryIssue");
const InventoryConsumption = require("../models/InventoryConsumption");
const InventoryItem = require("../models/InventoryItem");

// GET /api/staff/inventory-issues/:userId?
exports.getInventoryIssues = async (req, res) => {
  try {
    const { userId } = req.params;
    const query = userId ? { userId } : {};
    
    const issues = await InventoryIssue.find(query).sort({ issueDate: -1 });
    return res.json({ success: true, issues });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/staff/inventory-issues/:id/complete
exports.completeUsage = async (req, res) => {
  try {
    const { id } = req.params;
    const { usedQuantity, returnedQuantity, remarks } = req.body;

    const parsedUsed = parseFloat(usedQuantity) || 0;
    const parsedReturned = parseFloat(returnedQuantity) || 0;

    if (parsedUsed < 0 || parsedReturned < 0) {
      return res.status(400).json({ success: false, message: "Quantities cannot be negative." });
    }

    const issue = await InventoryIssue.findById(id);
    if (!issue) {
      return res.status(404).json({ success: false, message: "Inventory issue not found." });
    }

    if (issue.status === "Completed") {
      return res.status(400).json({ success: false, message: "This issue has already been completed." });
    }

    if (parsedUsed + parsedReturned !== issue.issuedQuantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Used (${parsedUsed}) + Returned (${parsedReturned}) must equal Issued Quantity (${issue.issuedQuantity}).`
      });
    }

    const item = await InventoryItem.findById(issue.item);
    if (!item) {
      return res.status(404).json({ success: false, message: "Associated inventory item not found." });
    }

    // Adjust stocks
    item.issuedStock -= issue.issuedQuantity;
    item.consumedStock += parsedUsed;
    item.availableStock += parsedReturned;
    await item.save();

    // Mark issue as completed
    issue.status = "Completed";
    await issue.save();

    // Log consumption
    const consumption = await InventoryConsumption.create({
      issue: issue._id,
      item: item._id,
      itemName: item.name,
      userId: issue.userId,
      userName: issue.userName,
      role: issue.role,
      issuedQuantity: issue.issuedQuantity,
      usedQuantity: parsedUsed,
      returnedQuantity: parsedReturned,
      unit: issue.unit,
      purpose: issue.purpose,
      remarks: String(remarks || "").trim(),
    });

    return res.json({ success: true, message: "Usage completed successfully.", issue, consumption });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/inventory/reports/consumption
exports.getConsumptionReports = async (req, res) => {
  try {
    const consumptions = await InventoryConsumption.find().sort({ date: -1 }).limit(100);
    return res.json({ success: true, consumptions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
