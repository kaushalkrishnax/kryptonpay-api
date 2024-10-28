import { App } from "../models/app.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

export const registerApp = async (req, res) => {
  const requiredFields = ["appName", "appType"];

  requiredFields.forEach((field) => {
    if (!req.body[field]) {
      throw new ApiError(400, `${field} is required`);
    }
  });

  const { appName, appType } = req.body;

  console.log(req.body);

  const localApp = new App({
    appId: `kp-${appName
      .replace(" ", "_")
      .toLowerCase()}-${Date.now().toString()}-app`,
    appName,
    appType,
  });

  const apiKey = await localApp.generateApiKey();
  localApp.apiKey = apiKey;

  const appExists = await App.findOne({ appId: localApp.appId });
  if (appExists) {
    throw new ApiError(500, "App already exists, Please retry");
  }

  const app = await localApp.save();

  res
    .status(201)
    .json(new ApiResponse(201, app, "App registered successfully"));
};

export const generateApiKey = async (req, res) => {
  const apiKey = await req.app.generateApiKey();

  const app = await App.findOne({ appId: req.app.appId });
  req.app.apiKey = apiKey;
  app.apiKey = apiKey;
  await app.save();
  res
    .status(201)
    .json(new ApiResponse(201, { apiKey }, "API key generated successfully"));
};

export const generateRefreshToken = async (req, res) => {
  const apiKey = req.headers["kp-api-key"];

  if (!apiKey) {
    throw new ApiError(400, "API key is required");
  }

  let appId;
  try {
    const decoded = jwt.verify(apiKey, process.env.API_KEY_SECRET);
    appId = decoded.appId;
  } catch (error) {
    throw new ApiError(401, "Invalid API key");
  }

  const app = await App.findOne({ appId });
  if (!app) {
    throw new ApiError(401, "Invalid API key");
  }

  const refreshToken = await app.generateRefreshToken();

  app.save();

  res.cookie("kpRefreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    sameSite: "strict",
  });

  res.status(201).json({ message: "Refresh token generated successfully" });
};

export const getRazorpayKeyId = async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, { key: process.env.RAZORPAY_KEY_ID }));
};
