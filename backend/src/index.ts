const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
import { AppDataSource } from "./config/data_source";
import authRoutes from "./routes/auth.routes";
import { authMiddleware } from "./middlewares/auth.middlewares";
import contractRoutes from "./routes/contract.routes";

const app = express();
app.use(cors());
app.use(express.json());

// Mount routes
app.use("/auth", authRoutes);
app.use(authMiddleware);

app.use("/contracts", contractRoutes);
// các route khác sau khi xác thực
AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log(` Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error("DB Connection Error:", err));
