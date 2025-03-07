import dotenv from "dotenv";
dotenv.config();

export const base_url = "https://api.deepseek.com/v1";
export const api_key = process.env.DEEP_SEEK_KEY;
