import { describe, it, expect } from 'vitest';
import { calculateProteinProperties } from '../src/lib/bio/protein-properties';

describe('calculateProteinProperties', () => {
  it('computes molecular weight for a simple peptide', () => {
    const result = calculateProteinProperties('M');
    expect(result.molecularWeight).toBeGreaterThan(0);
  });

  it('isoelectric point is between 0 and 14', () => {
    const result = calculateProteinProperties('MAGIC');
    expect(result.isoelectricPoint).toBeGreaterThan(0);
    expect(result.isoelectricPoint).toBeLessThan(14);
  });

  it('amino acid composition sums to sequence length', () => {
    const seq = 'MAGICH';
    const result = calculateProteinProperties(seq);
    const total = Object.values(result.aminoAcidComposition).reduce((a, b) => a + b, 0);
    expect(total).toBe(seq.length);
  });

  it('handles empty sequence', () => {
    const result = calculateProteinProperties('');
    expect(result.molecularWeight).toBe(18.02);
  });
});
