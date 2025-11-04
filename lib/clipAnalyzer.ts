import type { ClipInsight } from "./types";
import type { TranscriptSegment } from "./transcript";

const EMOTION_LEXICON = new Map<string, number>([
  ["amazing", 1.4],
  ["astonishing", 1.8],
  ["awesome", 1.3],
  ["beautiful", 1.2],
  ["believe", 1.1],
  ["best", 1.5],
  ["breakthrough", 1.7],
  ["crazy", 1.4],
  ["crush", 1.5],
  ["epic", 1.8],
  ["explosive", 1.6],
  ["fear", -1.4],
  ["fearless", 1.5],
  ["game", 1.2],
  ["hack", 1.3],
  ["insane", 1.6],
  ["jaw-dropping", 2.0],
  ["life", 1.1],
  ["massive", 1.3],
  ["million", 1.4],
  ["mind-blowing", 2.2],
  ["mistake", -1.5],
  ["never", 1.4],
  ["power", 1.3],
  ["profit", 1.4],
  ["secret", 1.6],
  ["shocking", 1.8],
  ["success", 1.2],
  ["surprising", 1.5],
  ["viral", 1.7],
  ["wild", 1.3],
  ["wow", 1.5]
]);

const CTA_SNIPPETS = [
  "Tap now to watch the full moment!",
  "Stick around for the payoff at the end.",
  "Save this so you never forget the play.",
  "Share this with someone who needs the hype.",
  "Replay this clip when you need motivation."
];

const MAX_CLIPS = 3;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function computeEmotionScore(tokens: string[]): number {
  return tokens.reduce((score, token) => score + (EMOTION_LEXICON.get(token) ?? 0), 0) / (tokens.length || 1);
}

function computeMomentum(segments: TranscriptSegment[]): number {
  const emphasisCount = segments.reduce((acc, segment) => {
    const exclamations = (segment.text.match(/!/g) ?? []).length;
    const questions = (segment.text.match(/\?/g) ?? []).length;
    const uppercaseBursts = (segment.text.match(/[A-Z]{3,}/g) ?? []).length;
    return acc + exclamations * 1.5 + questions + uppercaseBursts;
  }, 0);
  return emphasisCount / (segments.length || 1);
}

function computeNoveltyScore(tokens: string[], seenBag: Map<string, number>): number {
  let novelty = 0;
  for (const token of tokens) {
    if (token.length <= 3) continue;
    const previous = seenBag.get(token) ?? 0;
    if (previous === 0) {
      novelty += 1.2;
    } else if (previous === 1) {
      novelty += 0.4;
    } else {
      novelty -= 0.2;
    }
  }
  return novelty / (tokens.length || 1);
}

function buildHighlight(segments: TranscriptSegment[]): string {
  const text = segments.map((segment) => segment.text).join(" ").trim();
  if (text.length <= 180) {
    return text;
  }
  return `${text.slice(0, 177)}...`;
}

function secondsToTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${secs}`;
}

function craftTitle(baseTitle: string, highlight: string, emotionScore: number): string {
  const trimmed = highlight.replace(/\s+/g, " ").trim();
  const powerFragment = trimmed.split(/\.\s|!\s|\?\s/).at(0) ?? trimmed;
  const excitement = emotionScore > 0.6 ? "Unbelievable" : emotionScore > 0.3 ? "Must-See" : "Watch";
  return `${excitement} ${powerFragment.slice(0, 68)} | ${baseTitle}`.replace(/\s+/g, " ").trim();
}

function craftDescription(start: number, end: number, highlight: string): string {
  const timestampRange = `${secondsToTimestamp(start)} - ${secondsToTimestamp(end)}`;
  const cta = CTA_SNIPPETS[Math.floor(Math.random() * CTA_SNIPPETS.length)];
  return [`Clip moment: ${timestampRange}`, highlight, "Why it slaps: instant hook • emotional spike • loop-worthy ending", cta].join("\n\n");
}

function craftTags(tokens: string[], channelTitle: string): string[] {
  const frequency = new Map<string, number>();
  for (const token of tokens) {
    if (token.length < 3) continue;
    frequency.set(token, (frequency.get(token) ?? 0) + 1);
  }
  const sorted = Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([token]) => token.replace(/[^a-z0-9]+/g, ""))
    .filter(Boolean);

  const baseTags = ["shorts", "viralclip", "fyp", channelTitle.replace(/\s+/g, "").toLowerCase()];
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const tag of [...sorted, ...baseTags]) {
    const sanitized = tag.toLowerCase();
    if (sanitized && !seen.has(sanitized)) {
      seen.add(sanitized);
      tags.push(`#${sanitized}`);
    }
  }

  return tags.slice(0, 10);
}

export function analyzeTranscript(
  transcript: TranscriptSegment[],
  baseTitle: string,
  channelTitle: string
): ClipInsight[] {
  const targetDuration = 32; // seconds
  const windowSegments: TranscriptSegment[][] = [];
  let cursor = 0;

  while (cursor < transcript.length) {
    const bucket: TranscriptSegment[] = [];
    let duration = 0;
    let idx = cursor;
    while (idx < transcript.length && duration < targetDuration) {
      bucket.push(transcript[idx]);
      duration += transcript[idx].duration || 2;
      idx += 1;
    }
    if (bucket.length === 0) {
      break;
    }
    windowSegments.push(bucket);
    cursor = cursor + Math.max(1, Math.floor(bucket.length / 2));
  }

  const seenBag = new Map<string, number>();
  const scored: Array<ClipInsight & { rawTokens: string[] }> = [];

  windowSegments.forEach((segments, index) => {
    const combinedText = segments.map((segment) => segment.text).join(" ");
    const tokens = tokenize(combinedText);
    tokens.forEach((token) => seenBag.set(token, (seenBag.get(token) ?? 0) + 1));

    const emotion = computeEmotionScore(tokens);
    const momentum = computeMomentum(segments);
    const novelty = computeNoveltyScore(tokens, seenBag);
    const viralityScore = emotion * 0.5 + momentum * 0.3 + novelty * 0.2;

    const start = segments[0]?.offset ?? 0;
    const end = (segments.at(-1)?.offset ?? 0) + (segments.at(-1)?.duration ?? 0);
    const insight: ClipInsight & { rawTokens: string[] } = {
      id: `clip-${index}`,
      start,
      end,
      duration: end - start,
      highlight: buildHighlight(segments),
      emotionalPulse: Number(emotion.toFixed(3)),
      noveltyScore: Number(novelty.toFixed(3)),
      viralityScore: Number(viralityScore.toFixed(3)),
      title: "",
      description: "",
      tags: [],
      rawTokens: tokens
    };
    scored.push(insight);
  });

  const sorted = scored
    .filter((item) => item.duration >= 12) // ensure shorts-friendly
    .sort((a, b) => b.viralityScore - a.viralityScore)
    .slice(0, MAX_CLIPS)
    .map((item) => {
      const title = craftTitle(baseTitle, item.highlight, item.emotionalPulse);
      const description = craftDescription(item.start, item.end, item.highlight);
      const tags = craftTags(item.rawTokens, channelTitle);
      return {
        id: item.id,
        start: item.start,
        end: item.end,
        duration: Number(item.duration.toFixed(2)),
        highlight: item.highlight,
        emotionalPulse: item.emotionalPulse,
        noveltyScore: item.noveltyScore,
        viralityScore: item.viralityScore,
        title,
        description,
        tags
      } satisfies ClipInsight;
    });

  return sorted;
}
