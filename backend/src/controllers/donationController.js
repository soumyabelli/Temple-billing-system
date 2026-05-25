const Donation = require("../models/Donation");

// CREATE DONATION
const createDonation = async (req, res) => {
  try {
    const {
      donorName,
      amount,
      category = "General",
      paymentMethod = "UPI",
      contactNumber,
      transactionId,
      notes,
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

    const donation = await Donation.create({
      donorName: donorName.trim(),
      contactNumber,
      amount: numericAmount,
      category,
      paymentMethod,
      transactionId,
      notes,
    });

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
    const donations = await Donation.find().sort({ createdAt: -1 });

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

    const totalAmount = donations.reduce(
      (acc, item) => acc + (Number(item.amount) || 0),
      0
    );

    const totalDonors = donations.length;

    const completed = donations.filter((d) => d.status === "Completed").length;
    const pending = donations.filter((d) => d.status === "Pending").length;

    res.status(200).json({
      success: true,
      stats: {
        totalAmount,
        totalDonors,
        completed,
        pending,
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

module.exports = {
  createDonation,
  getAllDonations,
  getDonationStats,
  deleteDonation,
};