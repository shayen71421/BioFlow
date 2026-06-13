'use client';

import { useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useSequenceStore } from '@/store/sequence-store';
import { ScrollArea } from '@/components/ui/scroll-area';

const CHUNK_SIZE = 100;

export function SequenceViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const seq = useSequenceStore((s) => s.getActiveSequence());

  const chunks = useMemo(() => {
    if (!seq) return [];
    const result: { start: number; bases: string[] }[] = [];
    for (let i = 0; i < seq.sequence.length; i += CHUNK_SIZE) {
      result.push({
        start: i,
        bases: seq.sequence.slice(i, i + CHUNK_SIZE).split(''),
      });
    }
    return result;
  }, [seq]);

  if (!seq) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        No sequence loaded
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium">{seq.header}</span>
        <span className="font-mono">({seq.length.toLocaleString()} bp)</span>
      </div>
      <ScrollArea orientation="horizontal">
        <div ref={containerRef} className="min-w-fit">
          {chunks.map((chunk) => (
            <div key={chunk.start} className="flex">
              <div className="sticky left-0 z-10 flex items-center gap-2 bg-background pr-3 text-xs text-muted-foreground font-mono w-[70px] flex-shrink-0">
                {chunk.start.toLocaleString()}
              </div>
              <div className="flex gap-0">
                {chunk.bases.map((base, i) => (
                  <span
                    key={i}
                    className={cn(
                      'inline-block w-[11px] text-center text-xs font-mono leading-relaxed',
                      base === 'A' ? 'text-success' :
                      base === 'T' ? 'text-danger' :
                      base === 'G' ? 'text-warning' :
                      base === 'C' ? 'text-secondary' : 'text-muted-foreground',
                    )}
                  >
                    {base}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
