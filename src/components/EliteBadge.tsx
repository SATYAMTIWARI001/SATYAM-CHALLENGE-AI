import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface EliteBadgeProps {
  turns: number;
  isCreator?: boolean;
}

export const EliteBadge: React.FC<EliteBadgeProps> = ({ turns, isCreator = false }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Determine badge values based on tier
  let title = '';
  let sub = '';
  let description = '';
  let badgeId = '';
  let colors: { from: string; via?: string; to: string; bg: string; border: string; text: string } = {
    from: '#3b82f6',
    to: '#0284c7',
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.3)',
    text: 'text-blue-400',
  };

  if (isCreator) {
    title = 'Supreme Architect';
    sub = '0 TURNS • INFINITE';
    description = 'Creator of The Satyam Challenge holding supreme admin rights and infinite respect.';
    badgeId = 'creator';
    colors = {
      from: '#fbbf24',
      via: '#f59e0b',
      to: '#dbaf42',
      bg: 'rgba(251, 191, 36, 0.15)',
      border: 'rgba(251, 191, 36, 0.4)',
      text: 'text-yellow-400',
    };
  } else if (turns <= 2) {
    title = 'Divine Ascent';
    sub = `${turns} ${turns === 1 ? 'TURN' : 'TURNS'} • GODLIKE`;
    description = 'Achieved absolute divinity and godlike mental compression with extraordinary speed.';
    badgeId = 'divine';
    colors = {
      from: '#f43f5e',
      via: '#ec4899',
      to: '#f59e0b',
      bg: 'rgba(244, 63, 94, 0.15)',
      border: 'rgba(244, 63, 94, 0.35)',
      text: 'text-rose-400',
    };
  } else if (turns <= 4) {
    title = 'Grandmaster Cosmos';
    sub = `${turns} TURNS • MYTHIC`;
    description = 'Celestial level of logic. Master of structural pattern solutions across cosmic grids.';
    badgeId = 'cosmos';
    colors = {
      from: '#a855f7',
      via: '#8b5cf6',
      to: '#ec4899',
      bg: 'rgba(139, 92, 246, 0.15)',
      border: 'rgba(139, 92, 246, 0.35)',
      text: 'text-purple-400',
    };
  } else if (turns <= 8) {
    title = 'Elite Defender';
    sub = `${turns} TURNS • ELITE`;
    description = 'Passed the firewall with superb awareness, accuracy, and quick cognitive defense.';
    badgeId = 'defender';
    colors = {
      from: '#10b981',
      to: '#06b6d4',
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.3)',
      text: 'text-emerald-400',
    };
  } else {
    title = 'Persistent Believer';
    sub = `${turns} TURNS • WARRIOR`;
    description = 'Conquered all obstacles by pure willpower, patience, and absolute perseverance.';
    badgeId = 'believer';
    colors = {
      from: '#3b82f6',
      to: '#1d4ed8',
      bg: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.25)',
      text: 'text-blue-400',
    };
  }

  // Multi-tier animated SVG Badge Renderer
  const renderSVGBadge = () => {
    switch (badgeId) {
      case 'creator':
        return (
          <motion.svg
            width="24"
            height="24"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="cursor-pointer drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          >
            <defs>
              <linearGradient id="creatorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
              <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* Pulsing Outer Orbit */}
            <circle cx="50" cy="50" r="44" stroke="url(#creatorGrad)" strokeWidth="3" strokeDasharray="6 4" opacity="0.8" />
            <circle cx="50" cy="50" r="38" stroke="url(#creatorGrad)" strokeWidth="1.5" opacity="0.4" />
            {/* Rotated Star Background */}
            <polygon points="50,15 61,38 85,38 66,54 72,78 50,65 28,78 34,54 15,38 39,38" fill="url(#creatorGrad)" filter="url(#goldGlow)" />
            {/* Center Crown Emblem */}
            <path d="M38 48 L44 58 L50 48 L56 58 L62 48 L65 65 L35 65 Z" fill="#000000" opacity="0.85" />
            <circle cx="50" cy="50" r="3" fill="#ffffff" />
          </motion.svg>
        );

      case 'divine':
        return (
          <motion.svg
            width="24"
            height="24"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="cursor-pointer drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <defs>
              <linearGradient id="divineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="60%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>
            {/* Celestial Angelic Wings */}
            <path d="M15 45 C30 30 40 45 50 65 C60 45 70 30 85 45 C75 70 60 75 50 75 C40 75 25 70 15 45 Z" fill="url(#divineGrad)" opacity="0.3" />
            {/* Divine Shield Frame */}
            <path d="M50 12 L80 25 L80 55 C80 75 50 88 50 88 C50 88 20 75 20 55 L20 25 Z" stroke="url(#divineGrad)" strokeWidth="4.5" fill="rgba(15,10,25,0.7)" />
            {/* Radiant Sparkle */}
            <path d="M50 25 L54 44 L73 48 L54 52 L50 71 L46 52 L27 48 L46 44 Z" fill="url(#divineGrad)" />
            <circle cx="50" cy="48" r="4" fill="#ffffff" />
          </motion.svg>
        );

      case 'cosmos':
        return (
          <motion.svg
            width="24"
            height="24"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="cursor-pointer drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"
            whileHover={{ scale: 1.15 }}
          >
            <defs>
              <linearGradient id="cosmosGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            {/* Double Hexagon Matrix */}
            <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" stroke="url(#cosmosGrad)" strokeWidth="4" fill="rgba(10,5,30,0.8)" />
            <polygon points="50,20 76,35 76,65 50,80 24,65 24,35" stroke="url(#cosmosGrad)" strokeWidth="1.5" opacity="0.5" />
            {/* Galactic Sphere and Rings */}
            <circle cx="50" cy="50" r="14" fill="url(#cosmosGrad)" />
            <ellipse cx="50" cy="50" rx="22" ry="5" stroke="#ffffff" strokeWidth="2.5" transform="rotate(-25 50 50)" opacity="0.9" />
            <circle cx="50" cy="50" r="4" fill="#ffffff" />
          </motion.svg>
        );

      case 'defender':
        return (
          <motion.svg
            width="24"
            height="24"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="cursor-pointer drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]"
          >
            <defs>
              <linearGradient id="defGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            {/* Futuristic Tech Shield */}
            <path d="M50 15 L82 30 L76 65 C70 80 50 87 50 87 C50 87 30 80 24 65 L18 30 Z" stroke="url(#defGrad)" strokeWidth="4" fill="rgba(5,20,15,0.75)" />
            {/* Crosshairs & Security Seal */}
            <line x1="50" y1="25" x2="50" y2="75" stroke="url(#defGrad)" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="25" y1="50" x2="75" y2="50" stroke="url(#defGrad)" strokeWidth="1.5" strokeDasharray="3 3" />
            <rect x="42" y="42" width="16" height="16" rx="4" fill="url(#defGrad)" />
            <path d="M47 50 L49 52 L53 48" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        );

      default:
        return (
          <motion.svg
            width="24"
            height="24"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="cursor-pointer drop-shadow-[0_0_4px_rgba(59,130,246,0.3)]"
          >
            <defs>
              <linearGradient id="belGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>
            {/* Standard circular solid badge representing persistent support */}
            <circle cx="50" cy="50" r="32" stroke="url(#belGrad)" strokeWidth="3" fill="rgba(5,10,25,0.8)" />
            <path d="M50 28 L56 42 L72 42 L59 51 L64 66 L50 56 L36 66 L41 51 L28 42 L44 42 Z" fill="url(#belGrad)" />
            <circle cx="50" cy="50" r="5" fill="#ffffff" opacity="0.3" />
          </motion.svg>
        );
    }
  };

  return (
    <div 
      className="relative flex items-center shrink-0"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="relative z-10 flex items-center justify-center p-0.5 rounded-lg hover:bg-white/5 transition-colors">
        {renderSVGBadge()}
      </div>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 w-64 p-4 bg-[#0a071c]/95 border border-purple-500/30 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(139,92,246,0.15)] backdrop-blur-xl text-left"
          >
            <div className="flex flex-col gap-1">
              <span className={`text-[10px] font-black uppercase tracking-widest ${colors.text} font-mono`}>
                {sub}
              </span>
              <h5 className="text-sm font-black text-white uppercase tracking-wide font-display">
                {title}
              </h5>
              <div className="h-[1px] bg-white/10 my-1"/>
              <p className="text-[11px] text-gray-300 leading-relaxed font-sans font-medium">
                {description}
              </p>
              <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[9px] text-gray-500 font-mono">
                <span>VERIFIED LEGACY</span>
                <span className="text-gray-400 font-bold">100% SECURE</span>
              </div>
            </div>
            {/* Tiny Tooltip Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 rotate-45 bg-[#0a071c] border-r border-b border-purple-500/35" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
