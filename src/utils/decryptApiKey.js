import crypto from "crypto";
import { ApiError } from "./ApiError.js";

export const decryptApiKey = (apiKey) => {
  try {
    const algorithm = "aes-256-cbc";
    const secretKey = Buffer.from(process.env.AES_SECRET, "hex");
    const iv = Buffer.from(process.env.AES_IV, "hex");

    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);

    let decrypted = decipher.update(apiKey, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    throw new ApiError(401, "Unauthorized request: Invalid API key");
  }
};
