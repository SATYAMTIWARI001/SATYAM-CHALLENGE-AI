import React, { useEffect, useRef } from 'react';

export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Dynamic resize handler
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Star configuration
    interface TwinkleStar {
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
      fadeDirection: number;
    }
    const stars: TwinkleStar[] = Array.from({ length: 80 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.02 + 0.01,
      opacity: Math.random(),
      fadeDirection: Math.random() > 0.5 ? 1 : -1,
    }));

    // Particle system (floating space debris, glowing dust)
    interface SpaceDust {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      speed: number;
    }
    const dustParticles: SpaceDust[] = Array.from({ length: 25 }, () => {
      const colors = ['rgba(139, 92, 246, 0.4)', 'rgba(59, 130, 246, 0.4)', 'rgba(236, 72, 153, 0.4)'];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2,
        speed: Math.random() * 0.05 + 0.02,
      };
    });

    // Cloud simulation
    interface SpaceCloud {
      x: number;
      y: number;
      radiusX: number;
      radiusY: number;
      vx: number;
      alpha: number;
    }
    const clouds: SpaceCloud[] = Array.from({ length: 4 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.8),
      radiusX: Math.random() * 150 + 100,
      radiusY: Math.random() * 80 + 40,
      vx: (i + 1) * 0.05,
      alpha: Math.random() * 0.15 + 0.05,
    }));

    // Floating humorous space emojis
    const emojis = ['😂', '🔥', '👑', '💎', '🚀', '✨', '🌍', '🇮🇳'];
    interface FloatingEmoji {
      x: number;
      y: number;
      text: string;
      scale: number;
      rotation: number;
      rotSpeed: number;
      vx: number;
      vy: number;
    }
    const spaceEmojis: FloatingEmoji[] = Array.from({ length: 9 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      text: emojis[i % emojis.length],
      scale: Math.random() * 0.6 + 0.5,
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.01,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));

    // Digital earth continent offset (rotation mapping)
    let earthRotation = 0;
    let globalZoom = 1.0;
    let zoomDir = 0.0003;

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Slow cosmic zoom mapping
      globalZoom += zoomDir;
      if (globalZoom > 1.08 || globalZoom < 0.96) {
        zoomDir = -zoomDir;
      }

      // 2. Cosmic color gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#100b26'); // Sophisticated Dark deep violet
      bgGrad.addColorStop(0.5, '#050505'); // Sophisticated Dark modern absolute black base
      bgGrad.addColorStop(1, '#060d24'); // Sophisticated Dark deep midnight blue
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Save transformation matrix for slow zoom effect
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(globalZoom, globalZoom);
      ctx.translate(-width / 2, -height / 2);

      // 3. Draw space clouds (ambient nebula)
      clouds.forEach((cloud) => {
        cloud.x += cloud.vx;
        if (cloud.x - cloud.radiusX > width) {
          cloud.x = -cloud.radiusX;
        }

        const cloudGrad = ctx.createRadialGradient(
          cloud.x,
          cloud.y,
          0,
          cloud.x,
          cloud.y,
          cloud.radiusX
        );
        cloudGrad.addColorStop(0, `rgba(168, 85, 247, ${cloud.alpha})`);
        cloudGrad.addColorStop(0.5, `rgba(59, 130, 246, ${cloud.alpha * 0.5})`);
        cloudGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = cloudGrad;
        ctx.beginPath();
        ctx.ellipse(cloud.x, cloud.y, cloud.radiusX, cloud.radiusY, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Draw starry background (with glowing fading twinkling)
      stars.forEach((star) => {
        star.opacity += star.fadeDirection * star.speed;
        if (star.opacity >= 1.0) {
          star.opacity = 1.0;
          star.fadeDirection = -1;
        } else if (star.opacity <= 0.05) {
          star.opacity = 0.05;
          star.fadeDirection = 1;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Subtly animate star positions
        star.x += 0.02;
        if (star.x > width) star.x = 0;
      });

      // 5. Ambient glowing nebula center
      const coreX = width * 0.75;
      const coreY = height * 0.3;
      const coreRad = Math.min(width, height) * 0.35;
      const coreGrad = ctx.createRadialGradient(coreX, coreY, 50, coreX, coreY, coreRad);
      coreGrad.addColorStop(0, 'rgba(124, 58, 237, 0.15)'); // Violet tint
      coreGrad.addColorStop(0.5, 'rgba(30, 64, 175, 0.05)'); // Blue tint
      coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(coreX, coreY, coreRad, 0, Math.PI * 2);
      ctx.fill();

      // 6. Draw the 3D-Look Stylized Rotating Digital Earth
      // Position Earth nicely in the top right / mid right zone for elegant visual layout
      const earthX = width > 768 ? width * 0.75 : width * 0.5;
      const earthY = width > 768 ? height * 0.32 : height * 0.22;
      const earthRadius = width > 1024 ? 120 : width > 768 ? 95 : 75;

      earthRotation += 0.003;

      // Outer atmosphere glow
      const atmGrad = ctx.createRadialGradient(
        earthX,
        earthY,
        earthRadius * 0.9,
        earthX,
        earthY,
        earthRadius * 1.35
      );
      atmGrad.addColorStop(0, 'rgba(57, 120, 255, 0.4)');
      atmGrad.addColorStop(0.3, 'rgba(147, 51, 234, 0.2)');
      atmGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = atmGrad;
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthRadius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // Earth core sphere clip and gradient shading
      ctx.save();
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthRadius, 0, Math.PI * 2);
      ctx.clip();

      // Oceans base
      const oceanGrad = ctx.createRadialGradient(
        earthX - earthRadius * 0.3,
        earthY - earthRadius * 0.3,
        earthRadius * 0.2,
        earthX,
        earthY,
        earthRadius
      );
      oceanGrad.addColorStop(0, '#101c4c'); // Light neon blue ocean
      oceanGrad.addColorStop(0.8, '#080a22'); // Deep ocean black shadow
      oceanGrad.addColorStop(1, '#02030d');
      ctx.fillStyle = oceanGrad;
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthRadius, 0, Math.PI * 2);
      ctx.fill();

      // Orbit grid lines (holographic grid)
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
      ctx.lineWidth = 1;
      for (let i = -4; i <= 4; i++) {
        const latY = earthY + (i * earthRadius) / 5;
        const r = Math.sqrt(Math.max(0, earthRadius * earthRadius - (latY - earthY) * (latY - earthY)));
        ctx.beginPath();
        ctx.ellipse(earthX, latY, r, r * 0.18, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Drawing rotating stylized world map continents
      const continentColor = 'rgba(139, 92, 246, 0.65)'; // Glowing purple continent vectors
      const mapFeatures = [
        // Fake continent structures as polygons relative to rotating offset [0 to 2*PI]
        { cx: 0.1, cy: -0.2, r: 0.25 },
        { cx: 0.35, cy: 0.25, r: 0.3 },
        { cx: 0.8, cy: -0.3, r: 0.18 },
        { cx: 1.1, cy: 0.1, r: 0.25 },
        { cx: 1.4, cy: -0.15, r: 0.2 },
        { cx: 1.7, cy: 0.3, r: 0.22 },
        { cx: 2.0, cy: -0.4, r: 0.15 },
        { cx: 2.3, cy: 0.0, r: 0.28 },
        { cx: 2.7, cy: 0.3, r: 0.2 },
        { cx: 3.1, cy: -0.1, r: 0.22 },
        { cx: 3.5, cy: 0.2, r: 0.24 },
        { cx: 3.9, cy: -0.3, r: 0.15 },
        { cx: 4.3, cy: 0.1, r: 0.26 },
        { cx: 4.8, cy: -0.2, r: 0.18 },
        { cx: 5.2, cy: 0.3, r: 0.23 },
        { cx: 5.7, cy: -0.1, r: 0.22 },
      ];

      ctx.fillStyle = continentColor;
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 4;

      mapFeatures.forEach((feat) => {
        // Calculate dynamic projection horizontal offset
        const rawX = ((feat.cx + earthRotation) % (Math.PI * 2));
        const theta = rawX - Math.PI; // Map bounds from -PI to PI
        
        // Orthographic projection horizontal coordinates
        if (Math.abs(theta) < Math.PI / 2) {
          const depthScale = Math.cos(theta);
          const px = earthX + earthRadius * Math.sin(theta);
          const py = earthY + feat.cy * earthRadius;

          ctx.beginPath();
          ctx.arc(px, py, feat.r * earthRadius * depthScale, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.shadowBlur = 0; // Reset shadow

      // Draw Earth dark shadow masking for realistic 3D appearance
      const shadowGrad = ctx.createRadialGradient(
        earthX - earthRadius * 0.4,
        earthY - earthRadius * 0.4,
        earthRadius * 0.8,
        earthX,
        earthY,
        earthRadius
      );
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      shadowGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.45)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.92)');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthRadius, 0, Math.PI * 2);
      ctx.fill();

      // Restore clip
      ctx.restore();

      // Earth digital atmosphere edge ring
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthRadius, 0, Math.PI * 2);
      ctx.stroke();

      // 7. FLOAT AND PULSE SHINING ADVANCED INDIA MAP (🇮🇳)
      // We will render a beautifully-crafted high-fidelity neon India map silhouette or 
      // neon geometric beacon floating directly adjacent or above the Earth sphere as requested.
      const hoverPulse = Math.sin(Date.now() * 0.002) * 6;
      const mapX = earthX - earthRadius * 1.3;
      const mapY = earthY + earthRadius * 0.5 + hoverPulse;

      // Draw futuristic orbital lines linking India to Earth core console
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)'; // Tech orange/red beacon
      ctx.setLineDash([4, 4]);
      ctx.moveTo(mapX, mapY);
      ctx.lineTo(earthX, earthY);
      ctx.stroke();
      ctx.restore();

      // Render a gorgeous neon vector map schematic of India
      ctx.save();
      ctx.translate(mapX, mapY);

      // Neon background aura
      ctx.shadowColor = 'rgba(34, 197, 94, 0.82)'; // Indian saffron/green glowing tech aura
      ctx.shadowBlur = 15;
      ctx.fillStyle = 'rgba(239, 121, 35, 0.15)'; // Indian Saffron tint fill
      ctx.lineWidth = 2.5;

      // Handcrafted detailed polygon vector points mimicking shape of India
      // Coordinates normalized to scale
      const points = [
        { x: 0, y: -45 },     // Northern tip (Kashmir / Ladakh)
        { x: 8, y: -38 },
        { x: 12, y: -32 },    // Himachal Pradesh region
        { x: 22, y: -30 },    // Nepal Border Start
        { x: 15, y: -25 },
        { x: 28, y: -25 },    // Central Nepal
        { x: 38, y: -27 },    // Sikkim region
        { x: 35, y: -20 },    // Bhutan border
        { x: 48, y: -22 },    // Arunachal Pradesh / North East
        { x: 50, y: -15 },
        { x: 42, y: -12 },    // Assam bend
        { x: 45, y: -3 },     // Mizoram tip
        { x: 35, y: -3 },     // Bangladesh cut
        { x: 30, y: -12 },
        { x: 34, y: -16 },    // West Bengal
        { x: 27, y: -12 },    // Odisha Coast
        { x: 18, y: -2 },     // Andhra Coast
        { x: 10, y: 15 },     // Tamil Nadu Coast
        { x: 5, y: 35 },      // Southern Tip (Kanyakumari)
        { x: -3, y: 32 },     // Kerala Coast
        { x: -8, y: 22 },     // Karnataka Coast
        { x: -14, y: 12 },    // Goa / Maharashtra Coast
        { x: -15, y: 2 },     // Mumbai region
        { x: -18, y: -4 },    // Gujarat Gulf of Khambhat
        { x: -32, y: -3 },    // Saurashtra Peninsula
        { x: -34, y: -11 },   // Kutch region
        { x: -25, y: -18 },   // Rajasthan-Pak border
        { x: -18, y: -30 },   // Punjab border
        { x: -6, y: -38 },    // Jammu region
      ];

      // Draw custom multi-tiered holographic colors
      // We will trace Saffron (top), White (mid), Green (bottom)
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach((pt) => ctx.lineTo(pt.x, pt.y));
      ctx.closePath();
      ctx.fill();

      // Stroke with elegant pulse
      const greenSaffronGrad = ctx.createLinearGradient(0, -42, 0, 32);
      greenSaffronGrad.addColorStop(0, '#FF9933'); // Saffron
      greenSaffronGrad.addColorStop(0.5, '#FFFFFF'); // White
      greenSaffronGrad.addColorStop(1, '#128807'); // Green
      ctx.strokeStyle = greenSaffronGrad;
      ctx.stroke();

      // Glowing Ashoka Chakra center beacon
      ctx.fillStyle = '#00008855';
      ctx.strokeStyle = 'rgba(0, 0, 136, 0.9)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(8, -8, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Draw spokes
      ctx.beginPath();
      ctx.arc(8, -8, 1, 0, Math.PI * 2);
      ctx.fillStyle = '#000088';
      ctx.fill();

      // Top off-pin labels "Satyam Core 👑"
      ctx.shadowBlur = 0; // disable shadow for small texts
      ctx.font = '700 8px "JetBrains Mono", monospace';
      ctx.fillStyle = '#a855f7';
      ctx.fillText('👑 INDIA BASE', -25, -55);
      
      ctx.font = '400 6px "JetBrains Mono", monospace';
      ctx.fillStyle = '#22c55e';
      ctx.fillText('STATUS: POWER LEVEL OVER 9999+', -45, 48);

      ctx.restore();

      // 8. Draw floating dust particles
      dustParticles.forEach((part) => {
        part.x += part.vx;
        part.y += part.vy;

        // Wrap around borders
        if (part.x < 0) part.x = width;
        if (part.x > width) part.x = 0;
        if (part.y < 0) part.y = height;
        if (part.y > height) part.y = 0;

        ctx.fillStyle = part.color;
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 9. Draw floating cosmic space emojis gentle drifting
      spaceEmojis.forEach((emoji) => {
        emoji.x += emoji.vx;
        emoji.y += emoji.vy;
        emoji.rotation += emoji.rotSpeed;

        if (emoji.x < -30) emoji.x = width + 30;
        if (emoji.x > width + 30) emoji.x = -30;
        if (emoji.y < -30) emoji.y = height + 30;
        if (emoji.y > height + 30) emoji.y = -30;

        ctx.save();
        ctx.translate(emoji.x, emoji.y);
        ctx.rotate(emoji.rotation);
        ctx.font = `${Math.floor(24 * emoji.scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Add subtle neon shadows
        ctx.shadowColor = 'rgba(255,255,255,0.3)';
        ctx.shadowBlur = 8;
        ctx.fillText(emoji.text, 0, 0);
        ctx.restore();
      });

      ctx.restore(); // Restore global zoom transformation matrix

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      id="space-background-canvas"
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
