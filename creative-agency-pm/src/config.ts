import path from "path";

export const CONFIG = {
  APP_NAME: "Aura Studio OS — Creative Agency Project Management",
  VERSION: "1.0.0",
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3400,
  HOST: process.env.HOST || "127.0.0.1",
  DB_PATH: path.resolve(__dirname, "..", "data", "aura_agency.sqlite.json"),
  DATA_DIR: path.resolve(__dirname, "..", "data"),
  UPLOADS_DIR: path.resolve(__dirname, "..", "data", "vault"),
  SESSION_SECRET: process.env.SESSION_SECRET || "aura_secret_jwt_hmac_sha256_k98a7sd",
  SESSION_MAX_AGE_SEC: 86400 * 7, // 7 days
};
