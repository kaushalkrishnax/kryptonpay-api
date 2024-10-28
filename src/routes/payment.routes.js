import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createOrder,
  verifyPayment,
} from "../controllers/payment.controller.js";
import { verifyApp } from "../middlewares/entry.middleware.js";

const orderRouter = express.Router();

orderRouter.post("/create", verifyApp, asyncHandler(createOrder));

orderRouter.post("/verify", verifyApp, asyncHandler(verifyPayment));

export default orderRouter;
