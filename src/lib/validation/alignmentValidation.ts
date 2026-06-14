import type { AlignmentResult } from '@/types/sequence';

export function validateAlignment(result: AlignmentResult): string[] {
  const errors: string[] = [];

  const { aligned1, aligned2, matches, mismatches, gaps, gapOpenings, identityPercent } = result;

  if (aligned1.length !== aligned2.length) {
    errors.push(`aligned1 length (${aligned1.length}) !== aligned2 length (${aligned2.length})`);
    return errors;
  }

  const alignedLength = aligned1.length;

  let computedMatches = 0;
  let computedMismatches = 0;
  let computedGaps = 0;
  let computedGapOpenings = 0;
  let prevGap = false;

  for (let i = 0; i < alignedLength; i++) {
    const c1 = aligned1[i];
    const c2 = aligned2[i];
    if (c1 === '-' || c2 === '-') {
      computedGaps++;
      if (!prevGap) computedGapOpenings++;
      prevGap = true;
    } else {
      if (c1 === c2) computedMatches++;
      else computedMismatches++;
      prevGap = false;
    }
  }

  if (computedMatches !== matches) errors.push(`matches mismatch: computed ${computedMatches}, got ${matches}`);
  if (computedMismatches !== mismatches) errors.push(`mismatches mismatch: computed ${computedMismatches}, got ${mismatches}`);
  if (computedGaps !== gaps) errors.push(`gaps mismatch: computed ${computedGaps}, got ${gaps}`);
  if (computedGapOpenings !== gapOpenings) errors.push(`gapOpenings mismatch: computed ${computedGapOpenings}, got ${gapOpenings}`);

  const alignedPositions = matches + mismatches + gaps;
  if (alignedPositions !== alignedLength) {
    errors.push(`aligned positions sum (${alignedPositions}) !== aligned length (${alignedLength})`);
  }

  const expectedIdentityPct = alignedPositions > 0 ? (matches / alignedPositions) * 100 : 0;
  if (Math.abs(expectedIdentityPct - identityPercent) > 0.001) {
    errors.push(`identityPercent mismatch: expected ${expectedIdentityPct.toFixed(4)} (${matches}/${alignedPositions}), got ${identityPercent.toFixed(4)}`);
  }

  if (mismatches === 0 && gaps === 0 && identityPercent !== 100) {
    errors.push(`Assertion failed: identical sequences must have 100% identity`);
  }

  if (mismatches === 0 && gaps > 0 && identityPercent < 100) {
    errors.push(`Identity ${identityPercent.toFixed(1)}% = ${matches}/${matches + mismatches + gaps} (${matches} matches + ${gaps} gaps). Gaps reduce identity proportionally; check that this matches expected biology.`);
  }

  return errors;
}
