'use client';

import React, { useEffect, useRef } from 'react';
import { useQuranStore } from '@/lib/store';

export default function FireworksCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      color: string; size: number; life: number; maxLife: number;
      type: 'spark' | 'confetti'; rotation: number;
    }
    const colors = ['#ffd700', '#ff6b6b', '#4ade80', '#60a5fa', '#f472b6', '#a78bfa', '#fb923c', '#22d3ee'];
    const particles: Particle[] = [];

    const createExplosion = (x: number, y: number) => {
      for (let i = 0; i < 30; i++) {
        const angle = (Math.PI * 2 * i) / 30;
        const speed = 2 + Math.random() * 5;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2 + Math.random() * 3,
          life: 0,
          maxLife: 40 + Math.random() * 40,
          type: Math.random() > 0.5 ? 'spark' : 'confetti',
          rotation: Math.random() * Math.PI * 2
        });
      }
    };

    let animFrame: number;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > 8000) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        useQuranStore.setState({ showFireworks: false });
        return;
      }
      ctx.fillStyle = 'rgba(5, 11, 24, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (elapsed < 6000 && Math.random() > 0.9) {
        createExplosion(Math.random() * canvas.width, Math.random() * canvas.height * 0.6);
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.life++;
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }
        const alpha = 1 - p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        if (p.type === 'spark') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      }
      animFrame = requestAnimationFrame(animate);
    };
    createExplosion(canvas.width * 0.3, canvas.height * 0.3);
    createExplosion(canvas.width * 0.7, canvas.height * 0.25);
    createExplosion(canvas.width * 0.5, canvas.height * 0.4);
    animate();
    return () => cancelAnimationFrame(animFrame);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9998, pointerEvents: 'none' }}
    />
  );
}
