import Groq from "groq-sdk";
import { ContentMode, ContentResponse } from "../types";

const groq = new Groq({
  apiKey: (import.meta.env.VITE_GROQ_API_KEY || '') as string,
  dangerouslyAllowBrowser: true
});

export async function generateSpaceContent(
  topic: string,
  _mode: ContentMode
): Promise<ContentResponse> {
  const SYSTEM_INSTRUCTION = `You are the COSMIC CR8T1V3 Deep-Space Tactical Bridge Processor.
Your mission is to provide structured reconnaissance data on celestial targets.
TONE: High-fidelity, scientific, epic, precise.

RECONNAISSANCE PROTOCOLS:
- hook: A CINEMATIC HEADLINE IN ALL CAPS (MAX 6 WORDS)
- sections: Provide exactly 5 sections: TELEMETRY, ANALYSIS, ANOMALIES, ENVIRONMENTAL DATA, and HUMAN SCALE LORE.
- HUMAN SCALE LORE: Translate space numbers into things humans understand (size, speed, distance, age comparisons).

Respond as valid JSON matching this schema exactly:
{"hook":"...", "sections":[{"title":"...", "type":"...", "content":["..."]}], "sources":[{"title":"...", "url":"..."}]}`;

  try {
    console.log('🚀 Calling Groq API for:', topic);
    
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        { role: "user", content: `INITIATE DEEP RECON: ${topic}. Synchronize with stellar databases.` }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });

    const rawText = completion.choices[0]?.message?.content || "{}";
    console.log('📡 Raw Groq response:', rawText);
    
    const parsedData = JSON.parse(rawText);
    console.log('✅ Parsed data:', parsedData);

    return {
      hook: parsedData.hook || "SIGNAL_ACQUIRED",
      sections: parsedData.sections || [],
      sources: parsedData.sources || []
    };
  } catch (error: any) {
    console.error('❌ Groq error:', error);
    if (error.message?.includes('quota')) {
      throw new Error("QUOTA_EXHAUSTED: Please wait a moment for the uplink to cool down or check your API billing.");
    }
    throw new Error(`SIGNAL_LOSS: ${error.message || "RETRY_UPLINK"}`);
  }
}
