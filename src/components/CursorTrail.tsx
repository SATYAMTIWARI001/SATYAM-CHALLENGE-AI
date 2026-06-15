import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  type: 'emoji' | 'sparkle';
  text?: string;
  scale: number;
}

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationId: number;
    let mouse = { x: -100, y: -100, lastX: -100, lastY: -100, speed: 0 };

    const colors = [
      '#a855f7', // purple-500
      '#ec4899', // pink-500
      '#3b82f6', // blue-500
      '#f59e0b', // amber-500
      '#10b981', // emerald-500
      '#f43f5e', // rose-500
    ];

    const emojis = ['😂', '🔥', '👑', '💎', '🚀'];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      mouse.speed = Math.sqrt(
        Math.pow(e.clientX - mouse.lastX, 2) + Math.pow(e.clientY - mouse.lastY, 2)
      );
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.lastX = e.clientX;
      mouse.lastY = e.clientY;

      // Spawn a blend of emojis and subtle star particles based on speed
      const numParticlesToSpawn = Math.min(3, Math.floor(mouse.speed / 6) + 1);
      for (let i = 0; i < numParticlesToSpawn; i++) {
        // Decide particle type: 30% chance of emoji, 70% chance of star
        const isEmoji = Math.random() < 0.35;
        const offsetAngle = Math.random() * Math.PI * 2;
        const offsetDist = Math.random() * 8;

        if (isEmoji) {
          particles.push({
            x: mouse.x + Math.cos(offsetAngle) * offsetDist,
            y: mouse.y + Math.sin(offsetAngle) * offsetDist,
            size: Math.random() * 8 + 16, // Emoji font size
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2 - 1.2, // Drift upward stronger
            alpha: 1.0,
            color: '#ffffff',
            rotation: (Math.random() - 0.5) * Math.PI,
            rotationSpeed: (Math.random() - 0.5) * 0.08,
            type: 'emoji',
            text: emojis[Math.floor(Math.random() * emojis.length)],
            scale: 1.0,
          });
        } else {
          particles.push({
            x: mouse.x + Math.cos(offsetAngle) * offsetDist,
            y: mouse.y + Math.sin(offsetAngle) * offsetDist,
            size: Math.random() * 4 + 2,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5 - 0.4, // Subtle drift upward
            alpha: 1.0,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.12,
            type: 'sparkle',
            scale: 1.0,
          });
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Keep particles alive until they are fully transparent or tiny
      particles = particles.filter((p) => p.alpha > 0.05);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (p.type === 'emoji') {
          p.alpha -= 0.015; // Slow fade for emojis
          p.size *= 0.985;
          
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.alpha;
          ctx.font = `${p.size}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.text || '😂', 0, 0);
          ctx.restore();
        } else {
          p.alpha -= 0.022; // Faster fade for sparkles
          p.size *= 0.96;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);

          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.globalAlpha = p.alpha;

          // Four-point star
          ctx.beginPath();
          const r = p.size;
          ctx.moveTo(0, -r * 1.5);
          ctx.quadraticCurveTo(0, 0, r * 1.5, 0);
          ctx.quadraticCurveTo(0, 0, 0, r * 1.5);
          ctx.quadraticCurveTo(0, 0, -r * 1.5, 0);
          ctx.quadraticCurveTo(0, 0, 0, -r * 1.5);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      id="cursor-trail-canvas"
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-50"
    />
  );
}
