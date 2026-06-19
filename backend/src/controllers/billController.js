const Bill = require("../models/Bill");

const getBills = async (req, res) => {
  try {
    const bills = await Bill.find().sort({ billDate: -1 });
    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bills", error: error.message });
  }
};

const createBill = async (req, res) => {
  try {
    const {
      devoteeName,
      sevaType,
      amount,
      paymentMode,
      billDate,
      billType = "Other",
      referenceNo,
      sourceId,
      notes,
      status = "Paid",
    } = req.body;

    if (!devoteeName || !sevaType || !amount) {
      return res.status(400).json({ message: "devoteeName, sevaType and amount are required." });
    }

    const bill = await Bill.create({
      devoteeName,
      sevaType,
      amount,
      paymentMode,
      billDate,
      billType,
      referenceNo,
      sourceId,
      notes,
      status,
    });
    return res.status(201).json(bill);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create bill", error: error.message });
  }
};

module.exports = { getBills, createBill };
