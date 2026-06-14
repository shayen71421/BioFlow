import { describe, it, expect } from 'vitest';
import { translate, translateProtein } from '../src/lib/bio/translation';

describe('translate', () => {
  it('translates ATG to M', () => {
    const result = translate('ATG');
    expect(result.frames[0].aa).toBe('M');
  });

  it('translates ATGGCCTAA correctly', () => {
    const result = translate('ATGGCCTAA');
    expect(result.frames[0].aa).toBe('MA*');
  });

  it('returns all three frames by default', () => {
    const result = translate('ATGCGATAA');
    expect(result.frames.length).toBe(3);
  });

  it('translates sequence length not divisible by 3 without error', () => {
    const result = translate('ATGGA');
    expect(result.frames[0].aa.length).toBeGreaterThan(0);
  });

  it('handles empty sequence', () => {
    const result = translate('');
    expect(result.frames[0].aa).toBe('');
  });

  it('stop codons are translated as *', () => {
    const result = translate('TGA');
    expect(result.frames[0].aa).toBe('*');
    const result2 = translate('TAA');
    expect(result2.frames[0].aa).toBe('*');
    const result3 = translate('TAG');
    expect(result3.frames[0].aa).toBe('*');
  });
});

describe('translateProtein', () => {
  it('translates the same as frame 0', () => {
    const seq = 'ATGGCTTGA';
    expect(translateProtein(seq)).toBe(translate(seq).frames[0].aa);
  });
});
