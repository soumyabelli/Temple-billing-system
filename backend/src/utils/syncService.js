const Bill = require("../models/Bill");
const Booking = require("../models/Booking");
const Donation = require("../models/Donation");
const PrasadamOrder = require("../models/PrasadamOrder");

const syncLedgerBills = async () => {
  try {
    console.log("Starting financial ledger synchronization...");

    const { resolveDevoteeDetails, backfillExistingBills } = require("./devoteeLookup");

    // 1. Sync Bookings
    const bookings = await Booking.find();
    let bookingCount = 0;
    for (const b of bookings) {
      const existing = await Bill.findOne({ sourceId: b._id.toString() });
      if (!existing) {
        const resolved = await resolveDevoteeDetails({
          name: b.devoteeName,
          email: b.devoteeEmail,
          phone: b.devoteePhone || b.contactNumber,
          devoteeId: b.devoteeId,
        });

        const formattedItems = (b.items || []).map((i) => ({
          itemName: i.name || i.service || i.itemName || "Item",
          itemType: String(i.type || i.itemType || "Pooja").charAt(0).toUpperCase() + String(i.type || i.itemType || "Pooja").slice(1),
          amount: Number(i.amount || 0),
          quantity: Number(i.qty || i.quantity || 1),
        }));

        await Bill.create({
          devoteeName: b.devoteeName || resolved.name || "Unknown",
          devoteeEmail: b.devoteeEmail || resolved.email || undefined,
          devoteePhone: b.devoteePhone || b.contactNumber || resolved.phone || undefined,
          devoteeAddress: b.devoteeAddress || b.address || resolved.address || undefined,
          sevaType: b.service || "Pooja Seva",
          items: formattedItems,
          amount: b.amount || 0,
          paymentMode: b.paymentMethod || "UPI",
          billType: b.isCombined ? "Combined Order" : "Pooja Booking",
          referenceNo: `BK-${String(b._id).slice(-6).toUpperCase()}`,
          sourceId: b._id.toString(),
          notes: b.notes || "",
          status: "Paid",
          billDate: b.createdAt || b.datetime || new Date(),
        });
        bookingCount++;
      }
    }
    if (bookingCount > 0) {
      console.log(`Synced ${bookingCount} missing bills for bookings.`);
    }

    // 2. Sync Donations
    const donations = await Donation.find();
    let donationCount = 0;
    for (const d of donations) {
      const existing = await Bill.findOne({ sourceId: d._id.toString() });
      if (!existing) {
        const resolved = await resolveDevoteeDetails({
          name: d.donorName,
          email: d.donorEmail,
          phone: d.donorPhone || d.contactNumber,
          id: d.donatedBy,
        });

        await Bill.create({
          devoteeName: d.donorName || resolved.name || "Anonymous",
          devoteeEmail: d.donorEmail || resolved.email || undefined,
          devoteePhone: d.donorPhone || d.contactNumber || resolved.phone || undefined,
          devoteeAddress: d.donorAddress || d.address || resolved.address || undefined,
          sevaType: d.category || "General",
          amount: d.amount || 0,
          paymentMode: d.paymentMethod || "UPI",
          billType: "Donation",
          referenceNo: `DN-${String(d._id).slice(-6).toUpperCase()}`,
          sourceId: d._id.toString(),
          notes: d.notes || "",
          status: "Paid",
          billDate: d.createdAt || new Date(),
        });
        donationCount++;
      }
    }
    if (donationCount > 0) {
      console.log(`Synced ${donationCount} missing bills for donations.`);
    }

    // 3. Sync Prasadam Orders
    const orders = await PrasadamOrder.find();
    let orderCount = 0;
    for (const o of orders) {
      const existing = await Bill.findOne({ sourceId: o._id.toString() });
      if (!existing) {
        const resolved = await resolveDevoteeDetails({
          name: o.devoteeName,
          email: o.email,
          phone: o.phone,
          devoteeId: o.devoteeId,
        });

        await Bill.create({
          devoteeName: o.devoteeName || resolved.name || "Unknown",
          devoteeEmail: o.email || resolved.email || undefined,
          devoteePhone: o.phone || resolved.phone || undefined,
          devoteeAddress: o.address || resolved.address || undefined,
          sevaType: o.itemName || "Prasadam",
          amount: o.amount || 0,
          paymentMode: o.paymentMethod || "UPI",
          billType: "Prasadam Sale",
          referenceNo: `PR-${String(o._id).slice(-6).toUpperCase()}`,
          sourceId: o._id.toString(),
          notes: `Quantity: ${o.quantity || 1}, Unit Price: ${o.unitPrice || 0}`,
          status: "Paid",
          billDate: o.createdAt || new Date(),
        });
        orderCount++;
      }
    }
    if (orderCount > 0) {
      console.log(`Synced ${orderCount} missing bills for prasadam orders.`);
    }

    // 4. Backfill any existing bills that are missing devotee details
    await backfillExistingBills();

    console.log("Financial ledger synchronization completed.");
  } catch (error) {
    console.error("Error during financial ledger synchronization:", error);
  }
};

module.exports = { syncLedgerBills };
