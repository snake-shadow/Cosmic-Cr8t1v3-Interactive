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
  const SYSTEM_INSTRUCTION = `You are a scientific space data analyst providing factual astronomical information.

CRITICAL ACCURACY REQUIREMENTS:
- Use ONLY verified scientific data from NASA, ESA, peer-reviewed sources
- Include actual measurements with units (km, AU, light-years, solar masses, etc.)
- Cite real missions, telescopes, discoveries with dates
- If uncertain, state "estimated" or "approximately"
- Never invent data - use "data unavailable" if unknown

OUTPUT FORMAT (valid JSON):
{
  "hook": "BRIEF FACTUAL HEADLINE (ALL CAPS, MAX 6 WORDS)",
  "sections": [
    {
      "title": "TELEMETRY",
      "type": "telemetry",
      "content": ["Precise measurements: distance, size, mass, temperature, composition with sources"]
    },
    {
      "title": "ANALYSIS", 
      "type": "analysis",
      "content": ["Scientific classification, formation theory, current state based on observations"]
    },
    {
      "title": "ANOMALIES",
      "type": "anomaly", 
      "content": ["Unusual features, unexplained phenomena, ongoing research questions"]
    },
    {
      "title": "ENVIRONMENTAL DATA",
      "type": "telemetry",
      "content": ["Conditions, radiation, magnetic fields, atmospheric data if applicable"]
    },
    {
      "title": "HUMAN SCALE LORE",
      "type": "lore",
      "content": ["Real-world comparisons using everyday objects/distances, historical observations, cultural significance"]
    }
  ],
  "sources": [
    {"title": "Source name (NASA, etc.)", "url": "actual URL or 'Primary literature'"}
  ]
}`;

  try {
    console.log('🚀 Calling Groq API for:', topic);
    
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        { role: "user", content: `Provide scientifically accurate data about: ${topic}. Include real measurements, missions, and sources. Use SI units and cite discoveries.` }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.05,
      max_tokens: 2000,
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
