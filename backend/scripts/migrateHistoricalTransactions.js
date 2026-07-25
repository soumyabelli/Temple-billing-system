require("dotenv").config();
const mongoose = require("mongoose");
const Donation = require("../src/models/Donation");
const PoojaBooking = require("../src/models/PoojaBooking");
const PrasadamOrder = require("../src/models/PrasadamOrder");
const AccountTransaction = require("../src/models/AccountTransaction");
const AccountHead = require("../src/models/AccountHead");

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for migration");

    const getFinancialYear = (date) => {
      const d = new Date(date);
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      if (month >= 4) {
        return `${year}-${year + 1}`;
      } else {
        return `${year - 1}-${year}`;
      }
    };

    let count = 0;

    const User = require("../src/models/User");
    const Employee = require("../src/models/Employee"); // Some schemas use Employee, some use User
    const adminUser = await User.findOne({ role: "admin" }) || await Employee.findOne({ role: "admin" });
    const fallbackUserId = adminUser ? adminUser._id : new mongoose.Types.ObjectId();

    const mapPaymentMethod = (pm) => {
      if (!pm) return "Cash";
      if (["Debit Card", "Credit Card"].includes(pm)) return "Card";
      if (pm === "Net Banking") return "Bank Transfer";
      if (["Cash", "UPI", "Card", "Bank Transfer", "Cheque", "System"].includes(pm)) return pm;
      return "System";
    };

    // 1. Migrate Donations
    const donations = await Donation.find({});
    for (const d of donations) {
      const exists = await AccountTransaction.findOne({ referenceId: d._id });
      if (!exists) {
        let accountHead = "Donation Income";
        const cat = (d.category || "").toLowerCase();
        if (cat.includes("annadanam")) accountHead = "Annadanam Fund";
        else if (cat.includes("goshala")) accountHead = "Goshala Fund";
        else if (cat.includes("building")) accountHead = "Building Fund";
        else if (cat.includes("hundi")) accountHead = "Hundi Collection";
        else if (cat.includes("festival")) accountHead = "Festival Income";

        await AccountTransaction.create({
          transactionType: "Credit",
          source: "Donation",
          category: accountHead,
          amount: d.amount,
          date: d.createdAt || new Date(),
          financialYear: getFinancialYear(d.createdAt || new Date()),
          paymentMethod: mapPaymentMethod(d.paymentMethod),
          status: "Completed",
          description: `Historical Donation from ${d.donorName}`,
          referenceId: d._id,
          referenceModel: "Donation",
          recordedBy: d.recordedBy || fallbackUserId
        });
        count++;
      }
    }

    // 2. Migrate Pooja Bookings
    const poojas = await PoojaBooking.find({});
    for (const p of poojas) {
      const exists = await AccountTransaction.findOne({ referenceId: p._id });
      if (!exists) {
        await AccountTransaction.create({
          transactionType: "Credit",
          source: "Pooja Booking",
          category: "Pooja Income",
          amount: p.amount,
          date: p.bookingDate || p.createdAt || new Date(),
          financialYear: getFinancialYear(p.bookingDate || p.createdAt || new Date()),
          paymentMethod: mapPaymentMethod(p.paymentMethod),
          status: "Completed",
          description: `Historical Pooja: ${p.service}`,
          referenceId: p._id,
          referenceModel: "PoojaBooking",
          recordedBy: p.createdBy || fallbackUserId
        });
        count++;
      }
    }

    // 3. Migrate Prasadam Orders
    const prasadams = await PrasadamOrder.find({});
    for (const p of prasadams) {
      const exists = await AccountTransaction.findOne({ referenceId: p._id });
      if (!exists) {
        await AccountTransaction.create({
          transactionType: "Credit",
          source: "Prasadam",
          category: "Prasadam Sales",
          amount: p.amount,
          date: p.orderDate || p.createdAt || new Date(),
          financialYear: getFinancialYear(p.orderDate || p.createdAt || new Date()),
          paymentMethod: mapPaymentMethod(p.paymentMethod),
          status: "Completed",
          description: `Historical Prasadam Order`,
          referenceId: p._id,
          referenceModel: "PrasadamOrder",
          recordedBy: p.cashierId || fallbackUserId
        });
        count++;
      }
    }

    console.log(`Successfully migrated ${count} historical transactions to AccountTransaction.`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrate();
