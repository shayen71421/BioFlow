import type { CodonUsage } from '@/types/sequence';
import { CODON_TABLE } from './codon-table';

export function calculateCodonUsage(sequence: string): CodonUsage[] {
  const seq = sequence.toUpperCase();
  const codonCounts: Record<string, number> = {};
  let total = 0;

  for (let i = 0; i + 3 <= seq.length; i += 3) {
    const codon = seq.slice(i, i + 3);
    if (codon.length === 3 && !codon.includes('N')) {
      codonCounts[codon] = (codonCounts[codon] || 0) + 1;
      total++;
    }
  }

  const usage: CodonUsage[] = [];
  for (const [codon, count] of Object.entries(codonCounts)) {
    usage.push({
      codon,
      aa: CODON_TABLE[codon] || 'X',
      count,
      frequency: total > 0 ? count / total : 0,
    });
  }

  usage.sort((a, b) => b.count - a.count);
  return usage;
}

export function getSequenceStats(sequence: string) {
  const seq = sequence.toUpperCase();
  const counts = { A: 0, T: 0, G: 0, C: 0, N: 0 };
  for (const base of seq) {
    if (base in counts) counts[base as keyof typeof counts]++;
  }
  const total = counts.A + counts.T + counts.G + counts.C;
  return {
    ...counts,
    total,
    gcPercent: total > 0 ? ((counts.G + counts.C) / total) * 100 : 0,
    atPercent: total > 0 ? ((counts.A + counts.T) / total) * 100 : 0,
    length: seq.length,
  };
}
