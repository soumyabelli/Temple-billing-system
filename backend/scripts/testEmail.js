const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env"), override: true });
const nodemailer = require("nodemailer");

const emailUser = (process.env.EMAIL_USER || "").trim();
const rawPass = (process.env.EMAIL_PASS || "").trim();
const emailPass = rawPass.replace(/\s+/g, "");

console.log("==================================================");
console.log("   TEMPLE SYSTEM - EMAIL DIAGNOSTIC TEST");
console.log("==================================================");
console.log(`Checking credentials from backend/.env:`);
console.log(`- EMAIL_USER: ${emailUser || "(empty)"}`);
console.log(`- EMAIL_PASS: ${emailPass ? `****${emailPass.slice(-4)} (${emailPass.length} chars)` : "(empty)"}`);
console.log("--------------------------------------------------");

if (!emailUser || !emailPass) {
  console.error("❌ ERROR: EMAIL_USER or EMAIL_PASS is missing in backend/.env!");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

console.log("1. Testing SMTP login authentication with Google...");
transporter.verify(async (err) => {
  if (err) {
    console.error("❌ LOGIN FAILED:", err.message);
    if (err.message.includes("535") || err.message.includes("Username and Password not accepted")) {
      console.error("\n👉 Tip: Google rejected the password. Please make sure 2-Step Verification is ON in your Google Account and you generated a 16-letter App Password from https://myaccount.google.com/apppasswords");
    }
    process.exit(1);
  }

  console.log("✅ LOGIN SUCCESS! Google authenticated your account successfully.");
  console.log("2. Attempting to send a real test email...");

  const recipient = "deepthiskulal@gmail.com";
  transporter.sendMail(
    {
      from: `"Sri Shanti Mahadev Mandir" <${emailUser}>`,
      to: recipient,
      subject: "Test Notification: Temple Billing System",
      text: `Hello! This is a test email sent from the Temple Billing System using account: ${emailUser}. Google SMTP delivery is active and working!`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #fff8ee; border: 1px solid #e2a045; border-radius: 8px;">
          <h2 style="color: #b46a13; margin-top: 0;">Sri Shanti Mahadev Mandir</h2>
          <p style="font-size: 15px; color: #333;">
            This is a test notification confirming that email broadcasting is successfully configured and working!
          </p>
          <p style="font-size: 13px; color: #777;">Sent via: <strong>${emailUser}</strong></p>
        </div>
      `,
    },
    (sendErr, info) => {
      if (sendErr) {
        console.error("\n❌ SEND FAILED:", sendErr.message);
        if (sendErr.message.includes("550-5.4.5") || sendErr.message.includes("Daily user sending limit exceeded")) {
          console.error("\n⚠️ Google Daily Limit Block: This account has exceeded Google's 500-recipient daily limit. Google will unblock it after 24 hours.");
        }
      } else {
        console.log("\n🎉 SUCCESS! Test email was accepted by Google and delivered!");
        console.log(`Recipient: ${recipient}`);
        console.log(`Google response: ${info.response}`);
      }
      process.exit(0);
    }
  );
});
