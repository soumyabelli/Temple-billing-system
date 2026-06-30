/**
 * Communication Service - Handles Email, SMS, and Message Notifications
 * This service integrates with email providers (like SendGrid/Nodemailer)
 * and SMS providers (like Twilio)
 */

// Mock implementations for demonstration
// In production, replace with actual provider integrations

let transporter = null;
const initTransporter = () => {
  if (transporter) return transporter;
  try {
    const nodemailer = require("nodemailer");
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
      console.log("Real NodeMailer SMTP transporter initialized successfully.");
    }
  } catch (error) {
    console.error("Failed to initialize real email transporter:", error.message);
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailTransporter = initTransporter();
    if (mailTransporter) {
      await mailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
        text,
      });
      console.log(`📧 Real Email sent to ${to}`);
    } else {
      console.log(`📧 (Mock) Email sent to ${to}`);
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
    console.error("Email error:", error.message);
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

/**
 * Send booking confirmation across multiple channels
 * @param {Object} devotee - Devotee information
 * @param {Object} booking - Booking details
 */
const sendBookingConfirmation = async (devotee, booking) => {
  const subject = "Pooja Booking Confirmation";
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #d4a574;">Pooja Booking Confirmation</h2>
      <p>Dear ${devotee.name},</p>
      <p>Your pooja booking has been confirmed!</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Service:</strong> ${booking.service}</p>
        <p><strong>Date & Time:</strong> ${booking.datetime}</p>
        <p><strong>Amount:</strong> ₹${booking.amount}</p>
        <p><strong>Status:</strong> ${booking.status}</p>
      </div>
      <p>Thank you for choosing our temple. We look forward to serving you!</p>
      <p>Best regards,<br>Temple Management</p>
    </div>
  `;

  const textMessage = `Pooja Booking Confirmation\nService: ${booking.service}\nDate & Time: ${booking.datetime}\nAmount: ₹${booking.amount}\nThank you!`;

  const smsMessage = `Pooja booking confirmed! Service: ${booking.service} on ${booking.datetime}. Amount: ₹${booking.amount}. -Temple`;

  const results = [];

  // Send email
  if (devotee.email) {
    results.push(
      await sendEmail({
        to: devotee.email,
        subject,
        html: emailHtml,
        text: textMessage,
      })
    );
  }

  // Send SMS
  if (devotee.phone) {
    results.push(
      await sendSMS({
        to: devotee.phone,
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
const sendDonationReceipt = async (devotee, donation) => {
  const subject = "Donation Receipt";
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #d4a574;">Donation Receipt</h2>
      <p>Dear ${devotee.name},</p>
      <p>Thank you for your generous donation to our temple!</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Amount:</strong> ₹${donation.amount}</p>
        <p><strong>Category:</strong> ${donation.category}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Transaction ID:</strong> ${donation.transactionId || "N/A"}</p>
      </div>
      <p>Your contribution helps us maintain and serve the community better. May you be blessed!</p>
      <p>Best regards,<br>Temple Management</p>
    </div>
  `;

  const textMessage = `Donation Receipt\nAmount: ₹${donation.amount}\nCategory: ${donation.category}\nTransaction ID: ${donation.transactionId || "N/A"}\nThank you for your donation!`;

  const smsMessage = `Donation received! Amount: ₹${donation.amount}. Transaction ID: ${donation.transactionId || "N/A"}. Thank you! -Temple`;

  const results = [];

  // Send email
  if (devotee.email) {
    results.push(
      await sendEmail({
        to: devotee.email,
        subject,
        html: emailHtml,
        text: textMessage,
      })
    );
  }

  // Send SMS
  if (devotee.phone) {
    results.push(
      await sendSMS({
        to: devotee.phone,
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
const sendPrasadamOrderConfirmation = async (devotee, order) => {
  const subject = "Prasadam Order Confirmation";
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #d4a574;">Prasadam Order Confirmation</h2>
      <p>Dear ${devotee.name},</p>
      <p>Your Prasadam order has been received and confirmed!</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Item:</strong> ${order.item || "Prasadam"}</p>
        <p><strong>Quantity:</strong> ${order.quantity || 1}</p>
        <p><strong>Amount:</strong> ₹${order.amount || 0}</p>
        <p><strong>Status:</strong> ${order.status}</p>
      </div>
      <p>Your order will be ready for pickup soon. Thank you!</p>
      <p>Best regards,<br>Temple Management</p>
    </div>
  `;

  const textMessage = `Prasadam Order Confirmed\nItem: ${order.item || "Prasadam"}\nQuantity: ${order.quantity || 1}\nAmount: ₹${order.amount || 0}\nThank you!`;

  const smsMessage = `Prasadam order confirmed! Item: ${order.item || "Prasadam"}. Qty: ${order.quantity || 1}. Ready soon! -Temple`;

  const results = [];

  // Send email
  if (devotee.email) {
    results.push(
      await sendEmail({
        to: devotee.email,
        subject,
        html: emailHtml,
        text: textMessage,
      })
    );
  }

  // Send SMS
  if (devotee.phone) {
    results.push(
      await sendSMS({
        to: devotee.phone,
        message: smsMessage,
      })
    );
  }

  return results;
};

module.exports = {
  sendEmail,
  sendSMS,
  sendNotification,
  sendBookingConfirmation,
  sendDonationReceipt,
  sendPrasadamOrderConfirmation,
};
