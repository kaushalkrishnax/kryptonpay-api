import express from "express";
import requestIp from "request-ip";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import paymentRouter from "./routes/payment.routes.js";
import appRouter from "./routes/app.routes.js";

const app = express();

// List of allowed origins
const allowedOrigins = [
    'http://127.0.0.1:5500',
    'https://billing.xyrocloud.in',
    'https://payments.kryptonlab.tech',
    'http://13.127.170.65:8000',
    'http://13.127.170.65:80',
];

// CORS configuration
app.use((req, res, next) => {
    const origin = req.get('Origin');
    const isApiRoute = req.path.startsWith('/api/v1');

    if (isApiRoute && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
	next()
	res.status(200).json({ message: 'Allowed: Access approved' })
    } else if (!isApiRoute) {
	// Only non-apiRoute request allowed
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Access denied' });
    }
});

// Configurations
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Test route
app.get("/api", (req, res) => {
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