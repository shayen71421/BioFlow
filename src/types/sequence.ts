export interface BioSequence {
  header: string;
  sequence: string;
  length: number;
  id: string;
}

export interface ORF {
  start: number;
  end: number;
  length: number;
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
