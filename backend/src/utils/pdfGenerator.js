const PDFDocument = require("pdfkit");
const { normalizeReceiptData } = require("./receiptNormalizer");

/**
 * Draws a pixel-perfect, ornamental Temple Receipt matching BookingReceipt.jsx
 */
function generateTempleReceiptPDF(inputData) {
  return new Promise((resolve, reject) => {
    try {
      const data = inputData.allPooja ? inputData : normalizeReceiptData({}, inputData);

      const doc = new PDFDocument({
        margin: 0,
        size: "A4", // 595.28 x 841.89 pt
      });

      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      const isOnline = Boolean(data.isOnline);
      const themeColor = isOnline ? "#0f5132" : "#8b4513";
      const themeLight = isOnline ? "#c8e0d3" : "#ebd9cc";
      const themeBg = isOnline ? "#f5f9f7" : "#faf6f3";

      // 1. Double Outer Border
      // Outer border
      doc
        .lineWidth(1.5)
        .strokeColor(themeColor)
        .rect(26, 24, 543, 792)
        .stroke();

      // Inner border
      doc
        .lineWidth(0.75)
        .strokeColor(themeColor)
        .rect(30, 28, 535, 784)
        .stroke();

      // Corner Flourishes (Decorative Accents)
      const drawCorner = (cx, cy, flipX, flipY) => {
        doc.save();
        doc.translate(cx, cy);
        doc.scale(flipX ? -1 : 1, flipY ? -1 : 1);
        doc.fillColor(themeColor);
        doc.rect(0, 0, 10, 2).fill();
        doc.rect(0, 0, 2, 10).fill();
        doc.circle(6, 6, 1.8).fill();
        doc.restore();
      };
      drawCorner(32, 30, false, false);
      drawCorner(563, 30, true, false);
      drawCorner(32, 810, false, true);
      drawCorner(563, 810, true, true);

      // 2. Top Badge
      const badgeText = isOnline ? "ONLINE BOOKING RECEIPT" : "OFFLINE BOOKING RECEIPT";
      const badgeW = 170;
      const badgeH = 18;
      const badgeX = (595.28 - badgeW) / 2;
      const badgeY = 16;
      doc
        .roundedRect(badgeX, badgeY, badgeW, badgeH, 9)
        .fill(themeColor);
      doc
        .fillColor("#ffffff")
        .fontSize(8.5)
        .font("Helvetica-Bold")
        .text(badgeText, badgeX, badgeY + 4.5, { width: badgeW, align: "center" });

      // 3. Header Section
      doc
        .fillColor(themeColor)
        .fontSize(19)
        .font("Times-Bold")
        .text("SRI SHANTI MAHADEV MANDIR", 30, 42, { width: 535, align: "center" });

      doc
        .fillColor("#444444")
        .fontSize(9)
        .font("Helvetica")
        .text("Main Road, Udupi - 576101, Karnataka", 30, 65, { width: 535, align: "center" });

      doc
        .fillColor("#555555")
        .fontSize(8.5)
        .font("Helvetica")
        .text("Tel: 0824-1234567   •   Web: www.srishantimandir.org", 30, 78, { width: 535, align: "center" });

      doc
        .fillColor(themeColor)
        .fontSize(10.5)
        .font("Helvetica-Bold")
        .text("|| Om Namah Shivaya ||", 30, 93, { width: 535, align: "center" });

      // 4. Ornamental "RECEIPT" Pill Bar
      const rcptPillW = 86;
      const rcptPillH = 18;
      const rcptPillX = (595.28 - rcptPillW) / 2;
      const rcptPillY = 111;

      // Left ornamental line
      doc
        .lineWidth(0.8)
        .strokeColor(themeColor)
        .moveTo(150, rcptPillY + 9)
        .lineTo(rcptPillX - 12, rcptPillY + 9)
        .stroke();
      doc
        .rect(rcptPillX - 15, rcptPillY + 7, 4, 4)
        .fillColor(themeColor)
        .fill();

      // Right ornamental line
      doc
        .lineWidth(0.8)
        .strokeColor(themeColor)
        .moveTo(rcptPillX + rcptPillW + 12, rcptPillY + 9)
        .lineTo(445, rcptPillY + 9)
        .stroke();
      doc
        .rect(rcptPillX + rcptPillW + 11, rcptPillY + 7, 4, 4)
        .fillColor(themeColor)
        .fill();

      // Pill
      doc
        .roundedRect(rcptPillX, rcptPillY, rcptPillW, rcptPillH, 9)
        .fill(themeColor);
      doc
        .fillColor("#ffffff")
        .fontSize(9.5)
        .font("Helvetica-Bold")
        .text("RECEIPT", rcptPillX, rcptPillY + 4, { width: rcptPillW, align: "center" });

      // 5. Details Panels (Side-by-Side 2 Columns)
      const panelY = 138;
      const panelH = 82;
      const leftPanelX = 42;
      const panelW = 246;
      const rightPanelX = 307;

      // Left Box: Receipt Details
      doc
        .roundedRect(leftPanelX, panelY, panelW, panelH, 5)
        .fillAndStroke("#fafbfc", themeLight);

      doc
        .fillColor(themeColor)
        .fontSize(9.5)
        .font("Helvetica-Bold")
        .text("Receipt Details", leftPanelX + 10, panelY + 7);

      doc
        .lineWidth(0.5)
        .strokeColor(themeLight)
        .moveTo(leftPanelX + 10, panelY + 20)
        .lineTo(leftPanelX + panelW - 10, panelY + 20)
        .stroke();

      const drawDetailRow = (bx, ry, label, val, isHighlight) => {
        doc.fillColor("#666666").font("Helvetica").fontSize(8.5).text(label, bx + 10, ry);
        doc.fillColor("#666666").font("Helvetica").fontSize(8.5).text(":", bx + 80, ry);
        doc
          .fillColor(isHighlight ? "#111111" : "#222222")
          .font(isHighlight ? "Helvetica-Bold" : "Helvetica")
          .fontSize(8.5)
          .text(String(val || "-"), bx + 88, ry, { width: 148, lineBreak: false, ellipsis: true });
      };

      drawDetailRow(leftPanelX, panelY + 25, "Receipt No.", data.receiptNo, true);
      drawDetailRow(leftPanelX, panelY + 38, "Booking Date", data.bookingDate, false);
      drawDetailRow(leftPanelX, panelY + 51, "Payment Mode", data.paymentMode, false);
      drawDetailRow(leftPanelX, panelY + 64, "Transaction ID", data.transactionId, false);

      // Right Box: Devotee Details
      doc
        .roundedRect(rightPanelX, panelY, panelW, panelH, 5)
        .fillAndStroke("#fafbfc", themeLight);

      doc
        .fillColor(themeColor)
        .fontSize(9.5)
        .font("Helvetica-Bold")
        .text("Devotee Details", rightPanelX + 10, panelY + 7);

      doc
        .lineWidth(0.5)
        .strokeColor(themeLight)
        .moveTo(rightPanelX + 10, panelY + 20)
        .lineTo(rightPanelX + panelW - 10, panelY + 20)
        .stroke();

      drawDetailRow(rightPanelX, panelY + 25, "Name", data.devotee?.name || "Devotee", true);
      drawDetailRow(rightPanelX, panelY + 38, "Phone Number", data.devotee?.phone || "-", false);
      drawDetailRow(rightPanelX, panelY + 51, "Email", data.devotee?.email || "-", false);
      drawDetailRow(rightPanelX, panelY + 64, "Address", data.devotee?.address || "-", false);

      // 6. Booking Details Table Section
      const tableSecY = 228;
      const tableW = 511;
      const tableX = 42;

      // Section Pill Badge
      doc
        .roundedRect(tableX, tableSecY, 115, 16, 4)
        .fill(themeColor);
      doc
        .fillColor("#ffffff")
        .fontSize(8)
        .font("Helvetica-Bold")
        .text("BOOKING DETAILS", tableX, tableSecY + 3.5, { width: 115, align: "center" });

      let currentY = tableSecY + 18;

      // Table Header Row
      const thH = 18;
      doc
        .rect(tableX, currentY, tableW, thH)
        .fillAndStroke(themeBg, themeLight);

      // Header Labels
      doc.fillColor("#333333").fontSize(8.5).font("Helvetica-Bold");
      doc.text("Sl. No.", tableX, currentY + 4.5, { width: 38, align: "center" });
      doc.text("Item / Service", tableX + 42, currentY + 4.5, { width: 230, align: "left" });
      doc.text("Date", tableX + 276, currentY + 4.5, { width: 90, align: "center" });
      doc.text("Qty", tableX + 370, currentY + 4.5, { width: 36, align: "center" });
      doc.text("Amount (Rs.)", tableX + 410, currentY + 4.5, { width: 93, align: "right" });

      currentY += thH;

      // Function to render category & items
      const renderTableCategory = (items, categoryName) => {
        if (!items || items.length === 0) return;

        // Category Banner Row
        const catH = 16;
        doc
          .rect(tableX, currentY, tableW, catH)
          .fillAndStroke(themeBg, themeLight);

        doc
          .fillColor(themeColor)
          .fontSize(8)
          .font("Helvetica-Bold")
          .text(categoryName, tableX + 10, currentY + 3.5, { width: tableW - 20, align: "left" });

        currentY += catH;

        // Rows
        const rowH = 17;
        items.forEach((it, idx) => {
          const rowBg = idx % 2 === 0 ? "#ffffff" : "#fafafa";
          doc
            .rect(tableX, currentY, tableW, rowH)
            .fillAndStroke(rowBg, themeLight);

          // Sl No
          doc
            .fillColor("#333333")
            .font("Helvetica")
            .fontSize(8.5)
            .text(String(it.slNo || idx + 1), tableX, currentY + 4, { width: 38, align: "center" });

          // Item Name
          doc
            .fillColor("#111111")
            .font("Helvetica-Bold")
            .fontSize(8.5)
            .text(it.name || "Temple Service", tableX + 42, currentY + 4, { width: 230, lineBreak: false, ellipsis: true });

          // Date
          doc
            .fillColor("#444444")
            .font("Helvetica")
            .fontSize(8)
            .text(it.date || "-", tableX + 276, currentY + 4, { width: 90, align: "center" });

          // Qty
          doc
            .fillColor("#333333")
            .font("Helvetica")
            .fontSize(8.5)
            .text(String(it.qty || 1), tableX + 370, currentY + 4, { width: 36, align: "center" });

          // Amount
          const formattedAmt = Number(it.amount || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          doc
            .fillColor("#111111")
            .font("Helvetica-Bold")
            .fontSize(8.5)
            .text(`Rs. ${formattedAmt}`, tableX + 410, currentY + 4, { width: 93, align: "right" });

          currentY += rowH;
        });
      };

      renderTableCategory(data.allPooja, "POOJA & SEVA BOOKINGS");
      renderTableCategory(data.allPrasadam, "PRASADAM ORDERS");
      renderTableCategory(data.allRooms, "ROOM & ACCOMMODATION");
      renderTableCategory(data.allDonations, "DONATIONS & OFFERINGS");

      const totalItems =
        (data.allPooja?.length || 0) +
        (data.allPrasadam?.length || 0) +
        (data.allRooms?.length || 0) +
        (data.allDonations?.length || 0);

      if (totalItems === 0) {
        doc
          .rect(tableX, currentY, tableW, 20)
          .fillAndStroke("#ffffff", themeLight);
        doc
          .fillColor("#666666")
          .font("Helvetica-Oblique")
          .fontSize(8.5)
          .text("Temple Service / Offering Completed", tableX, currentY + 5, { width: tableW, align: "center" });
        currentY += 20;
      }

      currentY += 10;

      // 7. Footer Section (Materials Panel & Totals Panel)
      const footerPanelH = 82;
      const matPanelW = 270;
      const totPanelX = 322;
      const totPanelW = 231;

      // Left Box: Materials
      doc
        .roundedRect(tableX, currentY, matPanelW, footerPanelH, 5)
        .fillAndStroke("#fafbfc", themeLight);

      doc
        .fillColor(themeColor)
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .text("Materials & Instructions:", tableX + 10, currentY + 7);

      let matY = currentY + 20;
      if (data.devoteeMaterials && data.devoteeMaterials.length > 0) {
        doc
          .fillColor(themeColor)
          .font("Helvetica-Bold")
          .fontSize(8)
          .text("• Devotee to bring:", tableX + 12, matY);
        matY += 11;
        data.devoteeMaterials.slice(0, 3).forEach((m) => {
          doc
            .fillColor("#444444")
            .font("Helvetica")
            .fontSize(7.5)
            .text(`  - ${m}`, tableX + 16, matY, { width: matPanelW - 30, lineBreak: false, ellipsis: true });
          matY += 10;
        });
      }

      if (data.templeMaterials && data.templeMaterials.length > 0) {
        doc
          .fillColor(themeColor)
          .font("Helvetica-Bold")
          .fontSize(8)
          .text("• Arranged by Temple:", tableX + 12, matY);
        matY += 11;
        data.templeMaterials.slice(0, 3).forEach((m) => {
          doc
            .fillColor("#444444")
            .font("Helvetica")
            .fontSize(7.5)
            .text(`  - ${m}`, tableX + 16, matY, { width: matPanelW - 30, lineBreak: false, ellipsis: true });
          matY += 10;
        });
      }

      if ((!data.devoteeMaterials || data.devoteeMaterials.length === 0) && (!data.templeMaterials || data.templeMaterials.length === 0)) {
        doc
          .fillColor("#777777")
          .font("Helvetica-Oblique")
          .fontSize(8)
          .text("No specific materials required from devotee.", tableX + 12, currentY + 34, { width: matPanelW - 24 });
      }

      // Right Box: Totals Panel
      doc
        .roundedRect(totPanelX, currentY, totPanelW, footerPanelH, 5)
        .fillAndStroke("#fafbfc", themeLight);

      // Sub Total
      doc.fillColor("#555555").font("Helvetica").fontSize(8.5).text("Sub Total", totPanelX + 10, currentY + 8);
      doc.fillColor("#111111").font("Helvetica-Bold").fontSize(8.5).text(
        `Rs. ${Number(data.subTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        totPanelX + 100, currentY + 8, { width: 121, align: "right" }
      );

      // Temple Charges
      doc.fillColor("#555555").font("Helvetica").fontSize(8.5).text("Temple Arrange Charges", totPanelX + 10, currentY + 21);
      doc.fillColor("#111111").font("Helvetica-Bold").fontSize(8.5).text(
        `+ Rs. ${Number(data.templeCharges || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        totPanelX + 100, currentY + 21, { width: 121, align: "right" }
      );

      // Divider
      doc
        .lineWidth(0.5)
        .strokeColor(themeLight)
        .moveTo(totPanelX + 10, currentY + 34)
        .lineTo(totPanelX + totPanelW - 10, currentY + 34)
        .stroke();

      // GRAND TOTAL
      doc.fillColor(themeColor).font("Helvetica-Bold").fontSize(9.5).text("GRAND TOTAL", totPanelX + 10, currentY + 38);
      doc.fillColor(themeColor).font("Helvetica-Bold").fontSize(10).text(
        `Rs. ${Number(data.grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        totPanelX + 90, currentY + 38, { width: 131, align: "right" }
      );

      // Cash Received / Change Returned (if cash)
      if (data.cashReceived != null && Number(data.cashReceived) > 0) {
        doc.fillColor("#166534").font("Helvetica-Bold").fontSize(7.5).text(
          `Cash Recv: Rs. ${Number(data.cashReceived).toFixed(2)}  |  Change: Rs. ${Number(data.changeReturned || 0).toFixed(2)}`,
          totPanelX + 10, currentY + 52, { width: 211, align: "right" }
        );
      }

      // Amount in Words
      doc
        .fillColor("#666666")
        .font("Helvetica-Oblique")
        .fontSize(7)
        .text(`(${data.amountInWords})`, totPanelX + 10, currentY + 63, { width: 211, align: "right", lineBreak: false, ellipsis: true });

      currentY += footerPanelH + 10;

      // 8. Notes Box
      const notesH = 40;
      doc
        .roundedRect(tableX, currentY, tableW, notesH, 4)
        .fillAndStroke("#f8fafc", "#e2e8f0");

      doc
        .rect(tableX, currentY, 3, notesH)
        .fill(themeColor);

      doc
        .fillColor(themeColor)
        .font("Helvetica-Bold")
        .fontSize(8)
        .text("Notes & Guidelines:", tableX + 10, currentY + 4);

      let noteY = currentY + 14;
      (data.notes || []).slice(0, 3).forEach((n) => {
        doc
          .fillColor("#444444")
          .font("Helvetica")
          .fontSize(7.5)
          .text(`• ${n}`, tableX + 12, noteY, { width: tableW - 24, lineBreak: false, ellipsis: true });
        noteY += 9;
      });

      currentY += notesH + 10;

      // 9. Bottom Info Banner
      const bannerH = 18;
      doc
        .roundedRect(tableX, currentY, tableW, bannerH, 4)
        .fillAndStroke(themeBg, themeLight);

      doc
        .fillColor("#444444")
        .font("Helvetica")
        .fontSize(8)
        .text(
          `This is an official ${isOnline ? 'online' : 'offline'} booking receipt. For queries: www.srishantimandir.org  •  Tel: 0824-1234567`,
          tableX, currentY + 4.5, { width: tableW, align: "center" }
        );

      currentY += bannerH + 12;

      // 10. Visit Again Blessing
      doc
        .fillColor(themeColor)
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .text("May the Divine Grace and Blessings Always Be with You!", 30, currentY, { width: 535, align: "center" });

      doc
        .fillColor(themeColor)
        .font("Times-Bold")
        .fontSize(9.5)
        .text("— Thank You! Visit Again! —", 30, currentY + 11, { width: 535, align: "center" });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * High-level exports for bookings, donations, prasadam, rooms, and consolidated bills.
 * All route into generateTempleReceiptPDF for unified, stunning formatting.
 */
const generateBookingReceiptPDF = (devotee, booking) => {
  const normalized = normalizeReceiptData(devotee, booking, "pooja");
  return generateTempleReceiptPDF(normalized);
};

const generateDonationReceiptPDF = (devotee, donation) => {
  const normalized = normalizeReceiptData(devotee, donation, "donation");
  return generateTempleReceiptPDF(normalized);
};

const generatePrasadamReceiptPDF = (devotee, order) => {
  const normalized = normalizeReceiptData(devotee, order, "prasadam");
  return generateTempleReceiptPDF(normalized);
};

const generateRoomBookingReceiptPDF = (devotee, booking) => {
  const normalized = normalizeReceiptData(devotee, booking, "room");
  return generateTempleReceiptPDF(normalized);
};

const generateBillReceiptPDF = (devotee, bill) => {
  const normalized = normalizeReceiptData(devotee, bill, "bill");
  return generateTempleReceiptPDF(normalized);
};

module.exports = {
  generateTempleReceiptPDF,
  generateBookingReceiptPDF,
  generateDonationReceiptPDF,
  generatePrasadamReceiptPDF,
  generateRoomBookingReceiptPDF,
  generateBillReceiptPDF,
};
