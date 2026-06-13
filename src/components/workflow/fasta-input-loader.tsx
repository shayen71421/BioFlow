'use client';

import { useRef, useCallback, useState } from 'react';
import { Upload, Dna, Globe, Search, FlaskConical, Loader2, FolderOpen, FileDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseFasta, formatFasta } from '@/lib/bio/fasta-parser';
import { useWorkflowStore } from '@/store/workflow-store';
import { toast } from 'sonner';
import type { BioSequence } from '@/types/sequence';
import { E_COLI_K12 } from '@/data/examples/ecoli-k12';
import { SARS_COV2_SPIKE } from '@/data/examples/sars-cov2-spike';
import { BRCA1_FRAGMENT } from '@/data/examples/brca1';
import { Button } from '@/components/ui/button';

interface FastaInputLoaderProps {
  nodeId: string;
  currentData: BioSequence[] | null;
}

const DEMOS = [
  { label: 'E. coli K12', data: E_COLI_K12 },
  { label: 'SARS-CoV-2 Spike', data: SARS_COV2_SPIKE },
  { label: 'BRCA1 Exon 11', data: BRCA1_FRAGMENT },
];

type Tab = 'upload' | 'url' | 'search';

const NCBI_SEARCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=nucleotide&retmax=10&retmode=json&term=';
const NCBI_FETCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nucleotide&rettype=fasta&retmode=text&id=';

interface SearchResult {
  id: string;
  title: string;
  length: number;
}

export function FastaInputLoader({ nodeId, currentData }: FastaInputLoaderProps) {
  const [tab, setTab] = useState<Tab>('upload');
  const [dragging, setDragging] = useState(false);
  const [url, setUrl] = useState('');
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [fetchingSearchId, setFetchingSearchId] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workspaceRef = useRef<FileSystemDirectoryHandle | null>(null);
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

  const pickWorkspace = async () => {
    if (!('showDirectoryPicker' in window)) {
      toast.error('Workspace folders require Chrome, Edge, or Opera');
      return;
    }
    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      workspaceRef.current = handle;
      setWorkspaceName(handle.name);
      toast.success(`Workspace set: ${handle.name}`);
    } catch {
      // user cancelled the picker
    }
  };

  const saveToWorkspace = async (seqs: BioSequence[]) => {
    if (!workspaceRef.current) {
      await pickWorkspace();
      if (!workspaceRef.current) return;
    }
    try {
      const name = seqs[0].header.slice(0, 40).replace(/[^a-zA-Z0-9_-]/g, '_') + '.fasta';
      const fileHandle = await workspaceRef.current.getFileHandle(name, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(formatFasta(seqs));
      await writable.close();
      toast.success(`Saved to workspace: ${name}`);
    } catch (e) {
      toast.error('Failed to save to workspace — permission may have been revoked');
      workspaceRef.current = null;
      setWorkspaceName(null);
    }
  };

  const storeSequence = (seqs: BioSequence[], saveToWs = false) => {
    updateNodeData(nodeId, {
      config: { sequenceData: seqs },
      results: seqs,
    } as Record<string, unknown>);
    toast.success(`Loaded ${seqs[0].header} (${seqs[0].length.toLocaleString()} bp)`);
    if (saveToWs) saveToWorkspace(seqs);
  };

  const fetchAndStore = async (fetchUrl: string) => {
    setFetchingUrl(true);
    try {
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const parsed = parseFasta(text);
      if (parsed.length === 0) {
        toast.error('No sequences found at this URL');
        return;
      }
      storeSequence(parsed);
      if (workspaceRef.current) saveToWorkspace(parsed);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to fetch URL');
    } finally {
      setFetchingUrl(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragging(true);
    else if (e.type === 'dragleave') setDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    Array.from(e.dataTransfer.files).forEach(handleFile);
  }, [nodeId]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach(handleFile);
    e.target.value = '';
  };

  const handleFile = (file: File) => {
    if (!/\.(fasta|fa|fna)$/i.test(file.name)) {
      toast.error('Please select a FASTA file (.fasta, .fa, .fna)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseFasta(text);
      if (parsed.length === 0) {
        toast.error('No sequences found in file');
        return;
      }
      storeSequence(parsed);
      if (workspaceRef.current) saveToWorkspace(parsed);
    };
    reader.readAsText(file);
  };

  const handleDemo = (demo: typeof DEMOS[0]) => {
    const seqs = [{
      id: demo.data.id,
      header: demo.data.header,
      sequence: demo.data.sequence,
      length: demo.data.sequence.length,
    }];
    storeSequence(seqs);
    if (workspaceRef.current) saveToWorkspace(seqs);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults(null);
    try {
      const res = await fetch(NCBI_SEARCH + encodeURIComponent(searchQuery));
      const data = await res.json();
      const ids = data?.esearchresult?.idlist as string[] | undefined;
      if (!ids || ids.length === 0) {
        toast.error('No results found');
        return;
      }
      const summaryRes = await fetch(
        'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=nucleotide&retmode=json&id=' + ids.join(','),
      );
      const summaryData = await summaryRes.json();
      const results: SearchResult[] = ids.map((id: string) => {
        const u = summaryData?.result?.[id];
        return {
          id,
          title: u?.title || u?.caption || `Sequence ${id}`,
          length: u?.slen || 0,
        };
      });
      setSearchResults(results);
    } catch (e) {
      toast.error('Search failed — NCBI API may be rate-limited');
    } finally {
      setSearching(false);
    }
  };

  const handleFetchSearchResult = async (id: string) => {
    setFetchingSearchId(id);
    try {
      const res = await fetch(NCBI_FETCH + id);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const parsed = parseFasta(text);
      if (parsed.length > 0) {
        storeSequence(parsed);
        if (workspaceRef.current) saveToWorkspace(parsed);
      } else toast.error('Failed to parse sequence');
    } catch {
      toast.error('Failed to fetch sequence from NCBI');
    } finally {
      setFetchingSearchId(null);
    }
  };

  if (currentData && currentData.length > 0) {
    const seqLength = currentData[0].length;
    const tooLarge = seqLength > 100000;
    return (
      <div className="space-y-2">
        <div className="rounded-lg bg-success/10 border border-success/20 p-2.5">
          <div className="flex items-center gap-2">
            <Dna size={14} className="text-success" />
            <span className="text-xs font-medium text-foreground truncate flex-1">
              {currentData[0].header}
            </span>
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground font-mono">
            {seqLength.toLocaleString()} bp
          </div>
        </div>
        {tooLarge && (
          <div className="rounded-lg border border-warning/20 bg-warning/5 p-2 text-[10px] text-warning">
            Large sequence — stored in memory only (not saved to local storage).
            Set a workspace folder below to auto-save to disk.
          </div>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            updateNodeData(nodeId, {
              config: { sequenceData: null },
              results: undefined,
            } as Record<string, unknown>);
          }}
          className="w-full justify-center text-xs"
        >
          Clear & Reload
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5">
        {!('showDirectoryPicker' in window) ? (
          <>
            <FileDown size={12} className="text-muted-foreground shrink-0" />
            <span className="text-[10px] text-muted-foreground flex-1">Workspace requires Chrome/Edge</span>
            <span className="text-[9px] text-warning font-mono">⚠</span>
          </>
        ) : workspaceName ? (
          <>
            <FolderOpen size={12} className="text-primary shrink-0" />
            <span className="text-[10px] text-foreground flex-1 truncate">{workspaceName}</span>
            <button
              onClick={pickWorkspace}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              Change
            </button>
          </>
        ) : (
          <>
            <FileDown size={12} className="text-muted-foreground shrink-0" />
            <span className="text-[10px] text-muted-foreground flex-1">Auto-save to workspace folder</span>
            <button
              onClick={pickWorkspace}
              className="text-[10px] text-primary hover:text-primary/80 transition-colors shrink-0 font-medium"
            >
              Set Folder
            </button>
          </>
        )}
      </div>

      <div className="flex gap-0.5 rounded-lg bg-background p-0.5 border border-border">
        {(['upload', 'url', 'search'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSearchResults(null); }}
            className={cn(
              'flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors',
              tab === t
                ? 'bg-surface text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t === 'upload' ? <Upload size={11} /> : t === 'url' ? <Globe size={11} /> : <Search size={11} />}
            {t === 'upload' ? 'File' : t === 'url' ? 'URL' : 'Search'}
          </button>
        ))}
      </div>

      {tab === 'upload' && (
        <>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-3 transition-all',
              dragging
                ? 'border-primary bg-primary/5 scale-[1.02]'
                : 'border-border hover:border-primary/50 hover:bg-surface/50',
            )}
          >
            <Upload size={16} className={dragging ? 'text-primary' : 'text-muted-foreground'} />
            <p className="mt-1.5 text-xs text-muted-foreground">Drop FASTA or click to browse</p>
            <div className="mt-1 flex gap-1">
              {['.fasta', '.fa', '.fna'].map((ext) => (
                <span key={ext} className="rounded bg-background px-1.5 py-0.5 text-[9px] text-muted-foreground font-mono">{ext}</span>
              ))}
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept=".fasta,.fa,.fna" className="hidden" onChange={handleFileInput} />
        </>
      )}

      {tab === 'url' && (
        <div className="space-y-2">
          <div className="text-[10px] text-muted-foreground">
            Paste a URL to a FASTA file or NCBI E-utilities link
          </div>
          <div className="flex gap-1">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/sequence.fasta"
              className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors font-mono"
              onKeyDown={(e) => e.key === 'Enter' && url && fetchAndStore(url)}
            />
            <Button
              size="sm"
              variant="primary"
              onClick={() => fetchAndStore(url)}
              disabled={!url || fetchingUrl}
              className="shrink-0"
            >
              {fetchingUrl ? <Loader2 size={12} className="animate-spin" /> : <Globe size={12} />}
              Fetch
            </Button>
          </div>
        </div>
      )}

      {tab === 'search' && (
        <div className="space-y-2">
          <div className="flex gap-1">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Homo sapiens BRCA1"
              className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              size="sm"
              variant="primary"
              onClick={handleSearch}
              disabled={!searchQuery.trim() || searching}
              className="shrink-0"
            >
              {searching ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
              Search
            </Button>
          </div>

          {searching && (
            <div className="flex items-center justify-center py-4">
              <Loader2 size={16} className="animate-spin text-muted-foreground" />
            </div>
          )}

          {searchResults && searchResults.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-2">No results found</div>
          )}

          {searchResults && searchResults.length > 0 && (
            <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
              {searchResults.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleFetchSearchResult(r.id)}
                  disabled={fetchingSearchId === r.id}
                  className="flex w-full items-center gap-2 rounded-lg border border-border px-2.5 py-2 text-left hover:bg-surface-hover transition-colors disabled:opacity-50"
                >
                  {fetchingSearchId === r.id ? (
                    <Loader2 size={12} className="animate-spin text-primary shrink-0" />
                  ) : (
                    <Dna size={12} className="text-primary shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-medium text-foreground truncate">{r.title}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {r.length.toLocaleString()} bp • NCBI:{r.id}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {tab !== 'search' && (
        <>
          <div className="text-[10px] text-muted-foreground">Or load a demo:</div>
          <div className="grid grid-cols-1 gap-1">
            {DEMOS.map((demo) => (
              <button
                key={demo.label}
                onClick={() => handleDemo(demo)}
                className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-xs text-foreground hover:bg-surface-hover transition-colors text-left"
              >
                <FlaskConical size={12} className="text-primary" />
                {demo.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
