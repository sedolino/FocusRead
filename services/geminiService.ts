
import { GoogleGenAI } from "@google/genai";

export const refineTextForSpeedReading = async (text: string): Promise<string> => {
  const apiKey = process.env.API_KEY || "";
  if (!apiKey) throw new Error("API Key missing");
  
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a text optimization expert. Refine the following text for speed reading (RSVP). 
      - Simplify complex sentence structures.
      - Remove redundant filler words.
      - Ensure high information density.
      - Return ONLY the optimized text.
      
      TEXT:
      ${text}`,
    });
    return response.text || text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const summarizeText = async (text: string): Promise<string> => {
  const apiKey = process.env.API_KEY || "";
  if (!apiKey) throw new Error("API Key missing");
  
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize the following text into a concise version suitable for rapid reading. 
      Keep only the essential points and narratives.
      
      TEXT:
      ${text}`,
    });
    return response.text || text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
