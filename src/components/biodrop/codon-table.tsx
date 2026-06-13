'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CODON_TABLE, CODON_BASES_FIRST, CODON_BASES_SECOND, CODON_BASES_THIRD, getCodonColor } from '@/lib/bio/codon-table';

export function CodonTableView() {
  const [hoveredCodon, setHoveredCodon] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground mb-2">
        Standard genetic code — hover a codon to see the amino acid
      </div>
      <div className="grid grid-cols-4 gap-1">
        {CODON_BASES_FIRST.map((first) => (
          <div key={first} className="space-y-1">
            <div className="text-center text-xs font-bold text-foreground font-mono">
              {first}
            </div>
            {CODON_BASES_SECOND.map((second) => (
              <div key={`${first}${second}`} className="flex flex-col gap-0.5">
                {CODON_BASES_THIRD.map((third) => {
                  const codon = `${first}${second}${third}`;
                  const aa = CODON_TABLE[codon] || 'X';
                  const isHovered = hoveredCodon === codon;
                  return (
                    <div
                      key={codon}
                      onMouseEnter={() => setHoveredCodon(codon)}
                      onMouseLeave={() => setHoveredCodon(null)}
                      className={cn(
                        'flex cursor-pointer items-center justify-between rounded px-1.5 py-0.5 text-[10px] font-mono transition-all',
                        isHovered
                          ? 'bg-surface-hover ring-1 ring-border scale-105 z-10'
                          : 'hover:bg-surface-hover',
                      )}
                    >
                      <span className="text-muted-foreground">{codon}</span>
                      <span
                        className="font-bold"
                        style={{ color: getCodonColor(aa) }}
                      >
                        {aa}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>

      {hoveredCodon && (
        <div className="rounded-lg border border-border bg-surface p-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-foreground">{hoveredCodon}</span>
            <span className="text-muted-foreground">→</span>
            <span
              className="font-mono font-bold"
              style={{ color: getCodonColor(CODON_TABLE[hoveredCodon] || 'X') }}
            >
              {CODON_TABLE[hoveredCodon] || 'X'}
            </span>
            <span className="text-muted-foreground ml-1">
              {CODON_TABLE[hoveredCodon] === '*' ? '(Stop codon)' : '(Amino acid)'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
