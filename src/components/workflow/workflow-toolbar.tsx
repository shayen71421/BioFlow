'use client';

import {
  Play, Download, Upload, Trash2, Save, ImageIcon, Code,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { useWorkflowStore } from '@/store/workflow-store';
import { useUIStore } from '@/store/ui-store';
import { useSequenceStore } from '@/store/sequence-store';
import { exportToCommand } from '@/lib/workflow/export';
import { toast } from 'sonner';
import { useRef } from 'react';

export function WorkflowToolbar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const runWorkflow = useWorkflowStore((s) => s.runWorkflow);
  const isRunning = useWorkflowStore((s) => s.isRunning);
  const clearCanvas = useWorkflowStore((s) => s.clearCanvas);
  const downloadWorkflow = useWorkflowStore((s) => s.downloadWorkflow);
  const importWorkflow = useWorkflowStore((s) => s.importWorkflow);
  const saveWorkflow = useWorkflowStore((s) => s.saveWorkflow);
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const sequences = useSequenceStore((s) => s.sequences);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);

  const handleRun = async () => {
    if (isRunning) return;
    const hasNodeSeq = nodes.some(
      (n) => (n.data as Record<string, unknown>)?.config &&
        typeof (n.data as Record<string, unknown>).config === 'object' &&
        !!((n.data as Record<string, unknown>).config as Record<string, unknown>)?.sequenceData,
    );
    if (sequences.length === 0 && !hasNodeSeq) {
      toast.error('No sequence loaded. Load a FASTA file into a FASTA Input node or use BioDrop Explorer first.');
      return;
    }
    await runWorkflow(sequences);
    toast.success('Workflow executed successfully');
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        importWorkflow(ev.target?.result as string);
        toast.success('Workflow imported');
      } catch {
        toast.error('Invalid workflow file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportImage = async () => {
    const { toPng } = await import('html-to-image');
    const el = document.querySelector('.react-flow') as HTMLElement;
    if (!el) return;
    const dataUrl = await toPng(el, { backgroundColor: '#0A0E17' });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'workflow.png';
    a.click();
    toast.success('Workflow image exported');
  };

  const handleShowCommand = () => {
    const cmd = exportToCommand(nodes, edges);
    navigator.clipboard.writeText(cmd);
    toast.success('Command copied to clipboard');
  };

  const handleSave = () => {
    const name = `Workflow ${new Date().toLocaleDateString()}`;
    saveWorkflow(name);
    toast.success('Workflow saved');
  };

  return (
    <div className="flex items-center gap-2 p-2">
      <Tooltip content="Run Workflow">
        <Button
          size="sm"
          variant={isRunning ? 'secondary' : 'primary'}
          onClick={handleRun}
          disabled={isRunning}
        >
          <Play size={14} />
          {isRunning ? 'Running...' : 'Run'}
        </Button>
      </Tooltip>

      <div className="h-6 w-px bg-border" />

      <Tooltip content="Export JSON">
        <Button size="sm" variant="ghost" onClick={downloadWorkflow}>
          <Download size={14} />
        </Button>
      </Tooltip>

      <Tooltip content="Import JSON">
        <Button size="sm" variant="ghost" onClick={handleImport}>
          <Upload size={14} />
        </Button>
      </Tooltip>

      <Tooltip content="Export as Image">
        <Button size="sm" variant="ghost" onClick={handleExportImage}>
          <ImageIcon size={14} />
        </Button>
      </Tooltip>

      <Tooltip content="Copy CLI Command">
        <Button size="sm" variant="ghost" onClick={handleShowCommand}>
          <Code size={14} />
        </Button>
      </Tooltip>

      <div className="h-6 w-px bg-border" />

      <Tooltip content="Save Workflow">
        <Button size="sm" variant="ghost" onClick={handleSave}>
          <Save size={14} />
        </Button>
      </Tooltip>

      <Tooltip content="Clear Canvas">
        <Button size="sm" variant="ghost" onClick={clearCanvas}>
          <Trash2 size={14} />
        </Button>
      </Tooltip>

      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {nodes.length} nodes
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <span className="text-xs">Add Node</span>
          <kbd className="ml-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
            Space
          </kbd>
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
