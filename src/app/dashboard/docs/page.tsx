import { BookOpen, Dna, Search, ArrowRightToLine, Scissors, FlaskConical, AlignStartVertical, Table, FileText, ArrowLeftRight, Percent } from 'lucide-react';

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
      storing genomes, genes, or protein sequences. BioFlow's FASTA Input node
      supports single and multi-record files with automatic detection.
    `,
  },
  {
    id: 'orf',
    icon: Search,
    title: 'ORF Finder',
    color: 'text-accent',
    content: `
      An Open Reading Frame (ORF) is a continuous stretch of codons
      that begins with a start codon (ATG) and ends with a stop codon
      (TAA, TAG, or TGA). ORFs are potential protein-coding regions.

      BioFlow scans all six reading frames (3 forward, 3 reverse)
      and reports each ORF with its start/end coordinates, length in bp and aa,
      and the translated protein sequence.

      The minimum ORF length threshold is configurable (default 30 bp / 10 aa).
      ORFs without a stop codon are considered partial and not reported.
    `,
  },
  {
    id: 'gc',
    icon: Percent,
    title: 'GC Content',
    color: 'text-secondary',
    content: `
      GC content is the percentage of guanine (G) and cytosine (C) bases
      in a DNA or RNA sequence.

      GC% = (G + C) / (A + T + G + C) x 100%

      GC-rich sequences are more stable (3 hydrogen bonds vs 2 for AT).
      GC content varies between organisms — humans ~41%, E. coli ~50%,
      S. cerevisiae ~38%, P. furiosus (thermophile) ~51%.

      BioFlow computes overall GC%, AT%, and a sliding window distribution
      to visualize GC variation across the sequence.
    `,
  },
  {
    id: 'translation',
    icon: ArrowRightToLine,
    title: 'Translation',
    color: 'text-warning',
    content: `
      Translation converts a DNA sequence into a protein (amino acid)
      sequence. The genetic code maps each 3-nucleotide codon to one
      of 20 amino acids.

      BioFlow translates in all three forward reading frames simultaneously.
      Start codons (ATG) produce Methionine (M), and stop codons
      (TAA, TAG, TGA) are marked with asterisks (*).

      Each frame shifts the reading window by one base, producing
      completely different translations.
    `,
  },
  {
    id: 'revcomp',
    icon: ArrowLeftRight,
    title: 'Reverse Complement',
    color: 'text-info',
    content: `
      The reverse complement of a DNA sequence is formed by reversing
      the order of bases and replacing each with its complement:
      A ↔ T, G ↔ C.

      This is essential for analyzing the opposite strand of a DNA
      double helix. Primers, restriction sites, and ORFs on the
      reverse strand all require reverse complement conversion.

      BioFlow generates the reverse complement instantly with
      color-coded nucleotide output.
    `,
  },
  {
    id: 'alignment',
    icon: AlignStartVertical,
    title: 'Alignment (Needleman-Wunsch)',
    color: 'text-success',
    content: `
      Sequence alignment arranges two sequences to identify regions
      of similarity. BioFlow implements the Needleman-Wunsch algorithm
      for global pairwise alignment.

      Parameters are configurable: match score (default +2), mismatch
      penalty (default -1), and gap penalty (default -2).

      Results show aligned sequences with match/mismatch/gap counts,
      percent identity, and coverage. The alignment is visualized
      base-by-base for inspection.
    `,
  },
  {
    id: 'motif',
    icon: Search,
    title: 'Motif Search',
    color: 'text-danger',
    content: `
      A sequence motif is a short, recurring pattern in DNA or protein
      sequences with biological significance. Examples include:
      - GAATTC (EcoRI restriction site)
      - TATAAT (Pribnow box promoter)
      - ATG (start codon)

      BioFlow searches for exact matches of a user-specified motif
      and reports the position, sequence, and strand of each match.
      Case-insensitive search is supported.
    `,
  },
  {
    id: 'restriction',
    icon: Scissors,
    title: 'Restriction Enzymes',
    color: 'text-danger',
    content: `
      Restriction enzymes (restriction endonucleases) cut DNA at
      specific recognition sequences. They are fundamental tools in
      molecular cloning and genetic engineering.

      BioFlow includes a built-in library of 200+ common restriction
      enzymes with their recognition sequences and cut positions.

      Results list every cut site with its position, the enzyme name,
      and the resulting DNA fragments. Useful for planning cloning
      strategies and verifying constructs.
    `,
  },
  {
    id: 'primer',
    icon: FlaskConical,
    title: 'Primer Design',
    color: 'text-accent',
    content: `
      PCR primers are short DNA oligonucleotides that flank a target
      region for amplification. Good primer design is critical for
      successful PCR.

      BioFlow designs primer pairs by scanning the 5' and 3' regions
      of the template. Each candidate is scored on:
      - Melting temperature (Tm): target ~55-60°C
      - GC content: 40-60% ideal
      - Hairpin and self-dimer formation penalties

      The best pairs are ranked by Tm difference (minimal ΔTm preferred).
      Product size, coordinates, and primer sequences are reported.
    `,
  },
  {
    id: 'codon-usage',
    icon: Table,
    title: 'Codon Usage Analysis',
    color: 'text-warning',
    content: `
      Codon usage analysis examines how frequently each of the 64
      possible codons appears in a coding sequence. The Relative
      Synonymous Codon Usage (RSCU) value measures bias: >1 means
      the codon is used more than expected.

      Differences in codon usage between organisms affect
      heterologous protein expression. Codons used rarely in the
      host organism can reduce yield.

      BioFlow reports each codon with its count, amino acid, and
      RSCU value, highlighting preferred and rare codons.
    `,
  },
  {
    id: 'protein',
    icon: FlaskConical,
    title: 'Protein Properties',
    color: 'text-info',
    content: `
      Protein properties are physicochemical characteristics computed
      from the amino acid sequence:

      - Molecular Weight (MW): sum of residue masses + water
      - Isoelectric Point (pI): pH where net charge is zero
      - Extinction Coefficient: light absorbance at 280 nm
      - Instability Index: predicts in vitro stability (>40 = unstable)
      - Net Charge at pH 7.0

      These properties are essential for characterizing expressed
      proteins and designing purification protocols.
    `,
  },
  {
    id: 'genbank',
    icon: FileText,
    title: 'GenBank Format',
    color: 'text-success',
    content: `
      GenBank is the NIH genetic sequence database with annotated
      features including genes, coding regions, regulatory elements,
      and variations.

      BioFlow's GenBank Input node parses the flat-file format and
      extracts the accession, length, features (CDS, gene, rRNA, etc.),
      and the full sequence.

      Features are visualized in the Genome Map with their locations,
      strands, and product annotations.
    `,
  },
];

export default function DocsPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin p-6">
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-foreground">Documentation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Reference guide for all BioFlow node types and bioinformatics concepts
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => (
          <div
            key={section.id}
            className="rounded-xl border border-border bg-surface p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background">
                <section.icon size={18} className={section.color} />
              </div>
              <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
              {section.content}
            </div>
          </div>
        ))}

        <div className="lg:col-span-2 xl:col-span-3 rounded-xl border border-border bg-gradient-to-br from-surface to-background p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
              <BookOpen size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">How to Build a Workflow</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Three steps to go from sequence to analysis
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-background p-3">
              <div className="text-xs font-semibold text-foreground mb-1">1. Load Sequence</div>
              <p className="text-[11px] text-muted-foreground">
                Add a FASTA Input, FASTQ Input, or GenBank Input node. Paste or upload
                your sequence data to start.
              </p>
            </div>
            <div className="rounded-lg bg-background p-3">
              <div className="text-xs font-semibold text-foreground mb-1">2. Connect & Configure</div>
              <p className="text-[11px] text-muted-foreground">
                Drag handles to connect nodes. Select a node to configure parameters
                in the right panel. Press Space to add more nodes.
              </p>
            </div>
            <div className="rounded-lg bg-background p-3">
              <div className="text-xs font-semibold text-foreground mb-1">3. Run & Explore</div>
              <p className="text-[11px] text-muted-foreground">
                Click Run to execute the pipeline. Results appear in each node and the
                right panel. Click individual results for detailed provenance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
