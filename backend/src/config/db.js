const mongoose = require("mongoose");
const dns = require("dns");

const MONGO_TIMEOUT_MS = Number(process.env.MONGO_CONNECT_TIMEOUT_MS || 8000);

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn("MongoDB URI missing. Running without MongoDB connection.");
    return false;
  }

  if (mongoUri.startsWith("mongodb+srv://")) {
    const dnsServers = (process.env.DNS_SERVERS || "8.8.8.8,1.1.1.1")
      .split(",")
      .map((server) => server.trim())
      .filter(Boolean);

    if (dnsServers.length > 0) {
      dns.setServers(dnsServers);
    }
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: MONGO_TIMEOUT_MS,
    });
    console.log("MongoDB connected");
    return true;
  } catch (error) {
    console.warn(`MongoDB connection failed: ${error.message}`);
    return false;
  }
};

const isDbConnected = () => mongoose.connection.readyState === 1;

module.exports = {
  connectDB,
  isDbConnected,
};
