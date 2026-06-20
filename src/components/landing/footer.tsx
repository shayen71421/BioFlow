'use client';

import { useRouter } from 'next/navigation';

export function Footer() {
  const router = useRouter();

  return (
    <footer className="border-t border-border/60 bg-[#070A10] px-4 py-12">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M12 2a8 8 0 0 0-8 8c0 4 8 12 8 12s8-8 8-12a8 8 0 0 0-8-8z" />
            <path d="M12 6a4 4 0 0 0-4 4c0 2 4 6 4 6s4-4 4-6a4 4 0 0 0-4-4z" />
          </svg>
          <span className="font-mono text-sm font-bold text-foreground tracking-wider">
            BIOFLOW_SYSTEM
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 font-mono text-[10px] text-muted-foreground">
          <button
            onClick={() => router.push('/dashboard/templates')}
            className="hover:text-foreground hover:underline transition-colors"
          >
            TEMPLATES
          </button>
          <span>·</span>
          <button
            onClick={() => router.push('/dashboard/docs')}
            className="hover:text-foreground hover:underline transition-colors"
          >
            DOCS
          </button>
          <span>·</span>
        </div>

        <div className="font-mono text-[9px] text-muted-foreground flex items-center gap-1.5">
          <a
            href="https://github.com/shayen71421/BioFlow/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground hover:underline transition-colors"
          >
            LICENSE_MIT
          </a>
          <span>·</span>
          <a
            href="https://github.com/shayen71421/BioFlow"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground hover:underline transition-colors"
          >
            COPYRIGHT_2026
          </a>
        </div>
      </div>
    </footer>
  );
}
