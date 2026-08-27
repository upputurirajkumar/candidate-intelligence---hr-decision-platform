import React, { useRef, useEffect, useState } from 'react';
import { ShieldCheck, FileText, GitBranch, Linkedin, Globe, Cpu, Sparkles } from 'lucide-react';

interface Hero3DCanvasProps {
  className?: string;
}

export const Hero3DCanvas: React.FC<Hero3DCanvasProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const mousePos = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - width / 2) / (width / 2);
      const y = (e.clientY - rect.top - height / 2) / (height / 2);
      mousePos.current.targetX = x;
      mousePos.current.targetY = y;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 3D Particles
    const particleCount = 70;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: (Math.random() - 0.5) * 500,
      y: (Math.random() - 0.5) * 400,
      z: (Math.random() - 0.5) * 400,
      size: Math.random() * 2 + 1,
      speedZ: Math.random() * 0.4 + 0.2,
      color: Math.random() > 0.6 ? '#06b6d4' : Math.random() > 0.3 ? '#818cf8' : '#a855f7',
    }));

    // Orbiting 3D Source Nodes
    const sourceNodes = [
      { id: 'resume', label: 'Resume & Claims', icon: '📄', angle: 0, radius: 180, speed: 0.008, yOffset: -30, color: '#6366f1' },
      { id: 'github', label: 'GitHub Commits', icon: '🐙', angle: (Math.PI * 2) / 5, radius: 190, speed: 0.008, yOffset: 40, color: '#38bdf8' },
      { id: 'linkedin', label: 'LinkedIn Verified', icon: '💼', angle: (Math.PI * 4) / 5, radius: 170, speed: 0.008, yOffset: -20, color: '#06b6d4' },
      { id: 'certs', label: 'Official Registries', icon: '🛡️', angle: (Math.PI * 6) / 5, radius: 185, speed: 0.008, yOffset: 35, color: '#10b981' },
      { id: 'portfolio', label: 'Live Systems & Architecture', icon: '🌐', angle: (Math.PI * 8) / 5, radius: 175, speed: 0.008, yOffset: -10, color: '#c084fc' },
    ];

    // Core 3D Geometry Vertices
    const baseRadius = 60;
    const coreVertices = [
      { x: 0, y: -baseRadius, z: 0 },
      { x: baseRadius, y: 0, z: 0 },
      { x: 0, y: baseRadius, z: 0 },
      { x: -baseRadius, y: 0, z: 0 },
      { x: 0, y: 0, z: baseRadius },
      { x: 0, y: 0, z: -baseRadius },
    ];

    const coreEdges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // equatorial & top
      [0, 4], [1, 4], [2, 4], [3, 4], // front pyramid
      [0, 5], [1, 5], [2, 5], [3, 5], // back pyramid
    ];

    let rotX = 0.2;
    let rotY = 0.4;
    let time = 0;

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = () => {
      time += 0.015;

      // Smooth mouse interpolation
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.05;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.05;

      if (!prefersReducedMotion) {
        rotY += 0.006 + mousePos.current.x * 0.005;
        rotX += mousePos.current.y * 0.004;
      }

      ctx.clearRect(0, 0, width, height);

      const fov = 400;
      const cx = width / 2;
      const cy = height / 2;

      // 1. Draw subtle background radial aura
      const radialGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, width * 0.45);
      radialGlow.addColorStop(0, 'rgba(99, 102, 241, 0.18)');
      radialGlow.addColorStop(0.5, 'rgba(6, 182, 212, 0.08)');
      radialGlow.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Project and draw 3D floating particles
      particles.forEach((p) => {
        if (!prefersReducedMotion) {
          p.z -= p.speedZ;
          if (p.z < -200) p.z = 200;
        }

        // Apply rotation
        const cosY = Math.cos(rotY * 0.5);
        const sinY = Math.sin(rotY * 0.5);
        const xRot = p.x * cosY - p.z * sinY;
        const zRot = p.z * cosY + p.x * sinY;

        const scale = fov / (fov + zRot);
        const projX = cx + xRot * scale;
        const projY = cy + p.y * scale;

        if (scale > 0) {
          ctx.beginPath();
          ctx.arc(projX, projY, Math.max(0.5, p.size * scale), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.min(1, Math.max(0.1, scale * 0.7));
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;

      // 3. Project 3D Core Octahedron
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

        // Breathing pulse
        const pulse = 1 + Math.sin(time * 2) * 0.05;
        const scale = fov / (fov + z2 * pulse);
        return {
          x: cx + x1 * pulse * scale,
          y: cy + y2 * pulse * scale,
          z: z2,
          scale,
        };
      });

      // Draw Core Edges
      ctx.lineWidth = 1.5;
      coreEdges.forEach(([i, j]) => {
        const p1 = projectedCore[i];
        const p2 = projectedCore[j];
        const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        grad.addColorStop(0, 'rgba(99, 102, 241, 0.7)');
        grad.addColorStop(1, 'rgba(6, 182, 212, 0.7)');
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      // Draw Core Center Glow
      ctx.save();
      const coreCenterGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 25);
      coreCenterGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      coreCenterGrad.addColorStop(0.4, 'rgba(99, 102, 241, 0.8)');
      coreCenterGrad.addColorStop(0.8, 'rgba(6, 182, 212, 0.4)');
      coreCenterGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = coreCenterGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 4. Project Orbiting Source Nodes
      sourceNodes.forEach((node) => {
        if (!prefersReducedMotion) {
          node.angle += node.speed;
        }

        const x = Math.cos(node.angle) * node.radius;
        const z = Math.sin(node.angle) * node.radius;
        const y = node.yOffset + Math.sin(time + node.angle) * 15;

        // Apply 3D rotation
        const cosY = Math.cos(rotY * 0.3);
        const sinY = Math.sin(rotY * 0.3);
        const xRot = x * cosY - z * sinY;
        const zRot = z * cosY + x * sinY;

        const scale = fov / (fov + zRot);
        const projX = cx + xRot * scale;
        const projY = cy + y * scale;

        // Connecting laser vector from core to node
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.2;
        const laserGrad = ctx.createLinearGradient(cx, cy, projX, projY);
        laserGrad.addColorStop(0, 'rgba(99, 102, 241, 0.6)');
        laserGrad.addColorStop(1, 'rgba(6, 182, 212, 0.3)');
        ctx.strokeStyle = laserGrad;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(projX, projY);
        ctx.stroke();
        ctx.restore();

        // Node circle
        const nodeSize = 18 * scale;
        ctx.beginPath();
        ctx.arc(projX, projY, nodeSize, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = node.color;
        ctx.stroke();

        // Glowing outer halo
        ctx.beginPath();
        ctx.arc(projX, projY, nodeSize + 4, 0, Math.PI * 2);
        ctx.strokeStyle = `${node.color}44`;
        ctx.stroke();

        // Node Icon Emoji / Symbol
        ctx.font = `${Math.max(10, Math.floor(12 * scale))}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.icon, projX, projY);

        // Node Label Pill
        ctx.font = `600 ${Math.max(9, Math.floor(10 * scale))}px Inter, sans-serif`;
        const textMetrics = ctx.measureText(node.label);
        const textWidth = textMetrics.width;
        const pillY = projY + nodeSize + 10;

        ctx.fillStyle = 'rgba(11, 15, 25, 0.85)';
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(projX - textWidth / 2 - 6, pillY - 7, textWidth + 12, 14, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(node.label, projX, pillY);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`relative w-full h-[400px] sm:h-[480px] lg:h-[540px] flex items-center justify-center ${className}`}>
      {/* Background Decorative Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full border border-indigo-500/10 animate-[spin_60s_linear_infinite]" />
        <div className="w-[420px] h-[420px] sm:w-[560px] sm:h-[560px] rounded-full border border-cyan-500/10 border-dashed animate-[spin_90s_linear_infinite_reverse]" />
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair relative z-10"
        title="Interactive 3D Multi-Source Intelligence Constellation"
      />

      {/* Floating Status Badge */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-slate-900/80 backdrop-blur-md border border-indigo-500/30 px-3.5 py-1.5 rounded-full text-[11px] font-mono text-cyan-300 shadow-xl flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Live Neural Grounding Engine Active</span>
        <span className="text-slate-500">|</span>
        <span className="text-slate-400">5 Grounded Modalities</span>
      </div>
    </div>
  );
};
