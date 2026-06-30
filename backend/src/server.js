require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");
const eventRoutes = require("./routes/eventRoutes");
const PORT = process.env.PORT || 5000;
app.use("/api/events", eventRoutes);
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

// Touch to force nodemon restart after changing default devotee prasadam status to Placed
