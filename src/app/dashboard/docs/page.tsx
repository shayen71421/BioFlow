import { BookOpen, Dna, Search, BarChart3, ArrowRightToLine } from 'lucide-react';

const sections = [
  {
    id: 'fasta',
    icon: Dna,
    title: 'What is FASTA?',
    color: 'text-success',
    content: `
      FASTA is a text-based format for representing nucleotide or peptide sequences.
      Each record begins with a ">" header line followed by the sequence data.
      
      Example:
      >Escherichia coli K12, lac operon
      ATGCGTATCGATCGATCGATCGATCGATCGA...
      
      FASTA files can contain one or more sequences, making them ideal for
      storing genomes, genes, or protein sequences.
    `,
  },
  {
    id: 'orf',
    icon: Search,
    title: 'What is an ORF?',
    color: 'text-accent',
    content: `
      An Open Reading Frame (ORF) is a continuous stretch of codons
      that begins with a start codon (ATG) and ends with a stop codon
      (TAA, TAG, or TGA).
      
      ORFs are potential protein-coding regions. Finding ORFs is often
      the first step in gene prediction and genome annotation.
      
      BioFlow scans all six reading frames (3 forward, 3 reverse)
      and highlights ORFs above a minimum length threshold.
    `,
  },
  {
    id: 'gc',
    icon: BarChart3,
    title: 'What is GC Content?',
    color: 'text-secondary',
    content: `
      GC content is the percentage of guanine (G) and cytosine (C) bases
      in a DNA or RNA sequence.
      
      GC content = (G + C) / (A + T + G + C) × 100%
      
      GC content varies between organisms and genomic regions. It affects
      DNA stability (GC bonds have 3 hydrogen bonds vs 2 for AT).
      
      BioFlow computes overall GC%, sliding window analysis, and
      visual distribution across the sequence.
    `,
  },
  {
    id: 'translation',
    icon: ArrowRightToLine,
    title: 'What is Translation?',
    color: 'text-warning',
    content: `
      Translation is the process of converting a DNA sequence into an
      amino acid sequence (protein). The genetic code maps each
      3-nucleotide codon to one of 20 amino acids.
      
      BioFlow translates DNA in all three forward reading frames,
      showing both the nucleotide sequence and the resulting protein.
      
      The standard start codon ATG codes for Methionine (M), and
      stop codons (TAA, TAG, TGA) are marked with asterisks (*).
    `,
  },
];

export default function DocsPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin p-6">
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-foreground">Documentation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Learn about bioinformatics concepts used in BioFlow
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {sections.map((section) => (
          <div
            key={section.id}
            className="rounded-xl border border-border bg-surface p-5 transition-all duration-300 hover:border-primary/30"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                <section.icon size={20} className={section.color} />
              </div>
              <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
              {section.content}
            </div>
          </div>
        ))}

        <div className="lg:col-span-2 rounded-xl border border-border bg-gradient-to-br from-surface to-background p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
              <BookOpen size={20} className="text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">How to Build Workflows</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-background p-3">
              <div className="text-xs font-semibold text-foreground mb-1">1. Add Nodes</div>
              <p className="text-[11px] text-muted-foreground">
                Press Space or click Add Node to open the command palette. Search and add analysis nodes.
              </p>
            </div>
            <div className="rounded-lg bg-background p-3">
              <div className="text-xs font-semibold text-foreground mb-1">2. Connect</div>
              <p className="text-[11px] text-muted-foreground">
                Drag from the right handle of one node to the left handle of another. Valid connections light up.
              </p>
            </div>
            <div className="rounded-lg bg-background p-3">
              <div className="text-xs font-semibold text-foreground mb-1">3. Execute</div>
              <p className="text-[11px] text-muted-foreground">
                Click Run to execute the pipeline. Results flow through the graph in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
