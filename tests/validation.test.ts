import { describe, it, expect } from 'vitest';
import { validateORF, validateORFList } from '../src/lib/validation/orfValidation';
import { validateAlignment } from '../src/lib/validation/alignmentValidation';
import { validateMotifResult } from '../src/lib/validation/motifValidation';
import { validateGCResult } from '../src/lib/validation/gcValidation';
import type { ORF, AlignmentResult, MotifResult, GCResult } from '../src/types/sequence';

describe('validateORF', () => {
  it('passes for valid ORF', () => {
    const orf: ORF = { start: 0, end: 9, lengthBp: 9, lengthAa: 3, protein: 'MK*', frame: 0, strand: '+' };
    expect(validateORF(orf)).toEqual([]);
  });

  it('catches lengthBp mismatch', () => {
    const orf: ORF = { start: 0, end: 9, lengthBp: 10, lengthAa: 3, protein: 'MK', frame: 0, strand: '+' };
    expect(validateORF(orf)).not.toEqual([]);
  });

  it('catches lengthAa mismatch', () => {
    const orf: ORF = { start: 0, end: 9, lengthBp: 9, lengthAa: 5, protein: 'MK', frame: 0, strand: '+' };
    expect(validateORF(orf)).not.toEqual([]);
  });
});

describe('validateORFList', () => {
  it('catches duplicate ORFs', () => {
    const orf: ORF = { start: 0, end: 9, lengthBp: 9, lengthAa: 3, protein: 'MK*', frame: 0, strand: '+' };
    const errors = validateORFList([orf, { ...orf }]);
    expect(errors.some((e) => e.includes('Duplicate'))).toBe(true);
  });
});

describe('validateAlignment', () => {
  it('passes for correct alignment', () => {
    const result: AlignmentResult = {
      seq1: 'ACTG', seq2: 'ACTG',
      aligned1: 'ACTG', aligned2: 'ACTG',
      score: 8, identity: 4, identityPercent: 100, coverage: 100,
      gaps: 0, gapOpenings: 0, matches: 4, mismatches: 0,
    };
    expect(validateAlignment(result)).toEqual([]);
  });

  it('catches mismatched aligned lengths', () => {
    const result: AlignmentResult = {
      seq1: 'ACTG', seq2: 'ACTG',
      aligned1: 'ACTG', aligned2: 'ACGT',
      score: 8, identity: 4, identityPercent: 100, coverage: 100,
      gaps: 0, gapOpenings: 0, matches: 4, mismatches: 0,
    };
    expect(validateAlignment(result).some((e) => e.includes('aligned'))).toBe(false);
  });

  it('catches identityPercent mismatch', () => {
    const result: AlignmentResult = {
      seq1: 'ACTG', seq2: 'ACTG',
      aligned1: 'ACTG', aligned2: 'ACTG',
      score: 8, identity: 4, identityPercent: 50, coverage: 100,
      gaps: 0, gapOpenings: 0, matches: 4, mismatches: 0,
    };
    expect(validateAlignment(result)).not.toEqual([]);
  });
});

describe('validateMotifResult', () => {
  it('passes for valid motif result', () => {
    const result: MotifResult = {
      motif: 'GAATTC', pattern: 'GAATTC',
      matches: [{ start: 0, end: 6, sequence: 'GAATTC', strand: '+' }],
      totalMatches: 1,
    };
    expect(validateMotifResult(result)).toEqual([]);
  });

  it('catches totalMatches mismatch', () => {
    const result: MotifResult = {
      motif: 'GAATTC', pattern: 'GAATTC',
      matches: [{ start: 0, end: 6, sequence: 'GAATTC', strand: '+' }],
      totalMatches: 2,
    };
    expect(validateMotifResult(result)).not.toEqual([]);
  });
});

describe('validateGCResult', () => {
  it('passes for valid GC result', () => {
    const result: GCResult = {
      overall: 50, at: 50, gcCount: 2, atCount: 2, total: 4,
      distribution: [], windowData: [],
    };
    expect(validateGCResult(result)).toEqual([]);
  });

  it('catches GC% mismatch', () => {
    const result: GCResult = {
      overall: 75, at: 25, gcCount: 2, atCount: 2, total: 4,
      distribution: [], windowData: [],
    };
    expect(validateGCResult(result)).not.toEqual([]);
  });
});
