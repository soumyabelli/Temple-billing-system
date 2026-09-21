const User = require("../models/User");
const Booking = require("../models/Booking");
const Bill = require("../models/Bill");

const cleanPhoneStr = (p) => String(p || "").replace(/\D/g, "").slice(-10);

/**
 * Given any devotee name, email, phone, or ID, find their registered devotee details.
 */
async function resolveDevoteeDetails({ name, email, phone, id, devoteeId }) {
  const result = {
    name: name ? String(name).trim() : "",
    email: email ? String(email).trim().toLowerCase() : "",
    phone: phone ? String(phone).trim() : "",
    address: "",
  };

  let user = null;
  const targetId = devoteeId || id;
  if (targetId && String(targetId).match(/^[0-9a-fA-F]{24}$/)) {
    user = await User.findById(targetId).select("name email phone address place role").lean();
  }

  if (!user && result.email) {
    user = await User.findOne({ email: result.email.toLowerCase() }).select("name email phone address place role").lean();
  }

  const cleanPhone = cleanPhoneStr(result.phone);
  if (!user && cleanPhone && cleanPhone.length >= 7) {
    user = await User.findOne({ phone: new RegExp(cleanPhone + "$") }).select("name email phone address place role").lean();
  }

  if (!user && result.name && result.name.toLowerCase() !== "devotee" && result.name.toLowerCase() !== "unknown" && result.name.toLowerCase() !== "anonymous") {
    user = await User.findOne({
      name: new RegExp(`^${result.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
      role: "devotee"
    }).select("name email phone address place role").lean();

    if (!user) {
      user = await User.findOne({
        name: new RegExp(`^${result.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")
      }).select("name email phone address place role").lean();
    }
  }

  if (user) {
    if (!result.name) result.name = user.name || "";
    if (!result.email) result.email = user.email || "";
    if (!result.phone) result.phone = user.phone || "";
    if (!result.address) result.address = user.address || user.place || "";
  }

  // If still missing address or phone or email, check previous bookings
  if ((!result.email || !result.phone || !result.address) && result.name) {
    const prevBooking = await Booking.findOne({
      devoteeName: new RegExp(`^${result.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
      $or: [
        { devoteeEmail: { $exists: true, $ne: "" } },
        { devoteePhone: { $exists: true, $ne: "" } },
        { devoteeAddress: { $exists: true, $ne: "" } },
        { address: { $exists: true, $ne: "" } }
      ]
    }).sort({ createdAt: -1 }).lean();

    if (prevBooking) {
      if (!result.email && prevBooking.devoteeEmail) result.email = prevBooking.devoteeEmail;
      if (!result.phone && (prevBooking.devoteePhone || prevBooking.contactNumber)) {
        result.phone = prevBooking.devoteePhone || prevBooking.contactNumber;
      }
      if (!result.address && (prevBooking.devoteeAddress || prevBooking.address)) {
        result.address = prevBooking.devoteeAddress || prevBooking.address;
      }
    }
  }

  return result;
}

/**
 * Builds an in-memory devotee lookup map from registered users for lightning-fast batch resolution.
 */
async function buildDevoteeLookupMap() {
  const users = await User.find().select("name email phone address place role").lean();

  const userByName = new Map();
  const userByEmail = new Map();
  const userByPhone = new Map();

  // Populate users (giving priority to role: "devotee")
  const sortedUsers = [...users].sort((a, b) => (a.role === "devotee" ? -1 : 1));

  sortedUsers.forEach((u) => {
    const cleanName = (u.name || "").trim().toLowerCase();
    const cleanMail = (u.email || "").trim().toLowerCase();
    const cleanP = cleanPhoneStr(u.phone);

    if (cleanName && !userByName.has(cleanName)) userByName.set(cleanName, u);
    if (cleanMail && !userByEmail.has(cleanMail)) userByEmail.set(cleanMail, u);
    if (cleanP && !userByPhone.has(cleanP)) userByPhone.set(cleanP, u);
  });

  return {
    findMatch({ name, email, phone }) {
      const cleanN = (name || "").trim().toLowerCase();
      const cleanM = (email || "").trim().toLowerCase();
      const cleanP = cleanPhoneStr(phone);

      let match = null;
      if (cleanM && userByEmail.has(cleanM)) match = userByEmail.get(cleanM);
      else if (cleanP && userByPhone.has(cleanP)) match = userByPhone.get(cleanP);
      else if (cleanN && userByName.has(cleanN)) match = userByName.get(cleanN);

      return match;
    },

    enrich(doc) {
      if (!doc) return doc;
      const name = doc.devoteeName || doc.donorName || "";
      const email = doc.devoteeEmail || doc.donorEmail || doc.email || "";
      const phone = doc.devoteePhone || doc.donorPhone || doc.contactNumber || doc.phone || "";
      const address = doc.devoteeAddress || doc.donorAddress || doc.address || "";

      const match = this.findMatch({ name, email, phone });
      if (match) {
        if (!doc.devoteeEmail && match.email) doc.devoteeEmail = match.email;
        if (!doc.devoteePhone && match.phone) doc.devoteePhone = match.phone;
        if (!doc.devoteeAddress && (match.address || match.place)) doc.devoteeAddress = match.address || match.place;
        if (doc.email === undefined && match.email) doc.email = match.email;
        if (doc.phone === undefined && match.phone) doc.phone = match.phone;
        if (doc.address === undefined && (match.address || match.place)) doc.address = match.address || match.place;
      }
      return doc;
    }
  };
}

/**
 * One-time or background sync to enrich all existing bills in MongoDB
 */
async function backfillExistingBills() {
  try {
    const resolver = await buildDevoteeLookupMap();
    const bills = await Bill.find({
      $or: [
        { devoteeEmail: { $exists: false } },
        { devoteeEmail: "" },
        { devoteeEmail: null },
        { devoteePhone: { $exists: false } },
        { devoteePhone: "" },
        { devoteePhone: null },
        { devoteeAddress: { $exists: false } },
        { devoteeAddress: "" },
        { devoteeAddress: null }
      ]
    });

    const bulkOps = [];
    for (const b of bills) {
      const beforeEmail = b.devoteeEmail;
      const beforePhone = b.devoteePhone;
      const beforeAddress = b.devoteeAddress;

      resolver.enrich(b);

      if (b.devoteeEmail !== beforeEmail || b.devoteePhone !== beforePhone || b.devoteeAddress !== beforeAddress) {
        bulkOps.push({
          updateOne: {
            filter: { _id: b._id },
            update: {
              $set: {
                devoteeEmail: b.devoteeEmail,
                devoteePhone: b.devoteePhone,
                devoteeAddress: b.devoteeAddress,
              }
            }
          }
        });
      }
    }

    if (bulkOps.length > 0) {
      await Bill.bulkWrite(bulkOps);
      console.log(`[devoteeLookup] Successfully backfilled ${bulkOps.length} bills with devotee details.`);
    }
  } catch (err) {
    console.error("[devoteeLookup] Failed to backfill bills:", err.message);
  }
}

module.exports = {
  resolveDevoteeDetails,
  buildDevoteeLookupMap,
  backfillExistingBills,
};
