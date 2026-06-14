import type { MotifResult } from '@/types/sequence';

export function validateMotifResult(result: MotifResult): string[] {
  const errors: string[] = [];

  if (result.matches.length !== result.totalMatches) {
    errors.push(`totalMatches (${result.totalMatches}) !== matches.length (${result.matches.length})`);
  }

  const positions = new Set<number>();
  for (let i = 0; i < result.matches.length; i++) {
    const m = result.matches[i];
    if (m.start < 0) errors.push(`match[${i}].start (${m.start}) must be >= 0`);
    if (m.end <= m.start) errors.push(`match[${i}].end (${m.end}) must be > start (${m.start})`);
    if (m.end - m.start !== m.sequence.length) errors.push(`match[${i}] length mismatch: end-start (${m.end - m.start}) !== sequence.length (${m.sequence.length})`);

    if (positions.has(m.start)) errors.push(`match[${i}]: duplicate position ${m.start}`);
    positions.add(m.start);
  }

  return errors;
}
