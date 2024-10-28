import { model, Schema } from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const appSchema = new Schema(
  {
    appId: {
      type: String,
      required: true,
      unique: true,
    },
    appName: {
      type: String,
      required: true,
    },
    appType: {
      type: String,
      required: true,
      default: "test",
    },
    apiKey: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

appSchema.methods.generateApiKey = async function () {
  const payload = {
    appId: this.appId,
  };

  const apiKey = jwt.sign(payload, process.env.API_KEY_SECRET, {
    expiresIn: process.env.API_KEY_EXPIRY,
  });
  const hashedApiKey = await bcrypt.hash(apiKey, 10);
  this.apiKey = hashedApiKey;

  return apiKey;
};

appSchema.methods.generateRefreshToken = async function () {
  const payload = {
    _id: this._id,
    appId: this.appId,
    appName: this.appName,
    appType: this.appType,
  };

  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });

  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  this.refreshToken = hashedRefreshToken;

  return refreshToken;
};

appSchema.methods.validateRefreshToken = async function (inputRefreshToken) {
  return await bcrypt.compare(inputRefreshToken, this.refreshToken);
};

export const App = model("App", appSchema);
