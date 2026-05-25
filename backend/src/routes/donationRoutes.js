const express = require("express");
const {
  createDonation,
  getAllDonations,
  getDonationStats,
  deleteDonation,
} = require("../controllers/donationController");

const router = express.Router();

router.post("/", createDonation);

router.get("/", getAllDonations);

router.get("/stats", getDonationStats);

router.delete("/:id", deleteDonation);

module.exports = router;