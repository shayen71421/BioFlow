import type { BioSequence } from '@/types/sequence';

export function parseFasta(text: string): BioSequence[] {
  const sequences: BioSequence[] = [];
  const lines = text.split(/\r?\n/);
  let currentHeader = '';
  let currentSeq = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('>')) {
      if (currentHeader) {
        sequences.push(makeSequence(currentHeader, currentSeq));
      }
      currentHeader = trimmed.slice(1).trim();
      currentSeq = '';
    } else if (trimmed && !trimmed.startsWith(';')) {
      currentSeq += trimmed.replace(/\s/g, '').toUpperCase();
    }
  }

  if (currentHeader) {
    sequences.push(makeSequence(currentHeader, currentSeq));
  }

  return sequences;
}

function makeSequence(header: string, seq: string): BioSequence {
  const id = header.split(/\s+/)[0] || `seq_${Math.random().toString(36).slice(2, 7)}`;
  return {
    id,
    header,
    sequence: seq,
    length: seq.length,
  };
}

export function formatFasta(sequences: BioSequence[]): string {
  return sequences
    .map((s) => {
      const lines: string[] = [];
      lines.push(`>${s.header}`);
      for (let i = 0; i < s.sequence.length; i += 80) {
        lines.push(s.sequence.slice(i, i + 80));
      }
      return lines.join('\n');
    })
    .join('\n');
}
