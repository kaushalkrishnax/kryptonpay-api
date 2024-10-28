import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { App } from "../models/app.model.js";
import jwt from "jsonwebtoken";

export const verifyApp = asyncHandler(async (req, _, next) => {
  try {
    const apiKey = req.header("kp-api-key");
    const refreshToken = req.cookies?.kpRefreshToken;

    if (!apiKey || apiKey.trim() === "") {
      throw new ApiError(401, "Unauthorized request: No API key provided");
    }

    if (!refreshToken) {
      throw new ApiError(401, "Unauthorized request: No refresh token found");
    }

    let decodedApiKey;
    try {
      decodedApiKey = jwt.verify(apiKey, process.env.API_KEY_SECRET);
    } catch (error) {
      throw new ApiError(401, "Unauthorized request: Invalid API key");
    }

    const appId = decodedApiKey.appId;

    const app = await App.findOne({ appId });

    if (app.apiKey !== apiKey) {
      throw new ApiError(401, "Unauthorized request: Invalid API key");
    }

    if (!app) {
      throw new ApiError(401, "Unauthorized request: Invalid API key");
    }

    const isValidRefreshToken = await app.validateRefreshToken(refreshToken);
    if (!isValidRefreshToken) {
      throw new ApiError(401, "Unauthorized request: Invalid refresh token");
    }

    req.app = app;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(
        401,
        "Unauthorized request: Invalid API key or refresh token"
      );
    } else if (error.name === "TokenExpiredError") {
      throw new ApiError(
        401,
        "Unauthorized request: API key or refresh token has expired"
      );
    }

    throw new ApiError(401, error.message || "Unauthorized request");
  }
});
