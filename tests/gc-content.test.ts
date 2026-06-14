import { describe, it, expect } from 'vitest';
import { calculateGC } from '../src/lib/bio/gc-content';
import { validateGCResult } from '../src/lib/validation/gcValidation';

describe('calculateGC', () => {
  it('computes 50% GC for equal AT/GC sequence', () => {
    const result = calculateGC('ATGC', 100);
    expect(result.overall).toBe(50);
    expect(result.at).toBe(50);
    expect(result.gcCount).toBe(2);
    expect(result.atCount).toBe(2);
  });

  it('computes 100% GC for all-GC sequence', () => {
    const result = calculateGC('GCGC', 100);
    expect(result.overall).toBe(100);
    expect(result.at).toBe(0);
  });

  it('computes 0% GC for all-AT sequence', () => {
    const result = calculateGC('ATAT', 100);
    expect(result.overall).toBe(0);
    expect(result.at).toBe(100);
  });

  it('computes correct GC for demo 348bp sequence', () => {
    const seq = 'ATGGCTAGCATGACTGGTGGACAGCAAATGGGTACCGGATCCGAATTCGAGCTCCGTCGACAAGCTTGCGGCCGCACTCGAGCACCACCACCACCACCACACTGCTGATCCGGCTGCTAACAAAGCCCGAAAGGAAGCTGAGTTGGCTGCTGCCACCGCTGAGCAATAACTAGCATAACCCCTTGGGGCCTCTAAACGGGTCTTGAGGGGTTTTTTGCTGAAAGGAGGAACTATATCCGGATCTGGCGTAATAGCGAAGAGGCCCGCACCGATCGCCCTTCCCAACAGTTGCGCAGCCTGAATGGCGAATGGCGCTTTGCCTGGTTTCCGGCACCAGAAGCGGTGCCG';
    const result = calculateGC(seq, 100);
    const gc = seq.toUpperCase().split('').filter((b) => b === 'G' || b === 'C').length;
    const total = seq.length;
    expect(result.overall).toBeCloseTo((gc / total) * 100, 6);
    expect(result.gcCount).toBe(gc);
    expect(result.total).toBe(total);
  });

  it('generates distribution data', () => {
    const result = calculateGC('ATGCATGCATGC', 10);
    expect(result.distribution.length).toBeGreaterThan(0);
    expect(result.windowData.length).toBeGreaterThan(0);
  });

  it('validates via gcValidation module', () => {
    const result = calculateGC('ATGCATGC', 4);
    const errors = validateGCResult(result);
    expect(errors).toEqual([]);
  });

  it('handles empty sequence', () => {
    const result = calculateGC('', 100);
    expect(result.overall).toBe(0);
    expect(result.gcCount).toBe(0);
    expect(result.total).toBe(0);
  });

  it('counts nucleotides correctly', () => {
    const result = calculateGC('AATTCCGG', 100);
    expect(result.gcCount).toBe(4);
    expect(result.atCount).toBe(4);
  });
});
