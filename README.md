# BioFlow

**Bioinformatics without the terminal.**

BioFlow is a visual, client-side bioinformatics workflow builder. Drag, connect, and run analysis pipelines in your browser — no backend, no CLI, no setup.

![Next.js](https://img.shields.io/badge/Next.js_16-000?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript_strict-3178C6?logo=typescript) ![Tailwind v4](https://img.shields.io/badge/Tailwind_v4-0F172A?logo=tailwindcss) ![React Flow](https://img.shields.io/badge/React_Flow-FF0072?logo=react) ![Zustand](https://img.shields.io/badge/Zustand-433E38?logo=react)

---

## Features

- **Visual Workflow Builder** — drag-and-drop nodes onto a React Flow canvas, connect them, and run a DAG pipeline in-browser.
- **Sequence Explorer (BioDrop)** — load FASTA files, explore sequences with colored nucleotides, find ORFs (6-frame), translate DNA, chart GC content, view codon usage, reverse-complement.
- **Pre-built Templates** — start from one of three ready-made workflows (FASTA Exploration, Protein Translation, Genome Overview).
- **Sample Data** — three built-in examples: E. coli K12 (~10k bp), SARS-CoV-2 spike (~3.8k bp), BRCA1 region (~5.6k bp).
- **Export** — download workflows as `.bioflow.json`, export results as CSV/JSON/Markdown, or generate CLI commands for offline use.
- **12 Node Types** — FASTA/FASTQ/GenBank input, GC content, ORF finder, translation, reverse complement, alignment, motif search, report, CSV export, sequence viewer.
- **Pure Client-Side** — no backend, no database. Deploy as static assets to Vercel or any static host.

## Routes

| Path | Page |
|---|---|
| `/` | Landing page with hero, features, sample playground |
| `/dashboard/workflow` | Workflow builder (canvas) |
| `/dashboard/biodrop` | Sequence explorer |
| `/dashboard/templates` | Pre-built pipeline templates |
| `/dashboard/docs` | Bioinformatics guides |

## Quick Start

```sh
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000). No API keys, no database, no setup.

## Scripts

| Command | Action |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript strict check (`tsc --noEmit`) |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run format` | Prettier format |

Commits require [conventional commit](https://www.conventionalcommits.org/) messages (`feat:`, `fix:`, `docs:`, etc.). Pre-commit runs `lint:fix` + `typecheck` on staged files.

## Tech Stack

- **Frameowrk**: Next.js 16, App Router, TypeScript strict
- **Styling**: Tailwind v4, custom dark palette
- **Canvas**: React Flow 12 (@xyflow/react)
- **State**: Zustand 5 (3 stores — workflow, sequence, UI)
- **Charts**: Recharts
- **Animations**: Framer Motion, GSAP (landing)
- **Forms**: React Hook Form + Zod
- **Fonts**: Geist (UI), JetBrains Mono (sequences)
- **Tooling**: ESLint, Prettier, Husky, lint-staged, commitlint

## Architecture

All bioinformatics run in the browser via pure-TypeScript modules:

- `src/lib/bio/fasta-parser` — Parse/format FASTA
- `src/lib/bio/orf-finder` — 6-frame ORF discovery
- `src/lib/bio/translation` — DNA → protein (standard table)
- `src/lib/bio/gc-content` — Sliding-window GC analysis
- `src/lib/bio/reverse-complement` — Reverse/complement
- `src/lib/bio/codon-usage` — Frequency analysis & stats

Workflow execution does a DAG topological sort and dispatches the appropriate bio function per node, passing results along edges.

## Deployment

```sh
npm run build
```

Output is in `out/` — deploy static files to Vercel, Netlify, or any CDN.

## Workflow Node Types

| Category | Nodes |
|---|---|
| Input | FASTA Input, FASTQ Input, GenBank Input |
| Analysis | GC Content, ORF Finder, Translation, Reverse Complement, Alignment, Motif Search |
| Output | Report, CSV Export, Sequence Viewer |

## License

MIT
