require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const dbConnected = await connectDB();

  if (!dbConnected) {
    console.warn("Starting without MongoDB. Auth will use local file fallback.");
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
