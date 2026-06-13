import type { NodeType } from '@/types/workflow';
import type { BioSequence } from '@/types/sequence';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  nodes: Array<{
    id: string;
    type: NodeType;
    position: { x: number; y: number };
    data?: Record<string, unknown>;
  }>;
  edges: Array<{
    source: string;
    target: string;
  }>;
}

const DEMO_SEQUENCE: BioSequence = {
  id: 'demo',
  header: 'demo (300bp test sequence with ORF, EcoRI, HindIII sites)',
  sequence: 'ATGGCTAGCATGACTGGTGGACAGCAAATGGGTACCGGATCCGAATTCGAGCTCCGTCGACAAGCTTGCGGCCGCACTCGAGCACCACCACCACCACCACACTGCTGATCCGGCTGCTAACAAAGCCCGAAAGGAAGCTGAGTTGGCTGCTGCCACCGCTGAGCAATAACTAGCATAACCCCTTGGGGCCTCTAAACGGGTCTTGAGGGGTTTTTTGCTGAAAGGAGGAACTATATCCGGATCTGGCGTAATAGCGAAGAGGCCCGCACCGATCGCCCTTCCCAACAGTTGCGCAGCCTGAATGGCGAATGGCGCTTTGCCTGGTTTCCGGCACCAGAAGCGGTGCCG',
  length: 300,
};

const SECOND_SEQUENCE: BioSequence = {
  id: 'second',
  header: 'second (truncated demo for alignment)',
  sequence: DEMO_SEQUENCE.sequence.slice(0, 200),
  length: 200,
};

const DEMO_DATA = {
  sequenceData: [DEMO_SEQUENCE],
};

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'fasta-exploration',
    name: 'FASTA Exploration',
    description: 'Load a FASTA file, find open reading frames, and analyze GC content.',
    icon: 'Dna',
    nodes: [
      { id: '1', type: 'fasta-input', position: { x: 300, y: 50 }, data: DEMO_DATA },
      { id: '2', type: 'orf-finder', position: { x: 300, y: 220 } },
      { id: '3', type: 'gc-content', position: { x: 300, y: 390 } },
      { id: '4', type: 'sequence-viewer', position: { x: 300, y: 560 } },
    ],
    edges: [
      { source: '1', target: '2' },
      { source: '1', target: '3' },
      { source: '2', target: '4' },
      { source: '3', target: '4' },
    ],
  },
  {
    id: 'protein-translation',
    name: 'Protein Translation',
    description: 'Translate a DNA sequence to protein and generate a report.',
    icon: 'ArrowRightToLine',
    nodes: [
      { id: '1', type: 'fasta-input', position: { x: 300, y: 50 }, data: DEMO_DATA },
      { id: '2', type: 'translation', position: { x: 300, y: 220 } },
      { id: '3', type: 'report', position: { x: 300, y: 390 } },
    ],
    edges: [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
    ],
  },
  {
    id: 'genome-overview',
    name: 'Genome Overview',
    description: 'Complete genome analysis pipeline: ORFs, translation, and GC content.',
    icon: 'ScanSearch',
    nodes: [
      { id: '1', type: 'fasta-input', position: { x: 300, y: 50 }, data: DEMO_DATA },
      { id: '2', type: 'orf-finder', position: { x: 50, y: 220 } },
      { id: '3', type: 'translation', position: { x: 550, y: 220 } },
      { id: '4', type: 'gc-content', position: { x: 300, y: 390 } },
      { id: '5', type: 'report', position: { x: 300, y: 560 } },
    ],
    edges: [
      { source: '1', target: '2' },
      { source: '1', target: '3' },
      { source: '1', target: '4' },
      { source: '2', target: '5' },
      { source: '3', target: '5' },
      { source: '4', target: '5' },
    ],
  },
  {
    id: 'primer-design',
    name: 'Primer Design',
    description: 'Design PCR primers from a DNA sequence.',
    icon: 'Dna',
    nodes: [
      { id: '1', type: 'fasta-input', position: { x: 300, y: 50 }, data: DEMO_DATA },
      { id: '2', type: 'primer-design', position: { x: 300, y: 220 } },
      { id: '3', type: 'report', position: { x: 300, y: 390 } },
    ],
    edges: [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
    ],
  },
  {
    id: 'restriction-analysis',
    name: 'Restriction Analysis',
    description: 'Analyze restriction enzyme cut sites in a DNA sequence.',
    icon: 'Scissors',
    nodes: [
      { id: '1', type: 'fasta-input', position: { x: 300, y: 50 }, data: DEMO_DATA },
      { id: '2', type: 'restriction-enzyme', position: { x: 300, y: 220 } },
      { id: '3', type: 'sequence-viewer', position: { x: 300, y: 390 } },
    ],
    edges: [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
    ],
  },
  {
    id: 'motif-discovery',
    name: 'Motif Discovery',
    description: 'Search for sequence motifs and patterns.',
    icon: 'Search',
    nodes: [
      { id: '1', type: 'fasta-input', position: { x: 300, y: 50 }, data: DEMO_DATA },
      { id: '2', type: 'motif-search', position: { x: 300, y: 220 } },
      { id: '3', type: 'report', position: { x: 300, y: 390 } },
    ],
    edges: [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
    ],
  },
  {
    id: 'protein-analysis',
    name: 'Protein Analysis',
    description: 'Analyze protein properties from a translated sequence.',
    icon: 'FlaskConical',
    nodes: [
      { id: '1', type: 'fasta-input', position: { x: 300, y: 50 }, data: DEMO_DATA },
      { id: '2', type: 'translation', position: { x: 300, y: 220 } },
      { id: '3', type: 'protein-properties', position: { x: 300, y: 390 } },
      { id: '4', type: 'report', position: { x: 300, y: 560 } },
    ],
    edges: [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
      { source: '3', target: '4' },
    ],
  },
  {
    id: 'codon-optimization',
    name: 'Codon Usage Analysis',
    description: 'Analyze codon usage bias and RSCU values.',
    icon: 'Table',
    nodes: [
      { id: '1', type: 'fasta-input', position: { x: 300, y: 50 }, data: DEMO_DATA },
      { id: '2', type: 'codon-usage', position: { x: 300, y: 220 } },
      { id: '3', type: 'report', position: { x: 300, y: 390 } },
    ],
    edges: [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
    ],
  },
  {
    id: 'fastq-quality',
    name: 'FASTQ Quality Analysis',
    description: 'Load FASTQ reads and generate a quality report.',
    icon: 'FileInput',
    nodes: [
      { id: '1', type: 'fastq-input', position: { x: 300, y: 50 } },
      { id: '2', type: 'report', position: { x: 300, y: 220 } },
    ],
    edges: [
      { source: '1', target: '2' },
    ],
  },
  {
    id: 'genbank-features',
    name: 'GenBank Feature Viewer',
    description: 'Load a GenBank file and analyze annotated features.',
    icon: 'FileInput',
    nodes: [
      { id: '1', type: 'genbank-input', position: { x: 300, y: 50 } },
      { id: '2', type: 'gc-content', position: { x: 100, y: 220 } },
      { id: '3', type: 'orf-finder', position: { x: 500, y: 220 } },
      { id: '4', type: 'report', position: { x: 300, y: 390 } },
    ],
    edges: [
      { source: '1', target: '2' },
      { source: '1', target: '3' },
      { source: '2', target: '4' },
      { source: '3', target: '4' },
    ],
  },
  {
    id: 'reverse-complement',
    name: 'Reverse Complement',
    description: 'Generate the reverse complement of a DNA sequence.',
    icon: 'ArrowLeftRight',
    nodes: [
      { id: '1', type: 'fasta-input', position: { x: 300, y: 50 }, data: DEMO_DATA },
      { id: '2', type: 'reverse-complement', position: { x: 300, y: 220 } },
      { id: '3', type: 'sequence-viewer', position: { x: 300, y: 390 } },
    ],
    edges: [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
    ],
  },
  {
    id: 'sequence-alignment',
    name: 'Pairwise Alignment',
    description: 'Align two sequences using the Needleman-Wunsch algorithm.',
    icon: 'AlignStartVertical',
    nodes: [
      { id: '1', type: 'fasta-input', position: { x: 150, y: 50 }, data: { sequenceData: [DEMO_SEQUENCE] } },
      { id: '2', type: 'fasta-input', position: { x: 450, y: 50 }, data: { sequenceData: [SECOND_SEQUENCE] } },
      { id: '3', type: 'alignment', position: { x: 300, y: 220 } },
      { id: '4', type: 'report', position: { x: 300, y: 390 } },
    ],
    edges: [
      { source: '1', target: '3' },
      { source: '2', target: '3' },
      { source: '3', target: '4' },
    ],
  },
  {
    id: 'comprehensive-pipeline',
    name: 'Comprehensive Analysis',
    description: 'Full pipeline: translation, protein properties, codon usage, motifs, and CSV export.',
    icon: 'ScanSearch',
    nodes: [
      { id: '1', type: 'fasta-input', position: { x: 300, y: 50 }, data: DEMO_DATA },
      { id: '2', type: 'translation', position: { x: 300, y: 220 } },
      { id: '3', type: 'protein-properties', position: { x: 50, y: 390 } },
      { id: '4', type: 'codon-usage', position: { x: 300, y: 390 } },
      { id: '5', type: 'motif-search', position: { x: 550, y: 390 } },
      { id: '6', type: 'csv-export', position: { x: 300, y: 560 } },
    ],
    edges: [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
      { source: '2', target: '4' },
      { source: '2', target: '5' },
      { source: '3', target: '6' },
      { source: '4', target: '6' },
      { source: '5', target: '6' },
    ],
  },
  {
    id: 'cloning-prep',
    name: 'Cloning Preparation',
    description: 'Analyze restriction sites and design primers for cloning.',
    icon: 'Scissors',
    nodes: [
      { id: '1', type: 'fasta-input', position: { x: 300, y: 50 }, data: DEMO_DATA },
      { id: '2', type: 'restriction-enzyme', position: { x: 100, y: 220 } },
      { id: '3', type: 'primer-design', position: { x: 500, y: 220 } },
      { id: '4', type: 'csv-export', position: { x: 300, y: 390 } },
    ],
    edges: [
      { source: '1', target: '2' },
      { source: '1', target: '3' },
      { source: '2', target: '4' },
      { source: '3', target: '4' },
    ],
  },
  {
    id: 'verify-all-nodes',
    name: 'Verify All Nodes',
    description: 'Every single node type on canvas with demo data. Run all to verify the full pipeline works end-to-end.',
    icon: 'ScanSearch',
    nodes: [
      { id: '1', type: 'fasta-input', position: { x: 300, y: 30 }, data: DEMO_DATA },
      { id: '2', type: 'fastq-input', position: { x: 1100, y: 30 } },
      { id: '3', type: 'genbank-input', position: { x: 300, y: 800 } },
      { id: '4', type: 'orf-finder', position: { x: 50, y: 200 } },
      { id: '5', type: 'gc-content', position: { x: 220, y: 200 } },
      { id: '6', type: 'translation', position: { x: 390, y: 200 } },
      { id: '7', type: 'reverse-complement', position: { x: 560, y: 200 } },
      { id: '8', type: 'motif-search', position: { x: 730, y: 200 } },
      { id: '9', type: 'restriction-enzyme', position: { x: 50, y: 380 } },
      { id: '10', type: 'alignment', position: { x: 220, y: 380 }, data: { sequence2: SECOND_SEQUENCE.sequence } },
      { id: '11', type: 'codon-usage', position: { x: 390, y: 380 } },
      { id: '12', type: 'primer-design', position: { x: 560, y: 380 } },
      { id: '13', type: 'protein-properties', position: { x: 730, y: 380 } },
      { id: '14', type: 'sequence-viewer', position: { x: 50, y: 560 } },
      { id: '15', type: 'report', position: { x: 390, y: 580 } },
      { id: '16', type: 'csv-export', position: { x: 730, y: 580 } },
    ],
    edges: [
      { source: '1', target: '4' },
      { source: '1', target: '5' },
      { source: '1', target: '6' },
      { source: '1', target: '7' },
      { source: '1', target: '8' },
      { source: '1', target: '9' },
      { source: '1', target: '10' },
      { source: '1', target: '11' },
      { source: '1', target: '12' },
      { source: '1', target: '14' },
      { source: '6', target: '13' },
      { source: '4', target: '15' },
      { source: '5', target: '15' },
      { source: '6', target: '15' },
      { source: '7', target: '15' },
      { source: '8', target: '15' },
      { source: '9', target: '15' },
      { source: '10', target: '15' },
      { source: '11', target: '15' },
      { source: '12', target: '15' },
      { source: '13', target: '15' },
      { source: '2', target: '15' },
      { source: '3', target: '15' },
      { source: '4', target: '16' },
      { source: '5', target: '16' },
      { source: '6', target: '16' },
      { source: '7', target: '16' },
      { source: '8', target: '16' },
      { source: '9', target: '16' },
      { source: '10', target: '16' },
      { source: '11', target: '16' },
      { source: '12', target: '16' },
      { source: '13', target: '16' },
    ],
  },
];
