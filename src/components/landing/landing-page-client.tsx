'use client';

import { Hero } from './hero';
import { Features } from './features';
import { PlaygroundCards } from '@/components/genome-playground/playground-cards';

export function LandingPageClient() {
  return (
    <div className="min-h-screen bg-background">
      <Hero />

      <section className="px-4 py-20 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 text-center">
            <h2 className="text-lg font-semibold text-foreground">Try BioFlow Instantly</h2>
            <p className="text-sm text-muted-foreground mt-1">
              No files needed — load a sample genome with one click
            </p>
          </div>
          <PlaygroundCards />
        </div>
      </section>

      <section className="px-4 py-20 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 text-center">
            <h2 className="text-lg font-semibold text-foreground">Why BioFlow?</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Everything you need for sequence analysis, visually
            </p>
          </div>
          <Features />
        </div>
      </section>

      <footer className="border-t border-border px-4 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00D4AA"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M12 2a8 8 0 0 0-8 8c0 4 8 12 8 12s8-8 8-12a8 8 0 0 0-8-8z" />
              <path d="M12 6a4 4 0 0 0-4 4c0 2 4 6 4 6s4-4 4-6a4 4 0 0 0-4-4z" />
            </svg>
            <span className="text-xs text-muted-foreground">BioFlow — Visual Bioinformatics Workflows</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Built with Next.js, React Flow, and TypeScript
          </div>
        </div>
      </footer>
    </div>
  );
}
