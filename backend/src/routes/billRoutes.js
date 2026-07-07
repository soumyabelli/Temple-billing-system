const express = require("express");
const { getBills, createBill, verifyBillPayment, updateBillStatus } = require("../controllers/billController");

const router = express.Router();

router.get("/", getBills);
router.post("/", createBill);
router.post("/verify", verifyBillPayment);
router.patch("/:id/status", updateBillStatus);

module.exports = router;