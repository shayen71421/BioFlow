'use client';

import { useSequenceStore } from '@/store/sequence-store';
import { cn } from '@/lib/utils';

export function ReverseComplementView() {
  const seq = useSequenceStore((s) => s.getActiveSequence());
  const revComp = useSequenceStore((s) => s.revComp);

  if (!seq || !revComp) {
    return <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">No sequence loaded</div>;
  }

  const previewLen = Math.min(200, seq.sequence.length);

  const renderBases = (bases: string) => (
    <div className="flex flex-wrap gap-0">
      {bases.slice(0, previewLen).split('').map((base, i) => (
        <span
          key={i}
          className={cn(
            'text-xs font-mono leading-loose',
            base === 'A' ? 'text-success' :
            base === 'T' ? 'text-danger' :
            base === 'G' ? 'text-warning' :
            base === 'C' ? 'text-secondary' : 'text-muted-foreground',
          )}
        >
          {base}
        </span>
      ))}
      {seq.sequence.length > previewLen && (
        <span className="text-xs text-muted-foreground">... (truncated)</span>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground">
        Side-by-side comparison (showing first {previewLen} bp)
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="text-xs font-semibold text-foreground mb-2">Original (5&apos; → 3&apos;)</div>
          <div className="overflow-x-auto scrollbar-thin">
            <div className="min-w-[600px] font-mono text-xs">{renderBases(seq.sequence)}</div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="text-xs font-semibold text-foreground mb-2">Complement (3&apos; → 5&apos;)</div>
          <div className="overflow-x-auto scrollbar-thin">
            <div className="min-w-[600px] font-mono text-xs">{renderBases(revComp)}</div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="text-xs font-semibold text-foreground mb-2">Reverse Complement Properties</div>
        <div className="grid grid-cols-3 gap-3 mt-2">
          <div>
            <div className="text-xs text-muted-foreground">Length</div>
            <div className="text-sm font-mono text-foreground">{seq.sequence.length.toLocaleString()} bp</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Original GC</div>
            <div className="text-sm font-mono text-foreground">
              {((seq.sequence.match(/[GC]/gi)?.length || 0) / seq.sequence.length * 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Complement GC</div>
            <div className="text-sm font-mono text-foreground">
              {((revComp.match(/[GC]/gi)?.length || 0) / revComp.length * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
