import type { AlignmentResult } from '@/types/sequence';

export function needlemanWunsch(
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

  for (let i = 0; i <= n; i++) {
    dp[i][0] = i * gapPenalty;
    traceback[i][0] = 'U';
  }
  for (let j = 0; j <= m; j++) {
    dp[0][j] = j * gapPenalty;
    traceback[0][j] = 'L';
  }
  traceback[0][0] = 'D';

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const match = dp[i - 1][j - 1] + (s1[i - 1] === s2[j - 1] ? matchScore : mismatchScore);
      const del = dp[i - 1][j] + gapPenalty;
      const ins = dp[i][j - 1] + gapPenalty;

      if (match >= del && match >= ins) {
        dp[i][j] = match;
        traceback[i][j] = 'D';
      } else if (del >= ins) {
        dp[i][j] = del;
        traceback[i][j] = 'U';
      } else {
        dp[i][j] = ins;
        traceback[i][j] = 'L';
      }
    }
  }

  let i = n, j = m;
  let a1 = '', a2 = '';
  let matches = 0, mismatches = 0, gaps = 0;

  while (i > 0 || j > 0) {
    if (traceback[i][j] === 'D') {
      a1 = s1[i - 1] + a1;
      a2 = s2[j - 1] + a2;
      if (s1[i - 1] === s2[j - 1]) matches++;
      else mismatches++;
      i--; j--;
    } else if (traceback[i][j] === 'U') {
      a1 = s1[i - 1] + a1;
      a2 = '-' + a2;
      gaps++;
      i--;
    } else {
      a1 = '-' + a1;
      a2 = s2[j - 1] + a2;
      gaps++;
      j--;
    }
  }

  const identity = matches;
  const identityPercent = a1.length > 0 ? (matches / a1.length) * 100 : 0;
  const coverage = Math.max(n, m) > 0 ? (matches + mismatches) / Math.max(n, m) * 100 : 0;

  return {
    seq1,
    seq2,
    aligned1: a1,
    aligned2: a2,
    score: dp[n][m],
    identity,
    identityPercent,
    coverage,
    gaps,
    matches,
    mismatches,
  };
}
