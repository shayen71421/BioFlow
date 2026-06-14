'use client';

import { useState, useCallback } from 'react';
import { X, FileText, FileJson, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui-store';
import { useWorkflowStore } from '@/store/workflow-store';
import { getNodeDefinition } from '@/components/workflow/node-definitions';
import { ReportPreview } from '@/components/workflow/report-preview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { BioNodeData } from '@/types/workflow';
import type { BioSequence } from '@/types/sequence';
import { FastaInputLoader } from '@/components/workflow/fasta-input-loader';
import { WorkflowResultCards } from '@/components/workflow/workflow-result-cards';
import type {
  GCResult, ORF, TranslationResult, AlignmentResult,
  MotifResult, RestrictionEnzymeResult, PrimerDesignResult,
  CodonUsageResult, ProteinPropertiesResult, FASTQResult, GenBankResult,
} from '@/types/sequence';
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

  const updateConfig = useWorkflowStore((s) => s.updateNodeData);
  const pushHistory = useWorkflowStore((s) => s.pushHistory);

  const updateConfigField = useCallback((field: string, value: unknown) => {
    if (!selectedNode || !nodeData) return;
    pushHistory();
    updateConfig(selectedNode.id, {
      config: { ...nodeData.config, [field]: value },
    } as Partial<BioNodeData>);
  }, [selectedNode, nodeData, pushHistory, updateConfig]);

  const isOutputNode = bizType === 'report' || bizType === 'csv-export' || bizType === 'sequence-viewer';
  const upstreamResults = (() => {
    if (!nodeData?.results || typeof nodeData.results !== 'object') return [];
    const obj = nodeData.results as Record<string, unknown>;
    if ('upstream' in obj && Array.isArray(obj.upstream)) return obj.upstream as unknown[];
    if (Array.isArray(nodeData.results) && nodeData.results.length > 0) return nodeData.results as unknown[];
    return [];
  })();

  const viewerSequences: BioSequence[] = upstreamResults.flatMap((r) => {
    if (Array.isArray(r)) return r.filter((x): x is BioSequence => typeof x === 'object' && x !== null && 'sequence' in x && 'header' in x);
    return [];
  });

  return (
    <div
      className={cn(
        'border-l border-border bg-background transition-all duration-300 overflow-hidden',
        rightPanelOpen ? 'w-80' : 'w-0',
      )}
    >
      <div className="w-80 h-full flex flex-col">
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

              {/* Config editors for analysis nodes */}
              {bizType === 'motif-search' && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Motif Pattern</div>
                  <Input
                    value={(nodeData.config?.motif as string) || ''}
                    onChange={(e) => updateConfigField('motif', e.target.value)}
                    placeholder="e.g. GAATTC, ATG, TATA"
                    className="font-mono text-xs"
                  />
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={(nodeData.config?.useRegex as boolean) || false}
                      onChange={(e) => updateConfigField('useRegex', e.target.checked)}
                      className="rounded border-border bg-surface"
                    />
                    Use regex
                  </label>
                </div>
              )}

              {bizType === 'gc-content' && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Window Size (bp)</div>
                  <Input
                    type="number"
                    min={10}
                    max={10000}
                    value={String(nodeData.config?.windowSize as number || 100)}
                    onChange={(e) => updateConfigField('windowSize', parseInt(e.target.value) || 100)}
                    className="font-mono text-xs"
                  />
                </div>
              )}

              {bizType === 'orf-finder' && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Min ORF Length (bp)</div>
                  <Input
                    type="number"
                    min={6}
                    max={10000}
                    value={String(nodeData.config?.minOrfLength as number || 30)}
                    onChange={(e) => updateConfigField('minOrfLength', parseInt(e.target.value) || 30)}
                    className="font-mono text-xs"
                  />
                </div>
              )}

              {bizType === 'restriction-enzyme' && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Enzymes (comma-separated)</div>
                  <Input
                    value={((nodeData.config?.enzymes as string[]) || []).join(', ')}
                    onChange={(e) => updateConfigField('enzymes', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                    placeholder="EcoRI, HindIII, BamHI"
                    className="font-mono text-xs"
                  />
                </div>
              )}

              {(bizType === 'alignment' || bizType === 'alignment-local') && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Alignment Parameters</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <div className="text-[10px] text-muted-foreground">Match</div>
                      <Input
                        type="number"
                        value={String(nodeData.config?.matchScore as number || 2)}
                        onChange={(e) => updateConfigField('matchScore', parseInt(e.target.value) || 2)}
                        className="font-mono text-xs"
                      />
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground">Mismatch</div>
                      <Input
                        type="number"
                        value={String(nodeData.config?.mismatchScore as number || -1)}
                        onChange={(e) => updateConfigField('mismatchScore', parseInt(e.target.value) || -1)}
                        className="font-mono text-xs"
                      />
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground">Gap</div>
                      <Input
                        type="number"
                        value={String(nodeData.config?.gapPenalty as number || -2)}
                        onChange={(e) => updateConfigField('gapPenalty', parseInt(e.target.value) || -2)}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Second Sequence</div>
                    <Input
                      value={(nodeData.config?.sequence2 as string) || ''}
                      onChange={(e) => updateConfigField('sequence2', e.target.value)}
                      placeholder="Paste second sequence here"
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {nodeData.results != null && !isOutputNode && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Results</div>
                  <WorkflowResultCards result={nodeData.results} />
                </div>
              )}

              {isOutputNode && (
                <div className="space-y-3">
                  {bizType === 'sequence-viewer' && viewerSequences.length > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-2">Sequence Data</div>
                      {viewerSequences.map((seq) => (
                        <div key={seq.id} className="rounded-lg bg-background/50 p-2 text-[11px] font-mono space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="truncate text-success font-medium">{seq.header}</span>
                            <span className="text-muted-foreground shrink-0 ml-2">{seq.length.toLocaleString()} bp</span>
                          </div>
                          <div className="max-h-40 overflow-y-auto break-all text-muted-foreground leading-relaxed">
                            {seq.sequence.match(/.{1,80}/g)?.map((line, i) => (
                              <div key={i} className="hover:text-foreground">{line}</div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                        const rows: string[] = ['Node,Type,Key,Value'];
                        for (const r of upstreamResults) {
                          if (!r || typeof r !== 'object') continue;
                          const obj = r as Record<string, unknown>;
                          if ('overall' in obj) {
                            const gc = obj as unknown as GCResult;
                            rows.push(`GC Content,analysis,GC%,${gc.overall.toFixed(1)}`);
                            rows.push(`GC Content,analysis,AT%,${gc.at.toFixed(1)}`);
                          } else if ('frames' in obj) {
                            const tr = obj as unknown as TranslationResult;
                            for (const f of tr.frames) {
                              rows.push(`Translation,analysis,Frame ${f.frame},${f.aa.length} aa`);
                            }
                          } else if (Array.isArray(r) && r.length > 0 && typeof r[0] === 'object' && 'start' in (r[0] as Record<string, unknown>)) {
                            const orfs = r as unknown as ORF[];
                            rows.push(`ORF Finder,analysis,ORFs found,${orfs.length}`);
                          } else if ('aligned1' in obj) {
                            const al = obj as unknown as AlignmentResult;
                            rows.push(`Alignment,analysis,Score,${al.score}`);
                            rows.push(`Alignment,analysis,Identity,${al.identityPercent.toFixed(1)}%`);
                          } else if ('totalMatches' in obj) {
                            const mr = obj as unknown as MotifResult;
                            rows.push(`Motif Search,analysis,Matches,${mr.totalMatches}`);
                          } else if ('totalCuts' in obj) {
                            const re = obj as unknown as RestrictionEnzymeResult;
                            rows.push(`Restriction,analysis,Total cuts,${re.totalCuts}`);
                            for (const [enz, count] of Object.entries(re.enzymeCounts)) {
                              rows.push(`Restriction,analysis,${enz},${count} cuts`);
                            }
                          } else if ('pairs' in obj) {
                            const pd = obj as unknown as PrimerDesignResult;
                            rows.push(`Primer Design,analysis,Pairs,${pd.pairs.length}`);
                          } else if ('preferredCodons' in obj) {
                            const cu = obj as unknown as CodonUsageResult;
                            rows.push(`Codon Usage,analysis,Codons,${cu.codons.length}`);
                            rows.push(`Codon Usage,analysis,Preferred,${cu.preferredCodons.length}`);
                            rows.push(`Codon Usage,analysis,Rare,${cu.rareCodons.length}`);
                          } else if ('molecularWeight' in obj) {
                            const pp = obj as unknown as ProteinPropertiesResult;
                            rows.push(`Protein Properties,analysis,MW,${(pp.molecularWeight / 1000).toFixed(1)} kDa`);
                            rows.push(`Protein Properties,analysis,pI,${pp.isoelectricPoint.toFixed(2)}`);
                          } else if ('totalReads' in obj) {
                            const fq = obj as unknown as FASTQResult;
                            rows.push(`FASTQ,analysis,Reads,${fq.totalReads}`);
                            rows.push(`FASTQ,analysis,Avg Quality,${fq.avgQuality.toFixed(1)}`);
                          } else if ('accession' in obj) {
                            const gb = obj as unknown as GenBankResult;
                            rows.push(`GenBank,analysis,Accession,${gb.accession}`);
                            rows.push(`GenBank,analysis,Features,${gb.features.length}`);
                          }
                        }
                        const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'workflow-results.csv';
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success('Results exported as CSV');
                      }}
                      className="justify-start text-xs"
                    >
                      <FileSpreadsheet size={12} /> CSV
                    </Button>
                  </div>
                  <div className="rounded-lg bg-background/50 p-2 text-[11px] text-muted-foreground">
                    {upstreamResults.length > 0 ? (
                      <div className="space-y-1">
                        <p>{upstreamResults.length} result(s) collected</p>
                        {upstreamResults.map((r, i) => {
                          if (!r || typeof r !== 'object') return null;
                          const obj = r as Record<string, unknown>;
                          let label = `Result ${i + 1}`;
                          if ('overall' in obj) label = 'GC Content';
                          else if ('frames' in obj) label = 'Translation';
                          else if (Array.isArray(r) && r.length > 0 && typeof r[0] === 'object' && 'start' in r[0]) label = 'ORF Finder';
                          else if ('aligned1' in obj) label = 'Alignment';
                          else if ('totalMatches' in obj) label = 'Motif Search';
                          else if ('totalCuts' in obj) label = 'Restriction Analysis';
                          else if ('pairs' in obj) label = 'Primer Design';
                          else if ('preferredCodons' in obj) label = 'Codon Usage';
                          else if ('molecularWeight' in obj) label = 'Protein Properties';
                          else if ('totalReads' in obj) label = 'FASTQ Analysis';
                          else if ('accession' in obj) label = 'GenBank Entry';
                          else if (Array.isArray(r) && r.length > 0 && typeof r[0] === 'object' && 'sequence' in r[0]) label = 'Sequence';
                          return (
                            <div key={i} className="flex items-center gap-1.5 text-[10px]">
                              <Badge variant="info" className="px-1 py-0 text-[8px]">{label}</Badge>
                              <span className="text-muted-foreground">✓</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      'Run the workflow to generate output'
                    )}
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
