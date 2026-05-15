<<<<<<< HEAD
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const app = require("./app");

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
=======
>>>>>>> 6c4d3b5e37e05e713d8ed849cb682b216b7d396e
