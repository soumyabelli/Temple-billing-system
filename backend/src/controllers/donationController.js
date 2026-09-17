const Donation = require("../models/Donation");
const Bill = require("../models/Bill");

// CREATE DONATION
const createDonation = async (req, res) => {
  try {
    const {
      donorName,
      donorEmail,
      amount,
      category = "General",
      paymentMethod = "UPI",
      contactNumber,
      transactionId,
      notes,
      status = "Collected",
    } = req.body;

    if (!donorName || !amount) {
      return res.status(400).json({
        success: false,
        message: "donorName and amount are required",
      });
    }

    if (contactNumber && !/^\+?[0-9\s-]{7,15}$/.test(contactNumber.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid contact number.",
      });
    }

    const numericAmount = Number(String(amount).replace(/[^0-9.-]+/g, ""));

    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid donation amount",
      });
    }

    const isOnline = paymentMethod && paymentMethod !== "Cash";
    const finalTxnId = isOnline
      ? (transactionId && transactionId.trim() !== "" ? transactionId.trim() : `pay_${Date.now()}`)
      : undefined;
    const finalStatus = (status === "Completed" || status === "Collected") ? "Collected" : status;

    const donation = await Donation.create({
      donorName: donorName.trim(),
      donorEmail: donorEmail ? String(donorEmail).trim().toLowerCase() : undefined,
      contactNumber,
      amount: numericAmount,
      category,
      paymentMethod,
      transactionId: finalTxnId,
      notes,
      status: finalStatus,
    });

    await Bill.create({
      devoteeName: donorName.trim(),
      sevaType: category || "General",
      amount: numericAmount,
      paymentMode: paymentMethod || "UPI",
      billType: "Donation",
      referenceNo: `DN-${String(donation._id).slice(-6).toUpperCase()}`,
      sourceId: donation._id.toString(),
      notes: notes || "",
      status: finalStatus === "Collected" ? "Paid" : "Pending",
      billDate: new Date(),
    });

    if (status === "Completed" || status === "Collected") {
      const { recordTransaction } = require("../services/accountingService");

      // Determine Fund based on category
      let accountHead = "Donation Income";
      const cat = (category || "").toLowerCase();
      if (cat.includes("annadan") || cat.includes("annadanam")) accountHead = "Annadanam Donation";
      else if (cat.includes("hundi")) accountHead = "Hundi Collection";
      else if (cat.includes("festival")) accountHead = "Festival Income";
      else if (cat.includes("general")) accountHead = "Donation Income";

      await recordTransaction({
        transactionType: "Credit",
        source: "Donation",
        category: accountHead,
        amount: numericAmount,
        paymentMethod: paymentMethod || "UPI",
        description: `Donation by ${donorName.trim()}${notes ? ' - ' + notes : ''}`,
        referenceId: donation._id,
        referenceModel: "Donation",
        recordedBy: req.user ? req.user.id : null,
        status: "Completed"
      });
    }

    res.status(201).json({
      success: true,
      message: "Donation added successfully",
      donation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// GET ALL DONATIONS
const getAllDonations = async (req, res) => {
  try {
    const rawDonations = await Donation.find().sort({ createdAt: -1 });

    const donations = rawDonations.map((d) => {
      const item = d.toObject ? d.toObject() : { ...d };
      const isOnline = item.paymentMethod && item.paymentMethod !== "Cash";
      
      // Normalize Completed -> Collected
      if (item.status === "Completed") {
        item.status = "Collected";
      }

      // Ensure online payments have a transactionId
      if (isOnline && (!item.transactionId || item.transactionId.trim() === "" || item.transactionId === "—")) {
        item.transactionId = item.razorpayPaymentId || (item.razorpayOrderId ? item.razorpayOrderId.replace(/^order_/, "pay_") : `pay_${String(item._id).slice(-14)}`);
      }

      // Cash payments don't have online transaction IDs
      if (!isOnline) {
        item.transactionId = undefined;
      }

      return item;
    });

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET DASHBOARD STATS
const getDonationStats = async (req, res) => {
  try {
    const donations = await Donation.find();

    const collectedDonations = donations.filter((d) => d.status === "Collected" || d.status === "Completed");
    const totalAmount = collectedDonations.reduce(
      (acc, item) => acc + (Number(item.amount) || 0),
      0
    );

    const totalDonors = donations.length;

    const collected = collectedDonations.length;
    const notCollected = donations.filter((d) => d.status === "Not Collected" || d.status === "Pending").length;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(currentYear, currentMonth, 1);

    const monthDonations = collectedDonations.filter((d) => {
      const dt = new Date(d.createdAt || d.date);
      return dt >= startOfMonth;
    });
    const currentMonthAmount = monthDonations.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    const currentMonthDonors = monthDonations.length;

    const todayDonations = collectedDonations.filter((d) => {
      const dt = new Date(d.createdAt || d.date);
      return dt >= startOfToday;
    });
    const todayAmount = todayDonations.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    const todayDonors = todayDonations.length;

    res.status(200).json({
      success: true,
      stats: {
        totalAmount,
        totalDonors,
        currentMonthAmount,
        currentMonthDonors,
        todayAmount,
        todayDonors,
        completed: collected,
        collected,
        pending: notCollected,
        notCollected,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE DONATION
const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    await donation.deleteOne();
    await Bill.deleteMany({ sourceId: donation._id.toString() });

    res.status(200).json({
      success: true,
      message: "Donation deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE DONATION STATUS
const updateDonationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    const previousStatus = donation.status;
    const normalizedStatus = (status === "Collected" || status === "Completed") ? "Collected" : "Not Collected";
    donation.status = normalizedStatus;
    await donation.save();

    // Sync bill ledger status as well
    await Bill.updateMany(
      { sourceId: donation._id.toString() },
      { $set: { status: normalizedStatus === "Collected" ? "Paid" : "Pending" } }
    );

    if (previousStatus !== normalizedStatus && normalizedStatus === "Collected") {
      const { recordTransaction } = require("../services/accountingService");

      // Determine Fund based on category
      let accountHead = "Donation Income";
      const cat = (donation.category || "").toLowerCase();
      if (cat.includes("annadan") || cat.includes("annadanam")) accountHead = "Annadanam Donation";
      else if (cat.includes("hundi")) accountHead = "Hundi Collection";
      else if (cat.includes("festival")) accountHead = "Festival Income";
      else if (cat.includes("general")) accountHead = "Donation Income";

      await recordTransaction({
        transactionType: "Credit",
        source: "Donation",
        category: accountHead,
        amount: donation.amount,
        paymentMethod: donation.paymentMethod,
        description: `Donation by ${donation.donorName}`,
        referenceId: donation._id,
        referenceModel: "Donation",
        recordedBy: req.user ? req.user.id : donation.donatedBy,
        status: "Completed"
      });
    }

    res.status(200).json({
      success: true,
      message: "Donation status updated successfully",
      donation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createDonation,
  getAllDonations,
  getDonationStats,
  deleteDonation,
  updateDonationStatus,
};
