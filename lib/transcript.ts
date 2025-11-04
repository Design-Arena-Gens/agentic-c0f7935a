import { YoutubeTranscript } from "youtube-transcript";

export type TranscriptSegment = {
  text: string;
  offset: number;
  duration: number;
};

export async function fetchTranscript(videoId: string): Promise<TranscriptSegment[]> {
  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" });
    return segments.map((segment) => ({
      text: segment.text,
      offset: segment.offset,
      duration: segment.duration ?? 0
    }));
  } catch (error) {
    throw new Error("Transcript unavailable for this video");
  }
}
