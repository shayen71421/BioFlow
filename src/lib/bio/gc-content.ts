import type { GCResult } from '@/types/sequence';

export function calculateGC(sequence: string, windowSize: number = 100): GCResult {
  const seq = sequence.toUpperCase();
  const total = seq.length;
  let gcCount = 0;
  let atCount = 0;

  for (const base of seq) {
    if (base === 'G' || base === 'C') gcCount++;
    else if (base === 'A' || base === 'T') atCount++;
  }

  const overall = total > 0 ? (gcCount / total) * 100 : 0;
  const at = total > 0 ? (atCount / total) * 100 : 0;

  const windowData: { position: number; gc: number }[] = [];
  const step = Math.max(1, Math.floor(windowSize / 2));

  for (let i = 0; i + windowSize <= seq.length; i += step) {
    const window = seq.slice(i, i + windowSize);
    let wGC = 0;
    for (const base of window) {
      if (base === 'G' || base === 'C') wGC++;
    }
    windowData.push({
      position: i + Math.floor(windowSize / 2),
      gc: (wGC / windowSize) * 100,
    });
  }

  const steps = 20;
  const chunkSize = Math.max(1, Math.floor(total / steps));
  const distribution: { gc: number; at: number; label: string }[] = [];

  for (let i = 0; i < total; i += chunkSize) {
    const chunk = seq.slice(i, i + chunkSize);
    let cGC = 0;
    let cAT = 0;
    for (const base of chunk) {
      if (base === 'G' || base === 'C') cGC++;
      else if (base === 'A' || base === 'T') cAT++;
    }
    const cTotal = cGC + cAT;
    distribution.push({
      gc: cTotal > 0 ? (cGC / cTotal) * 100 : 0,
      at: cTotal > 0 ? (cAT / cTotal) * 100 : 0,
      label: `${Math.floor(i / 1000)}kb`,
    });
  }

  return { overall, at, gcCount, atCount, total, distribution, windowData };
}
