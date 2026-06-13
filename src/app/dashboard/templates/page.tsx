'use client';

import { useRouter } from 'next/navigation';
import { WORKFLOW_TEMPLATES } from '@/lib/workflow/templates';
import { useWorkflowStore } from '@/store/workflow-store';
import { useUIStore } from '@/store/ui-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const categoryColors: Record<string, string> = {
  input: 'bg-success/10 text-success border-success/20',
  analysis: 'bg-accent/10 text-accent border-accent/20',
  output: 'bg-danger/10 text-danger border-danger/20',
};

export default function TemplatesPage() {
  const router = useRouter();
  const loadTemplate = useWorkflowStore((s) => s.loadTemplate);
  const setActiveSidebarItem = useUIStore((s) => s.setActiveSidebarItem);

  const handleLoad = (template: typeof WORKFLOW_TEMPLATES[0]) => {
    loadTemplate(template);
    setActiveSidebarItem('workflow');
    router.push('/dashboard/workflow');
    toast.success(`Loaded "${template.name}" template`);
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-foreground">Workflow Templates</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Start with a pre-built workflow and customize it
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {WORKFLOW_TEMPLATES.map((template) => (
          <div
            key={template.id}
            className="rounded-xl border border-border bg-surface p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <h3 className="text-sm font-semibold text-foreground">{template.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>

            <div className="mt-4 space-y-1">
              {template.nodes.map((node) => (
                <div key={node.id} className="flex items-center gap-2 rounded-lg bg-background px-3 py-1.5">
                  <Badge
                    className={cn(
                      'text-[9px] px-1.5 py-0',
                      categoryColors[
                        node.type === 'fasta-input' ? 'input' :
                        ['report', 'csv-export', 'sequence-viewer'].includes(node.type) ? 'output' : 'analysis'
                      ],
                    )}
                  >
                    {node.type === 'fasta-input' ? 'INPUT' :
                     ['report', 'csv-export', 'sequence-viewer'].includes(node.type) ? 'OUTPUT' : 'ANALYSIS'}
                  </Badge>
                  <span className="text-xs text-foreground font-medium">
                    {node.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </span>
                </div>
              ))}
            </div>

            <Button
              size="sm"
              className="mt-4 w-full"
              onClick={() => handleLoad(template)}
            >
              Use Template →
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
