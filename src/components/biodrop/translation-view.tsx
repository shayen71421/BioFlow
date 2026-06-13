'use client';

import { cn } from '@/lib/utils';
import { useSequenceStore } from '@/store/sequence-store';

export function TranslationView() {
  const translation = useSequenceStore((s) => s.translationResult);
  const seq = useSequenceStore((s) => s.getActiveSequence());

  if (!translation || !seq) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        {seq ? 'No translation data' : 'No sequence loaded'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground">
        Three forward reading frames
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <div className="min-w-[800px] space-y-4">
          {translation.frames.map((frame) => (
            <div key={frame.frame} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-accent font-mono">
                  Frame {frame.frame + 1}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  (offset {frame.frame})
                </span>
              </div>
              <div className="flex flex-wrap gap-0">
                {frame.sequence.split('').map((base: string, i: number) => (
                  <span
                    key={i}
                    className={cn(
                      'text-[11px] font-mono leading-relaxed',
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
              <div className="flex flex-wrap gap-0">
                {frame.aa.split('').map((aa: string, i: number) => (
                  <span
                    key={i}
                    className={cn(
                      'text-[11px] font-mono leading-relaxed',
                      aa === '*' ? 'text-danger' : 'text-foreground',
                    )}
                  >
                    {aa === '*' ? '●' : aa}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
