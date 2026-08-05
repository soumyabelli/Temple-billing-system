const PDFDocument = require("pdfkit");

/**
 * Generate a PDF receipt buffer for a pooja booking
 * @param {Object} devotee - Devotee details (name, email, phone)
 * @param {Object} booking - Booking details (service, datetime, amount, status)
 * @returns {Promise<Buffer>} - A promise that resolves to the PDF buffer
 */
const generateBookingReceiptPDF = (devotee, booking) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("Temple Management System", { align: "center" })
        .moveDown(0.5);

      doc
        .fontSize(16)
        .font("Helvetica")
        .text("Pooja Booking Receipt", { align: "center" })
        .moveDown(2);

      // Devotee Details
      doc.fontSize(12).font("Helvetica-Bold").text("Devotee Details:");
      doc.font("Helvetica").text(`Name: ${devotee.name || "N/A"}`);
      if (devotee.email) doc.text(`Email: ${devotee.email}`);
      if (devotee.phone) doc.text(`Phone: ${devotee.phone}`);
      doc.moveDown(1);

      // Booking Details
      doc.font("Helvetica-Bold").text("Booking Details:");
      doc.font("Helvetica").text(`Service: ${booking.service || "N/A"}`);
      
      const dateText = booking.datetime 
        ? new Date(booking.datetime).toLocaleString("en-IN")
        : "N/A";
      doc.text(`Date & Time: ${dateText}`);
      
      doc.text(`Amount: Rs ${booking.amount || 0}`);
      doc.text(`Status: ${booking.status || "Confirmed"}`);
      
      doc.moveDown(2);

      // Note
      doc
        .fontSize(10)
        .font("Helvetica-Oblique")
        .text(
          "Please bring this receipt at the time of visiting the temple to perform the pooja.",
          { align: "center" }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateBookingReceiptPDF,
};
