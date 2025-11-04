"use client";

import { useState } from "react";

import type { VideoAnalysis } from "@/lib/types";

type Props = {
  onResult: (value: VideoAnalysis) => void;
};

export function AnalysisForm({ onResult }: Props) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Analysis failed");
      }

      onResult(payload as VideoAnalysis);
    } catch (analysisError) {
      setError((analysisError as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur"
    >
      <div>
        <label htmlFor="youtube" className="block text-sm font-semibold text-white/70">
          Drop a YouTube URL
        </label>
        <input
          id="youtube"
          name="youtube"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-white/30 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent px-4 py-3 font-semibold text-brand-dark transition hover:bg-sky-300 disabled:cursor-wait disabled:bg-sky-500/60"
      >
        {isLoading ? "Synthesizing viral clips..." : "Generate Viral Clip Strategy"}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
