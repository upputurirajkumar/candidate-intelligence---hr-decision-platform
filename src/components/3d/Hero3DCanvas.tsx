import React, { useRef, useEffect, useState } from 'react';
import { ShieldCheck, FileText, GitBranch, Linkedin, Globe, Cpu, Sparkles, Award } from 'lucide-react';

interface Hero3DCanvasProps {
  className?: string;
}

export const Hero3DCanvas: React.FC<Hero3DCanvasProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [activeTabLabel, setActiveTabLabel] = useState<string>('Neural Grounding Core');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [webGLError, setWebGLError] = useState<boolean>(false);

  const mousePos = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setWebGLError(true);
      return;
    }

    let animationFrameId: number;
    let width = (canvas.width = container.clientWidth || 600);
    let height = (canvas.height = container.clientHeight || 480);

    // Performance: Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          width = canvas.width = Math.floor(entry.contentRect.width);
          height = canvas.height = Math.floor(entry.contentRect.height);
        }
      }
    });
    resizeObserver.observe(container);

    // Performance: Intersection Observer (Pause rendering when off-screen)
    let isVisible = true;
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        setIsPaused(!entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    // Performance: Tab Visibility Listener
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isVisible = false;
        setIsPaused(true);
      } else {
        isVisible = true;
        setIsPaused(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Smooth Mouse Interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - width / 2) / (width / 2);
      const y = (e.clientY - rect.top - height / 2) / (height / 2);
      mousePos.current.targetX = Math.max(-1, Math.min(1, x));
      mousePos.current.targetY = Math.max(-1, Math.min(1, y));
    };

    const handleMouseLeave = () => {
      mousePos.current.targetX = 0;
      mousePos.current.targetY = 0;
      setHoveredNode(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Check Reduced Motion Preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 3D Particles
    const particleCount = prefersReducedMotion ? 25 : 65;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: (Math.random() - 0.5) * 550,
      y: (Math.random() - 0.5) * 420,
      z: (Math.random() - 0.5) * 450,
      size: Math.random() * 2 + 1,
      speedZ: Math.random() * 0.4 + 0.2,
      color: Math.random() > 0.6 ? '#06b6d4' : Math.random() > 0.3 ? '#818cf8' : '#38bdf8',
    }));

    // Multi-Source Constellation Orbiting Nodes
    const sourceNodes = [
      { 
        id: 'resume', 
        label: 'Candidate Resume', 
        badge: 'DOCX/PDF', 
        angle: 0, 
        radius: 190, 
        speed: 0.007, 
        yOffset: -35, 
        color: '#6366f1',
        iconSymbol: '📄',
        evidenceCount: '24 Claims'
      },
      { 
        id: 'github', 
        label: 'GitHub Code Repos', 
        badge: 'Commits & PRs', 
        angle: (Math.PI * 2) / 5, 
        radius: 205, 
        speed: 0.007, 
        yOffset: 45, 
        color: '#38bdf8',
        iconSymbol: '🐙',
        evidenceCount: '340+ Stars'
      },
      { 
        id: 'linkedin', 
        label: 'LinkedIn Profile', 
        badge: 'Tenure & Roles', 
        angle: (Math.PI * 4) / 5, 
        radius: 180, 
        speed: 0.007, 
        yOffset: -25, 
        color: '#06b6d4',
        iconSymbol: '💼',
        evidenceCount: 'Verified Tenure'
      },
      { 
        id: 'certs', 
        label: 'Official Registries', 
        badge: 'CKA/AWS/GCP', 
        angle: (Math.PI * 6) / 5, 
        radius: 195, 
        speed: 0.007, 
        yOffset: 40, 
        color: '#10b981',
        iconSymbol: '🛡️',
        evidenceCount: 'Valid ID'
      },
      { 
        id: 'portfolio', 
        label: 'Live Systems & Architecture', 
        badge: 'Case Studies', 
        angle: (Math.PI * 8) / 5, 
        radius: 185, 
        speed: 0.007, 
        yOffset: -15, 
        color: '#a855f7',
        iconSymbol: '🌐',
        evidenceCount: 'Production'
      },
    ];

    // Core 3D Geometry Vertices (Dual Octahedron + Neural Ring)
    const baseRadius = 64;
    const coreVertices = [
      { x: 0, y: -baseRadius, z: 0 },
      { x: baseRadius, y: 0, z: 0 },
      { x: 0, y: baseRadius, z: 0 },
      { x: -baseRadius, y: 0, z: 0 },
      { x: 0, y: 0, z: baseRadius },
      { x: 0, y: 0, z: -baseRadius },
      // Inner core
      { x: 0, y: -baseRadius * 0.5, z: 0 },
      { x: baseRadius * 0.5, y: 0, z: 0 },
      { x: 0, y: baseRadius * 0.5, z: 0 },
      { x: -baseRadius * 0.5, y: 0, z: 0 },
      { x: 0, y: 0, z: baseRadius * 0.5 },
      { x: 0, y: 0, z: -baseRadius * 0.5 },
    ];

    const coreEdges = [
      // Outer Octahedron
      [0, 1], [1, 2], [2, 3], [3, 0],
      [0, 4], [1, 4], [2, 4], [3, 4],
      [0, 5], [1, 5], [2, 5], [3, 5],
      // Inner Octahedron
      [6, 7], [7, 8], [8, 9], [9, 6],
      [6, 10], [7, 10], [8, 10], [9, 10],
      [6, 11], [7, 11], [8, 11], [9, 11],
      // Inter-connections
      [0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]
    ];

    let rotX = 0.18;
    let rotY = 0.35;
    let time = 0;

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      time += 0.016;

      // Mouse interpolation
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.05;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.05;

      if (!prefersReducedMotion) {
        rotY += 0.005 + mousePos.current.x * 0.004;
        rotX += mousePos.current.y * 0.003;
      }

      ctx.clearRect(0, 0, width, height);

      const fov = 420;
      const cx = width / 2;
      const cy = height / 2;

      // 1. Background Neural Atmosphere
      const radialGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, width * 0.46);
      radialGlow.addColorStop(0, 'rgba(99, 102, 241, 0.22)');
      radialGlow.addColorStop(0.35, 'rgba(6, 182, 212, 0.10)');
      radialGlow.addColorStop(0.7, 'rgba(15, 23, 42, 0.04)');
      radialGlow.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Depth-Sorted Particles
      particles.forEach((p) => {
        if (!prefersReducedMotion) {
          p.z -= p.speedZ;
          if (p.z < -220) p.z = 220;
        }

        const cosY = Math.cos(rotY * 0.4);
        const sinY = Math.sin(rotY * 0.4);
        const xRot = p.x * cosY - p.z * sinY;
        const zRot = p.z * cosY + p.x * sinY;

        const scale = fov / (fov + zRot);
        const projX = cx + xRot * scale;
        const projY = cy + p.y * scale;

        if (scale > 0 && projX > 0 && projX < width && projY > 0 && projY < height) {
          ctx.beginPath();
          ctx.arc(projX, projY, Math.max(0.6, p.size * scale), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.min(0.85, Math.max(0.12, scale * 0.65));
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;

      // 3. Central AI Intelligence Core Geometry
      const projectedCore = coreVertices.map((v) => {
        // Rotate around Y
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const x1 = v.x * cosY - v.z * sinY;
        const z1 = v.z * cosY + v.x * sinY;

        // Rotate around X
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const y2 = v.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + v.y * sinX;

        // Dynamic pulsing breathing wave
        const pulse = 1 + Math.sin(time * 2.2) * 0.04;
        const scale = fov / (fov + z2 * pulse);
        return {
          x: cx + x1 * pulse * scale,
          y: cy + y2 * pulse * scale,
          z: z2,
          scale,
        };
      });

      // Draw Core Lattice Edges
      ctx.lineWidth = 1.6;
      coreEdges.forEach(([i, j]) => {
        const p1 = projectedCore[i];
        const p2 = projectedCore[j];
        const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        grad.addColorStop(0, 'rgba(99, 102, 241, 0.75)');
        grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.85)');
        grad.addColorStop(1, 'rgba(168, 85, 247, 0.75)');
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      // Central AI Core Radiant Fusion Hub
      ctx.save();
      const coreCenterGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 32);
      coreCenterGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
      coreCenterGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.9)');
      coreCenterGrad.addColorStop(0.65, 'rgba(99, 102, 241, 0.55)');
      coreCenterGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = coreCenterGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 4. Orbiting Multi-Source Modality Nodes
      sourceNodes.forEach((node) => {
        if (!prefersReducedMotion) {
          node.angle += node.speed;
        }

        const x = Math.cos(node.angle) * node.radius;
        const z = Math.sin(node.angle) * node.radius;
        const y = node.yOffset + Math.sin(time + node.angle * 1.5) * 14;

        // Apply 3D matrix transform
        const cosY = Math.cos(rotY * 0.35);
        const sinY = Math.sin(rotY * 0.35);
        const xRot = x * cosY - z * sinY;
        const zRot = z * cosY + x * sinY;

        const scale = fov / (fov + zRot);
        const projX = cx + xRot * scale;
        const projY = cy + y * scale;

        // Data Pulse Packet travelling from node -> Core
        const packetProgress = (time * 1.5 + node.angle) % 1;
        const packetX = projX + (cx - projX) * packetProgress;
        const packetY = projY + (cy - projY) * packetProgress;

        // Laser vector link
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.4;
        const laserGrad = ctx.createLinearGradient(projX, projY, cx, cy);
        laserGrad.addColorStop(0, `${node.color}99`);
        laserGrad.addColorStop(1, 'rgba(6, 182, 212, 0.3)');
        ctx.strokeStyle = laserGrad;
        ctx.beginPath();
        ctx.moveTo(projX, projY);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        ctx.restore();

        // Travelling photon
        ctx.beginPath();
        ctx.arc(packetX, packetY, 2.5 * scale, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Node Circle Body
        const nodeSize = 20 * scale;
        ctx.beginPath();
        ctx.arc(projX, projY, nodeSize, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = node.color;
        ctx.stroke();

        // Outer Neon Glow Halo
        ctx.beginPath();
        ctx.arc(projX, projY, nodeSize + 4, 0, Math.PI * 2);
        ctx.strokeStyle = `${node.color}40`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Node Icon Emoji
        ctx.font = `${Math.max(10, Math.floor(13 * scale))}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.iconSymbol, projX, projY);

        // Label Card Pill
        ctx.font = `600 ${Math.max(9, Math.floor(10 * scale))}px Inter, sans-serif`;
        const textMetrics = ctx.measureText(node.label);
        const textWidth = textMetrics.width;
        const pillY = projY + nodeSize + 11;

        ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(projX - textWidth / 2 - 8, pillY - 8, textWidth + 16, 16, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f1f5f9';
        ctx.fillText(node.label, projX, pillY);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="hero-3d-intelligence-core"
      className={`relative w-full h-[420px] sm:h-[480px] lg:h-[540px] flex items-center justify-center ${className}`}
      aria-label="Interactive 3D AI Candidate Intelligence Core visualization"
    >
      {/* Background Decorative Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <div className="w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full border border-indigo-500/15 animate-[spin_60s_linear_infinite]" />
        <div className="w-[420px] h-[420px] sm:w-[540px] sm:h-[540px] rounded-full border border-cyan-500/15 border-dashed animate-[spin_90s_linear_infinite_reverse]" />
        <div className="w-[520px] h-[520px] sm:w-[660px] sm:h-[660px] rounded-full border border-violet-500/10 animate-[spin_120s_linear_infinite]" />
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair relative z-10 block"
        title="Interactive 3D Multi-Source Intelligence Constellation"
      />

      {/* Accessible Text Fallback for Screen Readers */}
      <div className="sr-only">
        Interactive 3D visualization showing the AI Candidate Intelligence Core synthesizing evidence from candidate resumes, GitHub repositories, LinkedIn tenure, certification registries, and architecture portfolios.
      </div>

      {/* Floating Status Badge */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-20 bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 px-4 py-1.5 rounded-full text-[11px] font-mono text-cyan-300 shadow-2xl flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-bold">Live AI Candidate Intelligence Core</span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-300">5 Grounded Modalities</span>
      </div>

      {/* Top Left Intelligence Flow Indicator */}
      <div className="hidden sm:flex absolute top-3 left-4 z-20 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-mono text-slate-400 items-center gap-1.5">
        <span className="text-cyan-400 font-bold">SOURCE</span>
        <span>→</span>
        <span className="text-indigo-400 font-bold">AI AUDIT</span>
        <span>→</span>
        <span className="text-emerald-400 font-bold">EVIDENCE</span>
        <span>→</span>
        <span className="text-cyan-300 font-bold">INTELLIGENCE</span>
      </div>
    </div>
  );
};
