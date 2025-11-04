import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Viral Clip Architect",
  description: "AI agent that finds viral short clips and crafts SEO boost assets from any YouTube video."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-brand-dark text-white">
      <body className="min-h-screen bg-brand-dark antialiased">{children}</body>
    </html>
  );
}
