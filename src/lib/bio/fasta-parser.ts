import type { BioSequence } from '@/types/sequence';

let seqCounter = 0;

export function parseFasta(text: string): BioSequence[] {
  const sequences: BioSequence[] = [];
  const lines = text.split(/\r?\n/);
  let currentHeader = '';
  let currentSeq = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith(';')) continue;

    if (trimmed.startsWith('>')) {
      if (currentHeader && currentSeq) {
        sequences.push(createSeq(currentHeader, currentSeq));
      }
      currentHeader = trimmed.slice(1).trim();
      currentSeq = '';
    } else {
      currentSeq += trimmed.replace(/\s/g, '');
    }
  }

  if (currentHeader && currentSeq) {
    sequences.push(createSeq(currentHeader, currentSeq));
  }

  return sequences;
}

function createSeq(header: string, seq: string): BioSequence {
  const id = `seq_${++seqCounter}_${Date.now()}`;
  return {
    header,
    sequence: seq.toUpperCase(),
    length: seq.length,
    id,
  };
}

export function formatFasta(sequences: BioSequence[]): string {
  return sequences
    .map((s) => {
      const header = `>${s.header}`;
      const body = s.sequence.replace(/(.{80})/g, '$1\n').trim();
      return `${header}\n${body}`;
    })
    .join('\n');
}
