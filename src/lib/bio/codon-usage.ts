import type { CodonUsage, CodonUsageResult } from '@/types/sequence';
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

export function calculateCodonUsageWithRSCU(sequence: string): CodonUsageResult {
  const seq = sequence.toUpperCase();
  const codonCounts: Record<string, number> = {};
  const aaCounts: Record<string, number> = {};
  let total = 0;

  for (let i = 0; i + 3 <= seq.length; i += 3) {
    const codon = seq.slice(i, i + 3);
    if (codon.length === 3 && !codon.includes('N') && CODON_TABLE[codon]) {
      codonCounts[codon] = (codonCounts[codon] || 0) + 1;
      const aa = CODON_TABLE[codon];
      aaCounts[aa] = (aaCounts[aa] || 0) + 1;
      total++;
    }
  }

  const codonsPerAA: Record<string, string[]> = {};
  for (const [codon, aa] of Object.entries(CODON_TABLE)) {
    if (!codonsPerAA[aa]) codonsPerAA[aa] = [];
    codonsPerAA[aa].push(codon);
  }

  const rscuValues: Record<string, number> = {};
  for (const [codon, count] of Object.entries(codonCounts)) {
    const aa = CODON_TABLE[codon];
    const synonymous = codonsPerAA[aa] || [];
    let totalForAA = 0;
    for (const syn of synonymous) {
      totalForAA += codonCounts[syn] || 0;
    }
    const numSyn = synonymous.length;
    rscuValues[codon] = numSyn > 0 && totalForAA > 0
      ? (count / totalForAA) * numSyn
      : 0;
  }

  const preferredCodons: string[] = [];
  const rareCodons: string[] = [];

  for (const [codon, rscu] of Object.entries(rscuValues)) {
    if (rscu > 1.5) preferredCodons.push(codon);
    if (rscu < 0.3) rareCodons.push(codon);
  }

  const heatmapData = Object.entries(codonCounts).map(([codon, count]) => ({
    codon,
    aa: CODON_TABLE[codon] || 'X',
    frequency: total > 0 ? count / total : 0,
    rscu: rscuValues[codon] || 0,
  }));
  heatmapData.sort((a, b) => a.codon.localeCompare(b.codon));

  const codons: CodonUsage[] = Object.entries(codonCounts).map(([codon, count]) => ({
    codon,
    aa: CODON_TABLE[codon] || 'X',
    count,
    frequency: total > 0 ? count / total : 0,
    rscu: rscuValues[codon] || 0,
  }));
  codons.sort((a, b) => b.count - a.count);

  return { codons, rscuValues, preferredCodons, rareCodons, heatmapData };
}
