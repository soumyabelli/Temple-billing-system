/**
 * Generates email-safe HTML for Temple Receipts matching BookingReceipt.jsx
 */

function generateReceiptHTML(data) {
  const isOnline = Boolean(data.isOnline);
  const themeColor = isOnline ? "#0f5132" : "#8b4513";
  const themeLight = isOnline ? "#c8e0d3" : "#ebd9cc";
  const themeBg = isOnline ? "#f5f9f7" : "#faf6f3";

  const renderCategoryRows = (items, categoryTitle) => {
    if (!items || items.length === 0) return "";
    let rows = `
      <tr>
        <td colspan="5" style="background-color: ${themeBg}; font-weight: bold; font-size: 11.5px; text-align: left; padding: 6px 10px; color: ${themeColor}; letter-spacing: 0.5px; border-bottom: 1px solid ${themeLight};">
          ${categoryTitle}
        </td>
      </tr>
    `;
    items.forEach((item) => {
      rows += `
        <tr>
          <td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid ${themeLight}; border-right: 1px solid ${themeLight}; font-size: 12px; color: #333;">${item.slNo}</td>
          <td style="padding: 6px 8px; text-align: left; border-bottom: 1px solid ${themeLight}; border-right: 1px solid ${themeLight}; font-size: 12px; font-weight: 500; color: #222;">${item.name}</td>
          <td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid ${themeLight}; border-right: 1px solid ${themeLight}; font-size: 12px; color: #444;">${item.date || "-"}</td>
          <td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid ${themeLight}; border-right: 1px solid ${themeLight}; font-size: 12px; color: #333;">${item.qty}</td>
          <td style="padding: 6px 8px; text-align: right; border-bottom: 1px solid ${themeLight}; font-size: 12px; font-weight: 600; color: #111;">₹ ${Number(item.amount || 0).toFixed(2)}</td>
        </tr>
      `;
    });
    return rows;
  };

  const poojaRows = renderCategoryRows(data.allPooja, "POOJA & SEVA BOOKINGS");
  const prasadamRows = renderCategoryRows(data.allPrasadam, "PRASADAM ORDERS");
  const roomRows = renderCategoryRows(data.allRooms, "ROOM & ACCOMMODATION");
  const donationRows = renderCategoryRows(data.allDonations, "DONATIONS & OFFERINGS");

  const totalItemsCount =
    (data.allPooja?.length || 0) +
    (data.allPrasadam?.length || 0) +
    (data.allRooms?.length || 0) +
    (data.allDonations?.length || 0);

  const emptyRow = totalItemsCount === 0 ? `
    <tr>
      <td colspan="5" style="padding: 16px; text-align: center; color: #666; font-style: italic; border-bottom: 1px solid ${themeLight}; font-size: 12px;">
        Temple Service / Offering Completed
      </td>
    </tr>
  ` : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Temple Booking Receipt - ${data.receiptNo}</title>
</head>
<body style="margin: 0; padding: 20px 10px; background-color: #f1f5f9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a;">
  <div style="max-width: 760px; margin: 0 auto; background: #ffffff; border: 2px solid ${themeColor}; border-radius: 10px; position: relative; padding: 20px 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
    
    <!-- Inner Border Effect -->
    <div style="border: 1px solid ${themeLight}; border-radius: 6px; padding: 18px 20px;">

      <!-- Top Badge -->
      <div style="text-align: center; margin-top: -30px; margin-bottom: 12px;">
        <span style="display: inline-block; background-color: ${themeColor}; color: #ffffff; padding: 4px 20px; border-radius: 16px; font-size: 11.5px; font-weight: bold; letter-spacing: 0.8px; text-transform: uppercase;">
          ${isOnline ? "🌐 ONLINE BOOKING RECEIPT" : "🏛️ OFFLINE BOOKING RECEIPT"}
        </span>
      </div>

      <!-- Header -->
      <div style="text-align: center; margin-bottom: 16px; border-bottom: 1px dashed ${themeLight}; padding-bottom: 14px;">
        <h1 style="margin: 0 0 4px 0; font-family: 'Georgia', serif; font-size: 24px; font-weight: 700; color: ${themeColor}; letter-spacing: 0.5px;">
          SRI SHANTI MAHADEV MANDIR
        </h1>
        <p style="margin: 2px 0; font-size: 12px; color: #444;">
          Main Road, Udupi - 576101, Karnataka
        </p>
        <p style="margin: 2px 0; font-size: 12px; color: #555;">
          📞 0824-1234567 &nbsp;•&nbsp; 🌐 www.srishantimandir.org
        </p>
        <p style="margin: 6px 0 0 0; font-size: 13px; font-weight: 600; color: ${themeColor}; letter-spacing: 0.5px;">
          || Om Namah Shivaya ||
        </p>
      </div>

      <!-- RECEIPT Pill Badge -->
      <div style="text-align: center; margin-bottom: 16px;">
        <span style="display: inline-block; width: 40px; height: 1px; background-color: ${themeColor}; vertical-align: middle; margin-right: 12px;"></span>
        <span style="display: inline-block; background-color: ${themeColor}; color: #ffffff; padding: 3px 22px; border-radius: 14px; font-size: 14px; font-weight: bold; letter-spacing: 1.5px;">
          RECEIPT
        </span>
        <span style="display: inline-block; width: 40px; height: 1px; background-color: ${themeColor}; vertical-align: middle; margin-left: 12px;"></span>
      </div>

      <!-- Details Panel (2 Columns) -->
      <table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid ${themeLight}; border-radius: 6px; margin-bottom: 16px; background-color: #fafbfc;">
        <tr>
          <!-- Left Col: Receipt Details -->
          <td style="width: 50%; vertical-align: top; padding: 12px 14px; border-right: 1px solid ${themeLight};">
            <div style="font-weight: bold; color: ${themeColor}; font-size: 12.5px; border-bottom: 1px dashed ${themeLight}; padding-bottom: 4px; margin-bottom: 8px;">
              Receipt Details
            </div>
            <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
              <tr>
                <td style="color: #666; width: 100px; padding: 2px 0;">Receipt No.</td>
                <td style="color: #666; width: 12px; padding: 2px 0;">:</td>
                <td style="color: #111; font-weight: bold; padding: 2px 0;">${data.receiptNo}</td>
              </tr>
              <tr>
                <td style="color: #666; padding: 2px 0;">Booking Date</td>
                <td style="color: #666; padding: 2px 0;">:</td>
                <td style="color: #222; font-weight: 600; padding: 2px 0;">${data.bookingDate}</td>
              </tr>
              <tr>
                <td style="color: #666; padding: 2px 0;">Payment Mode</td>
                <td style="color: #666; padding: 2px 0;">:</td>
                <td style="color: #222; font-weight: 600; padding: 2px 0;">${data.paymentMode}</td>
              </tr>
              <tr>
                <td style="color: #666; padding: 2px 0;">Transaction ID</td>
                <td style="color: #666; padding: 2px 0;">:</td>
                <td style="color: #222; font-weight: 600; padding: 2px 0;">${data.transactionId}</td>
              </tr>
              ${!isOnline && data.cashierName ? `
              <tr>
                <td style="color: #666; padding: 2px 0;">Cashier Name</td>
                <td style="color: #666; padding: 2px 0;">:</td>
                <td style="color: #222; font-weight: 600; padding: 2px 0;">${data.cashierName}</td>
              </tr>
              ` : ''}
            </table>
          </td>

          <!-- Right Col: Devotee Details -->
          <td style="width: 50%; vertical-align: top; padding: 12px 14px;">
            <div style="font-weight: bold; color: ${themeColor}; font-size: 12.5px; border-bottom: 1px dashed ${themeLight}; padding-bottom: 4px; margin-bottom: 8px;">
              Devotee Details
            </div>
            <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
              <tr>
                <td style="color: #666; width: 100px; padding: 2px 0;">Name</td>
                <td style="color: #666; width: 12px; padding: 2px 0;">:</td>
                <td style="color: #111; font-weight: bold; font-size: 12.5px; padding: 2px 0;">${data.devotee.name}</td>
              </tr>
              <tr>
                <td style="color: #666; padding: 2px 0;">Phone Number</td>
                <td style="color: #666; padding: 2px 0;">:</td>
                <td style="color: #222; font-weight: 600; padding: 2px 0;">${data.devotee.phone}</td>
              </tr>
              <tr>
                <td style="color: #666; padding: 2px 0;">Email</td>
                <td style="color: #666; padding: 2px 0;">:</td>
                <td style="color: #222; font-weight: 600; padding: 2px 0; word-break: break-all;">${data.devotee.email}</td>
              </tr>
              <tr>
                <td style="color: #666; padding: 2px 0;">Address</td>
                <td style="color: #666; padding: 2px 0;">:</td>
                <td style="color: #222; font-weight: 600; padding: 2px 0;">${data.devotee.address}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Booking Details Table Section -->
      <div style="border: 1px solid ${themeLight}; border-radius: 6px; overflow: hidden; margin-bottom: 16px;">
        <div style="background-color: ${themeColor}; color: #ffffff; display: inline-block; padding: 4px 14px; font-size: 11px; font-weight: bold; border-radius: 0 0 6px 0;">
          BOOKING DETAILS
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background-color: ${themeBg}; color: #333; font-weight: bold;">
              <th style="width: 8%; padding: 7px 6px; text-align: center; border-bottom: 1px solid ${themeLight}; border-right: 1px solid ${themeLight};">Sl. No.</th>
              <th style="width: 44%; padding: 7px 8px; text-align: left; border-bottom: 1px solid ${themeLight}; border-right: 1px solid ${themeLight};">Item / Service</th>
              <th style="width: 18%; padding: 7px 6px; text-align: center; border-bottom: 1px solid ${themeLight}; border-right: 1px solid ${themeLight};">Date</th>
              <th style="width: 10%; padding: 7px 6px; text-align: center; border-bottom: 1px solid ${themeLight}; border-right: 1px solid ${themeLight};">Qty</th>
              <th style="width: 20%; padding: 7px 8px; text-align: right; border-bottom: 1px solid ${themeLight};">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${poojaRows}
            ${prasadamRows}
            ${roomRows}
            ${donationRows}
            ${emptyRow}
          </tbody>
        </table>
      </div>

      <!-- Footer Panels: Materials & Totals -->
      <table style="width: 100%; border-collapse: separate; border-spacing: 12px 0; margin-bottom: 14px; margin-left: -12px;">
        <tr>
          <!-- Materials Panel -->
          <td style="width: 55%; vertical-align: top; border: 1px solid ${themeLight}; border-radius: 6px; padding: 10px 14px; background-color: #fafbfc;">
            ${data.devoteeMaterials && data.devoteeMaterials.length > 0 ? `
              <div style="color: ${themeColor}; font-weight: bold; font-size: 11.5px; margin-bottom: 4px;">
                📋 To be Brought by Devotee:
              </div>
              <ul style="margin: 0 0 8px 18px; padding: 0; font-size: 11px; color: #444;">
                ${data.devoteeMaterials.map(m => `<li>${m}</li>`).join('')}
              </ul>
            ` : ''}

            ${data.templeMaterials && data.templeMaterials.length > 0 ? `
              <div style="color: ${themeColor}; font-weight: bold; font-size: 11.5px; margin-bottom: 4px;">
                🏛️ Arranged by Temple:
              </div>
              <ul style="margin: 0 0 4px 18px; padding: 0; font-size: 11px; color: #444;">
                ${data.templeMaterials.map(m => `<li>${m}</li>`).join('')}
              </ul>
            ` : ''}

            ${(!data.devoteeMaterials || data.devoteeMaterials.length === 0) && (!data.templeMaterials || data.templeMaterials.length === 0) ? `
              <div style="color: #777; font-style: italic; font-size: 11.5px; padding: 10px 0;">
                No specific materials required from devotee.
              </div>
            ` : ''}
          </td>

          <!-- Totals Panel -->
          <td style="width: 45%; vertical-align: top; border: 1px solid ${themeLight}; border-radius: 6px; padding: 10px 14px; background-color: #fafbfc;">
            <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
              <tr>
                <td style="color: #555; padding: 2px 0;">Sub Total</td>
                <td style="text-align: right; font-weight: 600; padding: 2px 0;">₹ ${Number(data.subTotal || 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="color: #555; padding: 2px 0;">Temple Arrange Charges</td>
                <td style="text-align: right; font-weight: 600; padding: 2px 0;">+ ₹ ${Number(data.templeCharges || 0).toFixed(2)}</td>
              </tr>
              <tr style="border-top: 1px dashed ${themeLight};">
                <td style="color: ${themeColor}; font-weight: 800; font-size: 13.5px; padding-top: 6px;">GRAND TOTAL</td>
                <td style="text-align: right; color: ${themeColor}; font-weight: 800; font-size: 13.5px; padding-top: 6px;">₹ ${Number(data.grandTotal || 0).toFixed(2)}</td>
              </tr>
              ${data.cashReceived != null && Number(data.cashReceived) > 0 ? `
              <tr>
                <td style="color: #166534; font-weight: bold; font-size: 11.5px; padding-top: 4px;">Cash Received</td>
                <td style="text-align: right; color: #166534; font-weight: bold; font-size: 11.5px; padding-top: 4px;">₹ ${Number(data.cashReceived).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="color: #0369a1; font-weight: bold; font-size: 11.5px; padding-top: 2px;">Change Returned</td>
                <td style="text-align: right; color: #0369a1; font-weight: bold; font-size: 11.5px; padding-top: 2px;">₹ ${Number(data.changeReturned || 0).toFixed(2)}</td>
              </tr>
              ` : ''}
              <tr>
                <td colspan="2" style="font-size: 10px; color: #666; text-align: right; font-style: italic; padding-top: 4px;">
                  (${data.amountInWords})
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Notes Section -->
      <div style="font-size: 11px; color: #444; margin-bottom: 12px; background-color: #f8fafc; border-left: 3px solid ${themeColor}; padding: 6px 12px; border-radius: 0 4px 4px 0;">
        <div style="font-weight: bold; color: ${themeColor}; margin-bottom: 3px;">
          📌 Notes & Instructions:
        </div>
        <ul style="margin: 0; padding-left: 16px;">
          ${data.notes.map(n => `<li style="margin-bottom: 2px;">${n}</li>`).join('')}
        </ul>
      </div>

      <!-- Bottom Info Banner -->
      <div style="background-color: ${themeBg}; border-radius: 6px; padding: 8px 14px; font-size: 11px; color: #444; text-align: center; margin-bottom: 12px; border: 1px solid ${themeLight};">
        💻 <strong>This is an ${isOnline ? 'online' : 'offline'} booking receipt.</strong> For any queries, please visit our website <a href="http://www.srishantimandir.org" style="color: ${themeColor}; text-decoration: underline;">www.srishantimandir.org</a> or contact the temple office.
      </div>

      <!-- Visit Again -->
      <div style="text-align: center; font-size: 12px; font-weight: bold; color: ${themeColor}; letter-spacing: 0.8px;">
        — May the Divine Grace and Blessings Always Be with You! —<br>
        <span style="font-size: 13px; margin-top: 2px; display: inline-block;">Thank You! Visit Again!</span>
      </div>

    </div>
  </div>
</body>
</html>
  `;
}

module.exports = {
  generateReceiptHTML,
};
