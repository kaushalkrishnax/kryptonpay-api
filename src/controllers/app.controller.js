import { App } from "../models/app.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { decryptApiKey } from "../utils/decryptApiKey.js";

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

export const generateAccessToken = async (req, res) => {
  const apiKey = req.headers["kp-api-key"];

  if (!apiKey) {
    throw new ApiError(401, "API key is required");
  }

  const appId = decryptApiKey(apiKey);
  const app = await App.findOne({ appId });

  if (!app) {
    throw new ApiError(401, "Unauthorized request: Invalid API key");
  }

  const accessToken = await app.generateAccessToken();

  app.save();

  res.cookie("_kpat", accessToken, {
    httpOnly: true,
    secure: false, //PROD:  true
    maxAge: 15 * 60 * 1000, // 15 minutes
    sameSite: "strict",
  });

  res
    .status(201)
    .json(
      new ApiResponse(201, { apiKey }, "Access token generated successfully")
    );
};

export const getRazorpayKeyId = async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, { key: process.env.RAZORPAY_KEY_ID }));
};

export const revokeApiKey = async (req, res) => {
  const apiKey = req.headers["kp-api-key"];

  if (!apiKey) {
    throw new ApiError(401, "API key is required");
  }

  const appId = decryptApiKey(apiKey);
  const app = await App.findOne({ appId });

  if (!app) {
    throw new ApiError(401, "Unauthorized request: Invalid API key");
  }

  app.apiKey = null;
  app.accessToken = null;
  await app.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        201,
        { appId: app.appId },
        "API key revoked, Please generate a new one from dashboard"
      )
    );
};
