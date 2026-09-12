/**
 * Comprehensive Unit Converter for Temple Inventory Management
 * Handles volume, weight, counts, packaging, and temple-specific conversions.
 */

// Normalizes unit string by trimming, removing punctuation/parentheses, and lowercasing
const cleanUnit = (raw) => {
  if (!raw) return "";
  return String(raw)
    .trim()
    .toLowerCase()
    .replace(/[()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

// Definitions of unit conversion categories and ratios to a base unit
const UNIT_DEFINITIONS = {
  volume: {
    base: "ml",
    units: {
      ml: 1,
      milliliter: 1,
      millilitre: 1,
      milliliters: 1,
      millilitres: 1,
      mls: 1,
      l: 1000,
      liter: 1000,
      litre: 1000,
      liters: 1000,
      litres: 1000,
      ltr: 1000,
      ltrs: 1000,
      "litre l": 1000,
      "liter l": 1000,
      "litres l": 1000,
      cl: 10,
      centiliter: 10,
      centilitre: 10,
      dl: 100,
      deciliter: 100,
      decilitre: 100,
    },
  },
  weight: {
    base: "g",
    units: {
      mg: 0.001,
      milligram: 0.001,
      milligrams: 0.001,
      mgs: 0.001,
      g: 1,
      gm: 1,
      gms: 1,
      gram: 1,
      grams: 1,
      kg: 1000,
      kgs: 1000,
      kilo: 1000,
      kilos: 1000,
      kilogram: 1000,
      kilograms: 1000,
      "kilogram kg": 1000,
      "kg kg": 1000,
      quintal: 100000,
      quintals: 100000,
      ton: 1000000,
      tonne: 1000000,
      tons: 1000000,
      tonnes: 1000000,
    },
  },
  count: {
    base: "piece",
    units: {
      piece: 1,
      pieces: 1,
      pc: 1,
      pcs: 1,
      nos: 1,
      no: 1,
      item: 1,
      items: 1,
      unit: 1,
      units: 1,
      count: 1,
      pair: 2,
      pairs: 2,
      dozen: 12,
      dozens: 12,
    },
  },
  packaging: {
    base: "pack",
    units: {
      pack: 1,
      packs: 1,
      packet: 1,
      packets: 1,
      box: 1,
      boxes: 1,
      pouch: 1,
      pouches: 1,
      bag: 1,
      bags: 1,
      set: 1,
      sets: 1,
    },
  },
  bunch: {
    base: "bunch",
    units: {
      bunch: 1,
      bunches: 1,
      bundle: 1,
      bundles: 1,
    },
  },
};

/**
 * Identify the category and conversion ratio to the category's base unit.
 */
const findUnitInfo = (unitStr) => {
  const cleaned = cleanUnit(unitStr);
  if (!cleaned) return null;

  for (const [category, def] of Object.entries(UNIT_DEFINITIONS)) {
    // Exact match in map
    if (def.units[cleaned] !== undefined) {
      return { category, ratioToBase: def.units[cleaned], key: cleaned };
    }

    // Word token match (e.g., "1 Litre (L)" or "Kilogram (kg)")
    const tokens = cleaned.split(" ");
    for (const token of tokens) {
      if (def.units[token] !== undefined) {
        return { category, ratioToBase: def.units[token], key: token };
      }
    }
  }

  return null;
};

/**
 * Converts a quantity from one unit to another.
 * 
 * Returns:
 * {
 *   success: boolean,
 *   convertedQty: number,
 *   fromUnit: string,
 *   toUnit: string,
 *   ratioUsed: number,
 *   error?: string
 * }
 */
const convertQuantity = (rawQty, fromUnitStr, toUnitStr) => {
  const qty = parseFloat(rawQty);
  if (isNaN(qty)) {
    return {
      success: false,
      convertedQty: 0,
      fromUnit: fromUnitStr,
      toUnit: toUnitStr,
      error: `Invalid quantity: ${rawQty}`,
    };
  }

  const cleanedFrom = cleanUnit(fromUnitStr);
  const cleanedTo = cleanUnit(toUnitStr);

  // If units are textually identical or empty, no conversion needed
  if (!cleanedFrom || !cleanedTo || cleanedFrom === cleanedTo) {
    return {
      success: true,
      convertedQty: qty,
      fromUnit: fromUnitStr || toUnitStr || "",
      toUnit: toUnitStr || fromUnitStr || "",
      ratioUsed: 1,
    };
  }

  const fromInfo = findUnitInfo(cleanedFrom);
  const toInfo = findUnitInfo(cleanedTo);

  // Case 1: Both belong to the same standard category (e.g. ml <-> Litre, Gram <-> Kg)
  if (fromInfo && toInfo && fromInfo.category === toInfo.category) {
    const qtyInBase = qty * fromInfo.ratioToBase;
    const converted = qtyInBase / toInfo.ratioToBase;
    // Round to max 6 decimal places to prevent floating point inaccuracies
    const rounded = Math.round(converted * 1e6) / 1e6;
    return {
      success: true,
      convertedQty: rounded,
      fromUnit: fromUnitStr,
      toUnit: toUnitStr,
      ratioUsed: fromInfo.ratioToBase / toInfo.ratioToBase,
    };
  }

  // Case 2: Flowers/Garlands: Bunch <-> Weight (Kg/Gram)
  // Temple standard: 1 bunch of flowers ≈ 0.25 kg (250 grams)
  if (fromInfo && toInfo) {
    if (fromInfo.category === "bunch" && toInfo.category === "weight") {
      const grams = qty * 250;
      const inTarget = grams / toInfo.ratioToBase;
      const rounded = Math.round(inTarget * 1e6) / 1e6;
      return {
        success: true,
        convertedQty: rounded,
        fromUnit: fromUnitStr,
        toUnit: toUnitStr,
        ratioUsed: 250 / toInfo.ratioToBase,
      };
    }
    if (fromInfo.category === "weight" && toInfo.category === "bunch") {
      const grams = qty * fromInfo.ratioToBase;
      const inBunches = grams / 250;
      const rounded = Math.round(inBunches * 1e6) / 1e6;
      return {
        success: true,
        convertedQty: rounded,
        fromUnit: fromUnitStr,
        toUnit: toUnitStr,
        ratioUsed: fromInfo.ratioToBase / 250,
      };
    }
  }

  // Case 3: Incompatible or unmapped units (e.g. Pieces vs Litres)
  // Return direct quantity as fallback without blocking if identical name
  return {
    success: false,
    convertedQty: qty,
    fromUnit: fromUnitStr,
    toUnit: toUnitStr,
    error: `Incompatible units: cannot convert from '${fromUnitStr}' to '${toUnitStr}'`,
  };
};

/**
 * Formats a quantity nicely with its unit, e.g. 0.25 -> "0.25 L", 250 -> "250 ml"
 */
const formatQuantity = (qty, unit) => {
  const num = typeof qty === "number" ? qty : parseFloat(qty);
  if (isNaN(num)) return `${qty} ${unit || ""}`.trim();
  const formattedNum = Number.isInteger(num) ? String(num) : num.toFixed(3).replace(/\.?0+$/, "");
  return `${formattedNum} ${unit || ""}`.trim();
};

/**
 * Checks if stock is sufficient, automatically converting units if needed.
 * 
 * Returns:
 * {
 *   isSufficient: boolean,
 *   availableStock: number,
 *   inventoryUnit: string,
 *   neededInInventoryUnit: number,
 *   requestedQuantity: number,
 *   requestedUnit: string,
 *   newStockAfterDeduction: number,
 *   details: string
 * }
 */
const checkStockWithConversion = ({
  availableStock,
  inventoryUnit,
  requestedQuantity,
  requestedUnit,
}) => {
  const avail = parseFloat(availableStock) || 0;
  const reqQty = parseFloat(requestedQuantity) || 0;

  const conv = convertQuantity(reqQty, requestedUnit, inventoryUnit);
  const neededInInv = conv.success ? conv.convertedQty : reqQty;

  const isSufficient = avail >= neededInInv;
  const newStock = Math.round(Math.max(0, avail - neededInInv) * 1e6) / 1e6;

  let details = "";
  if (!isSufficient) {
    if (conv.success && cleanUnit(requestedUnit) !== cleanUnit(inventoryUnit)) {
      details = `Insufficient inventory stock. Needed: ${formatQuantity(reqQty, requestedUnit)} (${formatQuantity(neededInInv, inventoryUnit)}), but only ${formatQuantity(avail, inventoryUnit)} is available in Central Inventory.`;
    } else {
      details = `Insufficient inventory stock. Needed: ${formatQuantity(reqQty, requestedUnit || inventoryUnit)}, but only ${formatQuantity(avail, inventoryUnit)} is available in Central Inventory.`;
    }
  }

  return {
    isSufficient,
    availableStock: avail,
    inventoryUnit: inventoryUnit || "",
    neededInInventoryUnit: neededInInv,
    requestedQuantity: reqQty,
    requestedUnit: requestedUnit || "",
    newStockAfterDeduction: newStock,
    converted: conv.success,
    details,
  };
};

module.exports = {
  cleanUnit,
  convertQuantity,
  formatQuantity,
  checkStockWithConversion,
};
