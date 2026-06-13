# BioFlow

Visual bioinformatics workflow builder. Next.js 15 App Router, TypeScript strict, Tailwind v4, React Flow, Zustand, shadcn/ui.

## Commands

```sh
npm run dev          # dev server at localhost:3000
npm run build        # next build
npm run typecheck    # tsc --noEmit (CI enforces)
npm run lint         # eslint
npm run lint:fix     # eslint --fix (runs in pre-commit via lint-staged)
npm run format       # prettier --write .
```

## Pre-commit

- `lint-staged` runs `npm run lint:fix && npm run typecheck` on staged `.ts,.tsx` files.
- `commit-msg` enforces conventional commits (feat:, fix:, docs:, refactor:, etc.).
- If pre-commit fails on hoisting errors (`const` used before declaration), the hook aborts. Fix ordering or use `--no-verify` as escape hatch.

## Architecture

- **All client-side** — no backend. Deployable as static assets to Vercel.
- **3 Zustand stores**: `workflow-store` (nodes/edges/history/execution, persisted to localStorage as `bioflow-workflow`), `sequence-store` (FASTA data/analysis results), `ui-store` (sidebar/panels/palette).
- **Persist caveat**: `workflow-store` uses `partialize` to strip `config.sequenceData` and `results` from saved state. Large sequences (>100k bp) are session-only. A custom storage wrapper catches `QuotaExceededError` and clears saved workflows on overflow.
- **BioNodeData extends `Record<string, unknown>`** to satisfy React Flow's strict `Node<Record<string, unknown>>` type. The business type (e.g. `'orf-finder'`) lives in `data.type`, **not** `node.type` (which is always `'bioNode'` for React Flow routing).
- **Execution**: DAG topological sort → pure-TypeScript bio functions per node. Each node reads its input sequence from upstream node results via `extractSequence()`, falling back to global `sequence-store` data.

## Key gotchas

- `node.type` is the React Flow component type (`'bioNode'`). Business type is always `data.type`.
- `BioNodeData` has a mandatory `type: NodeType` field.
- FASTA Input nodes can store sequences in `config.sequenceData` — self-contained, no dependency on BioDrop.
- NCBI search uses public E-utilities API: `esearch` → `esummary` → `efetch`. No API key needed at low rates.
- Workspace folder feature uses File System Access API (`showDirectoryPicker`), Chrome/Edge only.

## Routes

| Path | Component |
|---|---|
| `/` | Landing page (hero, playground, features) |
| `/dashboard/workflow` | Workflow builder (React Flow canvas) |
| `/dashboard/biodrop` | Sequence explorer (viewer, ORFs, GC, translation, export) |
| `/dashboard/templates` | Pre-built workflow templates |
| `/dashboard/docs` | Bioinformatics explainers |

## Style

- Dark mode only. Custom palette in `globals.css`.
- Nucleotide coloring utilities: `nucleotide-a` (#22C55E), `nucleotide-t` (#EF4444), `nucleotide-g` (#F59E0B), `nucleotide-c` (#3B82F6).
- Fonts: Geist (UI), JetBrains Mono (sequences/terminal).
- All UI components are hand-written custom shadcn/ui (no CLI-generated components).
