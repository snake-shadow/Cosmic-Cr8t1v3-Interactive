
import { GoogleGenAI, Type } from "@google/genai";
import { ContentMode, ContentResponse } from "../types";

export async function generateSpaceContent(
  topic: string, 
  mode: ContentMode
): Promise<ContentResponse> {
  // Initialized using process.env.API_KEY which is injected by Vite during the build process
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const SYSTEM_INSTRUCTION = `You are the COSMIC CR8T1V3 Deep-Space Tactical Bridge Processor.
Your mission is to provide structured reconnaissance data on celestial targets.
TONE: High-fidelity, scientific, epic, precise.

RECONNAISSANCE PROTOCOLS:
- hook: A CINEMATIC HEADLINE IN ALL CAPS (MAX 6 WORDS)
- sections: Provide exactly 5 sections: TELEMETRY, ANALYSIS, ANOMALIES, ENVIRONMENTAL DATA, and HUMAN SCALE LORE.
- HUMAN SCALE LORE: Translate space numbers into things humans understand (size, speed, distance, age comparisons).`;

  try {
    // Upgrading to gemini-3-pro-preview as this is a complex reasoning/STEM task
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: `INITIATE DEEP RECON: ${topic}. Synchronize with stellar databases.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{googleSearch: {}}],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hook: {
              type: Type.STRING,
              description: "A cinematic headline in all caps (MAX 6 WORDS)."
            },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  type: { 
                    type: Type.STRING, 
                    enum: ['telemetry', 'analysis', 'visual', 'anomaly', 'lore'] 
                  },
                  content: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["title", "type", "content"],
                propertyOrdering: ["title", "type", "content"]
              }
            }
          },
          required: ["hook", "sections"]
        }
      },
    });

    // Access text property directly as per latest SDK guidelines
    const rawText = response.text || "{}";
    const parsedData = JSON.parse(rawText);
    
    // Extract website URLs from grounding chunks as mandated by Google Search grounding guidelines
    const groundingSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => ({
      title: chunk.web?.title || "Orbital Node",
      url: chunk.web?.uri || "#"
    })) || [];

    return {
      hook: parsedData.hook || "SIGNAL_ACQUIRED",
      sections: parsedData.sections || [],
      sources: [...(parsedData.sources || []), ...groundingSources].slice(0, 8)
    };
  } catch (error: any) {
    throw new Error(`SIGNAL_LOSS: ${error.message || "RETRY_UPLINK"}`);
  }
}
