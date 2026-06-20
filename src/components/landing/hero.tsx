'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ReactFlow,
  Background,
  Handle,
  Position,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  type NodeProps,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Dna, ArrowRight, RefreshCw, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUIStore } from '@/store/ui-store';
import HeroEdge from './hero-edge';

// Standard genetic code codon mapping
const GENETIC_CODE: Record<string, string> = {
  ATA: 'I', ATC: 'I', ATT: 'I', ATG: 'M',
  ACA: 'T', ACC: 'T', ACG: 'T', ACT: 'T',
  AAC: 'N', AAT: 'N', AAA: 'K', AAG: 'K',
  AGC: 'S', AGT: 'S', AGA: 'R', AGG: 'R',
  CTA: 'L', CTC: 'L', CTG: 'L', CTT: 'L',
  CCA: 'P', CCC: 'P', CCG: 'P', CCT: 'P',
  CAC: 'H', CAT: 'H', CAA: 'Q', CAG: 'Q',
  CGA: 'R', CGC: 'R', CGG: 'R', CGT: 'R',
  GTA: 'V', GTC: 'V', GTG: 'V', GTT: 'V',
  GCA: 'A', GCC: 'A', GCG: 'A', GCT: 'A',
  GAC: 'D', GAT: 'D', GAA: 'E', GAG: 'E',
  GGA: 'G', GGC: 'G', GGG: 'G', GGT: 'G',
  TCA: 'S', TCC: 'S', TCG: 'S', TCT: 'S',
  TTC: 'F', TTT: 'F', TTA: 'L', TTG: 'L',
  TAC: 'Y', TAT: 'Y', TAA: '*', TAG: '*',
  TGC: 'C', TGT: 'C', TGA: '*', TGG: 'W',
};

// Simplified translation
function translateDNA(dna: string) {
  let protein = '';
  for (let i = 0; i < dna.length - 2; i += 3) {
    const codon = dna.slice(i, i + 3).toUpperCase();
    const aa = GENETIC_CODE[codon] || 'X';
    if (aa === '*') break;
    protein += aa;
  }
  return protein;
}

// 3-Frame ORF finder
function findORFs(seq: string) {
  const orfs: Array<{ start: number; end: number; length: number }> = [];
  for (let frame = 0; frame < 3; frame++) {
    for (let i = frame; i < seq.length - 2; i += 3) {
      const codon = seq.slice(i, i + 3).toUpperCase();
      if (codon === 'ATG') {
        for (let j = i + 3; j < seq.length - 2; j += 3) {
          const stopCodon = seq.slice(j, j + 3).toUpperCase();
          if (['TAA', 'TAG', 'TGA'].includes(stopCodon)) {
            orfs.push({ start: i, end: j + 3, length: j + 3 - i });
            i = j;
            break;
          }
        }
      }
    }
  }
  return orfs.sort((a, b) => b.length - a.length);
}

// Custom Node Components
function FastaNode({ data }: NodeProps) {
  const seq = (data.sequence as string) || '';
  const status = data.status as string;

  const renderBases = () => {
    return seq.slice(0, 36).split('').map((base, idx) => {
      let cl = 'text-muted-foreground';
      if (base === 'A') cl = 'nucleotide-a';
      else if (base === 'T') cl = 'nucleotide-t';
      else if (base === 'G') cl = 'nucleotide-g';
      else if (base === 'C') cl = 'nucleotide-c';
      return (
        <span key={idx} className={cl}>
          {base}
        </span>
      );
    });
  };

  return (
    <div className="w-[240px] rounded-lg border border-border bg-[#0B0F19] shadow-lg overflow-hidden border-l-[3px] border-l-[#22C55E]">
      <div className="flex items-center justify-between border-b border-border bg-[#121826] px-3 py-1.5 font-mono text-[10px] font-bold text-foreground">
        <span className="flex items-center gap-1.5">
          <Terminal size={10} className="text-[#22C55E]" />
          FASTA_INPUT
        </span>
        <Badge className="text-[8px] px-1 py-0 bg-[#22C55E]/10 text-[#22C55E] border-none">
          {status === 'running' ? 'MUTATING' : 'READY'}
        </Badge>
      </div>
      <div className="p-3 space-y-2">
        <div className="bg-background/80 border border-border/40 rounded p-2 text-[9px] font-mono leading-tight break-all">
          <div className="text-muted-foreground mb-1 select-none font-bold text-[8px] tracking-wider border-b border-border/20 pb-0.5">
            HEADER: &gt;seq_demo_promoter
          </div>
          <div className="tracking-wider">{renderBases()}...</div>
          <div className="text-muted-foreground mt-1 text-[8px] font-bold uppercase">
            Length: {seq.length} bp
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (typeof data.onMutate === 'function') {
              data.onMutate();
            }
          }}
          disabled={status === 'running'}
          className="w-full py-1 text-[9px] font-mono font-bold bg-[#22C55E]/10 hover:bg-[#22C55E]/20 disabled:bg-[#1E293B]/20 disabled:text-muted-foreground text-[#22C55E] border border-[#22C55E]/30 rounded transition-all cursor-pointer text-center flex items-center justify-center gap-1"
        >
          <RefreshCw size={10} className={status === 'running' ? 'animate-spin' : ''} />
          MUTATE_GENOME
        </button>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-[#22C55E]" />
    </div>
  );
}

function OrfNode({ data }: NodeProps) {
  const status = data.status as string;
  const orfs = (data.orfs as Array<{ start: number; end: number; length: number }>) || [];

  return (
    <div className="w-[240px] rounded-lg border border-border bg-[#0B0F19] shadow-lg overflow-hidden border-l-[3px] border-l-[#8B5CF6]">
      <Handle type="target" position={Position.Left} className="!bg-[#8B5CF6]" />
      <div className="flex items-center justify-between border-b border-border bg-[#121826] px-3 py-1.5 font-mono text-[10px] font-bold text-foreground">
        <span className="flex items-center gap-1.5">
          <Terminal size={10} className="text-[#8B5CF6]" />
          ORF_FINDER
        </span>
        <Badge
          className={`text-[8px] px-1 py-0 border-none ${
            status === 'running' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-[#8B5CF6]/10 text-[#8B5CF6]'
          }`}
        >
          {status === 'running' ? 'COMPUTING' : 'DONE'}
        </Badge>
      </div>
      <div className="p-3 space-y-2">
        {status === 'running' ? (
          <div className="font-mono text-[9px] text-[#F59E0B] animate-pulse py-2">
            &gt; scanning frames...
          </div>
        ) : (
          <>
            <div className="font-mono text-[10px] text-foreground">
              Detected: <span className="text-[#8B5CF6] font-bold">{orfs.length} ORFs</span>
            </div>
            <div className="space-y-1.5 bg-background/50 border border-border/40 rounded p-2">
              <div className="flex items-center gap-2 text-[8px] font-mono text-muted-foreground">
                <span className="w-4">F1:</span>
                <div className="h-1.5 flex-1 bg-muted/30 rounded relative overflow-hidden">
                  <div className="absolute top-0 bottom-0 left-[10%] right-[40%] bg-[#22C55E]" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-[8px] font-mono text-muted-foreground">
                <span className="w-4">F2:</span>
                <div className="h-1.5 flex-1 bg-muted/30 rounded relative overflow-hidden">
                  <div className="absolute top-0 bottom-0 left-[35%] right-[20%] bg-[#F59E0B]" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-[8px] font-mono text-muted-foreground">
                <span className="w-4">F3:</span>
                <div className="h-1.5 flex-1 bg-muted/30 rounded relative overflow-hidden">
                  <div className="absolute top-0 bottom-0 left-[55%] right-[10%] bg-[#3B82F6]" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-[#8B5CF6]" />
    </div>
  );
}

function TranslationNode({ data }: NodeProps) {
  const status = data.status as string;
  const protein = (data.protein as string) || '';

  return (
    <div className="w-[240px] rounded-lg border border-border bg-[#0B0F19] shadow-lg overflow-hidden border-l-[3px] border-l-[#3B82F6]">
      <Handle type="target" position={Position.Left} className="!bg-[#3B82F6]" />
      <div className="flex items-center justify-between border-b border-border bg-[#121826] px-3 py-1.5 font-mono text-[10px] font-bold text-foreground">
        <span className="flex items-center gap-1.5">
          <Terminal size={10} className="text-[#3B82F6]" />
          TRANSLATION
        </span>
        <Badge
          className={`text-[8px] px-1 py-0 border-none ${
            status === 'running' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-[#3B82F6]/10 text-[#3B82F6]'
          }`}
        >
          {status === 'running' ? 'COMPUTING' : 'DONE'}
        </Badge>
      </div>
      <div className="p-3">
        {status === 'running' ? (
          <div className="font-mono text-[9px] text-[#F59E0B] animate-pulse py-2">
            &gt; codon lookup...
          </div>
        ) : (
          <div className="bg-background/80 border border-border/40 rounded p-2 text-[9px] font-mono leading-tight">
            <div className="text-muted-foreground mb-1 select-none font-bold text-[8px] tracking-wider border-b border-border/20 pb-0.5">
              FASTA: &gt;protein_translated
            </div>
            <div className="break-all tracking-wider text-[#3B82F6] font-semibold">
              {protein.slice(0, 36)}...
            </div>
            <div className="text-muted-foreground mt-1 text-[8px] font-bold uppercase">
              {protein.length} aa
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RestrictionNode({ data }: NodeProps) {
  const status = data.status as string;
  const cuts = (data.cuts as string[]) || [];

  return (
    <div className="w-[240px] rounded-lg border border-border bg-[#0B0F19] shadow-lg overflow-hidden border-l-[3px] border-l-[#EF4444]">
      <Handle type="target" position={Position.Left} className="!bg-[#EF4444]" />
      <div className="flex items-center justify-between border-b border-border bg-[#121826] px-3 py-1.5 font-mono text-[10px] font-bold text-foreground">
        <span className="flex items-center gap-1.5">
          <Terminal size={10} className="text-[#EF4444]" />
          RESTRICTION_MAP
        </span>
        <Badge
          className={`text-[8px] px-1 py-0 border-none ${
            status === 'running' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-[#EF4444]/10 text-[#EF4444]'
          }`}
        >
          {status === 'running' ? 'DIGESTING' : 'DONE'}
        </Badge>
      </div>
      <div className="p-3">
        {status === 'running' ? (
          <div className="font-mono text-[9px] text-[#F59E0B] animate-pulse py-2">
            &gt; enzyme digest...
          </div>
        ) : (
          <div className="space-y-1 bg-background/50 border border-border/40 rounded p-2 font-mono text-[9px]">
            {cuts.length === 0 ? (
              <div className="text-muted-foreground text-[8px] uppercase">No sites detected</div>
            ) : (
              cuts.map((cut, idx) => {
                const isEco = cut.includes('EcoRI');
                return (
                  <div key={idx} className="flex items-center justify-between border-b border-border/10 pb-0.5 last:border-b-0 last:pb-0">
                    <span className={isEco ? 'text-[#EF4444] font-semibold' : 'text-[#F59E0B] font-semibold'}>
                      {isEco ? 'EcoRI' : 'HindIII'}
                    </span>
                    <span className="text-muted-foreground text-[8px]">{cut.split(' @ ')[1]}</span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const nodeTypes = {
  fastaNode: FastaNode,
  orfNode: OrfNode,
  translationNode: TranslationNode,
  restrictionNode: RestrictionNode,
};

const edgeTypes = {
  heroEdge: HeroEdge,
};

// Default setup sequence
const INITIAL_DNA = 'ATGGCTAGCATGACTGGTGGACAGCAAATGGGTACCGGATCCGAATTCGAGCTCCGTCGACAAGCTTGCGGCCGCACTCGAGCACCACCACC';

export function Hero() {
  const router = useRouter();
  const setActiveSidebarItem = useUIStore((s) => s.setActiveSidebarItem);

  const [sequence, setSequence] = useState(INITIAL_DNA);
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('complete');

  // Trigger sequence mutation
  const handleMutate = useCallback(() => {
    setStatus('running');
    setTimeout(() => {
      setSequence((prev) => {
        const bases = ['A', 'T', 'G', 'C'];
        const arr = prev.split('');
        // Mutate 2-3 random bases
        for (let k = 0; k < 2; k++) {
          const randIdx = Math.floor(Math.random() * arr.length);
          const currentBase = arr[randIdx];
          const newBases = bases.filter((b) => b !== currentBase);
          arr[randIdx] = newBases[Math.floor(Math.random() * newBases.length)];
        }
        return arr.join('');
      });
      setStatus('complete');
    }, 900);
  }, []);

  const orfs = useMemo(() => findORFs(sequence), [sequence]);
  const protein = useMemo(() => {
    if (orfs.length > 0) {
      const longest = orfs[0];
      const orfSeq = sequence.slice(longest.start, longest.start + longest.length);
      return translateDNA(orfSeq);
    }
    return translateDNA(sequence);
  }, [sequence, orfs]);

  const cuts = useMemo(() => {
    const list: string[] = [];
    let idx = sequence.indexOf('GAATTC'); // EcoRI
    while (idx !== -1) {
      list.push(`EcoRI @ ${idx + 1}bp`);
      idx = sequence.indexOf('GAATTC', idx + 1);
    }
    idx = sequence.indexOf('AAGCTT'); // HindIII
    while (idx !== -1) {
      list.push(`HindIII @ ${idx + 1}bp`);
      idx = sequence.indexOf('AAGCTT', idx + 1);
    }
    return list;
  }, [sequence]);

  // React Flow node layout configuration
  const initialNodes: Node[] = useMemo(
    () => [
      {
        id: 'fasta',
        type: 'fastaNode',
        position: { x: 15, y: 80 },
        data: { label: 'FASTA Input', status, sequence, onMutate: handleMutate },
      },
      {
        id: 'orf',
        type: 'orfNode',
        position: { x: 285, y: 15 },
        data: { label: 'ORF Finder', status, orfs },
      },
      {
        id: 'translation',
        type: 'translationNode',
        position: { x: 555, y: 15 },
        data: { label: 'Translation', status, protein },
      },
      {
        id: 'restriction',
        type: 'restrictionNode',
        position: { x: 285, y: 175 },
        data: { label: 'Restriction Map', status, cuts },
      },
    ],
    [status, sequence, orfs, protein, cuts, handleMutate]
  );

  const initialEdges = useMemo(
    () => [
      { id: 'e-fasta-orf', source: 'fasta', target: 'orf', type: 'heroEdge' },
      { id: 'e-orf-translation', source: 'orf', target: 'translation', type: 'heroEdge' },
      { id: 'e-fasta-restriction', source: 'fasta', target: 'restriction', type: 'heroEdge' },
    ],
    []
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Sync state mutations to React Flow nodes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === 'fasta') {
          return { ...n, data: { ...n.data, status, sequence, onMutate: handleMutate } };
        }
        if (n.id === 'orf') {
          return { ...n, data: { ...n.data, status, orfs } };
        }
        if (n.id === 'translation') {
          return { ...n, data: { ...n.data, status, protein } };
        }
        if (n.id === 'restriction') {
          return { ...n, data: { ...n.data, status, cuts } };
        }
        return n;
      })
    );
  }, [status, sequence, orfs, protein, cuts, handleMutate, setNodes]);

  const handleBuildWorkflow = () => {
    setActiveSidebarItem('workflow');
    router.push('/dashboard/workflow');
  };

  return (
    <section className="relative w-full max-w-6xl mx-auto px-4 pt-20 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      {/* Visual background lines (pipeline DAG structure connector) */}
      <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-gradient-to-b from-transparent via-border to-transparent pointer-events-none opacity-20 hidden lg:block" />

      {/* Copy Content (Left, 5 cols) */}
      <div className="lg:col-span-5 flex flex-col space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#22C55E]/20 bg-[#22C55E]/5 w-fit">
          <Dna size={12} className="text-[#22C55E]" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#22C55E]">
            Client_Side_DAG_Compiler
          </span>
        </div>

        <h1 className="font-mono text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1]">
          [DAG_BIOFLOW]
          <br />
          <span className="text-[#22C55E]">VISUAL_PIPELINES</span>
        </h1>

        <p className="text-sm text-muted-foreground leading-relaxed font-sans max-w-lg">
          Build and execute DNA analysis workflows directly in your browser. Chain Needleman-Wunsch global alignment, 6-frame ORF scanning, PCR primer Tm calculation, and restriction digestions on an interactive canvas. Zero server dependencies.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            size="lg"
            variant="primary"
            onClick={handleBuildWorkflow}
            className="font-mono text-xs tracking-wider gap-2 bg-[#22C55E] hover:bg-[#22C55E]/90 text-[#0A0E17] font-bold"
          >
            LAUNCH_WORKSPACE <ArrowRight size={14} />
          </Button>
          <a
            href="https://github.com/shayen71421/BioFlow"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 font-mono text-xs tracking-wider gap-2 hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/10 text-foreground transition-colors"
          >
            GITHUB_REPO
          </a>
        </div>
      </div>

      {/* Live Interactive Canvas (Right, 7 cols) */}
      <div className="lg:col-span-7 relative">
        <div className="absolute -top-3 -left-3 font-mono text-[8px] text-muted-foreground select-none uppercase tracking-wider bg-[#0A0E17] px-2 py-0.5 border border-border rounded z-20">
          Interactive_Hero_Sandbox
        </div>

        <div className="w-full h-[320px] sm:h-[350px] border border-border bg-[#070A10] rounded-lg overflow-hidden shadow-2xl relative">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              zoomOnScroll={false}
              zoomOnDoubleClick={false}
              panOnDrag={false}
              panOnScroll={false}
              preventScrolling={true}
              nodesDraggable={true}
              nodesConnectable={false}
              fitView
              fitViewOptions={{ padding: 0.15 }}
              colorMode="dark"
            >
              <Background gap={14} size={1} color="rgba(34, 197, 94, 0.06)" />
            </ReactFlow>
          </ReactFlowProvider>

          {/* Canvas Interactive Tips */}
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between font-mono text-[8px] text-muted-foreground select-none pointer-events-none bg-[#070A10]/95 border border-border/40 px-2 py-1 rounded">
            <span>DRAG_NODES_TO_REPLACE</span>
            <span className="text-[#22C55E]">EXECUTION_ISOLATED</span>
          </div>
        </div>
      </div>
    </section>
  );
}
