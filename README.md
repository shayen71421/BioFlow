# BioFlow

Visual bioinformatics workflow builder. Drag-and-drop pipeline creation with real-time DNA/protein analysis — no backend required.

Built with **Next.js 15** (App Router), **React Flow**, **TypeScript**, **Zustand**, **Tailwind v4**, and **shadcn/ui**. Runs entirely in the browser as static assets.

---

## Quick Start

```sh
npm install
npm run dev
# → http://localhost:3000
```

| Command | Description |
|---|---|
| `npm run dev` | Dev server at localhost:3000 |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check (CI enforces) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run lint:fix` | ESLint auto-fix (runs in pre-commit) |

---

## Features

### Workflow Builder
- **16 node types** across 4 categories: Input, Analysis, Advanced Analysis, Output
- Drag-and-drop canvas with React Flow
- **15 pre-built templates** to start from
- DAG-based execution with topological sort, caching, and partial reruns
- Undo/redo with full history stack
- Command palette (Space or `A` key)

### Bioinformatics Analysis (all in-browser, pure TypeScript)
| Node | Analysis |
|---|---|
| **FASTA Input** | Load single/multi-record FASTA files |
| **FASTQ Input** | Parse FASTQ reads with quality scores |
| **GenBank Input** | Parse GenBank files with annotated features |
| **GC Content** | Overall GC%, AT%, per-window sliding distribution |
| **ORF Finder** | Open reading frames in all 6 frames (3 forward, 3 reverse) |
| **Translation** | DNA → protein in all 3 forward frames |
| **Reverse Complement** | Generate reverse complement |
| **Alignment** | Needleman-Wunsch global pairwise alignment |
| **Motif Search** | Exact/pattern search in sequences |
| **Restriction Enzymes** | Cut site detection for 200+ enzymes |
| **Primer Design** | PCR primer pair generation with Tm, GC%, dimer scoring |
| **Codon Usage** | Codon frequency, RSCU, preferred/rare codons |
| **Protein Properties** | MW, pI, extinction coefficient, instability index, charge |
| **Sequence Viewer** | Scrollable base-by-base viewer with nucleotide coloring |
| **Report** | Summary report of all upstream results |
| **CSV Export** | Export tabular results to CSV |

### Visualization
- **Genome Map** — Interactive SVG tracks for ORFs, features, motifs, restriction cuts, primers with zoom/pan/tooltip
- **Virtualized Sequence Viewer** — Smooth scrolling for sequences up to 10M+ bp with base coloring, annotations, and position markers
- **BioDrop** — Dedicated sequence explorer with ORF browser, GC distribution, translation viewer, and export
- **Nucleotide coloring** — A (#22C55E green), T (#EF4444 red), G (#F59E0B amber), C (#3B82F6 blue)

### Projects & Persistence
- **Project management** — Create, name, save, load, delete projects
- **Export/import** — Share workflows as `.bioflow.json` files
- **Auto-save** — Workflow state persisted to `localStorage`
- **Smart partialize** — Strips large sequence data on save; handles `QuotaExceededError` gracefully

### Scientific Correctness & Validation
- **42 benchmark tests** covering GC content, ORF detection, translation, motif search, restriction analysis, reverse complement, alignment, FASTA parsing, primer Tm, protein properties
- **Metadata verification** — Validates expected sequence lengths, GC counts, motif positions, revcomp lengths, ORF coordinates, and translation lengths independently before functional tests
- **Verification suite** catches benchmark data errors (mismatched sequence lengths, wrong expected values) before they reach users
- **All 42 tests pass** after systematic fixes: primer product size calculation, ORF 6-frame mode, stop codon exclusion, coordinate display conventions

### Templates (15 pre-built)
FASTA Exploration, Protein Translation, Genome Overview, Primer Design, Restriction Analysis, Motif Discovery, Protein Analysis, Codon Usage Analysis, FASTQ Quality Analysis, GenBank Feature Viewer, Reverse Complement, Pairwise Alignment, Comprehensive Analysis, Cloning Preparation

### Additional
- Dark mode only (custom palette)
- Keyboard shortcuts: `Space`/`A` for command palette, `⌘Z` undo, `⌘⇧Z` redo
- Selective update: only rerun downstream nodes on config change
- Execution caching with automatic cache invalidation

---

## Architecture

```
src/
├── app/                    # Next.js App Router pages
│   └── dashboard/
│       ├── workflow/       # Workflow builder (React Flow canvas)
│       ├── biodrop/        # Sequence explorer
│       ├── templates/      # Template browser
│       └── docs/           # Bioinformatics explainers
├── components/
│   ├── workflow/           # Canvas, nodes, panels, palette, result cards
│   ├── genome-map/         # Interactive genome visualization
│   ├── biodrop/            # BioDrop sequence viewer panes
│   ├── projects/           # Project dashboard and management
│   ├── ui/                 # Shared UI components (custom shadcn/ui)
│   └── dashboard/          # Layout shell, right panel, scientific dashboard
├── lib/
│   ├── bio/                # Pure-TypeScript bioinformatics functions
│   │   ├── orf-finder.ts           # 6-frame ORF detection
│   │   ├── gc-content.ts           # GC/AT content with sliding window
│   │   ├── translation.ts          # DNA→protein translation
│   │   ├── reverse-complement.ts   # Reverse complement
│   │   ├── needleman-wunsch.ts     # Global pairwise alignment
│   │   ├── motif-search.ts         # DNA motif pattern matching
│   │   ├── restriction-enzymes.ts  # Restriction site detection
│   │   ├── primer-design.ts        # PCR primer design with Tm calc
│   │   ├── codon-usage.ts          # Codon frequency and RSCU
│   │   ├── protein-properties.ts   # MW, pI, extinction coefficient
│   │   ├── fastq-parser.ts         # FASTQ read parser
│   │   └── genbank-parser.ts       # GenBank feature parser
│   ├── validation/          # Benchmark framework and result validation
│   │   ├── benchmark-data.ts       # 42 curated test cases
│   │   ├── benchmark-runner.ts     # Functional test runner
│   │   └── benchmark-verify.ts     # Independent metadata verifier
│   └── workflow/            # Execution engine, templates, export, palette
├── store/                   # Zustand state management
│   ├── workflow-store.ts    # Nodes, edges, history, execution, persistence
│   ├── sequence-store.ts    # FASTA data and analysis results
│   ├── project-store.ts     # Project CRUD operations
│   └── ui-store.ts          # Sidebar, panels, palette, command palette
└── types/                   # Shared TypeScript type definitions
```

### Stores

| Store | Purpose | Persistence |
|---|---|---|
| `workflow-store` | Nodes/edges, execution graph, undo/redo history | localStorage (bioflow-workflow) |
| `sequence-store` | Sequence data, ORF/GC/translation results | Session only (>100k bp) |
| `project-store` | Project CRUD, export/import | localStorage (bioflow-projects) |
| `ui-store` | Sidebar, panels, palette visibility | Session only |

### Key Design Decisions
- **`node.type` is always `'bioNode'`** — React Flow routes to a single component. Business logic type lives in `data.type`.
- **No backend** — All bio computations run in-browser as pure TypeScript functions. Deployable as static assets to Vercel or any CDN.
- **DAG execution** — Topological sort with selective recalculation and result caching. Only downstream nodes rerun on config changes.
- **Storage** — `localStorage` with `partialize` stripping large sequences and results. Falls back gracefully on `QuotaExceededError`.
- **NCBI E-utilities** — Public API (`esearch` → `esummary` → `efetch`) for sequence search. No API key required at low request rates.
- **Benchmark-first development** — All bio functions have test cases with independently verified expected values. Metadata verification catches data entry errors before functional tests run.

---

## Node Category Reference

| Category | Color | Nodes |
|---|---|---|
| **Input** | Green (`#22C55E`) | FASTA Input, FASTQ Input, GenBank Input |
| **Analysis** | Accent (blue/amber) | GC Content, ORF Finder, Translation, Reverse Complement, Alignment, Motif Search |
| **Advanced Analysis** | Pink (`#EC4899`) | Restriction Enzymes, Primer Design, Codon Usage, Protein Properties |
| **Output** | Red (`#EF4444`) | Report, CSV Export, Sequence Viewer |

---

## Routes

| Path | Component | Purpose |
|---|---|---|
| `/` | Landing page | Hero, interactive playground, feature highlights |
| `/dashboard/workflow` | Workflow builder | React Flow canvas with full node palette |
| `/dashboard/biodrop` | Sequence explorer | Sequence viewer, ORF browser, GC, translation, export |
| `/dashboard/templates` | Template browser | Pre-built workflow templates gallery |
| `/dashboard/docs` | Documentation | Bioinformatics explainers and usage guide |

---

## Browser Support

- **Chrome/Edge** — Full support including File System Access API for workspace folders
- **Firefox** — Core functionality (no workspace folder support)
- **Safari** — Basic support

---

## License

MIT
