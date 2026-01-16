
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const refineTextForSpeedReading = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a text optimization expert. Refine the following text for speed reading (RSVP). 
      - Simplify complex sentence structures.
      - Remove redundant filler words.
      - Ensure high information density.
      - Maintain the original meaning and tone.
      - Return ONLY the optimized text.
      
      TEXT:
      ${text}`,
    });
    return response.text || text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return text;
  }
};

export const summarizeText = async (text: string): Promise<string> => {
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
    return text;
  }
};
