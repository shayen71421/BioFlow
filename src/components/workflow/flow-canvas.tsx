'use client';

import { useCallback, useRef, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  SelectionMode,
  BackgroundVariant,
  ReactFlowProvider,
  type Node,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import BaseNode from './nodes/base-node';
import AnimatedEdge from './edges/animated-edge';
import { useWorkflowStore } from '@/store/workflow-store';
import { useUIStore } from '@/store/ui-store';

const nodeTypes = { bioNode: BaseNode };
const edgeTypes = { animated: AnimatedEdge };

export function FlowCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<ReactFlowInstance | null>(null);

  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const onNodesChange = useWorkflowStore((s) => s.onNodesChange);
  const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange);
  const onConnect = useWorkflowStore((s) => s.onConnect);
  const addNode = useWorkflowStore((s) => s.addNode);
  const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode);
  const removeNode = useWorkflowStore((s) => s.removeNode);
  const duplicateNode = useWorkflowStore((s) => s.duplicateNode);

  const setRightPanelOpen = useUIStore((s) => s.setRightPanelOpen);
  const setRightPanelView = useUIStore((s) => s.setRightPanelView);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
      setRightPanelOpen(true);
      setRightPanelView('properties');
    },
    [setSelectedNode, setRightPanelOpen, setRightPanelView],
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setRightPanelOpen(false);
  }, [setSelectedNode, setRightPanelOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
        const sel = useWorkflowStore.getState().selectedNodeId;
        if (sel) removeNode(sel);
      }
      if (e.key === 'd' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        const sel = useWorkflowStore.getState().selectedNodeId;
        if (sel) duplicateNode(sel);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [removeNode, duplicateNode]);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    flowRef.current = instance;
  }, []);

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'animated' as const,
      style: { stroke: '#1E293B', strokeWidth: 2 },
    }),
    [],
  );

  return (
    <div ref={containerRef} className="h-full w-full">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={onInit}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          selectionMode={SelectionMode.Partial}
          minZoom={0.1}
          maxZoom={4}
          fitView
          colorMode="dark"
          deleteKeyCode={null}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#1E293B"
          />
          <Controls
            showInteractive={false}
            className="!bg-surface !border-border !shadow-lg"
          />
          <MiniMap
            nodeColor={() => '#1E293B'}
            maskColor="rgba(10, 14, 23, 0.8)"
            style={{ background: '#111827' }}
            className="!border-border !rounded-xl !shadow-lg"
            pannable
            zoomable
          />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
