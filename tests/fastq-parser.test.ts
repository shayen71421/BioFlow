import { describe, it, expect } from 'vitest';
import { parseFASTQ, analyzeFASTQ } from '../src/lib/bio/fastq-parser';

const SINGLE_READ = '@SEQ_ID\nATGC\n+\n!!!!\n';

const MULTI_READS = '@READ1\nATGC\n+\nIIII\n@READ2\nCGTA\n+\nHHHH\n';

describe('parseFASTQ', () => {
  it('parses a single FASTQ read', () => {
    const reads = parseFASTQ(SINGLE_READ);
    expect(reads.length).toBe(1);
    expect(reads[0].id).toBe('SEQ_ID');
    expect(reads[0].sequence).toBe('ATGC');
    expect(reads[0].quality).toBe('!!!!');
  });

  it('parses multiple FASTQ reads', () => {
    const reads = parseFASTQ(MULTI_READS);
    expect(reads.length).toBe(2);
  });

  it('handles empty input', () => {
    const reads = parseFASTQ('');
    expect(reads).toEqual([]);
  });
});

describe('analyzeFASTQ', () => {
  it('analyzes a single read', () => {
    const reads = parseFASTQ(SINGLE_READ);
    const result = analyzeFASTQ(reads);
    expect(result.totalReads).toBe(1);
    expect(result.avgLength).toBe(4);
  });

  it('returns zeroes for empty input', () => {
    const result = analyzeFASTQ([]);
    expect(result.totalReads).toBe(0);
    expect(result.avgQuality).toBe(0);
  });
});
