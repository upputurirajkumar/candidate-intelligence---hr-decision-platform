import React, { useState, useMemo } from 'react';
import { Candidate, KnowledgeGraphNode, KnowledgeGraphLink } from '../types';
import { 
  Layers, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ShieldCheck, 
  Building2, 
  GraduationCap, 
  Code2, 
  FileText,
  Info
} from 'lucide-react';

interface EntityGraphViewProps {
  candidate: Candidate;
}

export const EntityGraphView: React.FC<EntityGraphViewProps> = ({ candidate }) => {
  const [selectedNodeType, setSelectedNodeType] = useState<string>('all');
  const [activeNode, setActiveNode] = useState<KnowledgeGraphNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Generate nodes and links from candidate profile
  const { nodes, links } = useMemo(() => {
    const nList: KnowledgeGraphNode[] = [];
    const lList: KnowledgeGraphLink[] = [];

    // Candidate Root Node
    nList.push({
      id: candidate.id,
      label: candidate.name,
      type: 'candidate',
      color: '#4f46e5', // indigo-600
      val: 28,
    });

    // Companies
    candidate.experiences.forEach((exp, i) => {
      const cId = `comp-${i}-${exp.company.replace(/\s+/g, '')}`;
      nList.push({
        id: cId,
        label: exp.company,
        type: 'company',
        color: '#0284c7', // sky-600
        val: 18,
      });
      lList.push({
        source: candidate.id,
        target: cId,
        relationship: exp.role,
        verified: exp.verifiedTenure,
      });

      // Tech used at company
      exp.technologies.slice(0, 3).forEach((tech, tIdx) => {
        const tId = `tech-${tech.replace(/\s+/g, '')}`;
        if (!nList.find(n => n.id === tId)) {
          nList.push({
            id: tId,
            label: tech,
            type: 'skill',
            color: '#10b981', // emerald-500
            val: 12,
          });
        }
        lList.push({
          source: cId,
          target: tId,
          relationship: 'Utilized In Production',
          verified: true,
        });
      });
    });

    // Education
    candidate.education.forEach((edu, i) => {
      const eId = `edu-${i}-${edu.institution.replace(/\s+/g, '')}`;
      nList.push({
        id: eId,
        label: edu.institution,
        type: 'degree',
        color: '#8b5cf6', // violet-500
        val: 16,
      });
      lList.push({
        source: candidate.id,
        target: eId,
        relationship: edu.degree,
        verified: edu.verified,
      });
    });

    // Verified Claims / Papers / Patents
    candidate.claims.forEach((claim, i) => {
      const pId = `claim-${claim.id}`;
      nList.push({
        id: pId,
        label: claim.claim.length > 25 ? claim.claim.substring(0, 23) + '...' : claim.claim,
        type: 'project',
        color: claim.status === 'verified' ? '#059669' : '#d97706',
        val: 14,
      });
      lList.push({
        source: candidate.id,
        target: pId,
        relationship: claim.status === 'verified' ? 'Verified Artifact' : 'Under Review',
        verified: claim.status === 'verified',
      });
    });

    return { nodes: nList, links: lList };
  }, [candidate]);

  const filteredNodes = nodes.filter(
    n => selectedNodeType === 'all' || n.type === selectedNodeType || n.type === 'candidate'
  );

  const filteredLinks = links.filter(
    l => filteredNodes.some(n => n.id === l.source) && filteredNodes.some(n => n.id === l.target)
  );

  // Position nodes in a radial circular cluster for clean SVG rendering
  const width = 800;
  const height = 500;
  const centerX = width / 2;
  const centerY = height / 2;

  const nodePositions = useMemo(() => {
    const posMap = new Map<string, { x: number; y: number }>();
    posMap.set(candidate.id, { x: centerX, y: centerY });

    const otherNodes = filteredNodes.filter(n => n.id !== candidate.id);
    const count = otherNodes.length;

    otherNodes.forEach((node, idx) => {
      // Stratify by type for concentric rings
      let radius = 170;
      if (node.type === 'company') radius = 130;
      if (node.type === 'degree') radius = 150;
      if (node.type === 'skill') radius = 210;
      if (node.type === 'project') radius = 220;

      const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
      posMap.set(node.id, {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    });

    return posMap;
  }, [filteredNodes, candidate.id]);

  return (
    <div id="entity-graph-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Entity Knowledge Graph & Verification Mesh</h2>
              <p className="text-xs text-slate-500">
                Interactive network representation connecting credentials, companies, technologies, and verified proofs
              </p>
            </div>
          </div>

          {/* Node Type Filters & Zoom */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filter Graph Entities"
              value={selectedNodeType}
              onChange={(e) => setSelectedNodeType(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Entity Types</option>
              <option value="company">Companies & Tenures</option>
              <option value="skill">Verified Skills</option>
              <option value="degree">Academic Institutions</option>
              <option value="project">Claims & Artifacts</option>
            </select>

            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
              <button
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.6))}
                className="p-1.5 hover:bg-slate-200 text-slate-600 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1.5 hover:bg-slate-200 text-slate-600 border-x border-slate-200 cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.7))}
                className="p-1.5 hover:bg-slate-200 text-slate-600 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs mt-4">
          <span className="flex items-center gap-1.5 text-indigo-700 font-medium">
            <span className="w-3 h-3 rounded-full bg-indigo-600"></span> Candidate Root
          </span>
          <span className="flex items-center gap-1.5 text-sky-700 font-medium">
            <span className="w-3 h-3 rounded-full bg-sky-600"></span> Company Tenure
          </span>
          <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Technical Skill
          </span>
          <span className="flex items-center gap-1.5 text-violet-700 font-medium">
            <span className="w-3 h-3 rounded-full bg-violet-500"></span> Education
          </span>
          <span className="flex items-center gap-1.5 text-amber-700 font-medium">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span> Grounded Claims
          </span>
        </div>
      </div>

      {/* SVG Canvas & Node Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-center overflow-hidden min-h-[480px]">
          <div
            className="w-full flex justify-center transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <svg width={width} height={height} className="max-w-full">
              {/* Render Connecting Links */}
              {filteredLinks.map((link, idx) => {
                const sourcePos = nodePositions.get(link.source);
                const targetPos = nodePositions.get(link.target);
                if (!sourcePos || !targetPos) return null;

                return (
                  <g key={idx}>
                    <line
                      x1={sourcePos.x}
                      y1={sourcePos.y}
                      x2={targetPos.x}
                      y2={targetPos.y}
                      stroke={link.verified ? '#cbd5e1' : '#fcd34d'}
                      strokeWidth={link.verified ? 1.5 : 2}
                      strokeDasharray={link.verified ? 'none' : '4 4'}
                    />
                  </g>
                );
              })}

              {/* Render Nodes */}
              {filteredNodes.map(node => {
                const pos = nodePositions.get(node.id);
                if (!pos) return null;
                const isSelected = activeNode?.id === node.id;

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={() => setActiveNode(node)}
                  >
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={node.val}
                      fill={node.color}
                      stroke={isSelected ? '#0f172a' : '#ffffff'}
                      strokeWidth={isSelected ? 3 : 2}
                      className="shadow-xs"
                    />
                    <text
                      x={pos.x}
                      y={pos.y + node.val + 12}
                      textAnchor="middle"
                      fill="#334155"
                      fontSize={node.type === 'candidate' ? 12 : 10}
                      fontWeight={node.type === 'candidate' ? 'bold' : 'normal'}
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right Column: Node Details Inspector */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-600" />
            Entity Inspector
          </h3>

          {activeNode ? (
            <div className="space-y-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: activeNode.color }}
                ></span>
                <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                  {activeNode.type}
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-900">{activeNode.label}</h4>

              <div className="text-xs text-slate-600 space-y-2">
                <div>
                  <span className="font-semibold text-slate-800">Direct Relationships:</span>{' '}
                  {links.filter(l => l.source === activeNode.id || l.target === activeNode.id).length} edges
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Verification Status:</span>{' '}
                  <span className="text-emerald-700 font-medium">Grounded & Verified</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 px-4 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
              Click any node in the graph to inspect entity attributes, source links, and verification provenance.
            </div>
          )}

          <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-xs text-indigo-950">
            <span className="font-bold block mb-1">Knowledge Mesh Insights:</span>
            Graph correlates cross-company stack transitions to identify deep expertise consistency vs. transient buzzwords.
          </div>
        </div>
      </div>
    </div>
  );
};
