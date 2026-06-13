'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Node, Edge, OnNodesChange, OnEdgesChange, OnConnect } from '@xyflow/react';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import type { BioNodeData, NodeType } from '@/types/workflow';
import { generateId } from '@/lib/utils';
import { NODE_DEFINITIONS } from '@/components/workflow/node-definitions';
import { validateConnection } from '@/lib/workflow/validation';
import { executeWorkflow, type ExecutionContext } from '@/lib/workflow/execution';
import type { BioSequence } from '@/types/sequence';
import type { WorkflowTemplate } from '@/lib/workflow/templates';

function stripSequenceData(obj: { nodes?: { data?: Record<string, unknown> }[] }): typeof obj {
  if (!obj.nodes) return obj;
  return {
    ...obj,
    nodes: obj.nodes.map((n) => {
      if (!n.data) return n;
      const data = { ...n.data };
      if (data.config && typeof data.config === 'object') {
        data.config = { ...(data.config as Record<string, unknown>) };
        delete (data.config as Record<string, unknown>).sequenceData;
      }
      delete data.results;
      data.status = 'idle' as const;
      return { ...n, data };
    }),
  };
}

interface HistoryEntry {
  nodes: Node[];
  edges: Edge[];
}

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  isRunning: boolean;
  executionError: string | null;
  executionContext: ExecutionContext | null;
  nodeResultCache: Map<string, { result: unknown; hash: string }>;

  history: HistoryEntry[];
  historyIndex: number;

  savedWorkflows: { id: string; name: string; data: string; updatedAt: number }[];

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  addNode: (type: NodeType, position?: { x: number; y: number }) => void;
  removeNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  updateNodeData: (id: string, data: Partial<BioNodeData>) => void;
  setSelectedNode: (id: string | null) => void;
  clearCanvas: () => void;

  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  runWorkflow: (sequences: BioSequence[], changedNodeIds?: string[]) => Promise<void>;

  importWorkflow: (json: string) => void;
  exportWorkflow: () => string;
  downloadWorkflow: () => void;

  saveWorkflow: (name: string) => void;
  loadWorkflow: (id: string) => void;
  loadTemplate: (template: WorkflowTemplate) => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      isRunning: false,
      executionError: null,
      executionContext: null,
      nodeResultCache: new Map(),
      history: [],
      historyIndex: -1,
      savedWorkflows: [],

      onNodesChange: (changes) => {
        set({ nodes: applyNodeChanges(changes, get().nodes) as Node[] });
      },

      onEdgesChange: (changes) => {
        set({ edges: applyEdgeChanges(changes, get().edges) });
      },

      onConnect: (connection) => {
        const { nodes, edges } = get();
        const sourceNode = nodes.find((n) => n.id === connection.source);
        const targetNode = nodes.find((n) => n.id === connection.target);

        if (!sourceNode || !targetNode) return;

        const validation = validateConnection(sourceNode.type || '', targetNode.type || '');
        if (!validation.valid) return;

        const newEdge: Edge = {
          id: `edge-${generateId()}`,
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle || undefined,
          targetHandle: connection.targetHandle || undefined,
          type: 'animated',
          animated: true,
          style: { stroke: '#00D4AA', strokeWidth: 2 },
        };

        set({ edges: addEdge(newEdge, edges) });
      },

      addNode: (type, position) => {
        const def = NODE_DEFINITIONS.find((d) => d.type === type);
        if (!def) return;

        const id = `node-${generateId()}`;
        const newNode: Node = {
          id,
          type: 'bioNode',
          position: position || {
            x: Math.random() * 400 + 100,
            y: Math.random() * 300 + 100,
          },
          data: {
            type: def.type,
            label: def.label,
            description: def.description,
            icon: def.icon,
            category: def.category,
            status: 'idle',
            config: {},
          },
        };

        get().pushHistory();
        set({ nodes: [...get().nodes, newNode] });
      },

      removeNode: (id) => {
        get().pushHistory();
        set({
          nodes: get().nodes.filter((n) => n.id !== id),
          edges: get().edges.filter((e) => e.source !== id && e.target !== id),
          selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
        });
      },

      duplicateNode: (id) => {
        const node = get().nodes.find((n) => n.id === id);
        if (!node) return;

        const newId = `node-${generateId()}`;
        const newNode: Node = {
          ...node,
          id: newId,
          position: { x: node.position.x + 50, y: node.position.y + 50 },
          data: { ...node.data, status: 'idle', results: undefined },
          selected: false,
        };

        get().pushHistory();
        set({ nodes: [...get().nodes, newNode] });
      },

      updateNodeData: (id, data) => {
        set({
          nodes: get().nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
          ),
        });
      },

      setSelectedNode: (id) => set({ selectedNodeId: id }),

      clearCanvas: () => {
        get().pushHistory();
        set({ nodes: [], edges: [], selectedNodeId: null, executionError: null, executionContext: null, nodeResultCache: new Map() });
      },

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < 0) return;

        const entry = history[historyIndex];
        set({
          nodes: entry.nodes,
          edges: entry.edges,
          historyIndex: historyIndex - 1,
        });
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex >= history.length - 2) return;

        const entry = history[historyIndex + 2];
        if (!entry) return;

        set({
          nodes: entry.nodes,
          edges: entry.edges,
          historyIndex: historyIndex + 1,
        });
      },

      pushHistory: () => {
        const { nodes, edges, history, historyIndex } = get();
        const entry: HistoryEntry = {
          nodes: JSON.parse(JSON.stringify(nodes)),
          edges: JSON.parse(JSON.stringify(edges)),
        };

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(entry);
        if (newHistory.length > 50) newHistory.shift();

        set({ history: newHistory, historyIndex: newHistory.length - 1 });
      },

      runWorkflow: async (sequences: BioSequence[], changedNodeIds?: string[]) => {
        const { nodes, edges, nodeResultCache } = get();
        set({ isRunning: true, executionError: null });

        try {
          set({
            nodes: nodes.map((n) => ({
              ...n,
              data: { ...n.data, status: 'idle', results: undefined } as unknown as BioNodeData,
            })),
          });

          const ctx = await executeWorkflow(
            nodes,
            edges,
            sequences,
            (nodeId, status, results) => {
              set({
                nodes: get().nodes.map((n) =>
                  n.id === nodeId
                    ? { ...n, data: { ...n.data, status, results } }
                    : n,
                ),
              });
            },
            nodeResultCache,
            changedNodeIds,
          );

          set({ isRunning: false, executionContext: ctx, nodeResultCache: ctx.nodeCache });
        } catch (error) {
          set({
            isRunning: false,
            executionError: error instanceof Error ? error.message : 'Workflow execution failed',
          });
        }
      },

      importWorkflow: (json: string) => {
        try {
          const data = JSON.parse(json);
          if (data.nodes && data.edges) {
            get().pushHistory();
            set({
              nodes: data.nodes.map((n: Node) => ({
                ...n,
                type: 'bioNode',
                data: { ...(n.data as BioNodeData), status: 'idle' },
              })),
              edges: data.edges,
            });
          }
        } catch {
          throw new Error('Invalid workflow JSON');
        }
      },

      exportWorkflow: () => {
        const { nodes, edges } = get();
        return JSON.stringify(
          {
            version: '2.0',
            createdAt: new Date().toISOString(),
            nodes: nodes.map((n) => {
              const data = { ...(n.data as BioNodeData) };
              const cleanConfig = { ...data.config };
              delete (cleanConfig as Record<string, unknown>).sequenceData;
              return {
                id: n.id,
                type: n.type,
                position: n.position,
                data: {
                  label: data.label,
                  description: data.description,
                  icon: data.icon,
                  config: cleanConfig,
                },
              };
            }),
            edges: edges.map((e) => ({
              id: e.id,
              source: e.source,
              target: e.target,
            })),
          },
          null,
          2,
        );
      },

      downloadWorkflow: () => {
        const json = get().exportWorkflow();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'workflow.bioflow.json';
        a.click();
        URL.revokeObjectURL(url);
      },

      saveWorkflow: (name: string) => {
        const json = get().exportWorkflow();
        const id = generateId();
        set({
          savedWorkflows: [
            ...get().savedWorkflows.filter((w) => w.name !== name),
            { id, name, data: json, updatedAt: Date.now() },
          ],
        });
      },

      loadWorkflow: (id: string) => {
        const workflow = get().savedWorkflows.find((w) => w.id === id);
        if (workflow) {
          get().importWorkflow(workflow.data);
        }
      },

      loadTemplate: (template: WorkflowTemplate) => {
        get().pushHistory();
        set({
          nodes: template.nodes.map((n) => ({
            id: n.id,
            type: 'bioNode',
            position: n.position,
            data: {
              ...NODE_DEFINITIONS.find((d) => d.type === n.type),
              status: 'idle',
              config: (n.data || {}) as Record<string, unknown>,
            } as BioNodeData,
          })),
          edges: template.edges.map((e) => ({
            id: `edge-${generateId()}`,
            source: e.source,
            target: e.target,
            type: 'animated',
            animated: true,
            style: { stroke: '#00D4AA', strokeWidth: 2 },
          })),
        });
      },
    }),
    {
      name: 'bioflow-workflow',
      storage: createJSONStorage(() => ({
        getItem: (key) => {
          try { return localStorage.getItem(key); }
          catch { return null; }
        },
        setItem: (key, value) => {
          try {
            localStorage.setItem(key, value);
          } catch (e) {
            if (e instanceof DOMException && e.name === 'QuotaExceededError') {
              const size = new TextEncoder().encode(value).length;
              console.warn(`[BioFlow] localStorage quota exceeded (${(size / 1024 / 1024).toFixed(1)}MB). Clearing saved workflows.`);
              try {
                const existing = JSON.parse(localStorage.getItem(key) || '{}');
                existing.state = existing.state || {};
                existing.state.savedWorkflows = [];
                localStorage.setItem(key, JSON.stringify(existing));
              } catch {
                localStorage.removeItem(key);
              }
            }
          }
        },
        removeItem: (key) => {
          try { localStorage.removeItem(key); }
          catch { /* noop */ }
        },
      })),
      partialize: (state) => ({
        savedWorkflows: state.savedWorkflows.map((w) => {
          try {
            const parsed = JSON.parse(w.data);
            const clean = stripSequenceData(parsed);
            return { ...w, data: JSON.stringify(clean) };
          } catch { return w; }
        }),
        nodes: state.nodes.map((n) => {
          const data = { ...(n.data as Record<string, unknown>) };
          if (data.config && typeof data.config === 'object') {
            data.config = { ...(data.config as Record<string, unknown>) };
            delete (data.config as Record<string, unknown>).sequenceData;
          }
          delete data.results;
          data.status = 'idle' as const;
          return { ...n, data };
        }),
        edges: state.edges,
      }),
      version: 4,
      migrate: (persisted: unknown) => {
        const p = persisted as { version?: number };
        if (p?.version === 3) {
          return { ...(persisted as Record<string, unknown>), version: 4, nodeResultCache: [] };
        }
        return persisted;
      },
    },
  ),
);
