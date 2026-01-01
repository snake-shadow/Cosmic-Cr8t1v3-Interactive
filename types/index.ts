export interface ContentMode {
  mode: 'telemetry' | 'analysis' | 'anomaly' | 'lore' | 'visual';
}

export interface ContentResponse {
  hook: string;
  sections: Array<{
    title: string;
    type: string;
    content: string[];
  }>;
  sources: Array<{ title: string; url: string }>;
}
