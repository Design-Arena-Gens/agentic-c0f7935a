export type ClipInsight = {
  id: string;
  start: number;
  end: number;
  duration: number;
  highlight: string;
  emotionalPulse: number;
  noveltyScore: number;
  viralityScore: number;
  title: string;
  description: string;
  tags: string[];
};

export type VideoAnalysis = {
  videoId: string;
  videoTitle: string;
  channelTitle: string;
  publishedAt: string;
  thumbnail: string;
  durationSeconds: number;
  clips: ClipInsight[];
};
