import { describe, it, expect } from 'vitest';
import { calculateCodonUsage, calculateCodonUsageWithRSCU, getSequenceStats } from '../src/lib/bio/codon-usage';

describe('calculateCodonUsage', () => {
  it('returns codons for valid sequence', () => {
    const result = calculateCodonUsage('ATGGCCTAA');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('codon');
    expect(result[0]).toHaveProperty('aa');
  });

  it('frequencies sum to approximately 1', () => {
    const result = calculateCodonUsage('ATGGCCTAAGCG');
    const sum = result.reduce((s, c) => s + c.frequency, 0);
    expect(sum).toBeCloseTo(1, 5);
  });
});

describe('calculateCodonUsageWithRSCU', () => {
  it('returns RSCU values', () => {
    const result = calculateCodonUsageWithRSCU('ATGGCCTAAGCG');
    expect(Object.keys(result.rscuValues).length).toBeGreaterThan(0);
  });
});

describe('getSequenceStats', () => {
  it('computes nucleotide counts', () => {
    const stats = getSequenceStats('AATTCCGG');
    expect(stats.A).toBe(2);
    expect(stats.T).toBe(2);
    expect(stats.G).toBe(2);
    expect(stats.C).toBe(2);
  });
});
