import { PlayCircle } from "lucide-react";

import type { ClipInsight } from "@/lib/types";

function secondsToHuman(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${remainder}`;
}

type Props = {
  clip: ClipInsight;
  index: number;
  videoId: string;
};

export function ClipCard({ clip, index, videoId }: Props) {
  const startTimestamp = Math.floor(clip.start);
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}&t=${startTimestamp}`;

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
      <header className="flex items-center justify-between gap-2">
        <span className="text-sm uppercase tracking-wider text-white/60">Clip #{index + 1}</span>
        <span className="rounded-full bg-brand-accent/20 px-3 py-1 text-xs font-semibold text-brand-accent">
          Viral Score {clip.viralityScore.toFixed(2)}
        </span>
      </header>
      <a
        className="flex items-center gap-3 rounded-2xl bg-black/40 px-4 py-3 text-sm font-semibold text-white transition hover:bg-black/60"
        href={youtubeUrl}
        target="_blank"
        rel="noreferrer"
      >
        <PlayCircle className="h-5 w-5 text-brand-accent" />
        Jump to {secondsToHuman(clip.start)} mark on YouTube
      </a>
      <div>
        <h3 className="text-xl font-bold text-white">{clip.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/70">{clip.highlight}</p>
      </div>
      <dl className="grid grid-cols-3 gap-3 text-xs text-white/60">
        <div>
          <dt className="font-semibold text-white/70">Duration</dt>
          <dd>{secondsToHuman(clip.duration)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-white/70">Emotion</dt>
          <dd>{clip.emotionalPulse.toFixed(2)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-white/70">Novelty</dt>
          <dd>{clip.noveltyScore.toFixed(2)}</dd>
        </div>
      </dl>
      <section className="space-y-2">
        <div>
          <h4 className="text-sm font-semibold text-white/80">Description</h4>
          <pre className="whitespace-pre-wrap rounded-2xl bg-black/40 px-4 py-3 text-xs text-white/70">
            {clip.description}
          </pre>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white/80">Tags</h4>
          <div className="flex flex-wrap gap-2 text-xs text-white/70">
            {clip.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-brand-accent/20 px-3 py-1 text-brand-accent">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
