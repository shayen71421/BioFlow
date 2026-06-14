import type { ORF } from '@/types/sequence';
import { CODON_TABLE } from './codon-table';

const START_CODONS = new Set(['ATG']);
const STOP_CODONS = new Set(['TAA', 'TAG', 'TGA']);

export function findORFs(sequence: string, minLength: number = 30): ORF[] {
  const orfs: ORF[] = [];
  const seq = sequence.toUpperCase();

  for (let frame = 0; frame < 3; frame++) {
    const len = seq.length - frame;
    const codons = Math.floor(len / 3);

    let i = 0;
    while (i < codons) {
      const pos = frame + i * 3;
      const codon = seq.slice(pos, pos + 3);

      if (START_CODONS.has(codon)) {
        let j = i + 1;
        while (j < codons) {
          const endPos = frame + j * 3;
          const endCodon = seq.slice(endPos, endPos + 3);
          if (STOP_CODONS.has(endCodon)) {
            const start = pos;
            const end = endPos + 3;
            const orfLength = end - start;

            if (orfLength >= minLength) {
              const raw = translateORF(seq.slice(start, end));
              const protein = raw.slice(0, -1);
              orfs.push({
                start,
                end,
                lengthBp: orfLength,
                lengthAa: Math.floor(orfLength / 3) - 1,
                protein,
                frame,
                strand: '+',
              });
            }
            i = j + 1;
            break;
          }
          j++;
        }
        if (j >= codons) break;
      } else {
        i++;
      }
    }
  }

  return orfs;
}

function translateORF(dna: string): string {
  let protein = '';
  for (let i = 0; i + 3 <= dna.length; i += 3) {
    const codon = dna.slice(i, i + 3);
    protein += CODON_TABLE[codon] || 'X';
  }
  return protein;
}

export function findORFsInSixFrames(sequence: string, minLength: number = 30): ORF[] {
  const forward = findORFs(sequence, minLength);
  const revComp = reverseComplement(sequence);
  const reverse = findORFs(revComp, minLength).map((orf) => ({
    ...orf,
    start: sequence.length - orf.end,
    end: sequence.length - orf.start,
    frame: orf.frame + 3,
    strand: '-' as const,
  }));
  return [...forward, ...reverse].sort((a, b) => a.start - b.start);
}

function reverseComplement(seq: string): string {
  const comp: Record<string, string> = { A: 'T', T: 'A', G: 'C', C: 'G', N: 'N' };
  return seq
    .split('')
    .reverse()
    .map((b) => comp[b] || 'N')
    .join('');
}
