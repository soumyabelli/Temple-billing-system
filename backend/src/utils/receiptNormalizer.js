const { numberToWordsINR } = require("./numberToWords");

function formatReceiptDate(d) {
  if (!d || d === "-" || d === "Invalid Date") {
    return new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  const parsed = new Date(d);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  return String(d).trim();
}

function formatReceiptDateTime(d) {
  if (!d || d === "-" || d === "Invalid Date") {
    return new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) + ", " + new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
  const parsed = new Date(d);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) + ", " + parsed.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
  return String(d).trim();
}

function resolveItemAmount(item) {
  const rawAmt = Number(item.amount);
  if (!isNaN(rawAmt) && rawAmt > 0) return rawAmt;
  const qty = Number(item.qty || item.quantity || 1);
  const price = Number(item.price);
  if (!isNaN(price) && price > 0) return price * qty;
  return 0;
}

/**
 * Normalizes input from bookings, bills, donations, room allotments, or prasadam orders
 * into a single unified receipt data structure that matches BookingReceipt.jsx
 */
function normalizeReceiptData(devotee = {}, details = {}, typeHint = "") {
  const isPlainCash =
    details.paymentMethod === "Cash" ||
    details.paymentMode === "Cash" ||
    details.payMode === "Cash" ||
    details.paymentMode === "Offline" ||
    details.isCashierBill === true;

  const isOnline = details.isOnline !== undefined
    ? Boolean(details.isOnline)
    : !isPlainCash;

  const receiptNo =
    details.referenceNo ||
    details.receiptNumber ||
    details.receiptNo ||
    details.orderNumber ||
    (details._id ? `REC-${String(details._id).slice(-8).toUpperCase()}` : `REC-${Date.now().toString().slice(-8)}`);

  const rawBookingDate =
    details.datetime ||
    details.bookingDate ||
    details.billDate ||
    details.createdAt ||
    details.date;
  const bookingDate = formatReceiptDateTime(rawBookingDate);

  const paymentMode =
    details.paymentMode ||
    details.paymentMethod ||
    details.payMode ||
    (isOnline ? "UPI" : "Cash");

  const transactionId =
    paymentMode === "Cash" || paymentMode === "Offline"
      ? "Offline Payment"
      : (details.transactionId || details.paymentId || (isOnline ? "UPI Payment" : "-"));

  const cashierName =
    details.cashierName ||
    details.cashier ||
    (!isOnline ? "Counter Staff" : "");

  // Devotee details
  const name =
    devotee.name ||
    details.devoteeName ||
    details.donorName ||
    details.guestName ||
    "Devotee";

  const phone =
    (devotee.phone && devotee.phone !== "-") ? devotee.phone :
    (details.devoteePhone && details.devoteePhone !== "-") ? details.devoteePhone :
    (details.donorPhone && details.donorPhone !== "-") ? details.donorPhone :
    (details.contactNumber && details.contactNumber !== "-") ? details.contactNumber :
    (details.phone && details.phone !== "-") ? details.phone : "-";

  const email =
    (devotee.email && devotee.email !== "-") ? devotee.email :
    (details.devoteeEmail && details.devoteeEmail !== "-") ? details.devoteeEmail :
    (details.donorEmail && details.donorEmail !== "-") ? details.donorEmail :
    (details.email && details.email !== "-") ? details.email : "-";

  const address =
    (devotee.address && devotee.address !== "-") ? devotee.address :
    (devotee.place && devotee.place !== "-") ? devotee.place :
    (details.devoteeAddress && details.devoteeAddress !== "-") ? details.devoteeAddress :
    (details.donorAddress && details.donorAddress !== "-") ? details.donorAddress :
    (details.address && details.address !== "-") ? details.address : "-";

  // Item categorization
  let allPooja = [...(details.poojaBookings || [])];
  let allPrasadam = [...(details.prasadamOrders || [])];
  let allRooms = [...(details.roomBookings || [])];
  let allDonations = [...(details.donations || [])];

  const incomingItems = details.items || [];

  if (incomingItems.length > 0 && allPooja.length === 0 && allPrasadam.length === 0 && allRooms.length === 0 && allDonations.length === 0) {
    incomingItems.forEach((item, idx) => {
      const type = String(item.type || item.itemType || item.catalogType || "").toLowerCase();
      const itemName = item.name || item.itemName || item.service || item.description || "Service Item";
      const itemDate = formatReceiptDate(item.date || rawBookingDate);
      const itemQty = item.qty || item.quantity || 1;
      const itemAmount = resolveItemAmount(item);
      const rowItem = { slNo: idx + 1, name: itemName, date: itemDate, qty: itemQty, amount: itemAmount };

      if (type.includes("room") || type.includes("accommodation") || itemName.toLowerCase().includes("room") || itemName.toLowerCase().includes("suite") || itemName.toLowerCase().includes("cottage") || itemName.toLowerCase().includes("dormitory")) {
        allRooms.push(rowItem);
      } else if (type.includes("prasad") || itemName.toLowerCase().includes("prasadam") || itemName.toLowerCase().includes("laddu")) {
        allPrasadam.push(rowItem);
      } else if (type.includes("donat") || itemName.toLowerCase().includes("donation") || itemName.toLowerCase().includes("fund") || itemName.toLowerCase().includes("annadanam")) {
        allDonations.push(rowItem);
      } else {
        allPooja.push(rowItem);
      }
    });
  }

  // Handle single type items when no items array was passed
  if (allPooja.length === 0 && allPrasadam.length === 0 && allRooms.length === 0 && allDonations.length === 0) {
    const hint = (typeHint || "").toLowerCase();
    const serviceName = details.service || details.sevaType || details.itemName || details.item || details.category || "Temple Offering";
    const serviceDate = formatReceiptDate(details.datetime || details.checkinDate || details.date || rawBookingDate);
    const serviceQty = details.quantity || details.qty || details.days || 1;
    const serviceAmount = Number(details.amount) || 0;

    const singleRow = {
      slNo: 1,
      name: serviceName,
      date: serviceDate,
      qty: serviceQty,
      amount: serviceAmount,
    };

    if (hint.includes("room") || serviceName.toLowerCase().includes("room") || details.checkinDate) {
      allRooms.push(singleRow);
    } else if (hint.includes("prasad") || serviceName.toLowerCase().includes("prasadam")) {
      allPrasadam.push(singleRow);
    } else if (hint.includes("donat") || serviceName.toLowerCase().includes("donation") || details.category) {
      allDonations.push(singleRow);
    } else {
      allPooja.push(singleRow);
    }
  }

  // Recalculate sequential serial numbers and proper amounts
  allPooja = allPooja.map((item, idx) => ({
    ...item,
    slNo: idx + 1,
    date: formatReceiptDate(item.date || rawBookingDate),
    amount: resolveItemAmount(item),
  }));
  allPrasadam = allPrasadam.map((item, idx) => ({
    ...item,
    slNo: idx + 1,
    date: formatReceiptDate(item.date || rawBookingDate),
    amount: resolveItemAmount(item),
  }));
  allRooms = allRooms.map((item, idx) => ({
    ...item,
    slNo: idx + 1,
    date: formatReceiptDate(item.date || details.checkinDate || rawBookingDate),
    amount: resolveItemAmount(item),
  }));
  allDonations = allDonations.map((item, idx) => ({
    ...item,
    slNo: idx + 1,
    date: formatReceiptDate(item.date || rawBookingDate),
    amount: resolveItemAmount(item),
  }));

  const allItems = [...allPooja, ...allPrasadam, ...allRooms, ...allDonations];
  const calculatedTotal = allItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const subTotal = Number(details.subTotal) > 0 ? Number(details.subTotal) : calculatedTotal;
  const templeCharges = Number(details.templeCharges || 0);
  const grandTotal = Number(details.grandTotal) > 0 ? Number(details.grandTotal) : (Number(details.amount) > 0 ? Number(details.amount) : (subTotal + templeCharges));

  const cashReceived = details.cashReceived != null ? Number(details.cashReceived) : (details.tenderedCash != null ? Number(details.tenderedCash) : null);
  const changeReturned = details.changeReturned != null ? Number(details.changeReturned) : (details.returnedChange != null ? Number(details.returnedChange) : null);

  const amountInWords = details.amountInWords || numberToWordsINR(grandTotal);

  const devoteeMaterials = details.devoteeMaterials || [];
  const templeMaterials = details.templeMaterials || [];

  const defaultNotes = [
    "Please report 15 minutes before the Pooja time.",
    "Pooja once booked will not be cancelled.",
    "Prasadam will be provided after Pooja.",
  ];

  let notes = defaultNotes;
  if (Array.isArray(details.notes) && details.notes.length > 0) {
    notes = details.notes;
  } else if (typeof details.notes === "string" && details.notes.trim()) {
    notes = [details.notes.trim(), ...defaultNotes.slice(1)];
  }

  return {
    isOnline,
    receiptNo,
    bookingDate,
    paymentMode,
    transactionId,
    cashierName,
    devotee: {
      name,
      phone,
      email,
      address,
    },
    allPooja,
    allPrasadam,
    allRooms,
    allDonations,
    subTotal,
    templeCharges,
    grandTotal,
    cashReceived,
    changeReturned,
    amountInWords,
    devoteeMaterials,
    templeMaterials,
    notes,
  };
}

module.exports = {
  normalizeReceiptData,
  formatReceiptDate,
  formatReceiptDateTime,
};
