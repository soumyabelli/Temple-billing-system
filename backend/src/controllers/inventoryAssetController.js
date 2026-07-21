const Asset = require("../models/Asset");
const RepairRequest = require("../models/RepairRequest");
const AccountTransaction = require("../models/AccountTransaction");

const clean = (val) => String(val || "").trim();

exports.getAllAssets = async (req, res) => {
  try {
    const assets = await Asset.find().populate("supplier").sort({ name: 1 });
    res.json({ success: true, assets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAsset = async (req, res) => {
  try {
    const { assetId, name, category, purchaseDate, supplier, invoiceNumber, warranty, assignedLocation, status } = req.body;
    if (!clean(assetId) || !clean(name)) return res.status(400).json({ success: false, message: "Asset ID and Name are required" });

    const asset = await Asset.create({
      assetId: clean(assetId),
      name: clean(name),
      category: clean(category),
      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      supplier: supplier || null,
      invoiceNumber: clean(invoiceNumber),
      warranty: clean(warranty),
      assignedLocation: clean(assignedLocation),
      status: clean(status) || "Active"
    });
    res.status(201).json({ success: true, asset });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: "Asset ID already exists" });
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!asset) return res.status(404).json({ success: false, message: "Asset not found" });
    res.json({ success: true, asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: "Asset not found" });
    res.json({ success: true, message: "Asset deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Repairs
exports.getAllRepairs = async (req, res) => {
  try {
    const repairs = await RepairRequest.find().populate("asset").sort({ createdAt: -1 });
    res.json({ success: true, repairs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createRepair = async (req, res) => {
  try {
    const { asset, description, vendor, cost, invoiceNumber } = req.body;
    if (!asset || !description) return res.status(400).json({ success: false, message: "Asset and description required" });

    const repair = await RepairRequest.create({
      asset,
      description: clean(description),
      vendor: clean(vendor),
      cost: Number(cost) || 0,
      invoiceNumber: clean(invoiceNumber),
      status: "Pending",
      createdBy: req.user ? req.user.id : null
    });
    res.status(201).json({ success: true, repair });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.completeRepair = async (req, res) => {
  try {
    const repair = await RepairRequest.findById(req.params.id).populate("asset");
    if (!repair) return res.status(404).json({ success: false, message: "Repair request not found" });

    repair.status = "Completed";
    repair.completionDate = new Date();
    if (req.body.cost) repair.cost = Number(req.body.cost);
    if (req.body.invoiceNumber) repair.invoiceNumber = clean(req.body.invoiceNumber);
    await repair.save();

    if (repair.cost > 0) {
      const d = new Date();
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const financialYear = month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;

      await AccountTransaction.create({
        transactionType: "Debit",
        source: "Repair",
        category: "Repair Expense",
        amount: repair.cost,
        date: d,
        financialYear,
        paymentMethod: "System",
        status: "Completed",
        description: `Repair completed for asset ${repair.asset.name}. Vendor: ${repair.vendor}`,
        referenceId: repair._id,
        referenceModel: "RepairRequest",
        recordedBy: req.user ? req.user.id : null,
      });
    }

    res.json({ success: true, repair });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
