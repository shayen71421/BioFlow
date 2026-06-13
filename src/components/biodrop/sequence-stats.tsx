'use client';

import { useSequenceStore } from '@/store/sequence-store';
import { Card } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

export function SequenceStats() {
  const stats = useSequenceStore((s) => s.stats);
  const seq = useSequenceStore((s) => s.getActiveSequence());

  if (!stats || !seq) {
    return <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">No data</div>;
  }

  const items = [
    { label: 'Sequence Length', value: `${formatNumber(stats.length)} bp`, color: 'text-foreground' },
    { label: 'GC Content', value: `${stats.gcPercent.toFixed(1)}%`, color: 'text-success' },
    { label: 'AT Content', value: `${stats.atPercent.toFixed(1)}%`, color: 'text-warning' },
    { label: 'ORFs Found', value: formatNumber(stats.orfCount), color: 'text-accent' },
    { label: 'Adenine (A)', value: formatNumber(stats.nucleotides.A), color: 'text-success' },
    { label: 'Thymine (T)', value: formatNumber(stats.nucleotides.T), color: 'text-danger' },
    { label: 'Guanine (G)', value: formatNumber(stats.nucleotides.G), color: 'text-warning' },
    { label: 'Cytosine (C)', value: formatNumber(stats.nucleotides.C), color: 'text-secondary' },
    { label: 'Unknown (N)', value: formatNumber(stats.nucleotides.N), color: 'text-muted-foreground' },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item) => (
        <Card key={item.label} className="p-3">
          <div className="text-[10px] text-muted-foreground mb-1">{item.label}</div>
          <div className={`text-sm font-bold font-mono ${item.color}`}>{item.value}</div>
        </Card>
      ))}
    </div>
  );
}
