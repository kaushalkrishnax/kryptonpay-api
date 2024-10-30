import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import paymentRouter from "./routes/payment.routes.js";
import appRouter from "./routes/app.routes.js";

const app = express();

/** Use this CORS for production */
app.use(
  cors((req, callback) => {
    const allowedIPs = ["13.127.170.65"];

    const clientIP =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      
    if (allowedIPs.includes(clientIP)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  })
);

/**CAUTION: Remove this for production */
// app.use(cors({
//   origin: "*",
//   credentials: true,
// }));

// Configurations
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.get("/api/v1", (req, res) => {
  res.status(200).json({ message: "KryptonPay API is live", success: true });
});

// Static Webpage
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "static")));

// Routes
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/app", appRouter);

export { app };
