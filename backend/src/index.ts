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
import recipientRoutes from "./routes/recipient.routes";
import auditLogRoutes from "./routes/auditLog.routes";
import statsRoutes from "./routes/stats.routes";
import { startExpiryJob } from "./utils/expiry.job";

const app = express();

// Cấu hình CORS cho phép tất cả origins (dev) hoặc các origin cụ thể
const allowedOrigins = [
  "http://localhost:3000",   // Docker production frontend
  "http://localhost:5173",   // Vite dev server
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Cho phép requests không có origin (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Trong production Docker, nginx proxy đến backend nên origin là frontend container
      return callback(null, true); // Cho phép tất cả trong thời điểm này
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Mount routes
app.use("/auth", authRoutes);
app.use(authMiddleware);
app.use("/2fa", twofaRoutes);
app.use("/users", userRoutes);
app.use("/contracts", contractRoutes);
app.use("/signatures", signatureRoutes);
app.use("/recipients", recipientRoutes);
app.use("/audit-logs", auditLogRoutes);
app.use("/stats", statsRoutes);

// Khởi động server sau khi kết nối DB thành công
AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    startExpiryJob();
    app.listen(process.env.PORT || 5000, () => {
      console.log(` Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error("DB Connection Error:", err));
