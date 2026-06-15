export type GamePhase = 'welcome' | 'q1' | 'q2' | 'q3' | 'q4' | 'final';

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  emoji?: string;
}

export interface Achievement {
  id: string;
  title: string;
  unlocked: boolean;
  description: string;
}

export interface SoundEffectType {
  hover: () => void;
  click: () => void;
  escape: () => void;
  success: () => void;
  achievement: () => void;
  shake: () => void;
}
