'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useSequenceStore } from '@/store/sequence-store';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';

export function OrfDisplay() {
  const [selectedOrf, setSelectedOrf] = useState<number | null>(null);
  const orfs = useSequenceStore((s) => s.orfs);
  const seq = useSequenceStore((s) => s.getActiveSequence());
  const stats = useSequenceStore((s) => s.stats);

  if (!seq || orfs.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        {seq ? 'No ORFs found' : 'No sequence loaded'}
      </div>
    );
  }

  const totalLen = seq.sequence.length;
  const selected = selectedOrf !== null ? orfs[selectedOrf] : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="success">{orfs.length} ORFs found</Badge>
        <span className="text-xs text-muted-foreground">
          Min length: 30 codons
        </span>
      </div>

      <div className="space-y-2">
        {orfs.slice(0, 20).map((orf, i) => (
          <button
            key={i}
            onClick={() => setSelectedOrf(i)}
            className={cn(
              'flex w-full items-center gap-4 rounded-lg border border-border p-3 text-left transition-all',
              selectedOrf === i
                ? 'border-success/50 bg-success/5'
                : 'hover:bg-surface-hover',
            )}
          >
            <div
              className="h-8 w-1 rounded-full flex-shrink-0"
              style={{
                background: `linear-gradient(to bottom, 
                  ${'#22C55E'} 0%, 
                  ${'#22C55E'} ${(orf.start / totalLen) * 100}%, 
                  transparent ${(orf.start / totalLen) * 100}%)`,
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">
                Frame {orf.frame + 1} ({orf.strand})
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {orf.start.toLocaleString()} - {orf.end.toLocaleString()} ({orf.length} bp)
              </div>
              <div className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                {orf.protein.slice(0, 30)}{orf.protein.length > 30 ? '...' : ''}
              </div>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              {orf.length / 3} AA
            </div>
          </button>
        ))}
        {orfs.length > 20 && (
          <div className="text-center text-xs text-muted-foreground py-2">
            + {orfs.length - 20} more ORFs
          </div>
        )}
      </div>

      <Dialog
        open={selectedOrf !== null}
        onClose={() => setSelectedOrf(null)}
        title="ORF Details"
      >
        {selected && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-background p-3">
                <div className="text-xs text-muted-foreground mb-1">Start</div>
                <div className="text-sm font-mono text-foreground">{formatNumber(selected.start)}</div>
              </div>
              <div className="rounded-lg bg-background p-3">
                <div className="text-xs text-muted-foreground mb-1">Stop</div>
                <div className="text-sm font-mono text-foreground">{formatNumber(selected.end)}</div>
              </div>
              <div className="rounded-lg bg-background p-3">
                <div className="text-xs text-muted-foreground mb-1">Length</div>
                <div className="text-sm font-mono text-foreground">{selected.length} bp</div>
              </div>
              <div className="rounded-lg bg-background p-3">
                <div className="text-xs text-muted-foreground mb-1">Frame</div>
                <div className="text-sm font-mono text-foreground">+{selected.frame + 1}</div>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Protein Sequence</div>
              <div className="rounded-lg bg-background p-3 font-mono text-xs text-foreground break-all leading-relaxed">
                {selected.protein}
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
