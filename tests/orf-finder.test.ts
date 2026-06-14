import { describe, it, expect } from 'vitest';
import { findORFs, findORFsInSixFrames } from '../src/lib/bio/orf-finder';
import { validateORF, validateORFList } from '../src/lib/validation/orfValidation';

describe('findORFs', () => {
  const DEMO = 'ATGGCTAGCATGACTGGTGGACAGCAAATGGGTACCGGATCCGAATTCGAGCTCCGTCGACAAGCTTGCGGCCGCACTCGAGCACCACCACCACCACCACACTGCTGATCCGGCTGCTAACAAAGCCCGAAAGGAAGCTGAGTTGGCTGCTGCCACCGCTGAGCAATAACTAGCATAACCCCTTGGGGCCTCTAAACGGGTCTTGAGGGGTTTTTTGCTGAAAGGAGGAACTATATCCGGATCTGGCGTAATAGCGAAGAGGCCCGCACCGATCGCCCTTCCCAACAGTTGCGCAGCCTGAATGGCGAATGGCGCTTTGCCTGGTTTCCGGCACCAGAAGCGGTGCCG';

  it('finds ORFs in demo sequence with default min length', () => {
    const orfs = findORFs(DEMO);
    expect(orfs.length).toBeGreaterThan(0);
    for (const orf of orfs) {
      expect(orf.lengthBp).toBe(orf.end - orf.start);
      expect(orf.lengthAa).toBe(Math.floor(orf.lengthBp / 3));
      expect(orf.lengthBp % 3).toBe(0);
      expect(orf.protein.length).toBe(orf.lengthAa);
    }
  });

  it('reports correct length for ATGAAATAG: 9 bp, 3 aa', () => {
    const orfs = findORFs('ATGAAATAG', 1);
    expect(orfs.length).toBe(1);
    expect(orfs[0].lengthBp).toBe(9);
    expect(orfs[0].lengthAa).toBe(3);
    expect(orfs[0].start).toBe(0);
    expect(orfs[0].end).toBe(9);
  });

  it('reports correct length for ATGAAAAAATAA: 12 bp, 4 aa', () => {
    const orfs = findORFs('ATGAAAAAATAA', 1);
    expect(orfs.length).toBe(1);
    expect(orfs[0].lengthBp).toBe(12);
    expect(orfs[0].lengthAa).toBe(4);
  });

  it('validates ORF length invariant: lengthAa = floor(lengthBp / 3)', () => {
    const orfs = findORFs(DEMO, 1);
    for (const orf of orfs) {
      expect(orf.lengthAa).toBe(Math.floor(orf.lengthBp / 3));
    }
  });

  it('protein length matches lengthAa', () => {
    const orfs = findORFs(DEMO, 1);
    for (const orf of orfs) {
      expect(orf.protein.length).toBe(orf.lengthAa);
    }
  });

  it('starts with ATG and ends with stop codon', () => {
    const orfs = findORFs(DEMO, 1);
    for (const orf of orfs) {
      const seq = DEMO.slice(orf.start, orf.end);
      expect(seq.startsWith('ATG')).toBe(true);
      const stop = seq.slice(-3);
      expect(['TAA', 'TAG', 'TGA']).toContain(stop);
    }
  });

  it('no ORFs below minLength', () => {
    const orfs = findORFs('ATGTAATGA', 100);
    expect(orfs.length).toBe(0);
  });

  it('finds no ORFs in sequence without start codon', () => {
    const orfs = findORFs('AAAAAAAAAA', 1);
    expect(orfs.length).toBe(0);
  });

  it('findORFsInSixFrames returns results from all frames', () => {
    const orfs = findORFsInSixFrames(DEMO, 30);
    expect(orfs.length).toBeGreaterThanOrEqual(findORFs(DEMO, 30).length);
    const frames = new Set(orfs.map((o) => o.frame));
    expect(frames.size).toBeGreaterThanOrEqual(1);
  });

  it('finds no duplicate ORFs', () => {
    const orfs = findORFs(DEMO, 1);
    const errors = validateORFList(orfs);
    expect(errors).toEqual([]);
  });

  it('all ORFs pass validation', () => {
    const orfs = findORFs(DEMO, 1);
    for (let i = 0; i < orfs.length; i++) {
      const errors = validateORF(orfs[i]);
      expect(errors, `ORF[${i}]: ${errors.join(', ')}`).toEqual([]);
    }
  });
});
