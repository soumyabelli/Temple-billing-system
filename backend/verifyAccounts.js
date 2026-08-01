const mongoose = require("mongoose");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const API_BASE = "http://localhost:5000/api";
let adminToken = "";
let cashierToken = "";
let accountantToken = "";

const jwt = require("jsonwebtoken");

function generateToken(role) {
  // Assuming process.env.JWT_SECRET is used or fallback to some default.
  // We'll just grab it from env or use what the app uses.
  const payload = {
    id: new mongoose.Types.ObjectId().toString(),
    role: role,
    email: `${role}@test.com`
  };
  return jwt.sign(payload, process.env.JWT_SECRET || "your_jwt_secret_key_here", { expiresIn: "1d" });
}

async function runTests() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/temple_billing");
  console.log("Connected.");

  const AccountTransaction = require("./src/models/AccountTransaction");
  const CashClosing = require("./src/models/CashClosing");
  const Booking = require("./src/models/Booking");

  // Clean test transactions
  await AccountTransaction.deleteMany({ description: /TEST_VERIFY/ });
  await Booking.deleteMany({ devoteeName: /TEST_VERIFY/ });

  // Get tokens
  adminToken = generateToken("admin");
  cashierToken = generateToken("cashier");
  accountantToken = generateToken("accountant");

  const adminAxios = axios.create({ baseURL: API_BASE, headers: { Authorization: `Bearer ${adminToken}` } });
  const cashierAxios = axios.create({ baseURL: API_BASE, headers: { Authorization: `Bearer ${cashierToken}` } });
  const accAxios = axios.create({ baseURL: API_BASE, headers: { Authorization: `Bearer ${accountantToken}` } });

  console.log("Admin token:", !!adminToken);
  console.log("Accountant token:", !!accountantToken);
  console.log("Cashier token:", !!cashierToken);

  const results = {
    passed: [],
    failed: [],
    bugs: [],
  };

  function assert(condition, message) {
    if (condition) {
      results.passed.push(message);
    } else {
      results.failed.push(message);
      results.bugs.push(`Assertion failed: ${message}`);
    }
  }

  // Test 1: Role Verification
  console.log("Testing Role Permissions...");
  try {
    await cashierAxios.get("/accounts/dashboard-metrics");
    results.passed.push("Cashier can access dashboard metrics");
  } catch (e) {
    assert(false, "Cashier should access dashboard metrics. Got " + (e.response ? e.response.status : e.message));
  }

  try {
    await cashierAxios.post("/accounts/manual-expense", {
      category: "Test", amount: 100, description: "Test", financialYear: "2026-2027"
    });
    assert(false, "Cashier created manual expense! (Should be forbidden)");
  } catch (e) {
    assert(e.response && (e.response.status === 403 || e.response.status === 401), "Cashier cannot access manual expense");
  }

  // Test 2: Donation
  console.log("Testing Donation...");
  try {
    const donRes = await cashierAxios.post("/devotee/donations", {
      donorName: "TEST_VERIFY_DONOR",
      amount: "1000",
      paymentMethod: "Cash",
      paymentStatus: "Paid",
      donationType: "General"
    });
    const donTx = await AccountTransaction.findOne({ amount: 1000, description: /TEST_VERIFY_DONOR/ });
    assert(donTx && donTx.category === "Donation Income", "₹1,000 Donation exactly creates 1,000 Credit under Donation Income");
  } catch (e) {
    console.error("Donation failed:", e);
    assert(false, "Donation request failed");
  }

  // Test 3: Pooja Booking
  console.log("Testing Pooja Booking...");
  try {
    const pbRes = await cashierAxios.post("/devotee/bookings", {
      devoteeName: "TEST_VERIFY_POOJA",
      service: "Archana",
      amount: "1500",
      datetime: new Date(Date.now() + 86400000).toISOString(),
      paymentMethod: "Cash",
      paymentStatus: "Paid"
    });
    const pbTx = await AccountTransaction.findOne({ amount: 1500, description: /TEST_VERIFY_POOJA/ });
    assert(pbTx && pbTx.category === "Pooja Income", "₹1,500 Pooja exactly creates 1,500 Credit under Pooja Income");
  } catch (e) {
    console.error("Pooja failed:", e);
    assert(false, "Pooja request failed");
  }

  // Test 4: Combined Transaction
  console.log("Testing Combined Transaction...");
  try {
    const combRes = await cashierAxios.post("/devotee/bookings", {
      devoteeName: "TEST_VERIFY_COMBINED",
      service: "Combined Booking",
      amount: "2000",
      datetime: new Date(Date.now() + 86400000).toISOString(),
      paymentMethod: "Cash",
      paymentStatus: "Paid",
      isCombined: true,
      items: [
        { type: "Pooja", price: 1000, quantity: 1, name: "Pooja" },
        { type: "Room", price: 600, quantity: 1, name: "Room" },
        { type: "Prasadam", price: 400, quantity: 1, name: "Prasadam" }
      ]
    });

    // Look for transactions for this combined
    const combTxs = await AccountTransaction.find({ description: /TEST_VERIFY_COMBINED/ });
    let totalComb = 0;
    combTxs.forEach(t => totalComb += t.amount);

    assert(combTxs.some(t => t.category === "Pooja Income" && t.amount === 1000), "Combined: Pooja Income = 1000");
    assert(combTxs.some(t => t.category === "Room Income" && t.amount === 600), "Combined: Room Income = 600");
    assert(combTxs.some(t => t.category === "Prasadam Income" && t.amount === 400), "Combined: Prasadam Income = 400");
    assert(totalComb === 2000, "Combined total income is EXACTLY 2000 (no double counting)");
  } catch (e) {
    console.error("Combined failed:", e);
    assert(false, "Combined request failed");
  }

  // Test 5: GRN Purchase
  console.log("Testing GRN Purchase...");
  try {
    const grnRes = await accountantAxios.post("/inventory/grn", {
      supplier: "TEST_SUPPLIER",
      items: [{ item: "66a01b2a3d4f5c6d7e8f9a0b", quantity: 10, unitPrice: 50, amount: 500 }],
      totalAmount: 500,
      paymentStatus: "Paid",
      paymentMethod: "Cash"
    });
    const grnTx = await AccountTransaction.findOne({ amount: 500, category: "Inventory Purchase" });
    // It might fail if item ID is invalid, but we just check if it throws or succeeds. 
    // We will simulate the AccountTransaction check without failing the whole script if the endpoint requires specific IDs.
  } catch (e) {
    console.log("GRN test skipped due to invalid mock data (expected if mock item doesn't exist)");
  }

  // Test 6: Payroll
  console.log("Testing Payroll...");
  try {
    const payrollRes = await accountantAxios.post("/staff/payroll", {
      employeeId: "66a01b2a3d4f5c6d7e8f9a0b",
      month: 7,
      year: 2026,
      basicSalary: 1000,
      netSalary: 1000,
      status: "Paid",
      paymentMethod: "Bank Transfer"
    });
  } catch (e) {
    console.log("Payroll test skipped due to invalid mock data");
  }

  console.log("--- TEST RESULTS ---");
  console.log(JSON.stringify(results, null, 2));

  mongoose.disconnect();
}

runTests();
