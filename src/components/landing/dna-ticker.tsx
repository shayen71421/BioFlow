'use client';

import { useMemo } from 'react';

// A representative DNA sequence containing promoter and restriction sites
const TICKER_SEQUENCE =
  'ATGGCTAGCATGACTGGTGGACAGCAAATGGGTACCGGATCCGAATTCGAGCTCCGTCGACAAGCTTGCGGCCGCACTCGAGCACCACCACCACCACCAC' +
  'GCTGATCCGGCTGCTAACAAAGCCCGAAAGGAAGCTGAGTTGGCTGCTGCCACCGCTGAGCAATAACTAGCATAACCCCTTGGGGCCTCTAAACGGGTCT';

interface DnaTickerProps {
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
}

export function DnaTicker({ className = '' }: DnaTickerProps) {
  const sequenceArray = useMemo(() => TICKER_SEQUENCE.split(''), []);

  const renderBases = () => {
    return sequenceArray.map((base, idx) => {
      let colorClass = 'text-muted-foreground';
      if (base === 'A') colorClass = 'nucleotide-a';
      else if (base === 'T') colorClass = 'nucleotide-t';
      else if (base === 'G') colorClass = 'nucleotide-g';
      else if (base === 'C') colorClass = 'nucleotide-c';

      return (
        <span
          key={`${base}-${idx}`}
          className={`font-mono font-bold text-xs tracking-[0.2em] inline-block ${colorClass}`}
        >
          {base}
        </span>
      );
    });
  };

  return (
    <div className={`relative w-full overflow-hidden border-y border-border/40 bg-background py-1.5 select-none ${className}`}>
      <div className="flex w-max">
        {/* Two identical lists to make the scrolling loop seamless */}
        <div className="animate-ticker flex gap-2">
          <div className="flex gap-1.5 pr-8">{renderBases()}</div>
          <div className="flex gap-1.5 pr-8">{renderBases()}</div>
        </div>
      </div>
      {/* Subtle shadows on edges to smooth out boundaries */}
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
}
