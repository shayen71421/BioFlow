import { describe, it, expect } from 'vitest';
import { digestSequence, getAvailableEnzymes } from '../src/lib/bio/restriction-enzymes';

describe('digestSequence', () => {
  it('finds EcoRI site in GAATTC', () => {
    const result = digestSequence('GAATTC', ['EcoRI']);
    expect(result.totalCuts).toBe(1);
    expect(result.cuts[0].enzyme).toBe('EcoRI');
  });

  it('no cuts for sequence without restriction sites', () => {
    const result = digestSequence('AAAAAAAAAA', ['EcoRI']);
    expect(result.totalCuts).toBe(0);
  });

  it('finds multiple enzymes in the demo sequence', () => {
    const seq = 'ATGGCTAGCATGACTGGTGGACAGCAAATGGGTACCGGATCCGAATTCGAGCTCCGTCGACAAGCTTGCGGCCGCACTCGAGCACCACCACCACCACCACACTGCTGATCCGGCTGCTAACAAAGCCCGAAAGGAAGCTGAGTTGGCTGCTGCCACCGCTGAGCAATAACTAGCATAACCCCTTGGGGCCTCTAAACGGGTCTTGAGGGGTTTTTTGCTGAAAGGAGGAACTATATCCGGATCTGGCGTAATAGCGAAGAGGCCCGCACCGATCGCCCTTCCCAACAGTTGCGCAGCCTGAATGGCGAATGGCGCTTTGCCTGGTTTCCGGCACCAGAAGCGGTGCCG';
    const result = digestSequence(seq, ['EcoRI', 'BamHI', 'HindIII']);
    expect(result.totalCuts).toBeGreaterThanOrEqual(3);
  });

  it('fragment lengths sum to sequence length', () => {
    const seq = 'ATGGCTAGCATGACTGGTGGACAGCAAATGGGTACCGGATCCGAATTCGAGCTCCGTCGACAAGCTTGCGGCCGCACTCGAGCACCACCACCACCACCACACTGCTGATCCGGCTGCTAACAAAGCCCGAAAGGAAGCTGAGTTGGCTGCTGCCACCGCTGAGCAATAACTAGCATAACCCCTTGGGGCCTCTAAACGGGTCTTGAGGGGTTTTTTGCTGAAAGGAGGAACTATATCCGGATCTGGCGTAATAGCGAAGAGGCCCGCACCGATCGCCCTTCCCAACAGTTGCGCAGCCTGAATGGCGAATGGCGCTTTGCCTGGTTTCCGGCACCAGAAGCGGTGCCG';
    const result = digestSequence(seq, ['EcoRI', 'BamHI', 'HindIII']);
    const sum = result.fragments.reduce((a, b) => a + b, 0);
    expect(sum).toBe(seq.length);
  });

  it('getAvailableEnzymes returns enzyme list', () => {
    const enzymes = getAvailableEnzymes();
    expect(enzymes.length).toBeGreaterThan(0);
    expect(enzymes[0]).toHaveProperty('name');
    expect(enzymes[0]).toHaveProperty('recognition');
  });
});
