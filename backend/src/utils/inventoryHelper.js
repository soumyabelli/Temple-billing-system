const InventoryItem = require("../models/InventoryItem");
const InventoryLog = require("../models/InventoryLog");
const { createStaffNotification } = require("./notificationService");

/**
 * Deduct stock from an inventory item and create a log entry.
 * If stock falls below minimum, sends a notification.
 */
const deductStock = async (itemId, quantity, action, userId, description) => {
  if (!quantity || quantity <= 0) return null;

  const item = await InventoryItem.findById(itemId);
  if (!item) throw new Error("Inventory item not found");

  if (item.availableStock < quantity) {
    throw new Error(`Insufficient stock for ${item.name}. Available: ${item.availableStock}`);
  }

  const oldStock = item.availableStock;
  item.availableStock -= quantity;
  await item.save();

  await InventoryLog.create({
    item: item._id,
    action: action || "Consumed",
    quantity: quantity,
    oldStock: oldStock,
    newStock: item.availableStock,
    user: userId,
    description: description || `Stock consumed for ${action}`,
  });

  if (item.availableStock <= (item.reorderLevel || item.minimumStock)) {
    await createStaffNotification({
      title: "⚠️ Low Stock Alert",
      message: `${item.name} stock is below minimum level. Current: ${item.availableStock} ${item.unit}. Suggest reordering soon.`,
      audienceRole: "admin",
      category: "inventory",
    });
  }

  return item;
};

/**
 * Add stock to an inventory item and create a log entry.
 */
const addStock = async (itemId, quantity, action, userId, description) => {
  if (!quantity || quantity <= 0) return null;

  const item = await InventoryItem.findById(itemId);
  if (!item) throw new Error("Inventory item not found");

  const oldStock = item.availableStock;
  item.availableStock += quantity;
  await item.save();

  await InventoryLog.create({
    item: item._id,
    action: action || "Restocked",
    quantity: quantity,
    oldStock: oldStock,
    newStock: item.availableStock,
    user: userId,
    description: description || `Stock added via ${action}`,
  });

  return item;
};

module.exports = {
  deductStock,
  addStock,
};
