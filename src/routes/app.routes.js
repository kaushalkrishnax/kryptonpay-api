import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyApp } from "../middlewares/entry.middleware.js";
import {
  registerApp,
  generateApiKey,
  generateAccessToken,
  getRazorpayKeyId,
  revokeApiKey,
} from "../controllers/app.controller.js";
const appRouter = express.Router();

appRouter.post("/register", asyncHandler(registerApp));
appRouter.post("/generate-access-token", asyncHandler(generateAccessToken));
appRouter.post("/generate-api-key", verifyApp, asyncHandler(generateApiKey));
appRouter.post("/razorpay-key-id", verifyApp, asyncHandler(getRazorpayKeyId));
appRouter.post("/revoke-api-key", verifyApp, asyncHandler(revokeApiKey));
appRouter.post(
  "/verify",
  verifyApp,
  asyncHandler(async (req, res) => {
    res.status(200).json({message: "success", success: true});
  })
);

export default appRouter;
