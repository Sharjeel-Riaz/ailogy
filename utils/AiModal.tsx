import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey });

// Chat session wrapper to match the existing interface
export const chatSession = {
  sendMessage: async (prompt: string) => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
      },
    });

    return {
      response: {
        text: () => response.text,
      },
    };
  },
};
