const {
  generateBookingReceiptPDF,
  generateDonationReceiptPDF,
  generatePrasadamReceiptPDF,
  generateRoomBookingReceiptPDF,
  generateBillReceiptPDF,
} = require("../src/utils/pdfGenerator");
const fs = require("fs");
const path = require("path");

async function runTests() {
  console.log("=== Testing Backend PDF Generators ===");

  const sampleDevotee = {
    name: "Ramesh Sharma",
    email: "ramesh.sharma@example.com",
    phone: "9876543210",
  };

  // 1. Consolidated Bill PDF with all 4 categories (Pooja, Prasadam, Room, Donation)
  const sampleBill = {
    referenceNo: "RC-TEST101",
    billDate: new Date(),
    paymentMode: "UPI",
    amount: 3200,
    devoteeName: sampleDevotee.name,
    devoteePhone: sampleDevotee.phone,
    devoteeEmail: sampleDevotee.email,
    items: [
      { itemType: "Pooja", itemName: "Maha Rudra Abhishekam", quantity: 1, amount: 1500 },
      { itemType: "Prasadam", itemName: "Special Laddu Prasadam Box", quantity: 2, amount: 200 },
      { itemType: "Room", itemName: "Dharmashala AC Deluxe (Room 102 - 2 Days)", quantity: 1, amount: 1000 },
      { itemType: "Donation", itemName: "Annadanam Nithya Seva Offering", quantity: 1, amount: 500 },
    ],
    notes: "Combined booking via counter / portal.",
  };

  const billPdf = await generateBillReceiptPDF(sampleDevotee, sampleBill);
  console.log(`✓ generateBillReceiptPDF: generated ${billPdf.length} bytes (starts with: ${billPdf.slice(0, 5).toString()})`);

  // 2. Booking PDF with items
  const bookingPdf = await generateBookingReceiptPDF(sampleDevotee, {
    referenceNo: "BK-TEST202",
    datetime: new Date().toISOString(),
    amount: 1700,
    isCombined: true,
    paymentMethod: "UPI",
    items: [
      { type: "Pooja", name: "Navagraha Shanti", quantity: 1, price: 1500, amount: 1500 },
      { type: "Prasadam", name: "Puliyogare Packets", quantity: 2, price: 100, amount: 200 },
    ],
  });
  console.log(`✓ generateBookingReceiptPDF: generated ${bookingPdf.length} bytes`);

  // 3. Room Booking PDF
  const roomPdf = await generateRoomBookingReceiptPDF(sampleDevotee, {
    referenceNo: "RM-TEST303",
    service: "Room Allotment: Room 105 (Deluxe)",
    checkinDate: new Date(),
    checkoutDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    days: 2,
    amount: 1600,
    paymentMethod: "Cash",
  });
  console.log(`✓ generateRoomBookingReceiptPDF: generated ${roomPdf.length} bytes`);

  // 4. Donation PDF
  const donationPdf = await generateDonationReceiptPDF(sampleDevotee, {
    referenceNo: "DN-TEST404",
    amount: 2500,
    category: "Temple Renovation",
    paymentMethod: "UPI",
    transactionId: "pay_XYZ98765",
  });
  console.log(`✓ generateDonationReceiptPDF: generated ${donationPdf.length} bytes`);

  // 5. Prasadam PDF
  const prasadamPdf = await generatePrasadamReceiptPDF(sampleDevotee, {
    referenceNo: "PR-TEST505",
    itemName: "Panchamrutham Pack",
    quantity: 4,
    amount: 400,
    paymentMethod: "Cash",
  });
  console.log(`✓ generatePrasadamReceiptPDF: generated ${prasadamPdf.length} bytes`);

  console.log("\n All 5 PDF Generator tests passed successfully!");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
