import React, { useRef, useEffect, useState } from 'react';
import { ShieldCheck, FileText, GitBranch, Linkedin, Globe, Cpu, Sparkles, Award } from 'lucide-react';

interface Hero3DCanvasProps {
  className?: string;
}

interface SourceNode {
  id: string;
  label: string;
  badge: string;
  angle: number;
  radius: number;
  speed: number;
  yOffset: number;
  color: string;
  haloColor: string;
  iconSymbol: string;
  evidenceText: string;
}

export const Hero3DCanvas: React.FC<Hero3DCanvasProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [hasCanvasError, setHasCanvasError] = useState<boolean>(false);

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
      setHasCanvasError(true);
      return;
    }

    let animationFrameId: number;
    let width = (canvas.width = container.clientWidth || 560);
    let height = (canvas.height = container.clientHeight || 460);

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
      mousePos.current.targetX = Math.max(-0.8, Math.min(0.8, x));
      mousePos.current.targetY = Math.max(-0.8, Math.min(0.8, y));
    };

    const handleMouseLeave = () => {
      mousePos.current.targetX = 0;
      mousePos.current.targetY = 0;
      setHoveredNodeId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Check Reduced Motion Preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 3D Particles - Soft ambient depth
    const particleCount = prefersReducedMotion ? 20 : 45;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: (Math.random() - 0.5) * 500,
      y: (Math.random() - 0.5) * 380,
      z: (Math.random() - 0.5) * 400,
      size: Math.random() * 1.8 + 0.8,
      speedZ: Math.random() * 0.25 + 0.1,
      color: Math.random() > 0.6 ? 'rgba(6, 182, 212, 0.4)' : Math.random() > 0.3 ? 'rgba(99, 102, 241, 0.35)' : 'rgba(147, 51, 234, 0.3)',
    }));

    // Multi-Source Nodes with concise labels
    const sourceNodes: SourceNode[] = [
      { 
        id: 'resume', 
        label: 'Resume', 
        badge: 'Claims', 
        angle: 0, 
        radius: 175, 
        speed: 0.0035, 
        yOffset: -28, 
        color: '#6366f1',
        haloColor: 'rgba(99, 102, 241, 0.35)',
        iconSymbol: '📄',
        evidenceText: '24 Claims'
      },
      { 
        id: 'github', 
        label: 'GitHub', 
        badge: 'Code', 
        angle: (Math.PI * 2) / 5, 
        radius: 185, 
        speed: 0.0035, 
        yOffset: 32, 
        color: '#06b6d4',
        haloColor: 'rgba(6, 182, 212, 0.35)',
        iconSymbol: '🐙',
        evidenceText: 'Verified Code'
      },
      { 
        id: 'linkedin', 
        label: 'LinkedIn', 
        badge: 'Tenure', 
        angle: (Math.PI * 4) / 5, 
        radius: 170, 
        speed: 0.0035, 
        yOffset: -22, 
        color: '#38bdf8',
        haloColor: 'rgba(56, 189, 248, 0.35)',
        iconSymbol: '💼',
        evidenceText: 'Career Tenure'
      },
      { 
        id: 'portfolio', 
        label: 'Portfolio', 
        badge: 'Systems', 
        angle: (Math.PI * 6) / 5, 
        radius: 180, 
        speed: 0.0035, 
        yOffset: 26, 
        color: '#a855f7',
        haloColor: 'rgba(168, 85, 247, 0.35)',
        iconSymbol: '🌐',
        evidenceText: 'Live Systems'
      },
      { 
        id: 'certs', 
        label: 'Certifications', 
        badge: 'Verified', 
        angle: (Math.PI * 8) / 5, 
        radius: 172, 
        speed: 0.0035, 
        yOffset: -12, 
        color: '#10b981',
        haloColor: 'rgba(16, 185, 129, 0.35)',
        iconSymbol: '🛡️',
        evidenceText: 'Valid ID'
      },
    ];

    // Core 3D Geometry Vertices (Dual Octahedron AI Core)
    const baseRadius = 56;
    const coreVertices = [
      { x: 0, y: -baseRadius, z: 0 },
      { x: baseRadius, y: 0, z: 0 },
      { x: 0, y: baseRadius, z: 0 },
      { x: -baseRadius, y: 0, z: 0 },
      { x: 0, y: 0, z: baseRadius },
      { x: 0, y: 0, z: -baseRadius },
      // Inner core
      { x: 0, y: -baseRadius * 0.52, z: 0 },
      { x: baseRadius * 0.52, y: 0, z: 0 },
      { x: 0, y: baseRadius * 0.52, z: 0 },
      { x: -baseRadius * 0.52, y: 0, z: 0 },
      { x: 0, y: 0, z: baseRadius * 0.52 },
      { x: 0, y: 0, z: -baseRadius * 0.52 },
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

    let rotX = 0.12;
    let rotY = 0.25;
    let time = 0;

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      time += 0.012;

      // Mouse interpolation (smooth dampening)
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.04;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.04;

      if (!prefersReducedMotion) {
        rotY += 0.003 + mousePos.current.x * 0.002;
        rotX += mousePos.current.y * 0.0015;
      }

      ctx.clearRect(0, 0, width, height);

      const fov = 400;
      const cx = width / 2;
      const cy = height / 2;

      // 1. Atmosphere Radial Gradient (Deep Navy, Midnight Blue, subtle Cyan/Violet)
      const radialGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, width * 0.44);
      radialGlow.addColorStop(0, 'rgba(30, 41, 59, 0.4)');
      radialGlow.addColorStop(0.35, 'rgba(15, 23, 42, 0.25)');
      radialGlow.addColorStop(0.7, 'rgba(2, 6, 23, 0.1)');
      radialGlow.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Depth Particles
      particles.forEach((p) => {
        if (!prefersReducedMotion) {
          p.z -= p.speedZ;
          if (p.z < -200) p.z = 200;
        }

        const cosY = Math.cos(rotY * 0.3);
        const sinY = Math.sin(rotY * 0.3);
        const xRot = p.x * cosY - p.z * sinY;
        const zRot = p.z * cosY + p.x * sinY;

        const scale = fov / (fov + zRot);
        const projX = cx + xRot * scale;
        const projY = cy + p.y * scale;

        if (scale > 0 && projX > 0 && projX < width && projY > 0 && projY < height) {
          ctx.beginPath();
          ctx.arc(projX, projY, Math.max(0.5, p.size * scale), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }
      });

      // 3. Central AI Intelligence Core Geometry
      const projectedCore = coreVertices.map((v) => {
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const x1 = v.x * cosY - v.z * sinY;
        const z1 = v.z * cosY + v.x * sinY;

        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const y2 = v.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + v.y * sinX;

        const pulse = 1 + Math.sin(time * 1.8) * 0.03;
        const scale = fov / (fov + z2 * pulse);
        return {
          x: cx + x1 * pulse * scale,
          y: cy + y2 * pulse * scale,
          z: z2,
          scale,
        };
      });

      // Core Edges (Controlled Cyan & Violet lattice)
      ctx.lineWidth = 1.4;
      coreEdges.forEach(([i, j]) => {
        const p1 = projectedCore[i];
        const p2 = projectedCore[j];
        const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        grad.addColorStop(0, 'rgba(99, 102, 241, 0.65)');
        grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.75)');
        grad.addColorStop(1, 'rgba(168, 85, 247, 0.65)');
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      // Central AI Core Hub
      ctx.save();
      const coreCenterGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 28);
      coreCenterGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      coreCenterGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.85)');
      coreCenterGrad.addColorStop(0.65, 'rgba(99, 102, 241, 0.45)');
      coreCenterGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = coreCenterGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Central Core Label Badge
      ctx.font = '700 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('AI CORE', cx, cy);

      // 4. Orbiting Multi-Source Modality Nodes
      sourceNodes.forEach((node) => {
        if (!prefersReducedMotion) {
          node.angle += node.speed;
        }

        const x = Math.cos(node.angle) * node.radius;
        const z = Math.sin(node.angle) * node.radius;
        const y = node.yOffset + Math.sin(time + node.angle * 1.2) * 10;

        const cosY = Math.cos(rotY * 0.3);
        const sinY = Math.sin(rotY * 0.3);
        const xRot = x * cosY - z * sinY;
        const zRot = z * cosY + x * sinY;

        const scale = fov / (fov + zRot);
        const projX = cx + xRot * scale;
        const projY = cy + y * scale;

        // Data Pulse Packet moving from Source Node -> Core
        const packetProgress = (time * 1.2 + node.angle) % 1;
        const packetX = projX + (cx - projX) * packetProgress;
        const packetY = projY + (cy - projY) * packetProgress;

        // Vector connection link
        ctx.save();
        ctx.setLineDash([3, 4]);
        ctx.lineWidth = 1.2;
        const laserGrad = ctx.createLinearGradient(projX, projY, cx, cy);
        laserGrad.addColorStop(0, `${node.color}80`);
        laserGrad.addColorStop(1, 'rgba(6, 182, 212, 0.25)');
        ctx.strokeStyle = laserGrad;
        ctx.beginPath();
        ctx.moveTo(projX, projY);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        ctx.restore();

        // Flow photon pulse
        ctx.beginPath();
        ctx.arc(packetX, packetY, 2.2 * scale, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();

        // Node Circle Body
        const nodeSize = 18 * scale;
        ctx.beginPath();
        ctx.arc(projX, projY, nodeSize, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.fill();
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = node.color;
        ctx.stroke();

        // Node Halo
        ctx.beginPath();
        ctx.arc(projX, projY, nodeSize + 3, 0, Math.PI * 2);
        ctx.strokeStyle = node.haloColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Node Icon
        ctx.font = `${Math.max(10, Math.floor(12 * scale))}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.iconSymbol, projX, projY);

        // Concise Label Pill below node
        ctx.font = `600 ${Math.max(9, Math.floor(10 * scale))}px Inter, sans-serif`;
        const textMetrics = ctx.measureText(node.label);
        const textWidth = textMetrics.width;
        const pillY = projY + nodeSize + 10;

        // Draw pill background with border
        ctx.fillStyle = 'rgba(2, 6, 23, 0.92)';
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(projX - textWidth / 2 - 6, pillY - 7, textWidth + 12, 14, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
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

  if (hasCanvasError) {
    // Polished 2D Static Fallback
    return (
      <div className={`relative w-full h-[400px] flex items-center justify-center bg-slate-900/60 border border-slate-800 rounded-3xl p-6 ${className}`}>
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-700 flex items-center justify-center mx-auto text-cyan-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div className="font-bold text-white text-sm">AI Candidate Intelligence Core</div>
          <p className="text-xs text-slate-400 max-w-xs">
            Synthesizing evidence across Resume, GitHub, LinkedIn, Portfolio, and Certifications.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      id="hero-3d-intelligence-core"
      className={`relative w-full h-[400px] sm:h-[460px] lg:h-[500px] flex items-center justify-center ${className}`}
      aria-label="Interactive 3D AI Candidate Intelligence Core visualization"
    >
      {/* Subtle Orbital Guidelines */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <div className="w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] rounded-full border border-indigo-500/10" />
        <div className="w-[380px] h-[380px] sm:w-[480px] sm:h-[480px] rounded-full border border-cyan-500/10 border-dashed" />
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer relative z-10 block"
        title="Interactive AI Candidate Intelligence Core"
      />

      {/* Accessible Text for Screen Readers */}
      <div className="sr-only">
        Interactive 3D visualization showing candidate sources (Resume, GitHub, LinkedIn, Portfolio, Certifications) connected to the AI Intelligence Core.
      </div>

      {/* Top Left Process Flow Indicator */}
      <div className="hidden sm:flex absolute top-3 left-4 z-20 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 px-3 py-1.5 rounded-xl text-[10px] font-mono text-slate-400 items-center gap-1.5">
        <span className="text-cyan-400 font-bold">SOURCES</span>
        <span>→</span>
        <span className="text-indigo-400 font-bold">AI ANALYSIS</span>
        <span>→</span>
        <span className="text-emerald-400 font-bold">EVIDENCE</span>
        <span>→</span>
        <span className="text-cyan-300 font-bold">INTELLIGENCE</span>
      </div>

      {/* Bottom Status Capsule */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3.5 py-1 rounded-full text-[11px] font-mono text-slate-300 shadow-xl flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-cyan-300 font-semibold">AI Intelligence Core</span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">5 Grounded Sources</span>
      </div>
    </div>
  );
};
