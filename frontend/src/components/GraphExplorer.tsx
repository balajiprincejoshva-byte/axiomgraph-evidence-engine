"use client";

import { useCallback } from 'react';
import { useTheme } from 'next-themes';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export function GraphExplorer({ data }: { data: { nodes: any[], edges: any[] } }) {
  const { theme } = useTheme();
  
  // Apply styles based on theme
  const layoutedNodes = data.nodes.map((node, i) => {
      const baseStyle = {
      background: theme === 'dark' ? '#0f172a' : '#ffffff',
      color: theme === 'dark' ? '#34d399' : '#0f172a',
      border: theme === 'dark' ? '1px solid #059669' : '1px solid #cbd5e1',
      borderRadius: '2px',
      padding: '12px 16px',
      fontSize: '12px',
      fontFamily: 'monospace',
      fontWeight: 'bold',
      width: 180,
      textAlign: 'center' as const,
      boxShadow: theme === 'dark' ? '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)' : 'none'
    };

    // Auto layout for global graph nodes
    if (node.position.x === 250 && node.position.y === 250) {
      const radius = 250;
      const angle = (i / data.nodes.length) * 2 * Math.PI;
      return {
        ...node,
        position: {
          x: 400 + radius * Math.cos(angle),
          y: 300 + radius * Math.sin(angle)
        },
        style: baseStyle
      };
    }
    return {
      ...node,
      style: baseStyle
    };
  });

  // Deduplicate edges between same nodes
  const mergedEdgesMap = new Map<string, any>();
  data.edges.forEach(e => {
    const key = `${e.source}-${e.target}`;
    if (mergedEdgesMap.has(key)) {
       const existing = mergedEdgesMap.get(key);
       if (!existing.label.includes(e.label)) {
          existing.label += ` | ${e.label}`;
       }
    } else {
       mergedEdgesMap.set(key, { ...e });
    }
  });

  const formattedEdges = Array.from(mergedEdgesMap.values()).map(e => ({
    ...e,
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: theme === 'dark' ? '#10b981' : '#0891b2' },
    style: { stroke: theme === 'dark' ? '#059669' : '#0891b2', strokeWidth: 2 },
    labelStyle: { fill: theme === 'dark' ? '#f8fafc' : '#0369a1', fontWeight: 600, fontSize: 11, fontFamily: 'monospace' },
    labelBgStyle: { fill: theme === 'dark' ? '#064e3b' : '#f0f9ff', fillOpacity: 0.9, stroke: theme === 'dark' ? '#047857' : '#bae6fd', strokeWidth: 1 },
    labelBgPadding: [6, 4] as [number, number],
    labelBgBorderRadius: 2
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(formattedEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="h-[600px] w-full bg-slate-50 dark:bg-slate-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        colorMode={theme === 'dark' ? 'dark' : 'light'}
        className="bg-slate-50 dark:bg-slate-950"
      >
        <Controls className={theme === 'dark' ? "fill-slate-300" : "fill-slate-700"} />
        <MiniMap 
          nodeColor={theme === 'dark' ? "#059669" : "#cbd5e1"}
          maskColor={theme === 'dark' ? "rgba(15, 23, 42, 0.8)" : "rgba(241, 245, 249, 0.8)"}
        />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color={theme === 'dark' ? "#334155" : "#94a3b8"} />
      </ReactFlow>
    </div>
  );
}
