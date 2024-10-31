import { App } from "../models/app.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { decryptApiKey } from "../utils/decryptApiKey.js";

export const registerApp = async (req, res) => {
  try {
    const requiredFields = ["appName", "appType"];

    requiredFields.forEach((field) => {
      if (!req.body[field]) {
        throw new ApiError(400, `${field} is required`);
      }
    });

    const { appName, appType } = req.body;

    if (!["dev", "prod", "other"].includes(appType)) {
      throw new ApiError(400, "Invalid app type");
    }

    const localApp = new App({
      appId: `kp-${appName
        .replace(" ", "_")
        .toLowerCase()}-${Date.now().toString()}-app`,
      appName,
      appType,
    });

    localApp.apiKey = await localApp.generateApiKey();

    const app = await localApp.save();
    req.app = app;

    res
      .status(201)
      .json(new ApiResponse(201, { app }, "App registered successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something went wrong while registering app"
    );
  }
};

export const generateApiKey = async (req, res) => {
  try {
    const app = await App.findOne({ appId: req.app.appId });

    const apiKey = await app.generateApiKey();
    req.app.apiKey = apiKey;

    await app.save();

    res
      .status(201)
      .json(new ApiResponse(201, { apiKey }, "API key generated successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something went wrong while generating API key"
    );
  }
};

export const generateAccessToken = async (req, res) => {
  try {
    const apiKey = req.headers["kp-api-key"];

    if (!apiKey) {
      throw new ApiError(401, "Unauthorized request: No API key provided");
    }

    const appId = decryptApiKey(apiKey);
    const app = await App.findOne({ appId });

    if (!app) {
      throw new ApiError(401, "Unauthorized request: Invalid API key");
    }

    const accessToken = await app.generateAccessToken();
    await app.save();

    res.cookie("_kpat", accessToken, {
      httpOnly: true,
      secure: false, //PROD: true
      maxAge: 15 * 60 * 1000, // 15 minutes
      sameSite: "strict",
    });

    res
      .status(201)
      .json(new ApiResponse(201, null, "Access token generated successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something went wrong while generating access token"
    );
  }
};

export const getRazorpayKeyId = async (req, res) => {
  try {
    res
      .status(200)
      .json(new ApiResponse(200, { key: process.env.RAZORPAY_KEY_ID }));
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something went wrong while getting Razorpay key id"
    );
  }
};

export const revokeApiKey = async (req, res) => {
  try {
    const app = await App.findOne({ appId: req.app.appId });

    req.app.apiKey = null;
    await app.revokeApiKey();

    await app.save();

    delete app.accessToken;
    delete app.salt;

    res
      .status(200)
      .json(
        new ApiResponse(
          201,
          { app },
          "API key revoked, Please generate a new one from the dashboard"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something went wrong while revoking API key"
    );
  }
};
