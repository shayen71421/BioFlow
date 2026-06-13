'use client';

import { Dna, Bone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { E_COLI_K12 } from '@/data/examples/ecoli-k12';
import { SARS_COV2_SPIKE } from '@/data/examples/sars-cov2-spike';
import { BRCA1_FRAGMENT } from '@/data/examples/brca1';
import { useSequenceStore } from '@/store/sequence-store';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const iconMap: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Dna, Bone,
};

const examples = [
  {
    data: E_COLI_K12,
    icon: 'Dna',
    color: 'text-success',
    gradient: 'from-success/20 to-transparent',
  },
  {
    data: SARS_COV2_SPIKE,
    icon: 'Dna',
    color: 'text-danger',
    gradient: 'from-danger/20 to-transparent',
  },
  {
    data: BRCA1_FRAGMENT,
    icon: 'Bone',
    color: 'text-accent',
    gradient: 'from-accent/20 to-transparent',
  },
];

export function PlaygroundCards() {
  const router = useRouter();
  const loadExample = useSequenceStore((s) => s.loadExample);
  const setActiveSidebarItem = useUIStore((s) => s.setActiveSidebarItem);

  const handleLoad = (data: typeof E_COLI_K12) => {
    loadExample(data);
    setActiveSidebarItem('biodrop');
    router.push('/dashboard/biodrop');
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {examples.map(({ data, icon, color, gradient }) => {
        const Icon = iconMap[icon];
        return (
          <div
            key={data.id}
            className={cn(
              'group relative overflow-hidden rounded-xl border border-border bg-surface p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
            )}
          >
            <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity', gradient)} />
            <div className="relative z-10">
              <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-background', color)}>
                {Icon && <Icon size={20} />}
              </div>
              <h3 className="text-sm font-semibold text-foreground">{data.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{data.description}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-md bg-background px-2 py-0.5 text-[10px] text-muted-foreground font-mono">
                  {(data.sequence.length / 1000).toFixed(1)} kb
                </span>
                <span className="rounded-md bg-background px-2 py-0.5 text-[10px] text-muted-foreground font-mono">
                  GC: {((data.sequence.match(/[GC]/gi)?.length || 0) / data.sequence.length * 100).toFixed(0)}%
                </span>
              </div>
              <div className="mt-3 flex gap-0.5 overflow-hidden rounded">
                {data.sequence.slice(0, 60).split('').map((base, i) => (
                  <span
                    key={i}
                    className={cn(
                      'text-[8px] font-mono leading-none',
                      base === 'A' ? 'text-success' :
                      base === 'T' ? 'text-danger' :
                      base === 'G' ? 'text-warning' :
                      base === 'C' ? 'text-secondary' : 'text-muted-foreground',
                    )}
                  >
                    {base}
                  </span>
                ))}
                <span className="text-[8px] text-muted-foreground">...</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-4 w-full group-hover:border-primary/50 group-hover:text-primary transition-colors"
                onClick={() => handleLoad(data)}
              >
                Load Example →
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
