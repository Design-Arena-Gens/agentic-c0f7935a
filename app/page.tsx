"use client";

import Image from "next/image";
import { useState } from "react";

import { AnalysisForm } from "@/components/AnalysisForm";
import { ClipCard } from "@/components/ClipCard";
import type { VideoAnalysis } from "@/lib/types";

export default function Home() {
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);

  return (
    <main className="gradient-bg mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 pb-24 pt-20">
      <section className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-start">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-accent/40 bg-brand-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand-accent">
            Viral Clip Architect
          </span>
          <h1 className="text-5xl font-black leading-tight text-white md:text-6xl">
            Convert any YouTube video into scroll-stopping Shorts in seconds.
          </h1>
          <p className="max-w-xl text-lg text-white/70">
            Drop a link. We mine the transcript, detect peak dopamine spikes, and auto-generate irresistible
            titles, descriptions, and viral hashtags engineered for YouTube Shorts and Reels.
          </p>
          <ul className="grid gap-3 text-sm text-white/60">
            <li>• Emotion-driven scoring so only the most shareable moments survive</li>
            <li>• AI copy tuned for retention, ranking, and repost virality</li>
            <li>• One-click timestamps to jump straight into the gold</li>
          </ul>
        </div>
        <AnalysisForm onResult={setAnalysis} />
      </section>

      {analysis && (
        <section className="space-y-8 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
          <header className="flex flex-col items-start justify-between gap-6 lg:flex-row">
            <div className="flex items-center gap-4">
              {analysis.thumbnail && (
                <div className="relative h-32 w-56 overflow-hidden rounded-2xl border border-white/10">
                  <Image src={analysis.thumbnail} alt={analysis.videoTitle} fill className="object-cover" />
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-widest text-white/40">Source Video</p>
                <h2 className="max-w-xl text-2xl font-bold text-white">{analysis.videoTitle}</h2>
                <p className="mt-1 text-sm text-white/60">
                  {analysis.channelTitle} • {new Date(analysis.publishedAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-white/50">
                  Duration: {Math.round(analysis.durationSeconds / 60)} min
                </p>
              </div>
            </div>
            <a
              href={`https://www.youtube.com/watch?v=${analysis.videoId}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-brand-accent/50 bg-brand-accent/10 px-5 py-2 text-sm font-semibold text-brand-accent transition hover:bg-brand-accent/20"
            >
              View Original
            </a>
          </header>
          <div className="grid gap-6 lg:grid-cols-3">
            {analysis.clips.map((clip, index) => (
              <ClipCard key={clip.id} clip={clip} index={index} videoId={analysis.videoId} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
