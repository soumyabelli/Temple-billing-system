const Bill = require("../models/Bill");
const { createStaffNotification } = require("../utils/notificationService");

const crypto = require("crypto");
const Razorpay = require("razorpay");

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
      items,
      amount,
      paymentMode,
      billDate,
      billType = "Other",
      referenceNo,
      sourceId,
      notes,
    } = req.body;

    if (!devoteeName || !amount) {
      return res.status(400).json({ message: "devoteeName and amount are required." });
    }

    if (!sevaType && (!items || items.length === 0)) {
      return res.status(400).json({ message: "Either sevaType or items are required." });
    }

    const numericAmount = Number(amount);
    const billStatus = "Paid";

    let finalRef = referenceNo;
    if (!finalRef) {
      finalRef = `BL-${Date.now().toString().slice(-6).toUpperCase()}`;
    }

    const bill = await Bill.create({
      devoteeName,
      sevaType,
      items,
      amount: numericAmount,
      paymentMode,
      billDate,
      billType,
      referenceNo: finalRef,
      sourceId,
      notes,
      status: billStatus,
    });

    if (hasKeys && isOnline) {
      const razorpayClient = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const orderOptions = {
        amount: Math.round(numericAmount * 100),
        currency: "INR",
        receipt: `bill_${Date.now()}`,
        payment_capture: 1,
      };

      const order = await razorpayClient.orders.create(orderOptions);
      bill.razorpayOrderId = order.id;
      await bill.save();

      return res.status(201).json({
        bill,
        order,
        key: process.env.RAZORPAY_KEY_ID || "",
        simulated: false,
      });
    }

    // Fire notification to cashier role for immediate payments
    createStaffNotification({
      title: `💰 New Bill Created`,
      message: `Bill for "${devoteeName}" — ${sevaType} — ₹${amount} (${paymentMode || "Cash"}) has been recorded.`,
      audienceRole: "cashier",
      category: "billing",
    }).catch(() => { });

    return res.status(201).json({
      bill,
      simulated: true,
    });
  } catch (error) {
    console.error("createBill error:", error);
    return res.status(500).json({ message: "Failed to create bill", error: error.message });
  }
};

const verifyBillPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, billId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing Razorpay verification fields." });
    }

    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "").update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid signature." });
    }

    let bill = null;
    if (billId) bill = await Bill.findById(billId);
    if (!bill) bill = await Bill.findOne({ razorpayOrderId: razorpay_order_id });
    if (!bill) return res.status(404).json({ error: "Bill not found." });

    bill.status = "Paid";
    bill.razorpayPaymentId = razorpay_payment_id;
    bill.razorpaySignature = razorpay_signature;
    await bill.save();

    // Fire notification to cashier role
    createStaffNotification({
      title: `💰 New Bill Created`,
      message: `Bill for "${bill.devoteeName}" — ${bill.sevaType} — ₹${bill.amount} (${bill.paymentMode || "UPI"}) has been recorded.`,
      audienceRole: "cashier",
      category: "billing",
    }).catch(() => { });

    return res.status(200).json({ success: true, bill });
  } catch (error) {
    console.error("verifyBillPayment error:", error);
    return res.status(500).json({ error: "Failed to verify bill payment." });
  }
};

const updateBillStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const bill = await Bill.findById(id);
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    bill.status = status || "Paid";
    await bill.save();

    return res.status(200).json({ success: true, bill });
  } catch (error) {
    console.error("updateBillStatus error:", error);
    return res.status(500).json({ message: "Failed to update bill status", error: error.message });
  }
};

module.exports = { getBills, createBill, verifyBillPayment, updateBillStatus };
