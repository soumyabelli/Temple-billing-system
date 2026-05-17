const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MongoDB URI missing. Set MONGODB_URI in backend/.env");
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
};

module.exports = connectDB;
