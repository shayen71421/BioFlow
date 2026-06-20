'use client';

import { useRouter } from 'next/navigation';
import { useWorkflowStore } from '@/store/workflow-store';
import { useUIStore } from '@/store/ui-store';
import { WORKFLOW_TEMPLATES } from '@/lib/workflow/templates';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FlaskConical, GitFork, ArrowRight, Dna, FileText } from 'lucide-react';

const HIGHLIGHTED_TEMPLATES = [
  {
    id: 'fasta-exploration',
    title: 'FASTA_EXPLORATION',
    icon: Dna,
    steps: ['FASTA Input', 'ORF Finder', 'GC Content', 'Sequence Viewer'],
  },
  {
    id: 'cloning-prep',
    title: 'CLONING_PREPARATION',
    icon: FlaskConical,
    steps: ['FASTA Input', 'Restriction Enzyme', 'Primer Design', 'CSV Export'],
  },
  {
    id: 'protein-translation',
    title: 'PROTEIN_TRANSLATION',
    icon: ArrowRight,
    steps: ['FASTA Input', 'Translation', 'Report'],
  },
  {
    id: 'sequence-alignment',
    title: 'GLOBAL_ALIGNMENT_NW',
    icon: GitFork,
    steps: ['FASTA Input 1 & 2', 'Alignment', 'Report'],
  },
];

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
              className="flex flex-col border border-border bg-[#0B0F19] rounded-lg overflow-hidden group hover:border-[#22C55E]/40 transition-all duration-300 shadow-md hover:shadow-[#22C55E]/5"
            >
              {/* Monospace Instrument Header */}
              <div className="flex items-center justify-between border-b border-border bg-[#121826] px-4 py-2">
                <div className="flex items-center gap-2">
                  <Icon size={14} className="text-[#22C55E]" />
                  <span className="font-mono text-xs font-bold tracking-wider text-foreground">
                    {item.title}
                  </span>
                </div>
                <span className="font-mono text-[9px] text-[#F59E0B] bg-[#F59E0B]/5 px-2 py-0.5 border border-[#F59E0B]/20 rounded">
                  VERIFIED
                </span>
              </div>

              {/* Template Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                    {rawTemplate?.description || 'Pre-configured workflow topology.'}
                  </p>

                  {/* Monospace flow sequence display */}
                  <div className="mt-5 space-y-1.5">
                    <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
                      Topology Flow
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] bg-background/50 border border-border/40 rounded p-2.5">
                      {item.steps.map((step, idx) => (
                        <div key={step} className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-surface border border-border text-foreground font-semibold">
                            {step}
                          </span>
                          {idx < item.steps.length - 1 && (
                            <span className="text-muted-foreground font-bold font-sans">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                    <span className="flex items-center gap-1">
                      <GitFork size={10} />
                      {rawTemplate?.nodes.length} Nodes
                    </span>
                    <span className="flex items-center gap-1">
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
                    DEPLOY Topo →
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
