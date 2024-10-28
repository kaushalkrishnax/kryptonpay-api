import crypto from "crypto";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { razorpay } from "../utils/razorpay.js";
import { Payment } from "../models/payment.model.js";

export const createOrder = async (req, res) => {
  const requiredFields = ["amount", "currency"];
  requiredFields.forEach((field) => {
    if (!req.body[field]) {
      throw new ApiError(400, `${field} is required`);
    }
  });

  const { amount, currency } = req.body;

  const options = {
    amount: Number(amount),
    currency: currency,
    // receipt: receipt,
    payment_capture: 1,
  };

  try {
    const razorpayOrder = await razorpay.orders.create(options);

    res
      .status(201)
      .json(
        new ApiResponse(201, { razorpayOrder }, "Order created successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Failed to create order with Razorpay");
  }
};

export const verifyPayment = async (req, res) => {
  const requiredFields = [
    "razorpay_order_id",
    "razorpay_payment_id",
    "razorpay_signature",
  ];
  requiredFields.forEach((field) => {
    if (!req.body[field]) {
      throw new ApiError(400, `${field} is required`);
    }
  });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, currency } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    try {
      const payment = await Payment.create({
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amount: Number(amount),
        currency: currency,
        status: "captured",
        razorpaySignature: razorpay_signature,
      });

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            payment,
            "Payment verified and recorded successfully"
          )
        );
    } catch (error) {
      throw new ApiError(500, "Failed to record payment in the database");
    }
  } else {
    res.status(400).json(new ApiError(400, "Payment verification failed"));
  }
};