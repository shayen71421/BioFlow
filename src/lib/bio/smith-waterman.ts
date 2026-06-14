import type { AlignmentResult } from '@/types/sequence';

export function smithWaterman(
  seq1: string,
  seq2: string,
  matchScore: number = 2,
  mismatchScore: number = -1,
  gapPenalty: number = -2,
): AlignmentResult {
  const s1 = seq1.toUpperCase();
  const s2 = seq2.toUpperCase();
  const n = s1.length;
  const m = s2.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  const traceback: string[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(''));

  let maxScore = 0;
  let maxI = 0;
  let maxJ = 0;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const match = dp[i - 1][j - 1] + (s1[i - 1] === s2[j - 1] ? matchScore : mismatchScore);
      const del = dp[i - 1][j] + gapPenalty;
      const ins = dp[i][j - 1] + gapPenalty;
      const best = Math.max(0, match, del, ins);

      dp[i][j] = best;
      if (best === match) traceback[i][j] = 'D';
      else if (best === del) traceback[i][j] = 'U';
      else if (best === ins) traceback[i][j] = 'L';
      else traceback[i][j] = 'E';

      if (best > maxScore) {
        maxScore = best;
        maxI = i;
        maxJ = j;
      }
    }
  }

  let i = maxI, j = maxJ;
  let a1 = '', a2 = '';
  let matches = 0, mismatches = 0, gaps = 0, gapOpenings = 0;
  let prevMove = 'D';

  while (i > 0 && j > 0 && dp[i][j] > 0) {
    if (traceback[i][j] === 'D') {
      a1 = s1[i - 1] + a1;
      a2 = s2[j - 1] + a2;
      if (s1[i - 1] === s2[j - 1]) matches++;
      else mismatches++;
      i--; j--;
      prevMove = 'D';
    } else if (traceback[i][j] === 'U') {
      if (prevMove !== 'U') gapOpenings++;
      a1 = s1[i - 1] + a1;
      a2 = '-' + a2;
      gaps++;
      i--;
      prevMove = 'U';
    } else if (traceback[i][j] === 'L') {
      if (prevMove !== 'L') gapOpenings++;
      a1 = '-' + a1;
      a2 = s2[j - 1] + a2;
      gaps++;
      j--;
      prevMove = 'L';
    } else {
      break;
    }
  }

  const alignedLength = a1.length;
  const identity = matches;
  const identityPercent = alignedLength > 0 ? (matches / alignedLength) * 100 : 0;
  const coverage = Math.max(n, m) > 0 ? (alignedLength / Math.max(n, m)) * 100 : 0;

  if (mismatches === 0 && gaps === 0 && identityPercent !== 100) {
    throw new Error('Assertion failed: identical sequences must have 100% identity');
  }

  return {
    seq1,
    seq2,
    aligned1: a1,
    aligned2: a2,
    score: maxScore,
    identity,
    identityPercent,
    coverage,
    gaps,
    gapOpenings,
    matches,
    mismatches,
  };
}
