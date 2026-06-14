export interface BenchmarkCase {
  id: string;
  category: string;
  name: string;
  description: string;
  input: Record<string, string>;
  expected: Record<string, unknown>;
}

const BENCHMARK_SEQUENCES: BenchmarkCase[] = [
  // ── GC Content (5 tests) ──
  {
    id: 'gc-pure-at',
    category: 'GC Content',
    name: 'Pure AT — 0% GC',
    description: 'Sequence of only A and T should yield 0% GC',
    input: { sequence: 'ATATATATATATATATATAT' },
    expected: { overall: 0, gcCount: 0, total: 20 },
  },
  {
    id: 'gc-pure-gc',
    category: 'GC Content',
    name: 'Pure GC — 100% GC',
    description: 'Sequence of only G and C should yield 100% GC',
    input: { sequence: 'GCGCGCGCGC' },
    expected: { overall: 100, gcCount: 10, total: 10 },
  },
  {
    id: 'gc-equal-mix',
    category: 'GC Content',
    name: 'Equal mix — 50% GC',
    description: 'Even ATCG pattern yields 50% GC',
    input: { sequence: 'ATCGATCGATCGATCGATCG' },
    expected: { overall: 50, gcCount: 10, total: 20 },
  },
  {
    id: 'gc-gc-rich',
    category: 'GC Content',
    name: 'GC-rich human promoter — ~67% GC',
    description: 'Promoter sequence with high GC content',
    input: { sequence: 'GGGGCGGGGCGGGGCGGGG' },
    expected: { overall: 100, gcCount: 19, total: 19 },
  },
  {
    id: 'gc-empty',
    category: 'GC Content',
    name: 'Empty sequence — 0% GC',
    description: 'Empty string should return 0 for all statistics',
    input: { sequence: '' },
    expected: { overall: 0, total: 0 },
  },

  // ── Translation (5 tests) ──
  {
    id: 'trans-start-codon',
    category: 'Translation',
    name: 'Start codon ATG → M',
    description: 'ATG codes for Methionine (M)',
    input: { sequence: 'ATG', frames: '0,1,2' },
    expected: { frame0: 'M' },
  },
  {
    id: 'trans-stop-codon',
    category: 'Translation',
    name: 'Stop codon TAA → *',
    description: 'TAA is a stop codon, translates to *',
    input: { sequence: 'TAA', frames: '0,1,2' },
    expected: { frame0: '*' },
  },
  {
    id: 'trans-short-protein',
    category: 'Translation',
    name: 'ATG GCC → M A',
    description: 'Two codons translate to MA',
    input: { sequence: 'ATGGCC', frames: '0,1,2' },
    expected: { frame0: 'MA' },
  },
  {
    id: 'trans-all-stop-codons',
    category: 'Translation',
    name: 'TAA TAG TGA → * * *',
    description: 'All three stop codons should produce *',
    input: { sequence: 'TAATAGTGA', frames: '0,1,2' },
    expected: { frame0: '***' },
  },
  {
    id: 'trans-ambiguous-base',
    category: 'Translation',
    name: 'ATN → MX',
    description: 'N in a codon produces X (unknown)',
    input: { sequence: 'ATN', frames: '0,1,2' },
    expected: { frame0: 'X' },
  },

  // ── ORF Finder (5 tests) ──
  {
    id: 'orf-simple',
    category: 'ORF Finder',
    name: 'Simple single ORF',
    description: 'ATG start with TAA stop in frame 0',
    input: { sequence: 'ATGGCCAAATAA', minLength: '1' },
    expected: { orfCount: 1, firstStart: 0, firstEnd: 12, firstFrame: 0 },
  },
  {
    id: 'orf-no-start',
    category: 'ORF Finder',
    name: 'No start codon — zero ORFs',
    description: 'Sequence with no ATG should find no ORFs',
    input: { sequence: 'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', minLength: '1' },
    expected: { orfCount: 0 },
  },
  {
    id: 'orf-no-stop',
    category: 'ORF Finder',
    name: 'Start codon but no stop — treat as partial (0 ORFs by design)',
    description: 'ATG without in-frame stop does not form an ORF',
    input: { sequence: 'ATGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', minLength: '1' },
    expected: { orfCount: 0 },
  },
  {
    id: 'orf-minlength-filter',
    category: 'ORF Finder',
    name: 'Min length filter — short ORF excluded',
    description: 'An ORF shorter than minLength should be excluded',
    input: { sequence: 'ATGTAATTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', minLength: '30' },
    expected: { orfCount: 0 },
  },
  {
    id: 'orf-six-frames',
    category: 'ORF Finder',
    name: 'ORF on reverse strand',
    description: 'ATG on reverse complement (CAT on forward) should find ORFs in 6-frame mode',
    input: { sequence: 'TTATTTGGCCAT', minLength: '1' },
    expected: { sixFrameOrfCount: 1 },
  },

  // ── Motif Search (4 tests) ──
  {
    id: 'motif-simple',
    category: 'Motif Search',
    name: 'Simple exact motif match',
    description: 'GAATTC (EcoRI) found in sequence containing it',
    input: { sequence: 'AAAGaattcTTTT', motif: 'GAATTC' },
    expected: { totalMatches: 1, matchSequence: 'GAATTC' },
  },
  {
    id: 'motif-no-match',
    category: 'Motif Search',
    name: 'Motif not present',
    description: 'GAATTC not found in AT-only sequence',
    input: { sequence: 'AAAAAAAAAAAAAAAAAAAA', motif: 'GAATTC' },
    expected: { totalMatches: 0 },
  },
  {
    id: 'motif-multiple',
    category: 'Motif Search',
    name: 'Multiple motif occurrences',
    description: 'GCAT found twice in repeating pattern',
    input: { sequence: 'GCATGCATGCAT', motif: 'GCAT' },
    expected: { totalMatches: 3 },
  },
  {
    id: 'motif-case-insensitive',
    category: 'Motif Search',
    name: 'Case-insensitive matching',
    description: 'Motif search should be case-insensitive',
    input: { sequence: 'gaattcGAATTC', motif: 'GAATTC' },
    expected: { totalMatches: 2 },
  },

  // ── Restriction Enzymes (4 tests) ──
  {
    id: 'enzyme-ecori-single',
    category: 'Restriction Enzymes',
    name: 'EcoRI single cut (1-based: position 1)',
    description: 'GAATTC has EcoRI cut at position 1 (0-indexed)',
    input: { sequence: 'GAATTC', enzymes: 'EcoRI' },
    expected: { totalCuts: 1, firstCutPosition: 1, firstEnzyme: 'EcoRI' },
  },
  {
    id: 'enzyme-bamhi-single',
    category: 'Restriction Enzymes',
    name: 'BamHI single cut',
    description: 'GGATCC has BamHI cut at position 1',
    input: { sequence: 'GGATCC', enzymes: 'BamHI' },
    expected: { totalCuts: 1, firstCutPosition: 1 },
  },
  {
    id: 'enzyme-two-sites',
    category: 'Restriction Enzymes',
    name: 'Two EcoRI sites',
    description: 'Sequence with two GAATTC sites should produce 2 cuts',
    input: { sequence: 'GAATTCGAATTC', enzymes: 'EcoRI' },
    expected: { totalCuts: 2, fragments: [1, 6, 5] },
  },
  {
    id: 'enzyme-no-cuts',
    category: 'Restriction Enzymes',
    name: 'No restriction sites',
    description: 'Pure AT sequence has no restriction sites',
    input: { sequence: 'AAAAAAAAAAAAAAAAAAAA', enzymes: '' },
    expected: { totalCuts: 0 },
  },

  // ── Reverse Complement (3 tests) ──
  {
    id: 'revcomp-simple',
    category: 'Reverse Complement',
    name: 'Simple reverse complement',
    description: 'ATCG reversed + complemented = CGAT',
    input: { sequence: 'ATCG' },
    expected: { reverseComplement: 'CGAT' },
  },
  {
    id: 'revcomp-palindrome',
    category: 'Reverse Complement',
    name: 'Palindrome — reverse complement equals itself',
    description: 'GATC (MboI site) is self-complementary',
    input: { sequence: 'GATC' },
    expected: { reverseComplement: 'GATC' },
  },
  {
    id: 'revcomp-n-handling',
    category: 'Reverse Complement',
    name: 'N base handling',
    description: 'N maps to N in complement',
    input: { sequence: 'N' },
    expected: { reverseComplement: 'N' },
  },

  // ── Alignment (3 tests) ──
  {
    id: 'align-identical',
    category: 'Alignment',
    name: 'Identical sequences — 100% identity',
    description: 'Two identical sequences should have 100% identity, no gaps',
    input: { seq1: 'ATCGATCG', seq2: 'ATCGATCG' },
    expected: { identity: 8, identityPercent: 100, mismatches: 0, gaps: 0 },
  },
  {
    id: 'align-single-mismatch',
    category: 'Alignment',
    name: 'Single nucleotide mismatch',
    description: 'ATC vs ATG — one mismatch, identity = 2/3 = 66.7%',
    input: { seq1: 'ATC', seq2: 'ATG' },
    expected: { matches: 2, mismatches: 1, gaps: 0 },
  },
  {
    id: 'align-different-lengths',
    category: 'Alignment',
    name: 'Different length sequences',
    description: 'Longer vs shorter sequence should introduce gaps',
    input: { seq1: 'ATCGATCG', seq2: 'ATCG' },
    expected: { gaps: 4, matches: 4, mismatches: 0 },
  },

  // ── FASTA Parser (2 tests) ──
  {
    id: 'fasta-single',
    category: 'FASTA Parser',
    name: 'Single FASTA entry',
    description: 'One FASTA record with header and sequence',
    input: { fasta: '>test\nATCGATCG\n' },
    expected: { count: 1, firstHeader: 'test', firstSeq: 'ATCGATCG' },
  },
  {
    id: 'fasta-multi-line',
    category: 'FASTA Parser',
    name: 'Multi-line sequence',
    description: 'FASTA with sequence split across lines',
    input: { fasta: '>test\nATCG\nATCG\n' },
    expected: { count: 1, firstSeq: 'ATCGATCG' },
  },

  // ── Primer Design (1 test) ──
  {
    id: 'primer-short-seq',
    category: 'Primer Design',
    name: 'Tm calculation for short primer',
    description: 'Short primer (<14bp) uses 2*(A+T) + 4*(G+C) formula',
    input: { sequence: 'ATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGC', primer: 'ATGCATGCATGC' },
    expected: { primerTm: 2 * 6 + 4 * 6 },
  },

  // ── Protein Properties (1 test) ──
  {
    id: 'protein-met-enkephalin',
    category: 'Protein Properties',
    name: 'Met-enkephalin — known MW 573.7 Da',
    description: 'YGGFM (Tyr-Gly-Gly-Phe-Met) has MW ≈ 573.7 Da',
    input: { sequence: 'YGGFM' },
    expected: { minMW: 567, maxMW: 580 },
  },

  // ── Real Reference Sequences ──
  {
    id: 'ref-gfp-mscarlet-revcomp',
    category: 'Reverse Complement',
    name: 'GFP-like mScarlet start (ATGGC) revcomp',
    description: 'First 30bp of mScarlet fluorescent protein -> verify reverse complement manually',
    input: { sequence: 'ATGGTGAGCAAGGGCGAGGCCGTGATC' },
    expected: { reverseComplement: 'GATCACGGCCTCGCCCTTGCTCACCAT' },
  },
  {
    id: 'ref-gfp-length',
    category: 'GC Content',
    name: 'GFP (first 96bp) from A. victoria — ~65% GC',
    description: 'Known GFP fragment, GC content ≈ 65%',
    input: { sequence: 'ATGGTGAGCAAGGGCGAGGAGCTGTTCACCGGGGTGGTGCCCATCCTGGTCGAGCTGGACGGCGACGTAAACGGCCACAAGTTCAGCGTGTCCGGC' },
    expected: { gcCount: 62, total: 96 },
  },
  {
    id: 'ref-ecori-plasmid',
    category: 'Restriction Enzymes',
    name: 'EcoRI in pUC19 MCS — one site',
    description: 'pUC19 multiple cloning site contains a single EcoRI site (GAATTC)',
    input: { sequence: 'GAATTCGAGCTCGGTACCCGGGGATCCTCTAGAGTCGACCTGCAGGCATGCAAGCTT', enzymes: 'EcoRI' },
    expected: { totalCuts: 1, firstCutPosition: 1, firstEnzyme: 'EcoRI' },
  },
  {
    id: 'ref-bamhi-ecori-plasmid',
    category: 'Restriction Enzymes',
    name: 'BamHI + EcoRI in pUC19 MCS — two sites',
    description: 'pUC19 MCS has both BamHI (GGATCC) and EcoRI (GAATTC) sites',
    input: { sequence: 'GAATTCGAGCTCGGTACCCGGGGATCCTCTAGAGTCGACCTGCAGGCATGCAAGCTT', enzymes: 'EcoRI,BamHI' },
    expected: { totalCuts: 2 },
  },
  {
    id: 'ref-brca1-gc',
    category: 'GC Content',
    name: 'BRCA1 exon 11 fragment — ~29% GC',
    description: 'Known BRCA1 exon 11 sequence (NCBI reference), GC ≈ 29%',
    input: { sequence: 'AATCTTGAATCTGCATCCAGACACTGAATACCATTTTCTCAGCATCTGTACTACTGTTTCTCATTTGCAACAGAAAATAAAAGTTCCAATTATGTACTGTTTTCAAATTATGCTCTAAATAAAACACTAATGTTAATAAT' },
    expected: { gcCount: 41, total: 140 },
  },
  {
    id: 'ref-sars-cov2-spike-start',
    category: 'Translation',
    name: 'SARS-CoV-2 Spike N-terminus (42bp) → 14 aa',
    description: 'First 42bp of SARS-CoV-2 Spike gene starts ATG, gives 14 amino acids',
    input: { sequence: 'ATGTTTGTTTTTCTTGTTTTATTGCCACTAGTCTCTAGTCAG', frames: '0,1,2' },
    expected: { frame0: 'MFVFLVLLPLVSSQ' },
  },
  {
    id: 'ref-sars-cov2-spike-gc',
    category: 'GC Content',
    name: 'SARS-CoV-2 Spike (first 200bp) — ~35% GC',
    description: 'First 42bp of SARS-CoV-2 Spike CDS (AT-rich coronavirus), ~35% GC',
    input: { sequence: 'TTTGTTTTTCTTGTTTTATTGCCACTAGTCTCTAGTCAGTGTGTTAATCTTACAACCAGAACTCAATTACCCCCTGCATACACTAATTCTTTCACACGTGGTGTTTATTACCCTGACAAAGTTTTCAGATCCTCAGTTTTACATTCAACTCAGGACTTGTTCTTACCTTTCTTTTCCAATGTTACTTGGTTC' },
    expected: { gcCount: 70, total: 192 },
  },
  {
    id: 'ref-gfp-orf',
    category: 'ORF Finder',
    name: 'GFP full-length ORF (720bp)',
    description: 'Full-length GFP coding sequence (720bp) from Aequorea victoria should have one large ORF',
    input: { sequence: 'ATGGTGAGCAAGGGCGAGGAGCTGTTCACCGGGGTGGTGCCCATCCTGGTCGAGCTGGACGGCGACGTAAACGGCCACAAGTTCAGCGTGTCCGGCGAGGGCGAGGGCGATGCCACCTACGGCAAGCTGACCCTGAAGTTCATCTGCACCACCGGCAAGCTGCCCGTGCCCTGGCCCACCCTCGTGACCACCCTGACCTACGGCGTGCAGTGCTTCAGCCGCTACCCCGACCACATGAAGCAGCACGACTTCTTCAAGTCCGCCATGCCCGAAGGCTACGTCCAGGAGCGCACCATCTTCTTCAAGGACGACGGCAACTACAAGACCCGCGCCGAGGTGAAGTTCGAGGGCGACACCCTGGTGAACCGCATCGAGCTGAAGGGCATCGACTTCAAGGAGGACGGCAACATCCTGGGGCACAAGCTGGAGTACAACTACAACAGCCACAACGTCTATATCATGGCCGACAAGCAGAAGAACGGCATCAAGGTGAACTTCAAGATCCGCCACAACATCGAGGACGGCAGCGTGCAGCTCGCCGACCACTACCAGCAGAACACCCCCATCGGCGACGGCCCCGTGCTGCTGCCCGACAACCACTACCTGAGCACCCAGTCCGCCCTGAGCAAAGACCCCAACGAGAAGCGCGATCACATGGTCCTGCTGGAGTTCGTGACCGCCGCCGGGATCACTCTCGGCATGGACGAGCTGTACAAGTAA', minLength: '100' },
    expected: { orfCount: 1 },
  },
  {
    id: 'ref-gfp-mscarlet-motif',
    category: 'Motif Search',
    name: 'GFP mScarlet GAGGCC motif (Glu-Ala codons)',
    description: 'GAGGCC found at known position 15 in mScarlet sequence',
    input: { sequence: 'ATGGTGAGCAAGGGCGAGGCCGTGATCGCCGAGTT', motif: 'GAGGCC' },
    expected: { totalMatches: 1, matchSequence: 'GAGGCC' },
  },
];

export default BENCHMARK_SEQUENCES;
