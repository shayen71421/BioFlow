import type { MotifResult, MotifMatch } from '@/types/sequence';
import { reverseComplement } from './reverse-complement';

export function searchMotif(sequence: string, motif: string, useRegex: boolean = false): MotifResult {
  const seq = sequence.toUpperCase();
  const pattern = useRegex ? motif : motif.toUpperCase().replace(/[ACTGN]/g, (c) => {
    const amb: Record<string, string> = { A: 'A', C: 'C', T: 'T', G: 'G', N: '[ACTGN]' };
    return amb[c] || c;
  });

  const matches: MotifMatch[] = [];

  try {
    const regex = new RegExp(pattern, 'g');
    let m: RegExpExecArray | null;

    while ((m = regex.exec(seq)) !== null) {
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        sequence: m[0],
        strand: '+',
      });
      if (!regex.global) break;
    }

    const revSeq = reverseComplement(seq);
    const revRegex = new RegExp(pattern, 'g');
    while ((m = revRegex.exec(revSeq)) !== null) {
      const revStart = seq.length - m.index - m[0].length;
      matches.push({
        start: revStart,
        end: revStart + m[0].length,
        sequence: m[0],
        strand: '-',
      });
    }
  } catch {
    return { motif, pattern, matches: [], totalMatches: 0 };
  }

  matches.sort((a, b) => a.start - b.start);
  return { motif, pattern, matches, totalMatches: matches.length };
}

export function searchCGRich(sequence: string, windowSize: number = 50, threshold: number = 65): MotifResult {
  const seq = sequence.toUpperCase();
  const matches: MotifMatch[] = [];

  for (let i = 0; i + windowSize <= seq.length; i += Math.floor(windowSize / 2)) {
    const window = seq.slice(i, i + windowSize);
    let gc = 0;
    for (const b of window) {
      if (b === 'G' || b === 'C') gc++;
    }
    const pct = (gc / windowSize) * 100;
    if (pct >= threshold) {
      matches.push({
        start: i,
        end: i + windowSize,
        sequence: window,
        strand: '+',
      });
    }
  }

  return { motif: `CG-rich (>${threshold}%)`, pattern: `window=${windowSize}`, matches, totalMatches: matches.length };
}
