import express from "express";
import requestIp from "request-ip";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import paymentRouter from "./routes/payment.routes.js";
import appRouter from "./routes/app.routes.js";

const app = express();

app.use(cors());

const allowedOrigins = ['http://13.127.170.65', 'http://127.0.0.1:5500'];

app.use((req, res, next) => {
    const origin = req.get('Origin');

    console.log(`Request from Origin: ${origin}`);

    if (allowedOrigins.includes(origin)) {
        console.log('Allowed');
	res.status(200).json({message: 'Allowed: Your origin is allowed'});
        next();
    } else {
        console.log('Blocked');
        res.status(403).send({message: 'Forbidden: Your origin is not allowed'});
    }
});

// Configurations
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Test route
app.get("/api/v1", (req, res) => {
  res.status(200).json({ message: "KryptonPay API is live", success: true });
});

// Static Webpage Serving
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "static")));

// Routes
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/app", appRouter);

export { app };
