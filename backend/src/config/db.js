const mongoose = require("mongoose");

const MONGO_TIMEOUT_MS = Number(
  process.env.MONGO_CONNECT_TIMEOUT_MS || 8000
);

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn("MongoDB URI missing.");
    return false;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: MONGO_TIMEOUT_MS,
    });

    console.log("MongoDB connected");
    return true;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    return false;
  }
};

const isDbConnected = () => mongoose.connection.readyState === 1;

module.exports = {
  connectDB,
  isDbConnected,
};