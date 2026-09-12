const mongoose = require("mongoose");
const { createNotification } = require("./src/utils/notificationService");
require("dotenv").config();

async function testNotification() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("❌ MONGODB_URI is missing in environment variables!");
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    const res = await createNotification({
      title: "Test Email Notification",
      message: "This is a test notification to ensure emails are dispatched.",
      audienceEmail: "kulalshiva3.sk@gmail.com",
      audienceRole: "priest",
      category: "duty"
    });

    console.log("Notification created:", res);

    // Wait a moment for async email
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log("Done.");
    process.exit(0);
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

testNotification();
