import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

/** Use this CORS for production */
app.use(
  cors((req, callback) => {
    const allowedOrigins = [
      "https://billing.xyrocloud.in",
      "http://13.127.170.65",
    ];
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  })
);

/**CAUTION: Remove this for production */
// app.use(cors({
//   origin: "http://localhost:3000",
//   credentials: true,
// }));

app.use(cookieParser());

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

import paymentRouter from "./routes/payment.routes.js";
import appRouter from "./routes/app.routes.js";

app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/app", appRouter);

export { app };
