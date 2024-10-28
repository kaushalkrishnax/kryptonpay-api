import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyApp } from "../middlewares/entry.middleware.js";
import {
  registerApp,
  generateRefreshToken,
  generateApiKey,
  getRazorpayKeyId,
} from "../controllers/app.controller.js";
const appRouter = express.Router();

appRouter.post("/register", asyncHandler(registerApp));

appRouter.post("/generate-api-key", verifyApp, asyncHandler(generateApiKey));

appRouter.post("/generate-refresh-token", asyncHandler(generateRefreshToken));

appRouter.post("/razorpay-key-id", verifyApp, asyncHandler(getRazorpayKeyId));

appRouter.post(
  "/verify",
  verifyApp,
  asyncHandler(async (req, res) => {
    res.send("API is accessible");
  })
);

export default appRouter;
