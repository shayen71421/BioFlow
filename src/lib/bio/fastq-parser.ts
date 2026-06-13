import type { FASTQRead, FASTQResult } from '@/types/sequence';

export function parseFASTQ(text: string): FASTQRead[] {
  const lines = text.split('\n');
  const reads: FASTQRead[] = [];

  for (let i = 0; i + 3 < lines.length; i += 4) {
    const header = lines[i].trim();
    const seq = lines[i + 1].trim();
    const qual = lines[i + 3].trim();

    if (!header.startsWith('@')) continue;
    if (!seq || !qual) continue;

    const id = header.slice(1).split(/\s/)[0];
    reads.push({ id, sequence: seq, quality: qual, length: seq.length });
  }

  return reads;
}

export function analyzeFASTQ(reads: FASTQRead[]): FASTQResult {
  if (reads.length === 0) {
    return { reads: [], totalReads: 0, avgQuality: 0, avgLength: 0 };
  }

  let totalLen = 0;

  for (const read of reads) {
    totalLen += read.length;
  }

  const totalReads = reads.length;
  const totalQualScores = reads.reduce((sum, r) => {
    return sum + r.quality.split('').reduce((s, c) => s + c.charCodeAt(0) - 33, 0);
  }, 0);
  const totalBases = reads.reduce((sum, r) => sum + r.length, 0);

  return {
    reads,
    totalReads,
    avgQuality: totalBases > 0 ? totalQualScores / totalBases : 0,
    avgLength: totalReads > 0 ? totalLen / totalReads : 0,
  };
}
