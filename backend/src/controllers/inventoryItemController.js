const InventoryItem = require("../models/InventoryItem");
const InventoryLog = require("../models/InventoryLog");
const { createStaffNotification } = require("../utils/notificationService");

const INVENTORY_UNITS = ["Kg", "Liter", "Pack", "Pieces", "Box"];

const DEFAULT_ITEMS = [
  { name: "Camphor", unit: "Pack", currentStock: 4, minimumStock: 10, category: "Pooja" },
  { name: "Flowers", unit: "Kg", currentStock: 18, minimumStock: 10, category: "Pooja" },
  { name: "Ghee", unit: "Liter", currentStock: 12, minimumStock: 5, category: "Pooja" },
  { name: "Agarbathi", unit: "Pack", currentStock: 6, minimumStock: 10, category: "Pooja" },
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

// POST /api/admin/inventory-items
const createInventoryItem = async (req, res) => {
  try {
    const { name, unit, currentStock, minimumStock, category, description } = req.body;

    if (!clean(name)) {
      return res.status(400).json({ success: false, message: "Item name is required." });
    }
    if (!INVENTORY_UNITS.includes(clean(unit))) {
      return res.status(400).json({
        success: false,
        message: `Unit must be one of: ${INVENTORY_UNITS.join(", ")}`,
      });
    }
    if (currentStock === undefined || currentStock === null || Number(currentStock) < 0) {
      return res.status(400).json({ success: false, message: "Current stock must be a non-negative number." });
    }
    if (minimumStock === undefined || minimumStock === null || Number(minimumStock) < 0) {
      return res.status(400).json({ success: false, message: "Minimum stock must be a non-negative number." });
    }

    const item = await InventoryItem.create({
      name: clean(name),
      unit: clean(unit),
      currentStock: Number(currentStock),
      minimumStock: Number(minimumStock),
      category: clean(category),
      description: clean(description),
    });

    await InventoryLog.create({
      item: item._id,
      action: "Added",
      quantity: item.currentStock,
      oldStock: 0,
      newStock: item.currentStock,
      user: req.user.id,
    });

    return res.status(201).json({ success: true, item });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "An item with this name already exists." });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/inventory-items/:id
const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unit, currentStock, minimumStock, category, description } = req.body;

    const existingItem = await InventoryItem.findById(id);
    if (!existingItem) {
      return res.status(404).json({ success: false, message: "Inventory item not found." });
    }

    const updatePayload = {};

    if (name !== undefined) updatePayload.name = clean(name);
    if (unit !== undefined) {
      if (!INVENTORY_UNITS.includes(clean(unit))) {
        return res.status(400).json({
          success: false,
          message: `Unit must be one of: ${INVENTORY_UNITS.join(", ")}`,
        });
      }
      updatePayload.unit = clean(unit);
    }
    if (currentStock !== undefined) updatePayload.currentStock = Math.max(0, Number(currentStock));
    if (minimumStock !== undefined) updatePayload.minimumStock = Math.max(0, Number(minimumStock));
    if (category !== undefined) updatePayload.category = clean(category);
    if (description !== undefined) updatePayload.description = clean(description);

    const item = await InventoryItem.findByIdAndUpdate(id, updatePayload, { new: true });

    if (currentStock !== undefined && Number(currentStock) !== existingItem.currentStock) {
      await InventoryLog.create({
        item: item._id,
        action: "Updated",
        quantity: Math.abs(Number(currentStock) - existingItem.currentStock),
        oldStock: existingItem.currentStock,
        newStock: item.currentStock,
        user: req.user.id,
      });
    }

    // Send low stock alert if updated stock is at or below minimum
    if (item.currentStock <= item.minimumStock) {
      await createStaffNotification({
        title: "⚠️ Low Stock Alert",
        message: `${item.name} stock is below minimum level. Current: ${item.currentStock} ${item.unit}, Minimum: ${item.minimumStock} ${item.unit}.`,
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
    const { quantityAdded } = req.body;

    if (!quantityAdded || Number(quantityAdded) <= 0) {
      return res.status(400).json({ success: false, message: "Valid quantity added is required." });
    }

    const item = await InventoryItem.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Inventory item not found." });
    }

    const oldStock = item.currentStock;
    item.currentStock += Number(quantityAdded);
    await item.save();

    await InventoryLog.create({
      item: item._id,
      action: "Restocked",
      quantity: Number(quantityAdded),
      oldStock,
      newStock: item.currentStock,
      user: req.user.id,
    });

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

module.exports = {
  getAllInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  seedDefaultItems,
  restockItem,
  getInventoryLogs,
};
