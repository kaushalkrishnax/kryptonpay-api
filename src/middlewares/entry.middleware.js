import { App } from "../models/app.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { decryptApiKey } from "../utils/decryptApiKey.js";

export const verifyApp = asyncHandler(async (req, _, next) => {
  try {
    const apiKey = req?.header("kp-api-key");
    const accessToken = req?.cookies?._kpat;

    if (!apiKey || apiKey.trim() === "") {
      throw new ApiError(401, "Unauthorized request: No API key provided");
    }

    if (!accessToken) {
      throw new ApiError(401, "Unauthorized request: No access token found");
    }

    const appId = decryptApiKey(apiKey);
    const app = await App.findOne({ appId });

    if (!app) {
      throw new ApiError(401, "Unauthorized request: Invalid API key");
    }

    const isValidAccessToken = await app.validateAccessToken(accessToken);
    if (!isValidAccessToken) {
      throw new ApiError(401, "Unauthorized request: Invalid access token");
    }

    delete app.accessToken, app.salt;

    req.app = app;

    next();
  } catch (error) {
    throw new ApiError(401, error.message || "Unauthorized request");
  }
});
