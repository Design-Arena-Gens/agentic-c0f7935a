import { z } from "zod";

const urlSchema = z
  .string()
  .min(1)
  .refine((value) => {
    try {
      // Accept plain IDs as well
      if (/^[\w-]{11}$/.test(value)) {
        return true;
      }
      const url = new URL(value);
      return url.hostname.includes("youtube.com") || url.hostname.includes("youtu.be");
    } catch (error) {
      return false;
    }
  }, "Invalid YouTube URL or video ID");

const youTubeDurationRegex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;

export function parseVideoId(input: string): string {
  const value = urlSchema.parse(input.trim());
  if (/^[\w-]{11}$/.test(value)) {
    return value;
  }

  const url = new URL(value);
  if (url.hostname.includes("youtu.be")) {
    return url.pathname.replace("/", "");
  }

  if (url.searchParams.get("v")) {
    return url.searchParams.get("v") as string;
  }

  const matches = value.match(/(?:embed\/|v=|vi=|%2Fvideos%2F|\/videos\/|youtu\.be\/|\/v\/|watch\?v=|&v=|^\/)\??([\w-]{11})/);
  if (matches && matches[1]) {
    return matches[1];
  }

  throw new Error("Unable to extract video ID");
}

export type YouTubeMetadata = {
  id: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  thumbnail: string;
  durationSeconds: number;
};

function parseIsoDuration(iso: string): number {
  const match = iso.match(youTubeDurationRegex);
  if (!match) return 0;
  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const seconds = match[3] ? parseInt(match[3], 10) : 0;
  return hours * 3600 + minutes * 60 + seconds;
}

export async function fetchYouTubeMetadata(videoId: string, apiKey: string): Promise<YouTubeMetadata> {
  const endpoint = new URL("https://www.googleapis.com/youtube/v3/videos");
  endpoint.searchParams.set("id", videoId);
  endpoint.searchParams.set("part", "snippet,contentDetails");
  endpoint.searchParams.set("key", apiKey);

  const response = await fetch(endpoint.toString());
  if (!response.ok) {
    throw new Error(`YouTube API responded with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    items: Array<{
      id: string;
      snippet: {
        title: string;
        publishedAt: string;
        channelTitle: string;
        thumbnails: Record<string, { url: string }>;
      };
      contentDetails: { duration: string };
    }>;
  };

  if (!payload.items || payload.items.length === 0) {
    throw new Error("Video metadata not found");
  }

  const item = payload.items[0];
  const thumbnail =
    item.snippet.thumbnails.maxres?.url ||
    item.snippet.thumbnails.standard?.url ||
    item.snippet.thumbnails.high?.url ||
    item.snippet.thumbnails.medium?.url ||
    item.snippet.thumbnails.default?.url ||
    "";

  return {
    id: item.id,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    thumbnail,
    durationSeconds: parseIsoDuration(item.contentDetails.duration)
  };
}
