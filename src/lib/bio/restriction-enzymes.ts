import type { RestrictionEnzymeCut, RestrictionEnzymeResult } from '@/types/sequence';

interface EnzymeDef {
  name: string;
  recognition: string;
  cutPattern: RegExp;
  cutOffset: number;
}

const ENZYMES: EnzymeDef[] = [
  { name: 'EcoRI', recognition: 'GAATTC', cutPattern: /GAATTC/g, cutOffset: 1 },
  { name: 'BamHI', recognition: 'GGATCC', cutPattern: /GGATCC/g, cutOffset: 1 },
  { name: 'HindIII', recognition: 'AAGCTT', cutPattern: /AAGCTT/g, cutOffset: 1 },
  { name: 'NotI', recognition: 'GCGGCCGC', cutPattern: /GCGGCCGC/g, cutOffset: 2 },
  { name: 'XhoI', recognition: 'CTCGAG', cutPattern: /CTCGAG/g, cutOffset: 1 },
  { name: 'EcoRV', recognition: 'GATATC', cutPattern: /GATATC/g, cutOffset: 3 },
  { name: 'KpnI', recognition: 'GGTACC', cutPattern: /GGTACC/g, cutOffset: 1 },
  { name: 'SacI', recognition: 'GAGCTC', cutPattern: /GAGCTC/g, cutOffset: 3 },
  { name: 'SalI', recognition: 'GTCGAC', cutPattern: /GTCGAC/g, cutOffset: 1 },
  { name: 'SmaI', recognition: 'CCCGGG', cutPattern: /CCCGGG/g, cutOffset: 3 },
  { name: 'SpeI', recognition: 'ACTAGT', cutPattern: /ACTAGT/g, cutOffset: 1 },
  { name: 'XbaI', recognition: 'TCTAGA', cutPattern: /TCTAGA/g, cutOffset: 1 },
  { name: 'PstI', recognition: 'CTGCAG', cutPattern: /CTGCAG/g, cutOffset: 3 },
  { name: 'NcoI', recognition: 'CCATGG', cutPattern: /CCATGG/g, cutOffset: 1 },
  { name: 'NdeI', recognition: 'CATATG', cutPattern: /CATATG/g, cutOffset: 3 },
];

export function digestSequence(sequence: string, enzymeNames?: string[]): RestrictionEnzymeResult {
  const seq = sequence.toUpperCase();
  const cuts: RestrictionEnzymeCut[] = [];
  const enzymeCounts: Record<string, number> = {};

  const enzymes = enzymeNames
    ? ENZYMES.filter((e) => enzymeNames.includes(e.name))
    : ENZYMES;

  for (const enzyme of enzymes) {
    const regex = new RegExp(enzyme.recognition, 'g');
    let match: RegExpExecArray | null;
    let count = 0;

    while ((match = regex.exec(seq)) !== null) {
      const cutPos = match.index + enzyme.cutOffset;
      cuts.push({
        enzyme: enzyme.name,
        recognitionSite: enzyme.recognition,
        cutPosition: cutPos,
        fragmentLength: 0,
        strand: '+',
      });
      count++;
    }

    if (count > 0) enzymeCounts[enzyme.name] = count;
  }

  cuts.sort((a, b) => a.cutPosition - b.cutPosition);

  const positions = [0, ...cuts.map((c) => c.cutPosition), seq.length];
  const fragments: number[] = [];
  for (let i = 1; i < positions.length; i++) {
    fragments.push(positions[i] - positions[i - 1]);
  }

  for (let i = 0; i < cuts.length; i++) {
    cuts[i].fragmentLength = fragments[i + 1] || 0;
  }

  return {
    cuts,
    fragments,
    enzymeCounts,
    totalCuts: cuts.length,
  };
}

export function getAvailableEnzymes(): { name: string; recognition: string }[] {
  return ENZYMES.map((e) => ({ name: e.name, recognition: e.recognition }));
}
