import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
if (!process.env.OPENAI_API_KEY) {
  console.error("Bitte hinterlegen Sie Ihren OpenAI API-Key in der .env-Datei.");
  process.exit(1);
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
