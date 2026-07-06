const express = require("express");
const { getBills, createBill, verifyBillPayment } = require("../controllers/billController");

const router = express.Router();

router.get("/", getBills);
router.post("/", createBill);
router.post("/verify", verifyBillPayment);

module.exports = router;