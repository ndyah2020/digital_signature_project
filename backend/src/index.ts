const express = require("express");
const cors = require("cors");
import { AppDataSource } from "./config/data_source";
const dotenv = require("dotenv");
import authRoutes from "./routes/auth.routes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
// Mount routes
app.use("/auth", authRoutes);

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log(` Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error("DB Connection Error:", err));
