/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  Sparkles,
  Share2,
  Users,
  Twitter,
  Briefcase,
  Play,
  Heart,
  Smile,
  ShieldCheck,
  CheckCircle,
  Smartphone,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';

import { sound } from './components/SoundEngine';
import SpaceBackground from './components/SpaceBackground';
import CursorTrail from './components/CursorTrail';
import RunningButton from './components/RunningButton';
import Certificate from './components/Certificate';
import { subscribeToSupporters, registerSupporter, SupporterRecord } from './firebase';

export default function App() {
  const [phase, setPhase] = useState<'welcome' | 'q1' | 'q2' | 'q3' | 'q4' | 'final'>('welcome');
  const [name, setName] = useState('Satyam');
  const [nameInput, setNameInput] = useState('Satyam');
  const [email, setEmail] = useState('satyam000108@gmail.com');
  const [emailInput, setEmailInput] = useState('satyam000108@gmail.com');
  const [turns, setTurns] = useState(1);
  const [isShaking, setIsShaking] = useState(false);
  const [toast, setToast] = useState<{ title: string; desc: string; active: boolean }>({
    title: '',
    desc: '',
    active: false,
  });

  const [copied, setCopied] = useState(false);
  const [escapeCount, setEscapeCount] = useState(0);
  const [activeMessage, setActiveMessage] = useState('Only premium minds allowed.');
  
  // Real-time supporter state sync variables
  const [globalSupporters, setGlobalSupporters] = useState<SupporterRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Achievement logs
  const [achievements, setAchievements] = useState([
    { id: 'knows_satyam', title: 'Knows Satyam', unlocked: false, desc: 'Passed the "Do you know him?" logic check.' },
    { id: 'id_verified', title: 'Identified Citizen', unlocked: false, desc: 'Officially declared your cosmic identity.' },
    { id: 'believer', title: 'True Believer', unlocked: false, desc: 'Confessed absolute belief in Satyam.' },
    { id: 'wealth_status', title: 'Wealth Realist', unlocked: false, desc: 'Agreed that Satyam remains supreme rich.' },
  ]);

  // Page shake trigger
  useEffect(() => {
    const triggerShake = () => {
      setIsShaking(true);
      sound.playShake();
      setTimeout(() => setIsShaking(false), 500);
    };

    window.addEventListener('satyam-shake-page', triggerShake);
    return () => window.removeEventListener('satyam-shake-page', triggerShake);
  }, []);

  // Real-time server listener subscription to retrieve and display active completions
  useEffect(() => {
    const unsubscribe = subscribeToSupporters((supportersList) => {
      setGlobalSupporters(supportersList);
    });
    return () => unsubscribe();
  }, []);

  // Sync supporter data with remote Firestore
  const saveSupporterRecord = async (finalTurns: number) => {
    if (hasSubmitted || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await registerSupporter({
        name: nameInput.trim() || 'Satyam Supporter',
        email: emailInput.trim() || 'satyam000108@gmail.com',
        turns: finalTurns,
        respectRank: 'Maximum',
        powerLevel: '9999+',
        rank: 'Elite Level',
      });
      setHasSubmitted(true);
      triggerToast('🏆 Supporter Certified', 'Your legendary result is saved in the global archive!');
    } catch (e) {
      console.error('Failed to register supporter progress:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Display toast alerts beautifully
  const triggerToast = (title: string, desc: string) => {
    setToast({ title, desc, active: true });
    sound.playAchievement();
    setTimeout(() => {
      setToast((prev) => ({ ...prev, active: false }));
    }, 4500);
  };

  // Unlocking specific achievements with sound
  const unlockAchievement = (id: string) => {
    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.id === id && !ach.unlocked) {
          triggerToast('🏆 Achievement Unlocked', ach.title);
          return { ...ach, unlocked: true };
        }
        return ach;
      })
    );
  };

  // Confetti explosive loop
  const launchEpicConfetti = () => {
    const duration = 6000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  // Next level navigation handlers
  const handleStartChallenge = () => {
    sound.playClick();
    setTurns(1);
    setPhase('q1');
  };

  const handleQ1Success = () => {
    sound.playClick();
    setTurns((t) => t + 1);
    unlockAchievement('knows_satyam');
    setPhase('q2');
  };

  const handleQ2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !emailInput.trim()) {
      sound.playShake();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    sound.playClick();
    setName(nameInput.trim());
    setEmail(emailInput.trim());
    setTurns((t) => t + 1);
    unlockAchievement('id_verified');
    setPhase('q3');
  };

  const handleQ3Success = () => {
    sound.playClick();
    setTurns((t) => t + 1);
    unlockAchievement('believer');
    setPhase('q4');
  };

  const handleQ4Success = () => {
    sound.playTriumph();
    const finalTurns = turns + 1;
    setTurns(finalTurns);
    unlockAchievement('wealth_status');
    setPhase('final');
    // Launch massive confetti on entry
    launchEpicConfetti();
    // Fire off remote Firestore database write
    saveSupporterRecord(finalTurns);
  };

  // WhatsApp & Social Share generator links
  const appUrl = (typeof window !== 'undefined' && window.location.href) || 'https://ai.studio/build';
  const shareText = `👑 I officially completed "The Satyam Challenge" and became a Certified Elite Satyam Supporter with Maximum Respect! 😎 Can you survive the test without disagreeing%3F Try it here: ${encodeURIComponent(appUrl)}`;

  const shareToTwitter = () => {
    sound.playClick();
    window.open(`https://twitter.com/intent/tweet?text=${shareText}`, '_blank');
  };

  const shareToWhatsApp = () => {
    sound.playClick();
    window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
  };

  const shareToLinkedIn = () => {
    sound.playClick();
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}`,
      '_blank'
    );
  };

  const handleScreenshotMock = () => {
    sound.playClick();
    setCopied(true);
    navigator.clipboard.writeText(appUrl);
    triggerToast('📋 URL Copied!', 'Share this web link directly with your friends!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    sound.playClick();
    setPhase('welcome');
    setName('Satyam');
    setNameInput('Satyam');
    setEmail('satyam000108@gmail.com');
    setEmailInput('satyam000108@gmail.com');
    setEscapeCount(0);
    setHasSubmitted(false);
    setAchievements((prev) => prev.map((ach) => ({ ...ach, unlocked: false })));
  };

  return (
    <main className="relative min-h-screen w-full text-white bg-[#050505] font-sans select-none overflow-x-hidden flex flex-col justify-between">
      
      {/* Premium custom high fidelity backdrops */}
      <SpaceBackground />
      <CursorTrail />

      {/* Main Navigation/Header in Sophisticated style */}
      <header className="relative w-full z-20 pt-8 px-6 sm:px-12 flex justify-between items-center pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-blue-500 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]">
            S
          </div>
          <span className="text-base sm:text-lg font-bold tracking-widest neon-text uppercase text-white font-display">
            The Satyam Challenge
          </span>
        </div>
        <div className="glass px-4 py-2 rounded-full text-xs sm:text-sm font-medium flex gap-4 sm:gap-6 border border-white/10">
          <span className="text-purple-400 font-extrabold font-mono">
            {phase === 'welcome' ? 'Level 00' : `Level 0${phase === 'final' ? '4' : phase[1]}`}
          </span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-200">
            Status: {phase === 'final' ? '🏆 Certified Elite' : 'True Believer'}
          </span>
        </div>
      </header>

      {/* Split Main Content */}
      <div className="relative flex-1 z-10 w-full max-w-7xl mx-auto px-4 sm:px-12 py-8 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">
        
        {/* Left: Beautiful Decorative Visual/Intro columns */}
        <div className="hidden lg:flex flex-1 flex-col items-start text-left select-none">
          <div className="text-7xl mb-8 filter drop-shadow-[0_0_30px_rgba(139,92,246,0.55)] animate-bounce">
            🌍
          </div>
          {phase === 'final' ? (
            <h1 className="text-5xl xl:text-7xl font-black mb-4 leading-none neon-text italic text-white tracking-tighter uppercase font-display">
              CHALLENGE<br />COMPLETED 🎉
            </h1>
          ) : (
            <h1 className="text-5xl xl:text-7xl font-black mb-4 leading-none neon-text italic text-white tracking-tighter uppercase font-display">
              ONLY TRUE<br />BELIEVERS
            </h1>
          )}
          <p className="text-gray-400 text-base xl:text-lg max-w-md mb-8 leading-relaxed font-sans font-light">
            Welcome to the ultimate digital pilgrimage. Complete all levels to become a Certified Satyam Supporter. Remember: Disagreement is not an option. 😎
          </p>
          <div className="flex gap-4">
            <div className="glass p-4 rounded-2xl flex flex-col gap-1 min-w-[130px] border border-white/10 shadow-lg">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Power Level</span>
              <span className="text-lg font-mono text-purple-400 font-extrabold">⚡ 9999+</span>
            </div>
            <div className="glass p-4 rounded-2xl flex flex-col gap-1 min-w-[130px] border border-white/10 shadow-lg">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Respect Rank</span>
              <span className="text-lg font-mono text-blue-400 font-extrabold uppercase">Maximum</span>
            </div>
          </div>
        </div>

        {/* Right: Interactive Card Area with beautiful backdrop layers */}
        <div className="w-full lg:max-w-[500px] relative">
          
          {/* Decorative Floating Card behind main */}
          <div className="absolute -top-3 -right-3 w-full h-full glass rounded-[40px] -z-10 opacity-30 rotate-3 pointer-events-none border border-white/5 shadow-xl" />

          {/* Master Question Container with Physics-Shake feedback wrapper */}
          <motion.div
            animate={
              isShaking
                ? {
                    x: [-15, 15, -12, 12, -8, 8, -4, 4, 0],
                    y: [-3, 3, -2, 2, -1, 1, 0],
                  }
                : { x: 0, y: 0 }
            }
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <AnimatePresence mode="wait">
              {/* Phase 0: WELCOME SCREEN */}
              {phase === 'welcome' && (
                <motion.div
                  key="welcome"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="glass rounded-[40px] p-6 sm:p-10 flex flex-col text-center relative z-10 neon-border-purple text-white shadow-2xl"
                >
                  <div className="bg-violet-600/20 text-violet-400 px-4 py-1.5 rounded-full text-xs font-bold mb-6 uppercase tracking-widest self-center border border-violet-500/20 shadow-sm">
                    Pilgrimage Start
                  </div>

                  {/* Visual Avatar Placeholder representing Satyam */}
                  <div className="relative mb-6 self-center group">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-purple-600 blur-md opacity-75 group-hover:opacity-100 transition-opacity animate-pulse w-24 h-24" />
                    <div className="relative w-24 h-24 rounded-full border-2 border-yellow-400/50 bg-slate-900 flex items-center justify-center">
                      <span className="text-4xl text-yellow-300 filter drop-shadow">😎</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                      PRESIDENT
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight font-display">
                    Welcome to the Ultimate <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 font-extrabold font-display">
                      Satyam Challenge
                    </span>
                  </h2>

                  <p className="text-gray-400 text-xs sm:text-sm mt-3 leading-relaxed font-sans">
                    Only True Believers can complete this journey. Warning: This process will assess your sanity and obedience. Disobedience is mathematically impossible.
                  </p>

                  {/* Verified Session Info */}
                  <div className="mt-4 px-4 py-2.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-left text-xs text-gray-400 font-mono">
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase text-purple-400 tracking-wider">Candidate Detected</span>
                      <span className="text-gray-200 font-bold">satyam000108@gmail.com</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] block uppercase text-purple-400 tracking-wider">Status</span>
                      <span className="text-emerald-400 animate-pulse font-bold">● Verified</span>
                    </div>
                  </div>

                  {/* Funny rules list */}
                  <div className="mt-6 text-left space-y-3 bg-purple-950/20 rounded-2xl p-4 border border-purple-500/10">
                    <h4 className="text-purple-300 text-xs font-bold uppercase tracking-wider font-mono">📜 Golden Directives</h4>
                    
                    <div className="flex items-start gap-2.5 text-xs text-gray-300">
                      <span className="text-yellow-400">🔥</span>
                      <p>You cannot disagree with Satyam under any cosmic parameters. 😎</p>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-gray-300">
                      <span className="text-yellow-400">🔥</span>
                      <p>Wrong choices may and will run away from your mouse cursor. 😂</p>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-gray-300">
                      <span className="text-yellow-400">🔥</span>
                      <p>Complete all 4 levels to unlock the elite Certified Supporters Certificate. 🏆</p>
                    </div>
                  </div>

                  {/* Real-time Certified Believers Lobby */}
                  <div className="mt-6 border-t border-white/5 pt-4 text-left">
                    <h4 className="text-cyan-400 text-xs font-black uppercase tracking-wider font-mono flex items-center justify-between mb-3">
                      <span>🏆 Live Supporters Hall ({globalSupporters.length})</span>
                      <span className="text-[9px] text-gray-500 font-normal tracking-wide uppercase font-mono">Real-Time Synced</span>
                    </h4>
                    {globalSupporters.length === 0 ? (
                      <div className="text-center py-4 text-xs font-mono text-gray-500 italic">
                        No completions yet. Be the first! 🚀
                      </div>
                    ) : (
                      <div className="max-h-36 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {globalSupporters.map((sup, idx) => (
                          <div key={sup.id || idx} className="flex items-center justify-between p-2.5 bg-white/[0.02] border border-white/5 rounded-xl text-xs gap-3">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="text-yellow-400 font-bold flex-shrink-0">🔱</span>
                              <div className="flex flex-col overflow-hidden">
                                <span className="font-bold text-gray-200 truncate">{sup.name}</span>
                                <span className="text-[9px] text-gray-500 font-mono lowercase truncate">{sup.email}</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-purple-400 font-bold flex-shrink-0">{sup.turns} turns</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Big Start button */}
                  <button
                    id="btn-start"
                    onClick={handleStartChallenge}
                    onPointerEnter={() => sound.playHover()}
                    className="mt-8 overflow-hidden group relative w-full py-4 text-center text-sm font-bold uppercase tracking-widest rounded-2xl cursor-pointer bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-500 text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.35)] hover:shadow-[0_0_40px_rgba(245,158,11,0.55)] active:scale-95 transition-all outline-none border border-yellow-500/10"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Play className="w-4 h-4 fill-current" />
                      Start Challenge 🚀
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-12 group-hover:translate-y-0 transition-transform duration-300" />
                  </button>
                </motion.div>
              )}

            {/* Q1 Screen */}
            {phase === 'q1' && (
              <motion.div
                key="q1"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                className="glass rounded-[40px] p-6 sm:p-10 flex flex-col relative z-10 neon-border-purple text-white shadow-2xl"
              >
                <div className="bg-violet-600/20 text-violet-400 px-4 py-1.5 rounded-full text-xs font-bold mb-6 uppercase tracking-widest self-center border border-violet-500/20 shadow-sm">
                  LEVEL 01 • Logic Evaluation
                </div>

                <div className="text-center mb-8">
                  <div className="text-5xl mb-4 animate-bounce">🤔</div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                    Do you know Satyam?
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 font-sans">
                    Think extremely wisely before submitting.
                  </p>
                </div>

                {/* Dual Decision Option Controls */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center py-6 min-h-[140px] relative">
                  
                  {/* Sane standard selection works */}
                  <motion.button
                    id="btn-q1-yes"
                    onClick={handleQ1Success}
                    onPointerEnter={() => sound.playHover()}
                    className="w-full sm:w-1/2 py-4 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500 text-white font-extrabold text-sm uppercase rounded-2xl shadow-[0_8px_25px_rgba(139,92,246,0.3)] cursor-pointer order-2 sm:order-1 outline-none border border-violet-400/20"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ✅ YES
                  </motion.button>

                  {/* Mad runaway option escaping cursor */}
                  <div className="w-full sm:w-1/2 flex items-center justify-center order-1 sm:order-2">
                    <RunningButton
                      idText="btn-q1-no"
                      text="❌ NO"
                      funnyMessages={[
                        '😂 "Nice Try!"',
                        '🏃 "Catch me first!"',
                        '😎 "Everyone knows Satyam!"',
                        '🚀 "Not possible!"',
                      ]}
                      onEscape={(msg) => {
                        setEscapeCount((c) => c + 1);
                        setTurns((t) => t + 1);
                        setActiveMessage(msg);
                      }}
                      className="bg-red-600/80 hover:bg-red-500 text-white w-full sm:w-auto"
                    />
                  </div>
                </div>

                {/* Sub-status live feed logs to make it look responsive and professional */}
                <div className="mt-4 border border-dashed border-purple-500/20 rounded-xl p-3 bg-black/60 font-mono text-xs text-center text-gray-500">
                  <span className="text-purple-400">Escape Counter:</span> {escapeCount} times |{' '}
                  <span className="text-gray-300 italic">{activeMessage}</span>
                </div>
              </motion.div>
            )}

            {/* Q2 Screen: ENTER NAME */}
            {phase === 'q2' && (
              <motion.div
                key="q2"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                className="glass rounded-[40px] p-6 sm:p-10 flex flex-col relative z-10 neon-border-purple text-white shadow-2xl"
              >
                <div className="bg-violet-600/20 text-violet-400 px-4 py-1.5 rounded-full text-xs font-bold mb-6 uppercase tracking-widest self-center border border-violet-500/20 shadow-sm">
                  LEVEL 02 • Citizen Identity
                </div>

                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">👤</div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                    Enter Your Name
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 font-sans">
                    Provide your genuine name so we can forge your Official Certificate.
                  </p>
                </div>

                <form onSubmit={handleQ2Submit} className="space-y-4 mt-2">
                  <div className="space-y-1 text-left">
                    <label htmlFor="input-name" className="text-[10px] uppercase text-purple-400 tracking-wider font-mono font-bold block">Genuine Name</label>
                    <div className="relative">
                      <input
                        id="input-name"
                        type="text"
                        maxLength={24}
                        value={nameInput}
                        onChange={(e) => {
                          setNameInput(e.target.value);
                          if (Math.random() > 0.7) sound.playHover();
                        }}
                        placeholder="e.g. Satoshi Nakamoto"
                        className="w-full bg-slate-900/40 border-2 border-purple-500/30 focus:border-violet-400 rounded-2xl px-5 py-3 text-white text-base font-semibold placeholder:text-gray-600 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all text-center uppercase tracking-wide"
                        required
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-purple-400">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <label htmlFor="input-email" className="text-[10px] uppercase text-purple-400 tracking-wider font-mono font-bold block">Verified Email</label>
                    <div className="relative">
                      <input
                        id="input-email"
                        type="email"
                        maxLength={60}
                        value={emailInput}
                        onChange={(e) => {
                          setEmailInput(e.target.value);
                          if (Math.random() > 0.7) sound.playHover();
                        }}
                        placeholder="e.g. satyam000108@gmail.com"
                        className="w-full bg-slate-900/40 border-2 border-purple-500/30 focus:border-violet-400 rounded-2xl px-5 py-3 text-white text-base font-semibold placeholder:text-gray-600 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all text-center tracking-wide"
                        required
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-purple-400">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {(nameInput.trim() || emailInput.trim()) && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center text-purple-300 font-mono text-xs py-1"
                    >
                      ✨ Welcome <span className="text-cyan-400 font-bold">{nameInput}</span> ✨
                      <span className="block text-[10px] text-gray-500">{emailInput}</span>
                    </motion.div>
                  )}

                  <button
                    id="btn-name-submit"
                    type="submit"
                    onPointerEnter={() => sound.playHover()}
                    className="w-full py-4 mt-2 text-center text-sm font-bold uppercase tracking-widest rounded-2xl cursor-pointer bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500 text-white shadow-[0_5px_15px_rgba(139,92,246,0.3)] hover:shadow-[0_8px_25px_rgba(139,92,246,0.5)] active:scale-95 transition-all outline-none border border-violet-500/20"
                  >
                    Continue Challenge 🚀
                  </button>
                </form>
              </motion.div>
            )}

            {/* Q3 Screen */}
            {phase === 'q3' && (
              <motion.div
                key="q3"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                className="glass rounded-[40px] p-6 sm:p-10 flex flex-col relative z-10 neon-border-purple text-white shadow-2xl"
              >
                <div className="bg-violet-600/20 text-violet-400 px-4 py-1.5 rounded-full text-xs font-bold mb-6 uppercase tracking-widest self-center border border-violet-500/20 shadow-sm">
                  LEVEL 03 • Faith Confirmation
                </div>

                <div className="text-center mb-8">
                  <div className="text-5xl mb-4 animate-pulse">💎</div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                    Do you believe in Satyam?
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 font-sans">
                    Welcome <span className="text-purple-400 font-bold uppercase">{name}</span>. Time to declare your cosmology.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center py-6 min-h-[140px] relative">
                  
                  {/* YES button works */}
                  <motion.button
                    id="btn-q3-yes"
                    onClick={handleQ3Success}
                    onPointerEnter={() => sound.playHover()}
                    className="w-full sm:w-1/2 py-4 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500 text-white font-extrabold text-sm uppercase rounded-2xl shadow-[0_8px_25px_rgba(139,92,246,0.3)] cursor-pointer order-2 sm:order-1 outline-none border border-purple-500/20"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ✅ YES
                  </motion.button>

                  {/* Escaping button */}
                  <div className="w-full sm:w-1/2 flex items-center justify-center order-1 sm:order-2">
                    <RunningButton
                      idText="btn-q3-no"
                      text="❌ NO"
                      funnyMessages={[
                        '😂 "Wrong Answer Loading…"',
                        '🔥 "Try Again!"',
                        '😎 "The Universe Says YES"',
                      ]}
                      onEscape={(msg) => {
                        setEscapeCount((c) => c + 1);
                        setTurns((t) => t + 1);
                        setActiveMessage(msg);
                      }}
                      className="bg-red-600/80 hover:bg-red-500 text-white w-full sm:w-auto"
                    />
                  </div>
                </div>

                {/* Status bar */}
                <div className="mt-4 border border-dashed border-purple-500/20 rounded-xl p-3 bg-black/60 font-mono text-xs text-center text-gray-500">
                  <span className="text-purple-400">Faith Verified:</span> IN PROCESS... |{' '}
                  <span className="text-gray-300 italic">{activeMessage}</span>
                </div>
              </motion.div>
            )}

            {/* Q4 Screen */}
            {phase === 'q4' && (
              <motion.div
                key="q4"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                className="glass rounded-[40px] p-6 sm:p-10 flex flex-col relative z-10 neon-border-purple text-white shadow-2xl"
              >
                <div className="bg-violet-600/20 text-violet-400 px-4 py-1.5 rounded-full text-xs font-bold mb-6 uppercase tracking-widest self-center border border-violet-500/20 shadow-sm">
                  LEVEL 04 • Wealth Ascendency
                </div>

                <div className="text-center mb-8">
                  <div className="text-5xl mb-4 animate-pulse">🏆</div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                    Who will be richer?
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 font-sans">
                    Final query before core certificate synthesis.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center py-6 min-h-[140px] relative">
                  
                  {/* SATYAM button works perfectly */}
                  <motion.button
                    id="btn-q4-satyam"
                    onClick={handleQ4Success}
                    onPointerEnter={() => sound.playHover()}
                    className="w-full sm:w-1/2 py-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-slate-950 font-extrabold text-sm uppercase rounded-2xl shadow-[0_8px_25px_rgba(245,158,11,0.3)] cursor-pointer order-2 sm:order-1 outline-none border border-yellow-500/10"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    👑 SATYAM
                  </motion.button>

                  {/* ME running away with a popup trigger as requested */}
                  <div className="w-full sm:w-1/2 flex items-center justify-center order-1 sm:order-2">
                    <RunningButton
                      idText="btn-q4-me"
                      text="💰 ME"
                      funnyMessages={[
                        '😂 "Confidence Level: Too High"',
                        '😎 "Satyam is already ahead!"',
                        '🚀 "Choose wisely!"',
                      ]}
                      onEscape={(msg) => {
                        setEscapeCount((c) => c + 1);
                        setTurns((t) => t + 1);
                        setActiveMessage(msg);
                        sound.playBlink();
                      }}
                      className="bg-red-600/80 hover:bg-red-500 text-white w-full sm:w-auto"
                    />
                  </div>
                </div>

                {/* Custom warning alert panel */}
                <div className="mt-4 border border-dashed border-red-500/30 rounded-xl p-3 bg-red-950/10 font-mono text-xs text-center text-red-300">
                  ⚠️ <span className="font-bold">System Override:</span> {activeMessage}
                </div>
              </motion.div>
            )}

            {/* Phase 5: CELEBRATION / FINAL SCREEN */}
            {phase === 'final' && (
              <motion.div
                key="final"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="w-full space-y-8 pb-12"
              >
                {/* Result header banner */}
                <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(234,179,8,0.15)] text-center">
                  
                  {/* Sparkle banner */}
                  <div className="mb-4 inline-flex items-center gap-1 bg-yellow-500/10 py-1.5 px-4 rounded-full border border-yellow-500/20 text-yellow-400 text-sm font-extrabold uppercase font-mono">
                    <Sparkles className="w-4 h-4 animate-spin-slow" />
                    Official Result 🏆
                  </div>

                  <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-300 to-green-400 uppercase tracking-tight">
                    Congratulations!
                  </h2>
                  <h4 className="text-lg sm:text-xl font-bold text-white mt-1">
                    {name || 'The Supporter'} Passed the Trial! 🎉
                  </h4>

                  <p className="text-gray-400 text-xs sm:text-sm mt-4 max-w-md mx-auto">
                    You have bypassed the running button parameters and officially locked in certified supreme supporter status.
                  </p>

                  {/* Realtime dynamic achievements list unlocked */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 text-left">
                    {achievements.map((ach) => (
                      <div
                        key={ach.id}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/40 border border-emerald-500/20 shadow-[0_2px_10px_rgba(16,185,129,0.05)]"
                      >
                        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <div>
                          <h5 className="text-xs font-bold text-white uppercase">{ach.title}</h5>
                          <p className="text-[10px] text-gray-500 font-mono italic">{ach.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Confetti re-launch option */}
                  <motion.button
                    onClick={() => {
                      sound.playTriumph();
                      launchEpicConfetti();
                    }}
                    className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-yellow-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-yellow-300 cursor-pointer transition-colors outline-none scale-100 active:scale-95"
                  >
                    🎉 Spawn Confetti
                  </motion.button>
                </div>

                {/* PREMIUM EMBEDDED DYNAMIC CERTIFICATE SECTION */}
                <Certificate name={name} email={email} turns={turns} />

                {/* SATIRICAL LEADERBOARD PANEL */}
                <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(99,102,241,0.1)]">
                  <h4 className="text-sm font-black uppercase tracking-widest text-cyan-400 mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Global Satyam Respect Leaderboard 👑
                  </h4>

                  <div className="space-y-3">
                    {/* #1 Satyam (Always locked supreme) */}
                    <div className="flex items-center justify-between p-3.5 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🥇</span>
                        <div>
                          <div className="text-sm font-bold text-yellow-400 uppercase flex items-center gap-1.5">
                            Satyam <span className="text-[10px] bg-yellow-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full uppercase">Creator</span>
                          </div>
                          <span className="text-[10px] text-yellow-400/50 font-mono">STATUS: INFINITE WEALTH</span>
                        </div>
                      </div>
                      <span className="font-mono text-sm font-extrabold text-yellow-400">999,999,999,999 respect</span>
                    </div>

                    {/* #2 Current User (The verified true believer) */}
                    <motion.div
                      animate={{ scale: [1, 1.01, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex items-center justify-between p-3.5 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🥈</span>
                        <div>
                          <div className="text-sm font-bold text-white uppercase flex items-center gap-1.5">
                            {name} <span className="text-[10px] bg-cyan-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full uppercase">YOU</span>
                          </div>
                          <span className="text-[10px] text-cyan-400/50 font-mono">ELITE CERTIFIED SUPPORTER • {turns} TURNS • {email}</span>
                        </div>
                      </div>
                      <span className="font-mono text-sm font-extrabold text-cyan-400">99,999,999 respect</span>
                    </motion.div>

                    {/* Real-time Synced Database Supporters */}
                    {globalSupporters.filter((s) => s.email !== email).slice(0, 8).map((sup, idx) => (
                      <div key={sup.id || idx} className="flex items-center justify-between p-3.5 bg-purple-500/[0.03] border border-purple-500/20 rounded-2xl">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="text-lg flex-shrink-0">🎖️</span>
                          <div className="overflow-hidden">
                            <div className="text-sm font-bold text-gray-200 uppercase flex items-center gap-1.5 font-display truncate">
                              {sup.name}
                            </div>
                            <span className="text-[10px] text-purple-400/75 font-mono truncate block">
                              CERTIFIED BELIEVER • {sup.turns} TURNS • {sup.email}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-purple-400 flex-shrink-0">99,999 respect</span>
                      </div>
                    ))}

                    {/* #3 Elon Musk */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-white/5 rounded-2xl opacity-60">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🥉</span>
                        <div>
                          <div className="text-sm font-bold text-gray-400 uppercase">Elon Musk</div>
                          <span className="text-[10px] text-gray-600 font-mono">Attempted to enter other names</span>
                        </div>
                      </div>
                      <span className="font-mono text-sm font-bold text-gray-500">8,500 respect</span>
                    </div>

                    {/* #4 Mark Zuckerberg */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-white/5 rounded-2xl opacity-40">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">👤</span>
                        <div>
                          <div className="text-sm font-bold text-gray-400 uppercase">Mark Zuckerberg</div>
                          <span className="text-[10px] text-gray-600 font-mono">Kept clicking "ME" button</span>
                        </div>
                      </div>
                      <span className="font-mono text-sm font-bold text-gray-500">6,200 respect</span>
                    </div>
                  </div>
                </div>

                {/* CUSTOM SOCIAL MEDIA SHARE BLOCK */}
                <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 sm:p-8 text-center shadow-[0_15px_40px_rgba(236,72,153,0.1)]">
                  <h4 className="text-sm font-black uppercase tracking-widest text-pink-400 mb-5 flex items-center justify-center gap-2">
                    <Share2 className="w-4 h-4 animate-pulse" />
                    Share Your Certified Supporter Status 📱
                  </h4>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                    
                    {/* Share Screenshot / Copy Link */}
                    <button
                      onClick={handleScreenshotMock}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer outline-none"
                    >
                      {copied ? (
                        <Check className="w-6 h-6 text-emerald-400 animate-scale" />
                      ) : (
                        <Copy className="w-6 h-6 text-yellow-400" />
                      )}
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                        {copied ? 'Link Copied!' : 'Copy App Link'}
                      </span>
                    </button>

                    {/* WhatsApp */}
                    <button
                      onClick={shareToWhatsApp}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer outline-none"
                    >
                      <Smartphone className="w-6 h-6 text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-300">WhatsApp</span>
                    </button>

                    {/* X */}
                    <button
                      onClick={shareToTwitter}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer outline-none"
                    >
                      <Twitter className="w-6 h-6 text-blue-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Share on X</span>
                    </button>

                    {/* LinkedIn */}
                    <button
                      onClick={shareToLinkedIn}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer outline-none"
                    >
                      <Briefcase className="w-6 h-6 text-sky-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-300">LinkedIn</span>
                    </button>
                  </div>
                </div>

                {/* Reset button inside finale screen */}
                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleReset}
                    onPointerEnter={() => sound.playHover()}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer outline-none"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Challenge
                  </button>
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Floating dynamic achievement toast logger */}
      <AnimatePresence>
        {toast.active && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -40 }}
            className="fixed top-24 right-4 z-50 rounded-2xl bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-slate-950 px-5 py-4 shadow-[0_10px_30px_rgba(245,158,11,0.30)] flex items-center gap-3.5 border border-yellow-400/40"
          >
            <div className="bg-slate-950 text-yellow-400 rounded-full w-10 h-10 flex items-center justify-center border border-yellow-400/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider leading-none">
                {toast.title}
              </div>
              <div className="text-sm font-bold mt-1 text-slate-900 leading-none">
                {toast.desc}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clean persistent elegant structural footer matching theme standards */}
      <footer className="w-full py-6 flex flex-col md:flex-row items-center justify-between px-6 sm:px-12 border-t border-white/10 glass z-20 mt-auto pointer-events-auto gap-4">
        <div className="flex flex-wrap gap-4 sm:gap-8 text-[11px] font-bold uppercase tracking-widest text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
            System: Optimized
          </div>
          <div className="flex items-center gap-2">
            <span className="text-violet-400">Map:</span> 🇮🇳 Floating Base
          </div>
          <div className="flex items-center gap-2">
            <span className="text-violet-400">Mood:</span> Sophisticated Dark
          </div>
        </div>
        <div className="text-xs text-gray-600 font-mono tracking-wider">
          &copy; 2026 SATYAM EMPIRE — EST. FOREVER 😎👑
        </div>
      </footer>
    </main>
  );
}
