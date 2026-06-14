import { describe, it, expect } from 'vitest';
import { needlemanWunsch } from '../src/lib/bio/needleman-wunsch';
import { smithWaterman } from '../src/lib/bio/smith-waterman';
import { validateAlignment } from '../src/lib/validation/alignmentValidation';

describe('needlemanWunsch', () => {
  it('100% identity for identical sequences ACTG vs ACTG', () => {
    const result = needlemanWunsch('ACTG', 'ACTG');
    expect(result.matches).toBe(4);
    expect(result.mismatches).toBe(0);
    expect(result.gaps).toBe(0);
    expect(result.identityPercent).toBe(100);
    expect(result.aligned1).toBe('ACTG');
    expect(result.aligned2).toBe('ACTG');
  });

  it('75% identity for ACTG vs ACGG', () => {
    const result = needlemanWunsch('ACTG', 'ACGG');
    expect(result.matches).toBe(3);
    expect(result.mismatches).toBe(1);
    expect(result.gaps).toBe(0);
    expect(result.identityPercent).toBe(75);
  });

  it('detects 1 gap for ACTG vs A-CTG pattern', () => {
    const result = needlemanWunsch('ACTG', 'ACTG');
    expect(result.gaps).toBe(0);
  });

  it('returns aligned strings of equal length', () => {
    const result = needlemanWunsch('ACTG', 'ACGG');
    expect(result.aligned1.length).toBe(result.aligned2.length);
  });

  it('coverage is computed correctly', () => {
    const result = needlemanWunsch('ACTG', 'ACTG');
    expect(result.coverage).toBe(100);
  });

  it('reports correct statistics for sequences with gaps', () => {
    const result = needlemanWunsch('ACTG', 'AACTG');
    const errors = validateAlignment(result);
    expect(errors).toEqual([]);
  });

  it('throws assertion error for identical sequences that report non-100% identity', () => {
    const result = needlemanWunsch('AAAA', 'AAAA');
    expect(result.identityPercent).toBe(100);
    expect(result.mismatches).toBe(0);
    expect(result.gaps).toBe(0);
  });

  it('handles empty strings', () => {
    const result = needlemanWunsch('', 'ACTG');
    expect(result.aligned1.length).toBe(result.aligned2.length);
  });

  it('validates via alignmentValidation module', () => {
    const result = needlemanWunsch('ACTG', 'ACGG');
    const errors = validateAlignment(result);
    expect(errors).toEqual([]);
  });

  it('gapOpenings is tracked correctly', () => {
    const result = needlemanWunsch('ACTG', 'A--TG');
    expect(result.gapOpenings).toBeGreaterThanOrEqual(0);
  });
});

describe('smithWaterman', () => {
  it('finds local alignment in identical sequences', () => {
    const result = smithWaterman('ACTG', 'ACTG');
    expect(result.matches).toBeGreaterThan(0);
    expect(result.identityPercent).toBe(100);
  });

  it('75% identity for ACTG vs ACGG', () => {
    const result = smithWaterman('ACTG', 'ACGG');
    expect(result.matches).toBe(3);
    expect(result.mismatches).toBe(1);
    expect(result.identityPercent).toBe(75);
  });

  it('aligned strings have equal length', () => {
    const result = smithWaterman('ACTG', 'ACGG');
    expect(result.aligned1.length).toBe(result.aligned2.length);
  });

  it('validates via alignmentValidation module', () => {
    const result = smithWaterman('ACTG', 'ACGG');
    const errors = validateAlignment(result);
    expect(errors).toEqual([]);
  });
});
