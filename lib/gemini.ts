import { GoogleGenerativeAI } from "@google/generative-ai";

export function getGemini(modelName = "gemini-2.5-flash") {
  const apiKey = process.env.GOOGLE_API_KEY!;
  return new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.7,
    },
  });
}
