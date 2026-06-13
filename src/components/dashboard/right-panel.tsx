'use client';

import { useState } from 'react';
import { X, FileText, FileJson, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui-store';
import { useWorkflowStore } from '@/store/workflow-store';
import { getNodeDefinition } from '@/components/workflow/node-definitions';
import { ReportPreview } from '@/components/workflow/report-preview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { BioNodeData } from '@/types/workflow';
import type { BioSequence } from '@/types/sequence';
import { FastaInputLoader } from '@/components/workflow/fasta-input-loader';
import { toast } from 'sonner';

export function RightPanel() {
  const [reportOpen, setReportOpen] = useState(false);
  const rightPanelOpen = useUIStore((s) => s.rightPanelOpen);
  const setRightPanelOpen = useUIStore((s) => s.setRightPanelOpen);
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const nodes = useWorkflowStore((s) => s.nodes);

  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null;
  const nodeData = selectedNode?.data as unknown as BioNodeData | undefined;
  const bizType = nodeData?.type as string | undefined;
  const def = bizType ? getNodeDefinition(bizType) : null;

  const isOutputNode = bizType === 'report' || bizType === 'csv-export' || bizType === 'sequence-viewer';
  const upstreamResults = nodeData?.results && typeof nodeData.results === 'object' && 'upstream' in (nodeData.results as Record<string, unknown>)
    ? ((nodeData.results as Record<string, unknown>).upstream as unknown[])
    : [];

  return (
    <div
      className={cn(
        'border-l border-border bg-background transition-all duration-300 overflow-hidden',
        rightPanelOpen ? 'w-72' : 'w-0',
      )}
    >
      <div className="w-72 h-full flex flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Properties</h3>
          <button
            onClick={() => setRightPanelOpen(false)}
            className="rounded-lg p-1 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
          {selectedNode && nodeData && def ? (
            <>
              <div>
                <div className="text-xs text-muted-foreground mb-2">Node Type</div>
                <div className="flex items-center gap-2">
                  <Badge variant="info">{def.category}</Badge>
                  <span className="text-sm text-foreground">{def.label}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2">Description</div>
                <p className="text-sm text-foreground">{def.description}</p>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2">Status</div>
                <Badge
                  variant={
                    nodeData.status === 'complete' ? 'success' :
                    nodeData.status === 'running' ? 'info' :
                    nodeData.status === 'error' ? 'danger' : 'default'
                  }
                >
                  {nodeData.status}
                </Badge>
              </div>

              {bizType === 'fasta-input' && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Sequence Source</div>
                  <FastaInputLoader
                    nodeId={selectedNode.id}
                    currentData={(nodeData.config?.sequenceData as BioSequence[]) || null}
                  />
                </div>
              )}
              {nodeData.results != null && !isOutputNode && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Results</div>
                  <pre className="text-xs text-foreground font-mono bg-surface rounded-lg p-2 overflow-x-auto whitespace-pre-wrap break-all">
                    {JSON.stringify(nodeData.results, null, 2).slice(0, 500)}
                  </pre>
                </div>
              )}

              {isOutputNode && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Output Actions</div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (upstreamResults.length === 0) {
                        toast.error('Run the workflow first to generate results');
                        return;
                      }
                      setReportOpen(true);
                    }}
                    className="w-full justify-start"
                  >
                    <FileText size={14} /> Preview & Export Report
                  </Button>
                  <div className="grid grid-cols-2 gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (upstreamResults.length === 0) return toast.error('Run workflow first');
                        const json = JSON.stringify(upstreamResults, null, 2);
                        const blob = new Blob([json], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'workflow-results.json';
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success('Results exported as JSON');
                      }}
                      className="justify-start text-xs"
                    >
                      <FileJson size={12} /> JSON
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (upstreamResults.length === 0) return toast.error('Run workflow first');
                        if (upstreamResults.length > 0 && typeof upstreamResults[0] === 'object' && upstreamResults[0] !== null && 'overall' in upstreamResults[0]) {
                          const gc = upstreamResults[0] as { overall: number; at: number };
                          const csv = 'Metric,Value\nGC%,' + gc.overall + '\nAT%,' + gc.at;
                          const blob = new Blob([csv], { type: 'text/csv' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'gc-content.csv';
                          a.click();
                          URL.revokeObjectURL(url);
                        } else {
                          const csv = 'Upstream Results\n' + upstreamResults.map((_, i) => 'Result ' + (i + 1)).join('\n');
                          const blob = new Blob([csv], { type: 'text/csv' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'workflow-results.csv';
                          a.click();
                          URL.revokeObjectURL(url);
                        }
                        toast.success('Results exported as CSV');
                      }}
                      className="justify-start text-xs"
                    >
                      <FileSpreadsheet size={12} /> CSV
                    </Button>
                  </div>
                  <div className="rounded-lg bg-background/50 p-2 text-[11px] text-muted-foreground">
                    {upstreamResults.length > 0
                      ? `${upstreamResults.length} upstream result(s) ready`
                      : 'Run the workflow to generate output'}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-muted-foreground text-sm">No node selected</div>
              <p className="text-xs text-muted-foreground mt-1">
                Click a node to view its properties
              </p>
            </div>
          )}
        </div>
      </div>
      <ReportPreview
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        upstream={upstreamResults}
      />
    </div>
  );
}
