/**
 * Communication Service - Handles Email, SMS, and Message Notifications
 * This service integrates with email providers (like SendGrid/Nodemailer)
 * and SMS providers (like Twilio)
 */

// Mock implementations for demonstration
// In production, replace with actual provider integrations

let transporter = null;
let currentEmailUser = null;
let currentEmailPass = null;

const initTransporter = () => {
  // Dynamically reload .env so changes are applied immediately without restarting the server
  try {
    const path = require("path");
    require("dotenv").config({ path: path.resolve(__dirname, "../../.env"), override: true });
  } catch (_) {}

  const emailUser = (process.env.EMAIL_USER || "").trim();
  const rawPass = (process.env.EMAIL_PASS || "").trim();
  // Remove any spaces that Google App Passwords display by default (e.g. 'abcd efgh ijkl mnop' -> 'abcdefghijklmnop')
  const emailPass = String(rawPass).replace(/\s+/g, "").trim();
  const emailService = (process.env.EMAIL_SERVICE || "gmail").trim();

  if (transporter && currentEmailUser === emailUser && currentEmailPass === emailPass) {
    return transporter;
  }

  try {
    const nodemailer = require("nodemailer");
    if (emailUser && emailPass) {
      transporter = nodemailer.createTransport({
        service: emailService,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
      currentEmailUser = emailUser;
      currentEmailPass = emailPass;
      console.log(`\n📧 Email transporter active for: ${emailUser}`);
    }
  } catch (error) {
    console.error("Failed to initialize real email transporter:", error.message);
  }
  return transporter;
};

const sendEmail = async ({ to, bcc, subject, html, text, attachments }) => {
  try {
    const mailTransporter = initTransporter();
    if (mailTransporter) {
      const fromEmail = currentEmailUser || process.env.EMAIL_USER || "";
      await mailTransporter.sendMail({
        from: `"Sri Shanti Mahadev Mandir" <${fromEmail}>`,
        to: to || fromEmail,
        bcc: bcc && bcc.length ? bcc : undefined,
        subject,
        html,
        text,
        attachments,
      });
      console.log(`📧 Real Email sent successfully using [${fromEmail}] to ${to || "BCC list"}${bcc ? ` (${bcc.length} BCC recipients)` : ""}`);
    } else {
      console.log(`📧 (Mock) Email sent to ${to || "BCC recipients"}`);
      console.log(`Subject: ${subject}`);
      console.log(`Message: ${text || html}`);
    }

    // Log to file for testing
    const fs = require("fs");
    const path = require("path");
    const logsDir = path.join(__dirname, "..", "logs");
    if (!require("fs").existsSync(logsDir)) {
      require("fs").mkdirSync(logsDir, { recursive: true });
    }

    const logEntry = `[${new Date().toISOString()}] EMAIL\nTo: ${to}\nSubject: ${subject}\n${text || html}\n\n`;
    fs.appendFileSync(path.join(logsDir, "communications.log"), logEntry);

    return { success: true, type: "email", recipient: to };
  } catch (error) {
    const isQuotaError = error.message && (
      error.message.includes("550-5.4.5") ||
      error.message.includes("Daily user sending limit exceeded") ||
      error.message.includes("ECONNRESET")
    );
    if (isQuotaError) {
      console.error(`\n⚠️  [Google SMTP Notice] Account ${process.env.EMAIL_USER} is currently under Google's daily sending limit block.`);
      console.error(`👉 To send emails right now, update EMAIL_USER and EMAIL_PASS in backend/.env with your Gmail and 16-character App Password (it reloads automatically now).\n`);
    } else {
      console.error("Email error:", error.message);
    }
    return { success: false, type: "email", error: error.message };
  }
};

const sendSMS = async ({ to, message }) => {
  try {
    // TODO: Integrate with actual SMS service (Twilio, AWS SNS, etc.)
    // Example with Twilio:
    // const twilio = require('twilio')(accountSid, authToken);
    // await twilio.messages.create({ body: message, from: twilioNumber, to });

    console.log(`📱 SMS sent to ${to}`);
    console.log(`Message: ${message}`);

    // Log to file for testing
    const fs = require("fs");
    const path = require("path");
    const logsDir = path.join(__dirname, "..", "logs");
    if (!require("fs").existsSync(logsDir)) {
      require("fs").mkdirSync(logsDir, { recursive: true });
    }

    const logEntry = `[${new Date().toISOString()}] SMS\nTo: ${to}\nMessage: ${message}\n\n`;
    fs.appendFileSync(path.join(logsDir, "communications.log"), logEntry);

    return { success: true, type: "sms", recipient: to };
  } catch (error) {
    console.error("SMS error:", error.message);
    return { success: false, type: "sms", error: error.message };
  }
};

const sendNotification = async ({ to, subject, message, messageType = "text" }) => {
  try {
    console.log(`🔔 Notification to ${to}`);
    console.log(`Message: ${message}`);

    const fs = require("fs");
    const path = require("path");
    const logsDir = path.join(__dirname, "..", "logs");
    if (!require("fs").existsSync(logsDir)) {
      require("fs").mkdirSync(logsDir, { recursive: true });
    }

    const logEntry = `[${new Date().toISOString()}] NOTIFICATION\nTo: ${to}\nSubject: ${subject}\nMessage: ${message}\n\n`;
    fs.appendFileSync(path.join(logsDir, "communications.log"), logEntry);

    return { success: true, type: "notification", recipient: to };
  } catch (error) {
    console.error("Notification error:", error.message);
    return { success: false, type: "notification", error: error.message };
  }
};

const {
  generateBookingReceiptPDF,
  generateDonationReceiptPDF,
  generatePrasadamReceiptPDF,
  generateRoomBookingReceiptPDF,
  generateBillReceiptPDF,
} = require("./pdfGenerator");
const { normalizeReceiptData } = require("./receiptNormalizer");
const { generateReceiptHTML } = require("./receiptHtmlTemplate");
const { resolveDevoteeDetails } = require("./devoteeLookup");

/**
 * Send booking confirmation across multiple channels
 * @param {Object} devotee - Devotee information
 * @param {Object} booking - Booking details
 */
const sendBookingConfirmation = async (devotee = {}, booking = {}) => {
  let targetEmail = devotee.email || booking.devoteeEmail || "";
  let targetPhone = devotee.phone || booking.devoteePhone || booking.contactNumber || "";
  let targetAddress = devotee.address || booking.devoteeAddress || booking.address || "";
  let targetName = devotee.name || booking.devoteeName || "";

  try {
    const resolved = await resolveDevoteeDetails({
      name: targetName,
      email: targetEmail,
      phone: targetPhone,
    });
    if (!targetEmail && resolved.email) targetEmail = resolved.email;
    if (!targetPhone && resolved.phone) targetPhone = resolved.phone;
    if (!targetAddress && resolved.address) targetAddress = resolved.address;
    if (!targetName && resolved.name) targetName = resolved.name;
  } catch (_) {}

  const enrichedDevotee = {
    name: targetName || "Devotee",
    email: targetEmail,
    phone: targetPhone,
    address: targetAddress,
  };

  const receiptData = normalizeReceiptData(enrichedDevotee, booking, "pooja");
  const subject = `Pooja Booking Receipt - ${receiptData.receiptNo} | Sri Shanti Mahadev Mandir`;
  const emailHtml = generateReceiptHTML(receiptData);

  const textMessage = `Pooja Booking Confirmed\nReceipt No: ${receiptData.receiptNo}\nDevotee: ${receiptData.devotee.name}\nDate: ${receiptData.bookingDate}\nTotal Paid: Rs. ${receiptData.grandTotal}\n\nYour official receipt is attached to this email. May divine grace be with you! - Sri Shanti Mahadev Mandir`;
  const smsMessage = `Pooja booking confirmed! Receipt: ${receiptData.receiptNo}. Amount: Rs. ${receiptData.grandTotal}. Receipt emailed. -Sri Shanti Mandir`;

  const results = [];
  let attachments = [];
  try {
    const pdfBuffer = await generateBookingReceiptPDF(enrichedDevotee, booking);
    attachments.push({
      filename: `Receipt_${receiptData.receiptNo}.pdf`,
      content: pdfBuffer,
      contentType: "application/pdf",
    });
  } catch (err) {
    console.error("Failed to generate PDF for booking email attachment:", err.message);
  }

  if (targetEmail) {
    results.push(
      await sendEmail({
        to: targetEmail,
        subject,
        html: emailHtml,
        text: textMessage,
        attachments,
      })
    );
  }

  if (targetPhone) {
    results.push(
      await sendSMS({
        to: targetPhone,
        message: smsMessage,
      })
    );
  }

  return results;
};

/**
 * Send donation receipt across multiple channels
 * @param {Object} devotee - Devotee information
 * @param {Object} donation - Donation details
 */
const sendDonationReceipt = async (devotee = {}, donation = {}) => {
  let targetEmail = devotee.email || donation.donorEmail || donation.email || "";
  let targetPhone = devotee.phone || donation.donorPhone || donation.phone || "";
  let targetAddress = devotee.address || donation.donorAddress || donation.address || "";
  let targetName = devotee.name || donation.donorName || "";

  try {
    const resolved = await resolveDevoteeDetails({
      name: targetName,
      email: targetEmail,
      phone: targetPhone,
    });
    if (!targetEmail && resolved.email) targetEmail = resolved.email;
    if (!targetPhone && resolved.phone) targetPhone = resolved.phone;
    if (!targetAddress && resolved.address) targetAddress = resolved.address;
    if (!targetName && resolved.name) targetName = resolved.name;
  } catch (_) {}

  const enrichedDevotee = {
    name: targetName || "Devotee",
    email: targetEmail,
    phone: targetPhone,
    address: targetAddress,
  };

  const receiptData = normalizeReceiptData(enrichedDevotee, donation, "donation");
  const subject = `Temple Donation Receipt - ${receiptData.receiptNo} | Sri Shanti Mahadev Mandir`;
  const emailHtml = generateReceiptHTML(receiptData);

  const textMessage = `Temple Donation Received\nReceipt No: ${receiptData.receiptNo}\nDonor: ${receiptData.devotee.name}\nAmount: Rs. ${receiptData.grandTotal}\nPayment: ${receiptData.paymentMode}\n\nOfficial receipt attached. Thank you for your divine offering! - Sri Shanti Mahadev Mandir`;
  const smsMessage = `Donation received! Receipt: ${receiptData.receiptNo}. Amount: Rs. ${receiptData.grandTotal}. Receipt emailed. -Sri Shanti Mandir`;

  const results = [];
  let attachments = [];
  try {
    const pdfBuffer = await generateDonationReceiptPDF(enrichedDevotee, donation);
    attachments.push({
      filename: `Donation_Receipt_${receiptData.receiptNo}.pdf`,
      content: pdfBuffer,
      contentType: "application/pdf",
    });
  } catch (err) {
    console.error("Failed to generate PDF for donation email attachment:", err.message);
  }

  if (targetEmail) {
    results.push(
      await sendEmail({
        to: targetEmail,
        subject,
        html: emailHtml,
        text: textMessage,
        attachments,
      })
    );
  }

  if (targetPhone) {
    results.push(
      await sendSMS({
        to: targetPhone,
        message: smsMessage,
      })
    );
  }

  return results;
};

/**
 * Send Prasadam order confirmation
 * @param {Object} devotee - Devotee information
 * @param {Object} order - Order details
 */
const sendPrasadamOrderConfirmation = async (devotee = {}, order = {}) => {
  let targetEmail = devotee.email || order.email || order.devoteeEmail || "";
  let targetPhone = devotee.phone || order.phone || order.devoteePhone || "";
  let targetAddress = devotee.address || order.address || order.devoteeAddress || "";
  let targetName = devotee.name || order.devoteeName || "";

  try {
    const resolved = await resolveDevoteeDetails({
      name: targetName,
      email: targetEmail,
      phone: targetPhone,
    });
    if (!targetEmail && resolved.email) targetEmail = resolved.email;
    if (!targetPhone && resolved.phone) targetPhone = resolved.phone;
    if (!targetAddress && resolved.address) targetAddress = resolved.address;
    if (!targetName && resolved.name) targetName = resolved.name;
  } catch (_) {}

  const enrichedDevotee = {
    name: targetName || "Devotee",
    email: targetEmail,
    phone: targetPhone,
    address: targetAddress,
  };

  const receiptData = normalizeReceiptData(enrichedDevotee, order, "prasadam");
  const subject = `Prasadam Order Receipt - ${receiptData.receiptNo} | Sri Shanti Mahadev Mandir`;
  const emailHtml = generateReceiptHTML(receiptData);

  const textMessage = `Prasadam Order Confirmed\nReceipt No: ${receiptData.receiptNo}\nDevotee: ${receiptData.devotee.name}\nTotal: Rs. ${receiptData.grandTotal}\n\nPlease present the attached receipt at the Prasadam Counter. - Sri Shanti Mahadev Mandir`;
  const smsMessage = `Prasadam order confirmed! Receipt: ${receiptData.receiptNo}. Total: Rs. ${receiptData.grandTotal}. Ready at counter. -Sri Shanti Mandir`;

  const results = [];
  let attachments = [];
  try {
    const pdfBuffer = await generatePrasadamReceiptPDF(enrichedDevotee, order);
    attachments.push({
      filename: `Prasadam_Receipt_${receiptData.receiptNo}.pdf`,
      content: pdfBuffer,
      contentType: "application/pdf",
    });
  } catch (err) {
    console.error("Failed to generate PDF for prasadam email attachment:", err.message);
  }

  if (targetEmail) {
    results.push(
      await sendEmail({
        to: targetEmail,
        subject,
        html: emailHtml,
        text: textMessage,
        attachments,
      })
    );
  }

  if (targetPhone) {
    results.push(
      await sendSMS({
        to: targetPhone,
        message: smsMessage,
      })
    );
  }

  return results;
};

/**
 * Send Room Booking Confirmation & Receipt
 * @param {Object} devotee - Devotee information
 * @param {Object} booking - Booking details
 */
const sendRoomBookingConfirmation = async (devotee = {}, booking = {}) => {
  let targetEmail = devotee.email || booking.devoteeEmail || booking.email || "";
  let targetPhone = devotee.phone || booking.devoteePhone || booking.phone || "";
  let targetAddress = devotee.address || booking.devoteeAddress || booking.address || "";
  let targetName = devotee.name || booking.devoteeName || booking.guestName || "";

  try {
    const resolved = await resolveDevoteeDetails({
      name: targetName,
      email: targetEmail,
      phone: targetPhone,
    });
    if (!targetEmail && resolved.email) targetEmail = resolved.email;
    if (!targetPhone && resolved.phone) targetPhone = resolved.phone;
    if (!targetAddress && resolved.address) targetAddress = resolved.address;
    if (!targetName && resolved.name) targetName = resolved.name;
  } catch (_) {}

  const enrichedDevotee = {
    name: targetName || "Devotee",
    email: targetEmail,
    phone: targetPhone,
    address: targetAddress,
  };

  const receiptData = normalizeReceiptData(enrichedDevotee, booking, "room");
  const subject = `Room Allotment Receipt - ${receiptData.receiptNo} | Sri Shanti Mahadev Mandir`;
  const emailHtml = generateReceiptHTML(receiptData);

  const textMessage = `Room Booking Confirmed\nReceipt No: ${receiptData.receiptNo}\nGuest: ${receiptData.devotee.name}\nTotal: Rs. ${receiptData.grandTotal}\n\nPlease present the attached receipt at the Guest House Office. - Sri Shanti Mahadev Mandir`;
  const smsMessage = `Room booked! Receipt: ${receiptData.receiptNo}. Total: Rs. ${receiptData.grandTotal}. Receipt emailed. -Sri Shanti Mandir`;

  const results = [];
  let attachments = [];
  try {
    const pdfBuffer = await generateRoomBookingReceiptPDF(enrichedDevotee, booking);
    attachments.push({
      filename: `Room_Receipt_${receiptData.receiptNo}.pdf`,
      content: pdfBuffer,
      contentType: "application/pdf",
    });
  } catch (err) {
    console.error("Failed to generate PDF for room booking email attachment:", err.message);
  }

  if (targetEmail) {
    results.push(
      await sendEmail({
        to: targetEmail,
        subject,
        html: emailHtml,
        text: textMessage,
        attachments,
      })
    );
  }

  if (targetPhone) {
    results.push(
      await sendSMS({
        to: targetPhone,
        message: smsMessage,
      })
    );
  }

  return results;
};

/**
 * Send Consolidated Bill receipt across multiple channels
 * @param {Object} bill - Bill details (with items, amount, etc.)
 */
const sendBillReceipt = async (bill = {}) => {
  let targetEmail = bill.devoteeEmail || bill.email || "";
  let targetPhone = bill.devoteePhone || bill.phone || "";
  let targetAddress = bill.devoteeAddress || bill.address || "";
  let targetName = bill.devoteeName || "";

  try {
    const resolved = await resolveDevoteeDetails({
      name: targetName,
      email: targetEmail,
      phone: targetPhone,
    });
    if (!targetEmail && resolved.email) targetEmail = resolved.email;
    if (!targetPhone && resolved.phone) targetPhone = resolved.phone;
    if (!targetAddress && resolved.address) targetAddress = resolved.address;
    if (!targetName && resolved.name) targetName = resolved.name;
  } catch (_) {}

  const enrichedDevotee = {
    name: targetName || "Devotee",
    email: targetEmail,
    phone: targetPhone,
    address: targetAddress,
  };

  const receiptData = normalizeReceiptData(enrichedDevotee, bill, "bill");
  const subject = `Official Temple Receipt - ${receiptData.receiptNo} | Sri Shanti Mahadev Mandir`;
  const emailHtml = generateReceiptHTML(receiptData);

  const textMessage = `Official Temple Receipt\nReceipt No: ${receiptData.receiptNo}\nDevotee: ${receiptData.devotee.name}\nTotal: Rs. ${receiptData.grandTotal}\nPayment: ${receiptData.paymentMode}\n\nYour official receipt is attached. May the divine grace always be with you! - Sri Shanti Mahadev Mandir`;
  const smsMessage = `Receipt generated! No: ${receiptData.receiptNo}. Total: Rs. ${receiptData.grandTotal}. Receipt emailed. -Sri Shanti Mandir`;

  const results = [];
  let attachments = [];
  try {
    const pdfBuffer = await generateBillReceiptPDF(enrichedDevotee, bill);
    attachments.push({
      filename: `Receipt_${receiptData.receiptNo}.pdf`,
      content: pdfBuffer,
      contentType: "application/pdf",
    });
  } catch (err) {
    console.error("Failed to generate PDF for bill receipt attachment:", err.message);
  }

  if (targetEmail) {
    results.push(
      await sendEmail({
        to: targetEmail,
        subject,
        html: emailHtml,
        text: textMessage,
        attachments,
      })
    );
  }

  if (targetPhone) {
    results.push(
      await sendSMS({
        to: targetPhone,
        message: smsMessage,
      })
    );
  }

  return results;
};

/**
 * Send Festival Notification to Devotees
 * @param {Object} event - Event details
 * @param {Array} devotees - List of devotee objects
 */
const sendFestivalNotification = async (event, devotees) => {
  const subject = `Upcoming Festival: ${event.title}`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #d4a574;">New Festival Announcement</h2>
      <p>Dear Devotee,</p>
      <p>We are delighted to invite you to <strong>${event.title}</strong> at our temple.</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
        <p><strong>Location:</strong> ${event.location}</p>
        <p><strong>Description:</strong> ${event.description}</p>
      </div>
      <p>Join us to seek blessings. We look forward to your presence.</p>
      <p>Best regards,<br>Temple Management</p>
    </div>
  `;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validDevoteeEmails = [
    ...new Set(
      (devotees || [])
        .map((d) => String(d?.email || "").trim().toLowerCase())
        .filter((em) => emailRegex.test(em))
    ),
  ];

  if (validDevoteeEmails.length > 0) {
    await sendEmail({
      to: process.env.EMAIL_USER || "ganga.mca2002@gmail.com",
      bcc: validDevoteeEmails,
      subject,
      html: emailHtml,
      text: textMessage,
    }).catch((err) => console.warn("sendFestivalNotification BCC error:", err.message));
  }

  for (const devotee of devotees || []) {
    if (devotee?.phone) {
      await sendSMS({ to: devotee.phone, message: smsMessage }).catch(() => {});
    }
  }
};

module.exports = {
  sendEmail,
  sendSMS,
  sendNotification,
  sendBookingConfirmation,
  sendDonationReceipt,
  sendPrasadamOrderConfirmation,
  sendRoomBookingConfirmation,
  sendBillReceipt,
  sendFestivalNotification,
};
