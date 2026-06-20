'use client';

import { useRouter } from 'next/navigation';
import { useWorkflowStore } from '@/store/workflow-store';
import { useUIStore } from '@/store/ui-store';
import { WORKFLOW_TEMPLATES } from '@/lib/workflow/templates';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FlaskConical, GitFork, ArrowRight, Dna, FileText, Scissors } from 'lucide-react';

const HIGHLIGHTED_TEMPLATES = [
  {
    id: 'fasta-exploration',
    title: 'FASTA_EXPLORATION',
    icon: Dna,
    gradient: 'from-[#22C55E]/10 via-transparent to-transparent',
    borderAccent: 'hover:border-[#22C55E]/50',
    badgeColor: 'text-[#22C55E] border-[#22C55E]/20 bg-[#22C55E]/5',
    nodes: [
      { id: 'in', label: 'FASTA', color: '#22C55E', x: 0 },
      { id: 'orf', label: 'ORF', color: '#3B82F6', x: 1 },
      { id: 'gc', label: 'GC', color: '#8B5CF6', x: 2 },
      { id: 'view', label: 'View', color: '#F59E0B', x: 3 },
    ],
  },
  {
    id: 'cloning-prep',
    title: 'CLONING_PREPARATION',
    icon: Scissors,
    gradient: 'from-[#EC4899]/10 via-transparent to-transparent',
    borderAccent: 'hover:border-[#EC4899]/50',
    badgeColor: 'text-[#EC4899] border-[#EC4899]/20 bg-[#EC4899]/5',
    nodes: [
      { id: 'in', label: 'FASTA', color: '#22C55E', x: 0 },
      { id: 're', label: 'Digest', color: '#EF4444', x: 1 },
      { id: 'prim', label: 'Primer', color: '#EC4899', x: 2 },
      { id: 'csv', label: 'CSV', color: '#F59E0B', x: 3 },
    ],
  },
  {
    id: 'protein-translation',
    title: 'PROTEIN_TRANSLATION',
    icon: ArrowRight,
    gradient: 'from-[#F59E0B]/10 via-transparent to-transparent',
    borderAccent: 'hover:border-[#F59E0B]/50',
    badgeColor: 'text-[#F59E0B] border-[#F59E0B]/20 bg-[#F59E0B]/5',
    nodes: [
      { id: 'in', label: 'FASTA', color: '#22C55E', x: 0 },
      { id: 'trans', label: 'Translate', color: '#F59E0B', x: 1 },
      { id: 'rep', label: 'Report', color: '#EF4444', x: 2 },
    ],
  },
  {
    id: 'sequence-alignment',
    title: 'GLOBAL_ALIGNMENT_NW',
    icon: GitFork,
    gradient: 'from-[#3B82F6]/10 via-transparent to-transparent',
    borderAccent: 'hover:border-[#3B82F6]/50',
    badgeColor: 'text-[#3B82F6] border-[#3B82F6]/20 bg-[#3B82F6]/5',
    nodes: [
      { id: 'in1', label: 'Seq_1', color: '#22C55E', x: 0 },
      { id: 'in2', label: 'Seq_2', color: '#22C55E', x: 0 },
      { id: 'align', label: 'Align', color: '#3B82F6', x: 1 },
      { id: 'rep', label: 'Report', color: '#EF4444', x: 2 },
    ],
  },
];

function MiniFlowGraph({ nodes }: { nodes: { id: string; label: string; color: string; x: number }[] }) {
  const grouped = nodes.reduce<Record<number, typeof nodes>>((acc, n) => {
    (acc[n.x] = acc[n.x] || []).push(n);
    return acc;
  }, {});
  const cols = Object.keys(grouped).map(Number).sort();
  return (
    <div className="flex items-center gap-2 py-2">
      {cols.map((col, ci) => (
        <div key={col} className="flex items-center gap-1.5">
          <div className="flex flex-col gap-1">
            {grouped[col].map((n) => (
              <div
                key={n.id}
                className="flex items-center gap-1.5 rounded-md border border-border/60 bg-[#070A10] px-2 py-1"
              >
                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: n.color }} />
                <span className="font-mono text-[9px] font-semibold text-foreground tracking-wide">{n.label}</span>
              </div>
            ))}
          </div>
          {ci < cols.length - 1 && (
            <div className="flex items-center mx-1">
              <div className="w-3 h-[1.5px] bg-gradient-to-r from-foreground/30 to-foreground/5" />
              <ArrowRight size={10} className="text-muted-foreground -ml-2" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function TemplatesShowcase() {
  const router = useRouter();
  const loadTemplate = useWorkflowStore((s) => s.loadTemplate);
  const setActiveSidebarItem = useUIStore((s) => s.setActiveSidebarItem);

  const handleLoad = (templateId: string) => {
    const template = WORKFLOW_TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      toast.error('Template not found');
      return;
    }
    loadTemplate(template);
    setActiveSidebarItem('workflow');
    router.push('/dashboard/workflow');
    toast.success(`Loaded "${template.name}" template`);
  };

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#3B82F6]/20 bg-[#3B82F6]/5">
          <FlaskConical size={12} className="text-[#3B82F6]" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#3B82F6]">
            Pre-Configured Pipelines
          </span>
        </div>
        <h2 className="font-mono text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          [SELECT_TEMPLATES]
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto font-sans leading-relaxed">
          Instantly deploy verified analytical topologies. Bypass setup overhead to inspect transcription, translation, and local restriction sites.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {HIGHLIGHTED_TEMPLATES.map((item) => {
          const rawTemplate = WORKFLOW_TEMPLATES.find((t) => t.id === item.id);
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`relative flex flex-col border border-border bg-[#0B0F19] rounded-lg overflow-hidden group ${item.borderAccent} transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#22C55E]/5`}
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

              {/* Header */}
              <div className="relative flex items-center justify-between border-b border-border/60 bg-[#121826] px-4 py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#070A10] border border-border/40">
                    <Icon size={13} className="text-foreground" />
                  </div>
                  <span className="font-mono text-xs font-bold tracking-wider text-foreground">
                    {item.title}
                  </span>
                </div>
                <span className={`font-mono text-[9px] px-2 py-0.5 rounded border ${item.badgeColor}`}>
                  VERIFIED
                </span>
              </div>

              {/* Content */}
              <div className="relative p-5 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                    {rawTemplate?.description || 'Pre-configured workflow topology.'}
                  </p>

                  {/* Mini pipeline graph */}
                  <div className="rounded-lg border border-border/40 bg-[#070A10]/60 p-3">
                    <div className="font-mono text-[8px] text-muted-foreground uppercase tracking-widest mb-2">
                      Pipeline_Topology
                    </div>
                    <MiniFlowGraph nodes={item.nodes} />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                    <span className="flex items-center gap-1.5">
                      <GitFork size={10} />
                      {rawTemplate?.nodes.length} Nodes
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FileText size={10} />
                      {rawTemplate?.edges.length} Edges
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleLoad(item.id)}
                    className="font-mono text-xs border-border hover:border-[#22C55E] hover:bg-[#22C55E]/10 hover:text-[#22C55E] transition-all gap-1.5"
                  >
                    DEPLOY <ArrowRight size={11} />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
