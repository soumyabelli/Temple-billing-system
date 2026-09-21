const {
  generateBookingReceiptPDF,
  generateDonationReceiptPDF,
  generatePrasadamReceiptPDF,
  generateRoomBookingReceiptPDF,
  generateBillReceiptPDF,
} = require("../src/utils/pdfGenerator");
const { normalizeReceiptData } = require("../src/utils/receiptNormalizer");
const { generateReceiptHTML } = require("../src/utils/receiptHtmlTemplate");
const fs = require("fs");
const path = require("path");

async function verifyAll() {
  console.log("=== Testing Receipt Normalization, HTML Generation, and PDF Rendering ===");

  const sampleDevotee = {
    name: "Ashwitha Naik",
    email: "naikashwitha08@gmail.com",
    phone: "8095146883",
    address: "Kapu, Udupi - 574106",
  };

  const sampleCombinedBooking = {
    referenceNo: "BK-8CE682",
    datetime: "2026-09-21T14:30:00.000Z",
    paymentMethod: "Cash",
    isCombined: true,
    tenderedCash: 1012,
    returnedChange: 0,
    items: [
      { type: "Pooja", name: "Maha Ganapathi Homam", qty: 1, amount: 750, date: "2026-09-21" },
      { type: "Prasadam", name: "Special Laddu Prasadam", qty: 1, amount: 151, date: "2026-09-21" },
      { type: "Donation", name: "Annadanam Nithya Seva", qty: 1, amount: 111, date: "2026-09-21" },
    ],
    notes: "Please arrive at the temple sanctum 15 minutes before pooja starts.",
  };

  // 1. Test Normalizer
  const normalized = normalizeReceiptData(sampleDevotee, sampleCombinedBooking, "pooja");
  console.log("✓ normalizeReceiptData success:", {
    receiptNo: normalized.receiptNo,
    grandTotal: normalized.grandTotal,
    amountInWords: normalized.amountInWords,
    poojaCount: normalized.allPooja.length,
    prasadamCount: normalized.allPrasadam.length,
    donationCount: normalized.allDonations.length,
    devoteeName: normalized.devotee.name,
    devoteeAddress: normalized.devotee.address,
  });

  if (normalized.grandTotal !== 1012) {
    throw new Error(`Expected grandTotal 1012, got ${normalized.grandTotal}`);
  }
  if (!normalized.amountInWords.includes("One Thousand Twelve")) {
    throw new Error(`Expected amountInWords to contain 'One Thousand Twelve', got ${normalized.amountInWords}`);
  }

  // 2. Test HTML Generation
  const html = generateReceiptHTML(normalized);
  console.log(`✓ generateReceiptHTML success: generated ${html.length} characters of HTML`);
  if (!html.includes("SRI SHANTI MAHADEV MANDIR")) throw new Error("HTML missing Temple Name");
  if (!html.includes("BK-8CE682")) throw new Error("HTML missing Receipt No");
  if (!html.includes("Ashwitha Naik")) throw new Error("HTML missing Devotee Name");
  if (!html.includes("Kapu, Udupi")) throw new Error("HTML missing Devotee Address");
  if (!html.includes("Maha Ganapathi Homam")) throw new Error("HTML missing Pooja Item");
  if (!html.includes("Special Laddu Prasadam")) throw new Error("HTML missing Prasadam Item");
  if (!html.includes("Annadanam Nithya Seva")) throw new Error("HTML missing Donation Item");
  if (!html.includes("One Thousand Twelve Rupees Only")) throw new Error("HTML missing words amount");

  // Save HTML sample to artifact scratch dir for review
  const scratchDir = path.join(__dirname, "../../.system_generated/scratch");
  try {
    if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
    fs.writeFileSync(path.join(scratchDir, "sample_receipt.html"), html);
    console.log("✓ Saved sample_receipt.html");
  } catch (_) {}

  // 3. Test PDF Generation for Booking (Combined)
  const bookingPdf = await generateBookingReceiptPDF(sampleDevotee, sampleCombinedBooking);
  console.log(`✓ generateBookingReceiptPDF success: generated ${bookingPdf.length} bytes`);

  // 4. Test Single Donation PDF
  const donationPdf = await generateDonationReceiptPDF(sampleDevotee, {
    referenceNo: "DN-100200",
    category: "Temple Renovation Fund",
    amount: 5000,
    paymentMethod: "UPI",
    transactionId: "UPI/987654321",
  });
  console.log(`✓ generateDonationReceiptPDF success: generated ${donationPdf.length} bytes`);

  // 5. Test Single Prasadam PDF
  const prasadamPdf = await generatePrasadamReceiptPDF(sampleDevotee, {
    referenceNo: "PR-300400",
    itemName: "Panchamrutha Prasadam",
    quantity: 5,
    amount: 250,
    paymentMethod: "Cash",
  });
  console.log(`✓ generatePrasadamReceiptPDF success: generated ${prasadamPdf.length} bytes`);

  // 6. Test Single Room Booking PDF
  const roomPdf = await generateRoomBookingReceiptPDF(sampleDevotee, {
    referenceNo: "RM-500600",
    service: "AC Guest Room 204",
    checkinDate: "2026-09-25",
    checkoutDate: "2026-09-27",
    days: 2,
    amount: 1800,
    paymentMethod: "UPI",
  });
  console.log(`✓ generateRoomBookingReceiptPDF success: generated ${roomPdf.length} bytes`);

  // 7. Test Bill PDF
  const billPdf = await generateBillReceiptPDF(sampleDevotee, {
    referenceNo: "RC-700800",
    paymentMode: "Cash",
    amount: 1012,
    items: sampleCombinedBooking.items,
  });
  console.log(`✓ generateBillReceiptPDF success: generated ${billPdf.length} bytes`);

  console.log("\nALL VERIFICATION TESTS PASSED SUCCESSFULLY! ✨");
}

verifyAll().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
