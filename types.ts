
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface TacticalSection {
  title: string;
  type: 'telemetry' | 'analysis' | 'visual' | 'anomaly';
  content: string[];
}

export interface ContentResponse {
  hook: string;
  sections: TacticalSection[];
  sources: { title: string; url: string }[];
  rawText?: string;
}

export enum ContentMode {
  SCRIPT = 'SCRIPT',
  PLAN = 'PLAN',
  FACTS = 'FACTS'
}

export interface HistoryItem {
  id: string;
  topic: string;
  mode: ContentMode;
  timestamp: number;
  content: ContentResponse;
}
