import type { TranslationFrame, TranslationResult } from '@/types/sequence';
import { CODON_TABLE } from './codon-table';

export function translate(sequence: string, frames: number[] = [0, 1, 2]): TranslationResult {
  const seq = sequence.toUpperCase();
  const result: TranslationFrame[] = [];

  for (const frame of frames) {
    const adj = seq.slice(frame);
    let aa = '';
    let translatedSeq = '';

    for (let i = 0; i + 3 <= adj.length; i += 3) {
      const codon = adj.slice(i, i + 3);
      aa += CODON_TABLE[codon] || 'X';
      translatedSeq += codon;
    }

    result.push({
      frame,
      sequence: translatedSeq,
      aa,
    });
  }

  return { frames: result };
}

export function translateProtein(sequence: string): string {
  const seq = sequence.toUpperCase();
  let protein = '';
  for (let i = 0; i + 3 <= seq.length; i += 3) {
    const codon = seq.slice(i, i + 3);
    protein += CODON_TABLE[codon] || 'X';
  }
  return protein;
}
