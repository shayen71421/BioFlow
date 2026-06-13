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
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check (CI enforces) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

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
| **GC Content** | Overall GC%, AT%, per-window sliding |
| **ORF Finder** | Open reading frames in all 6 frames |
| **Translation** | DNA → protein (standard + alternative tables) |
| **Reverse Complement** | Generate reverse complement |
| **Alignment** | Needleman-Wunsch global pairwise alignment |
| **Motif Search** | Regex pattern search in sequences |
| **Restriction Enzymes** | Cut site detection (200+ enzymes) |
| **Primer Design** | PCR primer pair generation with Tm calculation |
| **Codon Usage** | Codon frequency, RSCU, preferred/rare codons |
| **Protein Properties** | MW, pI, extinction coefficient, instability, charge |
| **Report** | Summary report of all upstream results |
| **Sequence Viewer** | Scrollable base viewer with highlights |
| **CSV Export** | Export tabular results to CSV |

### Visualization
- **Genome Map** — Interactive SVG tracks for ORFs, features, motifs, restriction cuts, primers (zoom/pan/tooltip)
- **Virtualized Sequence Viewer** — Smooth scrolling for sequences up to 10M+ bp with base coloring and annotations
- **BioDrop** — Sequence viewer with ORF, GC, translation, export tools
- **Nucleotide coloring** — A (green), T (red), G (amber), C (blue)

### Projects & Persistence
- **Project management** — Create, name, save, load, delete projects
- **Export/import** — Share workflows as `.bioflow.json` files
- **Auto-save** — Workflow state persisted to `localStorage`
- **Smart partialize** — Strips large sequence data on save; handles `QuotaExceededError` gracefully

### Templates (15 pre-built)
FASTA Exploration, Protein Translation, Genome Overview, Primer Design, Restriction Analysis, Motif Discovery, Protein Analysis, Codon Usage Analysis, FASTQ Quality Analysis, GenBank Feature Viewer, Reverse Complement, Pairwise Alignment, Comprehensive Analysis, Cloning Preparation

### Additional
- Dark mode only (custom palette)
- Keyboard shortcuts: `Space`/`A` for command palette, `⌘Z` undo, `⌘⇧Z` redo
- Selective update: only rerun downstream nodes on change
- Execution caching with cache invalidation on config change

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
│   ├── workflow/           # Canvas, nodes, panels, palette
│   ├── genome-map/         # Interactive genome visualization
│   ├── projects/           # Project dashboard
│   ├── sequence/           # Virtualized sequence viewer
│   └── ui/                 # Shared UI components
├── lib/
│   ├── bio/                # Pure-TypeScript bioinformatics functions
│   │   ├── orf-finder.ts
│   │   ├── gc-content.ts
│   │   ├── translation.ts
│   │   ├── reverse-complement.ts
│   │   ├── needleman-wunsch.ts
│   │   ├── motif-search.ts
│   │   ├── restriction-enzymes.ts
│   │   ├── primer-design.ts
│   │   ├── codon-usage.ts
│   │   ├── protein-properties.ts
│   │   ├── fastq-parser.ts
│   │   └── genbank-parser.ts
│   └── workflow/           # Execution engine, validation, templates, export
├── store/                  # Zustand stores
│   ├── workflow-store.ts   # Nodes, edges, history, execution, persistence
│   ├── sequence-store.ts   # FASTA data, analysis results
│   ├── project-store.ts    # Project management
│   └── ui-store.ts         # Sidebar, panels, palette state
└── types/                  # TypeScript type definitions
```

### Stores
| Store | Purpose |
|---|---|
| `workflow-store` | Nodes/edges, history, execution, localStorage persistence |
| `sequence-store` | Sequence data, analysis results |
| `project-store` | Project CRUD, export/import |
| `ui-store` | Sidebar, panels, command palette |

### Key Design Decisions
- **`node.type`** is always `'bioNode'` (React Flow routing). Business type is in `data.type`.
- **No backend** — all bio computations run in-browser as pure functions.
- **DAG execution** with topological sort, selective recalc, and result caching.
- **Storage** uses `localStorage` with `partialize` to strip large sequences. Falls back gracefully on quota errors.
- **NCBI E-utilities** for public sequence search (no API key needed).

---

## Node Category Reference

| Category | Color | Nodes |
|---|---|---|
| **Input** | Green | FASTA Input, FASTQ Input, GenBank Input |
| **Analysis** | Blue/Amber/Purple | GC Content, ORF Finder, Translation, Reverse Complement, Alignment, Motif Search |
| **Advanced** | Pink | Restriction Enzymes, Primer Design, Codon Usage, Protein Properties |
| **Output** | Red | Report, CSV Export, Sequence Viewer |

---

## Browser Support

- Chrome/Edge (full, including File System Access API for workspace folders)
- Firefox (no workspace folder support)
- Safari (basic support)

---

## License

MIT
