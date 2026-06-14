import { describe, it, expect } from 'vitest';
import { searchMotif, searchCGRich } from '../src/lib/bio/motif-search';
import { validateMotifResult } from '../src/lib/validation/motifValidation';

describe('searchMotif', () => {
  it('finds EcoRI site GAATTC in demo sequence at position 36', () => {
    const seq = 'ATGGCTAGCATGACTGGTGGACAGCAAATGGGTACCGGATCCGAATTCGAGCTCCGTCGACAAGCTTGCGGCCGCACTCGAGCACCACCACCACCACCACACTGCTGATCCGGCTGCTAACAAAGCCCGAAAGGAAGCTGAGTTGGCTGCTGCCACCGCTGAGCAATAACTAGCATAACCCCTTGGGGCCTCTAAACGGGTCTTGAGGGGTTTTTTGCTGAAAGGAGGAACTATATCCGGATCTGGCGTAATAGCGAAGAGGCCCGCACCGATCGCCCTTCCCAACAGTTGCGCAGCCTGAATGGCGAATGGCGCTTTGCCTGGTTTCCGGCACCAGAAGCGGTGCCG';
    const result = searchMotif(seq, 'GAATTC');
    expect(result.totalMatches).toBe(1);
    expect(result.matches[0].start).toBe(36);
    expect(result.matches[0].strand).toBe('+');
  });

  it('finds 1 match for single GAATTC sequence', () => {
    const result = searchMotif('GAATTC', 'GAATTC');
    expect(result.totalMatches).toBe(1);
    expect(result.matches.length).toBe(1);
    expect(result.matches[0].start).toBe(0);
  });

  it('finds 2 matches for GAATTCAAAAAGAATTC', () => {
    const result = searchMotif('GAATTCAAAAAGAATTC', 'GAATTC');
    expect(result.totalMatches).toBe(2);
    expect(result.matches.length).toBe(2);
    expect(result.matches[0].start).toBe(0);
    expect(result.matches[1].start).toBe(10);
  });

  it('reports unique positions only for palindromic motifs', () => {
    const result = searchMotif('GAATTC', 'GAATTC');
    const positions = result.matches.map((m) => m.start);
    expect(new Set(positions).size).toBe(positions.length);
  });

  it('matches.length equals totalMatches', () => {
    const result = searchMotif('GAATTCAAAAAGAATTC', 'GAATTC');
    expect(result.matches.length).toBe(result.totalMatches);
  });

  it('returns empty result for no matches', () => {
    const result = searchMotif('AAAAAA', 'GGG');
    expect(result.totalMatches).toBe(0);
    expect(result.matches).toEqual([]);
  });

  it('validates correctly via validation module', () => {
    const result = searchMotif('GAATTCAAAAAGAATTC', 'GAATTC');
    const errors = validateMotifResult(result);
    expect(errors).toEqual([]);
  });

  it('handles ambiguous nucleotide N', () => {
    const result = searchMotif('ANC', 'ANC');
    expect(result.totalMatches).toBe(1);
  });

  it('uses regex mode when useRegex is true', () => {
    const result = searchMotif('ABC', 'A.C', true);
    expect(result.totalMatches).toBe(1);
  });

  it('handles empty sequence', () => {
    const result = searchMotif('', 'GAATTC');
    expect(result.totalMatches).toBe(0);
  });

  it('handles empty motif', () => {
    const result = searchMotif('GAATTC', '');
    expect(result.totalMatches).toBe(0);
  });
});

describe('searchCGRich', () => {
  it('finds CG-rich regions in GC-heavy sequence', () => {
    const result = searchCGRich('GCGCGCGCGCGCGCGCGCGC', 10, 65);
    expect(result.totalMatches).toBeGreaterThan(0);
  });

  it('returns empty for AT-rich sequence', () => {
    const result = searchCGRich('ATATATATATATATAT', 10, 65);
    expect(result.totalMatches).toBe(0);
  });

  it('validates CG-rich results', () => {
    const result = searchCGRich('GCGCGCGCGCGCGCGCGCGC', 10, 65);
    const errors = validateMotifResult(result);
    expect(errors).toEqual([]);
  });
});
