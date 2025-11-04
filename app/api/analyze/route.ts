import { NextResponse } from "next/server";
import { z } from "zod";

import { analyzeTranscript } from "@/lib/clipAnalyzer";
import { fetchTranscript } from "@/lib/transcript";
import { fetchYouTubeMetadata, parseVideoId } from "@/lib/video";

const requestSchema = z.object({
  url: z.string().min(1, "YouTube URL is required")
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { url } = requestSchema.parse(json);

    const videoId = parseVideoId(url);
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server missing YouTube API credentials" }, { status: 500 });
    }

    const [metadata, transcript] = await Promise.all([
      fetchYouTubeMetadata(videoId, apiKey),
      fetchTranscript(videoId)
    ]);

    const clips = analyzeTranscript(transcript, metadata.title, metadata.channelTitle);

    return NextResponse.json({
      videoId,
      videoTitle: metadata.title,
      channelTitle: metadata.channelTitle,
      publishedAt: metadata.publishedAt,
      thumbnail: metadata.thumbnail,
      durationSeconds: metadata.durationSeconds,
      clips
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message ?? "Internal error" }, { status: 500 });
  }
}
