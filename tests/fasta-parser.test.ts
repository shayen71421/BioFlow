import { describe, it, expect } from 'vitest';
import { parseFasta } from '../src/lib/bio/fasta-parser';

describe('parseFasta', () => {
  it('parses single sequence FASTA', () => {
    const fasta = '>test\nATGC\n';
    const result = parseFasta(fasta);
    expect(result.length).toBe(1);
    expect(result[0].header).toBe('test');
    expect(result[0].sequence).toBe('ATGC');
    expect(result[0].length).toBe(4);
  });

  it('parses multi-line sequence', () => {
    const fasta = '>test\nATG\nCTA\n';
    const result = parseFasta(fasta);
    expect(result[0].sequence).toBe('ATGCTA');
  });

  it('parses multiple sequences', () => {
    const fasta = '>seq1\nATGC\n>seq2\nCGTA\n';
    const result = parseFasta(fasta);
    expect(result.length).toBe(2);
    expect(result[0].header).toBe('seq1');
    expect(result[1].header).toBe('seq2');
  });

  it('handles empty input', () => {
    const result = parseFasta('');
    expect(result).toEqual([]);
  });

  it('handles FASTA with whitespace', () => {
    const fasta = '>test header\n  ATGC  \n';
    const result = parseFasta(fasta);
    expect(result[0].sequence).toBe('ATGC');
  });

  it('strips > from header', () => {
    const fasta = '>test\nATGC\n';
    const result = parseFasta(fasta);
    expect(result[0].header).toBe('test');
  });
});
