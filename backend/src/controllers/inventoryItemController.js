const InventoryItem = require("../models/InventoryItem");
const InventoryLog = require("../models/InventoryLog");
const RestockHistory = require("../models/RestockHistory");
const AccountTransaction = require("../models/AccountTransaction");
const { createStaffNotification } = require("../utils/notificationService");

const INVENTORY_UNITS = [
  "Piece (Pc)", "Number (Nos)", "Unit", "Pair", "Set", "Bundle", "Packet", "Pack", "Box", "Carton", "Roll", "Dozen", "Tray", "Sack", "Bag", "Pieces",
  "Gram (g)", "Kilogram (kg)", "Kg", "Quintal", "Ton",
  "Millilitre (ml)", "Litre (L)", "Liter", "Can", "Drum", "Barrel",
  "Bottle", "Jar", "Tin", "Container", "Bucket", "Cylinder",
  "Meter", "Feet",
  "Square Feet", "Square Meter"
];

const DEFAULT_ITEMS = [
  { name: "Camphor", unit: "Pack", availableStock: 4, minimumStock: 10, category: "Pooja" },
  { name: "Flowers", unit: "Kg", availableStock: 18, minimumStock: 10, category: "Pooja" },
  { name: "Ghee", unit: "Liter", availableStock: 12, minimumStock: 5, category: "Pooja" },
  { name: "Agarbathi", unit: "Pack", availableStock: 6, minimumStock: 10, category: "Pooja" },
];

const clean = (value) => String(value || "").trim();

// Seed default items if the collection is empty
const seedDefaultItems = async () => {
  const count = await InventoryItem.countDocuments();
  if (count === 0) {
    await InventoryItem.insertMany(DEFAULT_ITEMS);
    console.log("✅ Inventory items seeded with default data.");
  }
};

// GET /api/admin/inventory-items
const getAllInventoryItems = async (req, res) => {
  try {
    await seedDefaultItems();
    const items = await InventoryItem.find().sort({ name: 1 });
    return res.json({ success: true, items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createInventoryItem = async (req, res) => {
  try {
    const { name, unit, availableStock, minimumStock, reorderLevel, category, description, expiryDate, lastSupplier, lastPurchasePrice } = req.body;

    if (!clean(name)) {
      return res.status(400).json({ success: false, message: "Item name is required." });
    }
    if (!INVENTORY_UNITS.includes(clean(unit))) {
      return res.status(400).json({
        success: false,
        message: `Unit must be one of: ${INVENTORY_UNITS.join(", ")}`,
      });
    }
    if (availableStock === undefined || availableStock === null || Number(availableStock) < 0) {
      return res.status(400).json({ success: false, message: "Available stock must be a non-negative number." });
    }
    if (minimumStock === undefined || minimumStock === null || Number(minimumStock) < 0) {
      return res.status(400).json({ success: false, message: "Minimum stock must be a non-negative number." });
    }

    const item = await InventoryItem.create({
      name: clean(name),
      unit: clean(unit),
      availableStock: Number(availableStock),
      minimumStock: Number(minimumStock),
      reorderLevel: Number(reorderLevel || minimumStock),
      category: clean(category),
      description: clean(description),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      lastSupplier: clean(lastSupplier) || undefined,
      lastPurchasePrice: Number(lastPurchasePrice) || undefined
    });

    if (item.availableStock > 0) {
      await RestockHistory.create({
        item: item._id,
        itemName: item.name,
        quantity: item.availableStock,
        unit: item.unit,
        supplier: "Initial Stock",
        restockedBy: req.user ? req.user.id : "System",
      });
    }

    return res.status(201).json({ success: true, item });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "An item with this name already exists." });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unit, availableStock, minimumStock, reorderLevel, category, description, isActive, expiryDate, lastSupplier, lastPurchasePrice } = req.body;

    const existingItem = await InventoryItem.findById(id);
    if (!existingItem) {
      return res.status(404).json({ success: false, message: "Inventory item not found." });
    }

    const updatePayload = {};

    if (name !== undefined) updatePayload.name = clean(name);
    if (lastSupplier !== undefined) updatePayload.lastSupplier = clean(lastSupplier);
    if (lastPurchasePrice !== undefined) updatePayload.lastPurchasePrice = Number(lastPurchasePrice);
    if (unit !== undefined) {
      if (!INVENTORY_UNITS.includes(clean(unit))) {
        return res.status(400).json({
          success: false,
          message: `Unit must be one of: ${INVENTORY_UNITS.join(", ")}`,
        });
      }
      updatePayload.unit = clean(unit);
    }
    if (availableStock !== undefined) updatePayload.availableStock = Math.max(0, Number(availableStock));
    if (minimumStock !== undefined) updatePayload.minimumStock = Math.max(0, Number(minimumStock));
    if (reorderLevel !== undefined) updatePayload.reorderLevel = Math.max(0, Number(reorderLevel));
    if (category !== undefined) updatePayload.category = clean(category);
    if (description !== undefined) updatePayload.description = clean(description);
    if (isActive !== undefined) updatePayload.isActive = Boolean(isActive);
    if (expiryDate !== undefined) updatePayload.expiryDate = expiryDate ? new Date(expiryDate) : null;

    const item = await InventoryItem.findByIdAndUpdate(id, updatePayload, { new: true });

    // Send low stock alert if updated stock is at or below minimum
    if (item.availableStock <= item.minimumStock) {
      await createStaffNotification({
        title: "⚠️ Low Stock Alert",
        message: `${item.name} stock is below minimum level. Current: ${item.availableStock} ${item.unit}, Minimum: ${item.minimumStock} ${item.unit}.`,
        audienceRole: "admin",
        category: "inventory",
      });
    }

    return res.json({ success: true, item });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "An item with this name already exists." });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/inventory-items/:id
const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await InventoryItem.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Inventory item not found." });
    }
    return res.json({ success: true, message: "Inventory item deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/inventory-items/:id/restock
const restockItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantityAdded, supplier, purchaseDate, cost, invoiceUrl, gst, remarks, expiryDate } = req.body;

    if (!quantityAdded || Number(quantityAdded) <= 0) {
      return res.status(400).json({ success: false, message: "Valid quantity added is required." });
    }

    const item = await InventoryItem.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Inventory item not found." });
    }

    item.availableStock += Number(quantityAdded);
    item.lastSupplier = clean(supplier);
    item.lastPurchasePrice = Number(cost) || 0;
    item.lastInvoiceNumber = clean(invoiceUrl);
    item.lastPurchaseDate = purchaseDate ? new Date(purchaseDate) : new Date();
    if (expiryDate) {
      item.expiryDate = new Date(expiryDate);
    }
    await item.save();

    const restock = await RestockHistory.create({
      item: item._id,
      itemName: item.name,
      quantity: Number(quantityAdded),
      unit: item.unit,
      supplier: clean(supplier),
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      cost: Number(cost) || 0,
      invoiceUrl: clean(invoiceUrl),
      restockedBy: req.user ? req.user.name || req.user.id : "Admin",
      gst: Number(gst) || 0,
      remarks: clean(remarks)
    });

    await InventoryLog.create({
      item: item._id,
      action: "Restocked",
      quantity: Number(quantityAdded),
      oldStock: item.availableStock - Number(quantityAdded),
      newStock: item.availableStock,
      user: req.user ? req.user.id : null,
      description: `Restocked ${quantityAdded} ${item.unit} from ${supplier}`
    });

    if (Number(cost) > 0) {
      // Determine financial year based on purchaseDate or current date
      const d = purchaseDate ? new Date(purchaseDate) : new Date();
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const financialYear = month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;

      await AccountTransaction.create({
        transactionType: "Debit",
        source: "Inventory",
        category: "Inventory Purchase",
        amount: Number(cost),
        date: d,
        financialYear: financialYear,
        paymentMethod: "System",
        status: "Completed",
        description: `Purchased ${quantityAdded} ${item.unit} of ${item.name} from ${supplier || 'supplier'}. Invoice: ${invoiceUrl}`,
        referenceId: restock._id,
        referenceModel: "RestockHistory",
        recordedBy: req.user ? req.user.id : null,
      });
    }

    return res.json({ success: true, message: "Item restocked successfully", item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/inventory-logs
const getInventoryLogs = async (req, res) => {
  try {
    const logs = await InventoryLog.find().populate("item", "name").populate("user", "name role").sort({ date: -1 }).limit(100);
    return res.json({ success: true, logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/inventory-items/:id/adjust
const adjustStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, quantity, reason } = req.body; // type: Damaged, Expired, Returned, Lost
    const parsedQty = Number(quantity);

    if (!parsedQty || parsedQty <= 0) {
      return res.status(400).json({ success: false, message: "Valid quantity is required." });
    }

    const item = await InventoryItem.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Inventory item not found." });
    }

    const oldStock = item.availableStock;

    if (["Damaged", "Expired", "Lost"].includes(type)) {
      if (item.availableStock < parsedQty) {
        return res.status(400).json({ success: false, message: "Insufficient stock to adjust." });
      }
      item.availableStock -= parsedQty;
      if (type === "Damaged") item.damagedStock += parsedQty;
      if (type === "Expired") item.expiredStock += parsedQty;

      await AccountTransaction.create({
        transactionType: "Debit",
        source: "Inventory",
        category: "Inventory Loss",
        amount: 0, // Since we don't know the exact cost per unit, it can be 0 or derived if average cost is tracked
        date: new Date(),
        financialYear: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
        paymentMethod: "System",
        status: "Completed",
        description: `Inventory Loss: ${parsedQty} ${item.unit} of ${item.name} (${type}). Reason: ${reason}`,
        referenceId: item._id,
        referenceModel: "InventoryItem",
        recordedBy: req.user ? req.user.id : null,
      });

    } else if (type === "Returned") {
      item.availableStock += parsedQty;
      item.returnedStock += parsedQty;
    } else {
      return res.status(400).json({ success: false, message: "Invalid adjustment type." });
    }

    await item.save();

    let actionEnum = "Adjusted";
    if (type === "Damaged") actionEnum = "Damage";
    if (type === "Expired") actionEnum = "Expire";
    if (type === "Lost") actionEnum = "Lost";
    if (type === "Returned") actionEnum = "Return";

    await InventoryLog.create({
      item: item._id,
      action: actionEnum,
      quantity: parsedQty,
      oldStock: oldStock,
      newStock: item.availableStock,
      user: req.user ? req.user.id : null,
      description: `Stock adjusted: ${type} - ${reason}`
    });

    if (item.availableStock <= (item.reorderLevel || item.minimumStock)) {
      await createStaffNotification({
        title: "⚠️ Low Stock Alert",
        message: `${item.name} stock is below minimum level. Current: ${item.availableStock} ${item.unit}. Suggest reordering soon.`,
        audienceRole: "admin",
        category: "inventory",
      });
    }

    return res.json({ success: true, message: "Stock adjusted successfully", item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  seedDefaultItems,
  restockItem,
  adjustStock,
  getInventoryLogs,
};
