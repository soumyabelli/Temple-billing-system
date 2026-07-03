const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../backend/.env") });

const User = require("../backend/src/models/User");

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const users = await User.find({ role: "devotee" });
    console.log("DEVOTEE USERS:");
    users.forEach(u => {
      console.log(`User: ID=${u._id}, Name=${u.name}, Email=${u.email}, Password_is_present=${!!u.password}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
