export const CODON_TABLE: Record<string, string> = {
  TTT: 'F', TTC: 'F', TTA: 'L', TTG: 'L',
  TCT: 'S', TCC: 'S', TCA: 'S', TCG: 'S',
  TAT: 'Y', TAC: 'Y', TAA: '*', TAG: '*',
  TGT: 'C', TGC: 'C', TGA: '*', TGG: 'W',
  CTT: 'L', CTC: 'L', CTA: 'L', CTG: 'L',
  CCT: 'P', CCC: 'P', CCA: 'P', CCG: 'P',
  CAT: 'H', CAC: 'H', CAA: 'Q', CAG: 'Q',
  CGT: 'R', CGC: 'R', CGA: 'R', CGG: 'R',
  ATT: 'I', ATC: 'I', ATA: 'I', ATG: 'M',
  ACT: 'T', ACC: 'T', ACA: 'T', ACG: 'T',
  AAT: 'N', AAC: 'N', AAA: 'K', AAG: 'K',
  AGT: 'S', AGC: 'S', AGA: 'R', AGG: 'R',
  GTT: 'V', GTC: 'V', GTA: 'V', GTG: 'V',
  GCT: 'A', GCC: 'A', GCA: 'A', GCG: 'A',
  GAT: 'D', GAC: 'D', GAA: 'E', GAG: 'E',
  GGT: 'G', GGC: 'G', GGA: 'G', GGG: 'G',
};

const AA_CLASSES: Record<string, string> = {
  A: 'hydrophobic', R: 'basic', N: 'polar', D: 'acidic', C: 'polar',
  Q: 'polar', E: 'acidic', G: 'hydrophobic', H: 'basic', I: 'hydrophobic',
  L: 'hydrophobic', K: 'basic', M: 'hydrophobic', F: 'hydrophobic',
  P: 'hydrophobic', S: 'polar', T: 'polar', W: 'hydrophobic',
  Y: 'polar', V: 'hydrophobic', '*': 'stop', 'X': 'unknown',
};

export function getAminoAcid(codon: string): string {
  return CODON_TABLE[codon.toUpperCase()] || 'X';
}

export function getAminoAcidClass(aa: string): string {
  return AA_CLASSES[aa] || 'unknown';
}

export const AMINO_ACIDS = 'ACDEFGHIKLMNPQRSTVWY';

export const CODON_BASES_FIRST = ['T', 'C', 'A', 'G'];
export const CODON_BASES_SECOND = ['T', 'C', 'A', 'G'];
export const CODON_BASES_THIRD = ['T', 'C', 'A', 'G'];

export function getCodonColor(aa: string): string {
  const cls = AA_CLASSES[aa] || 'unknown';
  switch (cls) {
    case 'hydrophobic': return '#F59E0B';
    case 'polar': return '#22C55E';
    case 'basic': return '#3B82F6';
    case 'acidic': return '#EF4444';
    case 'stop': return '#64748B';
    default: return '#F1F5F9';
  }
}
