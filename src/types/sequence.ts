export interface BioSequence {
  header: string;
  sequence: string;
  length: number;
  id: string;
}

export interface FASTQRead {
  id: string;
  sequence: string;
  quality: string;
  length: number;
}

export interface FASTQResult {
  reads: FASTQRead[];
  totalReads: number;
  avgQuality: number;
  avgLength: number;
}

export interface GenBankFeature {
  type: string;
  start: number;
  end: number;
  strand: '+' | '-' | '.';
  qualifiers: Record<string, string[]>;
}

export interface GenBankResult {
  accession: string;
  version: string;
  organism: string;
  definition: string;
  sequence: string;
  length: number;
  features: GenBankFeature[];
  cds: GenBankFeature[];
  annotations: Record<string, string>;
}

export interface AlignmentResult {
  seq1: string;
  seq2: string;
  aligned1: string;
  aligned2: string;
  score: number;
  identity: number;
  identityPercent: number;
  coverage: number;
  gaps: number;
  gapOpenings: number;
  matches: number;
  mismatches: number;
}

export interface MotifResult {
  motif: string;
  pattern: string;
  matches: MotifMatch[];
  totalMatches: number;
}

export interface MotifMatch {
  start: number;
  end: number;
  sequence: string;
  strand: '+' | '-';
}

export interface ORF {
  start: number;
  end: number;
  lengthBp: number;
  lengthAa: number;
  protein: string;
  frame: number;
  strand: '+' | '-';
}

export interface GCResult {
  overall: number;
  at: number;
  gcCount: number;
  atCount: number;
  total: number;
  distribution: { gc: number; at: number; label: string }[];
  windowData: { position: number; gc: number }[];
}

export interface TranslationFrame {
  frame: number;
  sequence: string;
  aa: string;
}

export interface TranslationResult {
  frames: TranslationFrame[];
}

export interface SequenceStats {
  length: number;
  gcPercent: number;
  atPercent: number;
  orfCount: number;
  codonCount: number;
  nucleotides: {
    A: number;
    T: number;
    G: number;
    C: number;
    N: number;
  };
}

export interface CodonUsage {
  codon: string;
  aa: string;
  count: number;
  frequency: number;
  rscu?: number;
}

export interface RestrictionEnzymeCut {
  enzyme: string;
  recognitionSite: string;
  recognitionStart: number;
  cutPosition: number;
  fragmentLength: number;
  strand: '+' | '-';
}

export interface RestrictionEnzymeResult {
  cuts: RestrictionEnzymeCut[];
  fragments: number[];
  enzymeCounts: Record<string, number>;
  totalCuts: number;
}

export interface PrimerCandidate {
  seq: string;
  start: number;
  end: number;
  length: number;
  gcPercent: number;
  tm: number;
  reverse: boolean;
  hairpinTm: number;
  selfDimer: number;
}

export interface PrimerDesignResult {
  forward: PrimerCandidate[];
  reverse: PrimerCandidate[];
  pairs: { forward: PrimerCandidate; reverse: PrimerCandidate; productSize: number; tmDiff: number }[];
}

export interface CodonUsageResult {
  codons: CodonUsage[];
  rscuValues: Record<string, number>;
  preferredCodons: string[];
  rareCodons: string[];
  heatmapData: { codon: string; aa: string; frequency: number; rscu: number }[];
}

export interface ProteinPropertiesResult {
  molecularWeight: number;
  isoelectricPoint: number;
  aminoAcidComposition: Record<string, number>;
  hydrophobicity: number;
  charge: number;
  extinctionCoefficient: number;
  instabilityIndex: number;
  aromaticity: number;
}

export type NucleotideBase = 'A' | 'T' | 'G' | 'C' | 'N';

export interface ExampleSequence {
  id: string;
  name: string;
  description: string;
  header: string;
  sequence: string;
  tags: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  workflow: string;
  sequenceIds: string[];
}
