const express = require("express");
const { getBills, createBill } = require("../controllers/billController");

const router = express.Router();

router.get("/", getBills);
router.post("/", createBill);

module.exports = router;

