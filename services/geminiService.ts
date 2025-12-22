import { GoogleGenAI, Type } from "@google/genai";
import { ContentMode, ContentResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are the Cosmic Lens Tactical Engine.
Your directive is to provide structured, high-impact data on celestial phenomena.
VOICE: Direct, scientific, epic.

Return a JSON object with the following structure:
- hook: A punchy, awe-inspiring headline.
- sections: An array of 4 objects:
  1. Telemetry: Technical specs (Mass, Distance, Temp).
  2. Analysis: Core mind-bending theories or physics facts.
  3. Visual: CGI/Cinematic visual descriptions.
  4. Anomaly: Strange mysteries or warnings about the object.
- sources: An array of objects with 'title' and 'url' to verifiable NASA or educational sites.

Zero small talk. Maximum data density.`;

export async function generateSpaceContent(
  topic: string, 
  mode: ContentMode
): Promise<ContentResponse> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: `Subject: ${topic}. Focus on technical and awe-inspiring data.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{googleSearch: {}}],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hook: { type: Type.STRING },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['telemetry', 'analysis', 'visual', 'anomaly'] },
                  content: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['title', 'type', 'content']
              }
            },
            sources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  url: { type: Type.STRING }
                },
                required: ['title', 'url']
              }
            }
          },
          required: ['hook', 'sections', 'sources']
        },
        temperature: 1,
      },
    });

    const text = response.text || "{}";
    const result = JSON.parse(text);

    return {
      hook: result.hook || "Signal Acquired",
      sections: result.sections || [],
      sources: result.sources || [],
      rawText: text
    };
  } catch (error) {
    console.error("Transmission Error:", error);
    throw error;
  }
}