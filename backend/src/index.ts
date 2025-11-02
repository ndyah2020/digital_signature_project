const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
import { AppDataSource } from "./config/data_source";
import authRoutes from "./routes/auth.routes";
import { authMiddleware } from "./middlewares/auth.middlewares";
import contractRoutes from "./routes/contract.routes";
import signatureRoutes from "./routes/signature.routes";
import userRoutes from "./routes/user.routes";
import twofaRoutes from "./routes/twofa.routes";
import { startExpiryJob } from "./utils/expiry.job";
const app = express();
app.use(cors());
app.use(express.json());

// Mount routes
app.use("/auth", authRoutes);
app.use(authMiddleware);
app.use("/2fa", twofaRoutes);
app.use("/users", userRoutes);
app.use("/contracts", contractRoutes);
app.use("/signatures", signatureRoutes);
// các route khác sau khi xác thực
AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    startExpiryJob();
    app.listen(process.env.PORT || 5000, () => {
      console.log(` Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error("DB Connection Error:", err));
