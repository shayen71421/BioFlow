import type { GCResult } from '@/types/sequence';

export function validateGCResult(result: GCResult): string[] {
  const errors: string[] = [];

  const { overall, at, gcCount, atCount, total } = result;

  if (gcCount + atCount > total) errors.push(`gcCount (${gcCount}) + atCount (${atCount}) > total (${total})`);

  const expectedOverall = total > 0 ? (gcCount / total) * 100 : 0;
  if (Math.abs(expectedOverall - overall) > 0.001) {
    errors.push(`overall GC% mismatch: expected ${expectedOverall.toFixed(4)}, got ${overall.toFixed(4)}`);
  }

  const expectedAt = total > 0 ? (atCount / total) * 100 : 0;
  if (Math.abs(expectedAt - at) > 0.001) {
    errors.push(`AT% mismatch: expected ${expectedAt.toFixed(4)}, got ${at.toFixed(4)}`);
  }

  return errors;
}
