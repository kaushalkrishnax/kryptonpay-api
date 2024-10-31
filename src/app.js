import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import paymentRouter from "./routes/payment.routes.js";
import appRouter from "./routes/app.routes.js";
import { ApiResponse } from "./utils/ApiResponse.js";

/** Configurations */
const app = express();

app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

/** List of allowed origins */
const allowedOrigins = [
  "http://127.0.0.1:5500",
  "https://billing.xyrocloud.in",
  "https://payments.kryptonlab.tech",
  "http://13.127.170.65:8000",
  "http://13.127.170.65:80",
];

/** CORS Middleware */
app.use((req, res, next) => {
  const origin = req.get("Origin");
  const isApiRoute = req.path.startsWith("/api/v1");

  if (isApiRoute && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, kp-api-key"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );

    if (req.method === "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  } else if (!isApiRoute) {
    next();
  } else {
    res
      .status(403)
      .json(new ApiResponse(403, null, "Forbidden: Access denied"));
  }
});

/** Test App */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

/** API Routes */
app.get("/api", (req, res) => {
  res.status(200).json(new ApiResponse(200, null, "KryptonPay API is live"));
});

// Protected API routes
app.get("/api/v1", (req, res) => {
  res.status(200).json(new ApiResponse(200, null, "Allowed: Access approved"));
});
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/app", appRouter);

export { app };
