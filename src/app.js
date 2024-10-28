import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from 'url';

const app = express();

/** Use this CORS for production */
/*app.use(
  cors((req, callback) => {
    const allowedOrigins = [
      "https://billing.xyrocloud.in",
      "http://13.127.170.65:80"
    ];
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  })
);*/

/**CAUTION: Remove this for production */
app.use(cors({
  origin: "*",
  credentials: true,
}));

app.use(cookieParser());

app.use(express.json({ limit: "16kb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static(path.join(__dirname, 'static')));

import paymentRouter from "./routes/payment.routes.js";
import appRouter from "./routes/app.routes.js";

//app.get("/", (req, res) => {
  //res.send("KryptonPay Server is running")
//})

app.get("/api/v1", (req, res) => {
    res.status(200).json({message: "KryptonPay API is live", success: true})
});

app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/app", appRouter);

export { app };
