const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcryptjs");

dotenv.config({ path: path.join(__dirname, "../backend/.env") });

const User = require("../backend/src/models/User");

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const hashedPassword = await bcrypt.hash("123456", 10);
    const result = await User.updateOne(
      { email: "devote@gmail.com" },
      { $set: { password: hashedPassword } }
    );
    console.log("Password updated:", result);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
