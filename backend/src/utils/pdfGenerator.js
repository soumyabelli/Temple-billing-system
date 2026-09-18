const PDFDocument = require("pdfkit");

/**
 * Common layout helper for creating temple receipts
 */
const renderHeader = (doc, title) => {
  doc
    .fillColor("#b46a13")
    .fontSize(18)
    .font("Helvetica-Bold")
    .text("SRI SHANTI MAHADEV MANDIR", { align: "center" })
    .moveDown(0.2);

  doc
    .fillColor("#555555")
    .fontSize(10)
    .font("Helvetica")
    .text("Temple Devotee Services • Official E-Receipt", { align: "center" })
    .moveDown(0.3);

  doc
    .fillColor("#ea580c")
    .fontSize(14)
    .font("Helvetica-Bold")
    .text(title, { align: "center" })
    .moveDown(0.5);

  doc
    .strokeColor("#d4a574")
    .lineWidth(1.5)
    .moveTo(40, doc.y)
    .lineTo(555, doc.y)
    .stroke();

  doc.moveDown(0.8);
};

const renderFooter = (doc, customNote) => {
  doc.moveDown(1.5);
  doc
    .strokeColor("#e2e8f0")
    .lineWidth(1)
    .moveTo(40, doc.y)
    .lineTo(555, doc.y)
    .stroke();

  doc.moveDown(0.8);

  if (customNote) {
    doc
      .fillColor("#854d0e")
      .fontSize(9)
      .font("Helvetica-Oblique")
      .text(customNote, { align: "center" })
      .moveDown(0.4);
  }

  doc
    .fillColor("#64748b")
    .fontSize(8)
    .font("Helvetica")
    .text("Sri Shanti Mahadev Mandir Administration • Email: ganga.mca2002@gmail.com", { align: "center" })
    .text("This is an official computer-generated receipt available to download anytime from your Devotee Portal.", { align: "center" });
};

/**
 * Generate a PDF receipt buffer for a pooja booking (single or combined cart)
 */
const generateBookingReceiptPDF = (devotee, booking) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      renderHeader(doc, "POOJA & SEVA BOOKING RECEIPT");

      const receiptNo = booking.referenceNo || `BK-${String(booking._id || Date.now()).slice(-6).toUpperCase()}`;
      const dateText = booking.datetime
        ? new Date(booking.datetime).toLocaleString("en-IN")
        : new Date().toLocaleString("en-IN");

      // Receipt Meta Box
      doc.fillColor("#1e293b").fontSize(10).font("Helvetica-Bold");
      doc.text(`Receipt No: ${receiptNo}`, 45, doc.y, { continued: true });
      doc.text(`        Date: ${dateText}`, { align: "right" });
      doc.moveDown(0.5);

      // Devotee Details
      doc.font("Helvetica-Bold").text("Devotee Information:");
      doc.font("Helvetica").fontSize(9);
      doc.text(`Name: ${devotee.name || booking.devoteeName || "Devotee"}`);
      if (devotee.phone || booking.contactNumber || booking.devoteePhone) {
        doc.text(`Phone: ${devotee.phone || booking.contactNumber || booking.devoteePhone}`);
      }
      if (devotee.email || booking.devoteeEmail) {
        doc.text(`Email: ${devotee.email || booking.devoteeEmail}`);
      }
      doc.moveDown(0.8);

      // Booked Items Breakdown
      doc.font("Helvetica-Bold").fontSize(10).text("Services & Items Breakdown:");
      doc.moveDown(0.4);

      if (booking.isCombined && booking.items && booking.items.length > 0) {
        doc.font("Helvetica-Bold").fontSize(9);
        doc.text("Type", 50, doc.y, { width: 100, continued: true });
        doc.text("Item / Seva", { width: 250, continued: true });
        doc.text("Qty", { width: 50, continued: true });
        doc.text("Amount", { align: "right" });
        doc.moveDown(0.3);
        doc.strokeColor("#cbd5e1").lineWidth(0.5).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.4);

        doc.font("Helvetica").fontSize(9);
        booking.items.forEach((item, i) => {
          const itemType = (item.type || "Pooja").toUpperCase();
          const itemName = item.name || item.service || "Service";
          const qty = item.quantity || item.qty || 1;
          const amt = Number(item.amount || (Number(item.price) * qty) || 0);

          doc.text(itemType, 50, doc.y, { width: 100, continued: true });
          doc.text(itemName, { width: 250, continued: true });
          doc.text(String(qty), { width: 50, continued: true });
          doc.text(`Rs. ${amt.toLocaleString("en-IN")}`, { align: "right" });
          doc.moveDown(0.3);
        });
      } else {
        doc.font("Helvetica").fontSize(9);
        doc.text(`Primary Service: ${booking.service || "Pooja Seva"}`);
        doc.text(`Date & Time of Seva: ${dateText}`);
        doc.moveDown(0.4);
      }

      doc.moveDown(0.5);
      doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.6);

      // Total & Payment
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#0f172a");
      doc.text(`Payment Mode: ${booking.paymentMethod || "Cash"}`, 45, doc.y, { continued: true });
      doc.fillColor("#b46a13").text(`Total Paid: Rs. ${Number(booking.amount || 0).toLocaleString("en-IN")}`, { align: "right" });
      doc.moveDown(0.4);

      if (booking.notes) {
        doc.font("Helvetica").fontSize(8).fillColor("#64748b").text(`Note: ${booking.notes}`);
      }

      renderFooter(doc, "Please present this receipt at the temple counter when performing the pooja. May the divine grace always be with you.");
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate a PDF receipt buffer for a donation
 */
const generateDonationReceiptPDF = (devotee, donation) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      renderHeader(doc, "TEMPLE DONATION RECEIPT");

      const receiptNo = donation.referenceNo || donation.receiptNumber || `DN-${String(donation._id || Date.now()).slice(-6).toUpperCase()}`;
      const dateText = donation.date || donation.createdAt
        ? new Date(donation.date || donation.createdAt).toLocaleString("en-IN")
        : new Date().toLocaleString("en-IN");

      doc.fillColor("#1e293b").fontSize(10).font("Helvetica-Bold");
      doc.text(`Receipt No: ${receiptNo}`, 45, doc.y, { continued: true });
      doc.text(`        Date: ${dateText}`, { align: "right" });
      doc.moveDown(0.8);

      doc.font("Helvetica-Bold").text("Donor Information:");
      doc.font("Helvetica").fontSize(9);
      doc.text(`Donor Name: ${devotee.name || donation.donorName || "Devotee"}`);
      if (devotee.phone || donation.donorPhone) doc.text(`Phone: ${devotee.phone || donation.donorPhone}`);
      if (devotee.email || donation.donorEmail) doc.text(`Email: ${devotee.email || donation.donorEmail}`);
      doc.moveDown(0.8);

      doc.strokeColor("#cbd5e1").lineWidth(0.5).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.8);

      doc.font("Helvetica-Bold").fontSize(10).text("Contribution Details:");
      doc.font("Helvetica").fontSize(9);
      doc.text(`Donation Category: ${donation.category || "General Fund"}`);
      doc.text(`Payment Mode: ${donation.paymentMethod || donation.paymentMode || "Online / Cash"}`);
      if (donation.transactionId && donation.transactionId !== "N/A") {
        doc.text(`Transaction Reference: ${donation.transactionId}`);
      }
      doc.moveDown(0.8);

      doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.6);

      doc.font("Helvetica-Bold").fontSize(12).fillColor("#15803d");
      doc.text(`Donation Amount: Rs. ${Number(donation.amount || 0).toLocaleString("en-IN")}`, { align: "right" });
      doc.moveDown(0.4);

      renderFooter(doc, "We deeply appreciate your generous offering towards Sri Shanti Mahadev Mandir. Donations support temple maintenance, daily poojas, and annadanam.");
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate a PDF receipt buffer for a prasadam order
 */
const generatePrasadamReceiptPDF = (devotee, order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      renderHeader(doc, "PRASADAM SALES RECEIPT");

      const receiptNo = order.referenceNo || order.orderNumber || `PR-${String(order._id || Date.now()).slice(-6).toUpperCase()}`;
      const dateText = order.createdAt
        ? new Date(order.createdAt).toLocaleString("en-IN")
        : new Date().toLocaleString("en-IN");

      doc.fillColor("#1e293b").fontSize(10).font("Helvetica-Bold");
      doc.text(`Receipt No: ${receiptNo}`, 45, doc.y, { continued: true });
      doc.text(`        Date: ${dateText}`, { align: "right" });
      doc.moveDown(0.8);

      doc.font("Helvetica-Bold").text("Devotee Information:");
      doc.font("Helvetica").fontSize(9);
      doc.text(`Name: ${devotee.name || order.devoteeName || "Devotee"}`);
      if (devotee.phone || order.phone) doc.text(`Phone: ${devotee.phone || order.phone}`);
      if (devotee.email || order.email) doc.text(`Email: ${devotee.email || order.email}`);
      doc.moveDown(0.8);

      doc.strokeColor("#cbd5e1").lineWidth(0.5).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.8);

      doc.font("Helvetica-Bold").fontSize(10).text("Prasadam Details:");
      doc.font("Helvetica").fontSize(9);
      doc.text(`Item Name: ${order.itemName || order.item || "Temple Prasadam"}`);
      doc.text(`Quantity: ${order.quantity || 1}`);
      doc.text(`Payment Mode: ${order.paymentMethod || "Cash"}`);
      doc.text(`Status: ${order.status || "Placed"}`);
      doc.moveDown(0.8);

      doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.6);

      doc.font("Helvetica-Bold").fontSize(11).fillColor("#b46a13");
      doc.text(`Total Amount Paid: Rs. ${Number(order.amount || 0).toLocaleString("en-IN")}`, { align: "right" });

      renderFooter(doc, "Please present this receipt at the Prasadam Counter to collect your holy prasadam. Thank you!");
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate a PDF receipt buffer for a room allotment
 */
const generateRoomBookingReceiptPDF = (devotee, booking) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      renderHeader(doc, "ROOM ALLOTMENT & ACCOMMODATION RECEIPT");

      const receiptNo = booking.referenceNo || `RM-${String(booking._id || Date.now()).slice(-6).toUpperCase()}`;
      const dateText = booking.datetime || booking.createdAt
        ? new Date(booking.datetime || booking.createdAt).toLocaleString("en-IN")
        : new Date().toLocaleString("en-IN");

      doc.fillColor("#1e293b").fontSize(10).font("Helvetica-Bold");
      doc.text(`Receipt No: ${receiptNo}`, 45, doc.y, { continued: true });
      doc.text(`        Date: ${dateText}`, { align: "right" });
      doc.moveDown(0.8);

      doc.font("Helvetica-Bold").text("Guest Information:");
      doc.font("Helvetica").fontSize(9);
      doc.text(`Name: ${devotee.name || booking.devoteeName || "Devotee"}`);
      if (devotee.phone || booking.phone || booking.devoteePhone) {
        doc.text(`Phone: ${devotee.phone || booking.phone || booking.devoteePhone}`);
      }
      if (devotee.email || booking.email || booking.devoteeEmail) {
        doc.text(`Email: ${devotee.email || booking.email || booking.devoteeEmail}`);
      }
      doc.moveDown(0.8);

      doc.strokeColor("#cbd5e1").lineWidth(0.5).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.8);

      doc.font("Helvetica-Bold").fontSize(10).text("Accommodation Details:");
      doc.font("Helvetica").fontSize(9);
      doc.text(`Service: ${booking.service || "Dharmashala Room Allotment"}`);
      if (booking.checkinDate) doc.text(`Check-In: ${new Date(booking.checkinDate).toLocaleDateString("en-IN")}`);
      if (booking.checkoutDate) doc.text(`Check-Out: ${new Date(booking.checkoutDate).toLocaleDateString("en-IN")}`);
      if (booking.days) doc.text(`Number of Days: ${booking.days}`);
      doc.text(`Payment Mode: ${booking.paymentMethod || booking.payMode || "Cash"}`);
      doc.moveDown(0.8);

      doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.6);

      doc.font("Helvetica-Bold").fontSize(11).fillColor("#b46a13");
      doc.text(`Total Tariff Paid: Rs. ${Number(booking.amount || 0).toLocaleString("en-IN")}`, { align: "right" });

      renderFooter(doc, "Please present this receipt at the Temple Guest House / Office upon arrival for room key collection. Enjoy your peaceful stay.");
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateBookingReceiptPDF,
  generateDonationReceiptPDF,
  generatePrasadamReceiptPDF,
  generateRoomBookingReceiptPDF,
};
