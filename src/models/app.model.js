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
    accessToken: {
      type: String,
    },
    salt: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

appSchema.methods.generateSalt = function () {
  const salt = crypto.randomBytes(7).toString("hex");
  this.salt = salt;
  return salt;
};

appSchema.methods.generateApiKey = async function () {
  const algorithm = "aes-256-cbc";
  const secretKey = process.env.AES_SECRET;
  const iv = crypto.randomBytes(16);
  const appId = this.appId;

  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  let encrypted = cipher.update(appId);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const encryptedApiKey = iv.toString("hex") + ":" + encrypted.toString("hex");

  this.generateSalt();
  this.apiKey = encryptedApiKey;
  return encryptedApiKey;
};

appSchema.methods.generateAccessToken = async function () {
  const payload = {
    appId: this.appId,
    appName: this.appName,
    appType: this.appType,
  };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });

  const hashedAccessToken = await bcrypt.hash(accessToken + this.salt, 10);
  this.accessToken = hashedAccessToken;

  return accessToken;
};

appSchema.methods.validateAccessToken = async function (inputAccessToken) {
  return await bcrypt.compare(inputAccessToken + this.salt, this.accessToken);
};

export const App = model("App", appSchema);
