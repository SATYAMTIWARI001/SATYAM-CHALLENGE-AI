/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Search,
  Globe,
  Bell,
  RefreshCw,
  Clock,
  ExternalLink,
  Zap,
  ShieldAlert,
} from 'lucide-react';

import { sound } from './components/SoundEngine';
import SpaceBackground from './components/SpaceBackground';
import CursorTrail from './components/CursorTrail';
import RunningButton from './components/RunningButton';
import Certificate from './components/Certificate';
import { EliteBadge } from './components/EliteBadge';
import { subscribeToSupporters, registerSupporter, SupporterRecord } from './firebase';

export default function App() {
  const [phase, setPhase] = useState<'welcome' | 'q1' | 'q2' | 'q3' | 'q4' | 'final'>('welcome');
  const [name, setName] = useState('Satyam');
  const [nameInput, setNameInput] = useState('Satyam');
  const [email, setEmail] = useState('satyam000108@gmail.com');
  const [emailInput, setEmailInput] = useState('satyam000108@gmail.com');
  const [turns, setTurns] = useState(1);
  const [isShaking, setIsShaking] = useState(false);
  const [generatedCertId, setGeneratedCertId] = useState('');
  
  // Real-time notification banners
  const [liveNotice, setLiveNotice] = useState<{ name: string; turns: number; certId: string } | null>(null);
  const seenSupporterIdsRef = useRef<Set<string>>(new Set());
  const isInitialSnapshotRef = useRef(true);

  // Search, filtration and caching
  const [searchQuery, setSearchQuery] = useState('');
  const [leaderboardFilter, setLeaderboardFilter] = useState<'all' | 'elite' | 'fastest'>('all');

  // Anti-spam, Bot limits & protection safeguards
  const [honeypot, setHoneypot] = useState(''); // Bot check trap
  const [isBotLocked, setIsBotLocked] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0); // Submission cooldown timer
  const [submitCooldownRemaining, setSubmitCooldownRemaining] = useState(0);

  // Users online fluctuate heartbeat simulator synced realistically
  const [onlineUsers, setOnlineUsers] = useState(14);

  // Toast status logs
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

  // Handle page shake alerts
  useEffect(() => {
    const triggerShake = () => {
      setIsShaking(true);
      sound.playShake();
      setTimeout(() => setIsShaking(false), 500);
    };

    window.addEventListener('satyam-shake-page', triggerShake);
    return () => window.removeEventListener('satyam-shake-page', triggerShake);
  }, []);

  // Sync supporter data in real-time with automatic global notifications
  useEffect(() => {
    const unsubscribe = subscribeToSupporters((supportersList) => {
      setGlobalSupporters(supportersList);

      // Track newly added records to output global live push notifications dynamically!
      if (supportersList.length > 0) {
        const newest = supportersList[0];
        if (newest.id && !isInitialSnapshotRef.current && !seenSupporterIdsRef.current.has(newest.id)) {
          // Play notification chime and slide-in notice banner
          sound.playAchievement();
          setLiveNotice({
            name: newest.name,
            turns: newest.turns,
            certId: newest.certificateId,
          });
          // Auto-fade notice
          setTimeout(() => {
            setLiveNotice(null);
          }, 6000);
        }

        // Keep seen ID list fully updated
        supportersList.forEach(s => {
          if (s.id) {
            seenSupporterIdsRef.current.add(s.id);
          }
        });
        isInitialSnapshotRef.current = false;
      }
    });

    return () => unsubscribe();
  }, []);

  // Pulsing online user counter
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers(prev => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2 drift
        const next = prev + delta;
        return next < 5 ? 5 : next > 28 ? 19 : next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Cooldown countdown timer logic
  useEffect(() => {
    if (submitCooldownRemaining <= 0) return;
    const t = setTimeout(() => {
      setSubmitCooldownRemaining(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [submitCooldownRemaining]);

  // Sync supporter data with remote Firestore with robust Anti-Spam protection
  const saveSupporterRecord = async (finalTurns: number, certId: string) => {
    if (hasSubmitted || isSubmitting) return;

    // Guard: Prevent rapid multiple submissions (cooldown of 30 seconds)
    const now = Date.now();
    if (now - lastSubmitTime < 30000) {
      const remainingSecs = Math.ceil((30000 - (now - lastSubmitTime)) / 1000);
      setSubmitCooldownRemaining(remainingSecs);
      triggerToast('⚠️ Cooldown Active', `Please wait ${remainingSecs} seconds before storing certificates.`);
      return;
    }

    // Guard: Honeypot bot protection
    if (honeypot.trim() !== '') {
      setIsBotLocked(true);
      triggerToast('🚨 System Lockout', 'Automated machine operations forbidden by Satyam!');
      return;
    }

    // Guard: Name character thresholds
    const testName = nameInput.trim();
    if (testName.length < 2) {
      triggerToast('❌ Error Saving Record', 'Name is too short. Minimum 2 characters required.');
      return;
    }
    if (testName.length > 25) {
      triggerToast('❌ Error Saving Record', 'Name is too long. Maximum 25 characters permitted.');
      return;
    }

    // Guard: Duplicate name validation check
    const isDuplicate = globalSupporters.some(sup => sup.name.toLowerCase() === testName.toLowerCase());
    if (isDuplicate) {
      sound.playShake();
      setIsShaking(true);
      triggerToast('⚠️ Identity Registered', 'Your name matches an active True Believer certificate!');
      // Allow them to continue but mark submission state to avoid database spam
      setHasSubmitted(true);
      return;
    }

    try {
      setIsSubmitting(true);
      
      const supporterPayload = {
        name: testName,
        email: emailInput.trim() || 'satyam000108@gmail.com',
        turns: finalTurns,
        respectRank: 'Maximum',
        powerLevel: '9999+',
        rank: 'Elite Level',
        score: 100,
        completedAt: new Date().toISOString(),
        certificateId: certId,
      };

      await registerSupporter(supporterPayload);
      
      setLastSubmitTime(now);
      setHasSubmitted(true);
      triggerToast('🏆 Supporter Verified', 'Your verified certificate is synced with the Global Hall of Fame!');
    } catch (e) {
      console.error('Failed to register supporter progress:', e);
      triggerToast('⚠️ Database Error', 'Failed to synchronize with global certificate registry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Launch explosive high-fidelity colored confetti arrays
  const launchEpicConfetti = () => {
    const duration = 6500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 7,
        angle: 45,
        spread: 60,
        origin: { x: 0, y: 0.8 },
        colors: ['#fbbf24', '#c084fc', '#f43f5e', '#38bdf8'],
      });
      confetti({
        particleCount: 7,
        angle: 135,
        spread: 60,
        origin: { x: 1, y: 0.8 },
        colors: ['#fbbf24', '#c084fc', '#f43f5e', '#38bdf8'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  // Toast alert chimes
  const triggerToast = (title: string, desc: string) => {
    setToast({ title, desc, active: true });
    sound.playAchievement();
    setTimeout(() => {
      setToast((prev) => ({ ...prev, active: false }));
    }, 4500);
  };

  // Unlocking specific achievements
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

  // Navigation handlers
  const handleStartChallenge = () => {
    if (isBotLocked) {
      triggerToast('⛔ Access Denied', 'Your device session has been locked.');
      return;
    }
    sound.playClick();
    setTurns(1);
    setIsShaking(false);
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
    
    // Honeypot spam test
    if (honeypot) {
      setIsBotLocked(true);
      return;
    }

    const testName = nameInput.trim();
    if (testName.length < 2) {
      sound.playShake();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      triggerToast('⚠️ Name Validation', 'Name must contain at least 2 characters!');
      return;
    }
    if (testName.length > 25) {
      sound.playShake();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      triggerToast('⚠️ Name Validation', 'Name must not exceed 25 characters!');
      return;
    }

    sound.playClick();
    setName(testName);
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
    
    // Auto-generate certified secure ID
    const uniqueId = `SATYAM-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    setGeneratedCertId(uniqueId);
    
    setPhase('final');
    launchEpicConfetti();
    
    // Real time firestore payload write with verification triggers
    saveSupporterRecord(finalTurns, uniqueId);
  };

  // Resets
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

  // Helper stats computed in real-time
  const computedStats = useMemo(() => {
    const totalCerts = globalSupporters.length;
    const totalChallengers = totalCerts + 43; // Factored baseline online visitors
    const topPerformers = globalSupporters.slice(0, 5);
    
    return {
      totalCerts,
      totalChallengers,
      topPerformers
    };
  }, [globalSupporters]);

  // Filtered leaderboard records matching query conditions
  const filteredSupporters = useMemo(() => {
    let result = [...globalSupporters];
    
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(sup => 
        sup.name.toLowerCase().includes(q) ||
        sup.email.toLowerCase().includes(q) ||
        sup.certificateId.toLowerCase().includes(q)
      );
    }

    if (leaderboardFilter === 'fastest') {
      result.sort((a, b) => a.turns - b.turns);
    } else if (leaderboardFilter === 'elite') {
      result = result.filter(sup => sup.turns <= 4);
    }
    
    return result;
  }, [globalSupporters, searchQuery, leaderboardFilter]);

  const appUrl = (typeof window !== 'undefined' && window.location.href) || 'https://ai.studio/build';

  return (
    <main className="relative min-h-screen w-full text-white bg-[#050512] font-sans select-none overflow-x-hidden flex flex-col justify-between">
      
      {/* Space Backdrop & Star Particle Canvas */}
      <SpaceBackground />
      <CursorTrail />

      {/* Real-time Global Completers Banner with Alert Slide-In */}
      <AnimatePresence>
        {liveNotice && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            className="fixed top-4 inset-x-4 mx-auto z-50 max-w-lg bg-gradient-to-r from-yellow-500 via-amber-500 to-purple-600 p-[1px] rounded-2xl shadow-[0_15px_40px_rgba(245,158,11,0.4)]"
          >
            <div className="bg-[#0b081e] px-4 py-3.5 rounded-[15px] flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center font-bold text-yellow-400">
                  <Bell className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <h5 className="text-[10px] uppercase font-mono tracking-widest text-[#fbbf24] font-black">Live Global Broadcast</h5>
                  <p className="text-xs text-white font-semibold mt-0.5">
                    🚀 <span className="text-cyan-300 uppercase font-black font-display text-sm">{liveNotice.name}</span> completed the Trial in <span className="text-purple-300 font-black">{liveNotice.turns} turns</span>!
                  </p>
                </div>
              </div>
              <span className="text-[8px] font-mono font-bold bg-[#fbbf24]/10 text-[#fbbf24] px-2 py-1 rounded">
                {liveNotice.certId}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header element */}
      <header className="relative w-full z-20 pt-8 px-6 sm:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-500 flex items-center justify-center font-black text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] font-display text-xl">
            👑
          </div>
          <span className="text-base sm:text-lg font-black tracking-widest uppercase text-white font-display">
            The Satyam Challenge
          </span>
        </div>
        <div className="glass px-4 py-2 rounded-full text-xs sm:text-sm font-bold flex gap-4 sm:gap-6 border border-white/10 shadow-lg">
          <span className="text-yellow-400 font-extrabold font-mono">
            {phase === 'welcome' ? 'Level 00' : `Level 0${phase === 'final' ? '4' : phase[1]}`}
          </span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-200">
            Status: {phase === 'final' ? '🏆 Certified Supporter' : 'Testing Faith'}
          </span>
        </div>
      </header>

      {/* Main split dashboard section */}
      <div className="relative flex-1 z-10 w-full max-w-7xl mx-auto px-4 sm:px-12 py-8 flex flex-col lg:flex-row items-stretch justify-center gap-12 lg:gap-16">
        
        {/* Left Side: Dynamic Visual Title & LIVE Stats Dashboard */}
        <div className="flex-1 flex flex-col justify-between text-left select-none gap-8">
          
          {/* Header Title Section */}
          <div className="space-y-4">
            <div className="text-6xl filter drop-shadow-[0_0_30px_rgba(245,158,11,0.4)] animate-bounce inline-block">
              👑
            </div>
            {phase === 'final' ? (
              <h1 className="text-5xl xl:text-7xl font-sans font-black leading-none italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-rose-400 uppercase font-display">
                PASSED THE<br />TRIAL SUCCESSFULLY 🎉
              </h1>
            ) : (
              <h1 className="text-5xl xl:text-7xl font-sans font-black leading-none italic tracking-tight text-white uppercase font-display">
                ONLY FOR TRUE<br />BELIEVERS
              </h1>
            )}
            <p className="text-gray-400 text-sm xl:text-base max-w-lg leading-relaxed font-sans font-light">
              Welcome to the digital loyalty trial. Satisfy all levels to forge an immutable PDF Certificate. Protip: Dissension remains mathematically impossible.
            </p>
          </div>

          {/* DYNAMIC LIVE STATS DASHBOARD */}
          <div className="bg-[#0b081e]/60 border border-white/10 backdrop-blur-xl p-6 rounded-3xl space-y-4 shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
            <h4 className="text-xs uppercase tracking-widest text-[#fbbf24] font-black flex items-center justify-between border-b border-white/5 pb-2">
              <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> LIVE STATS DASHBOARD</span>
              <span className="text-[9px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-mono font-black animate-pulse flex items-center gap-1">
                ● Live Updates
              </span>
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl flex flex-col justify-between">
                <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Total Challengers</span>
                <span className="text-xl font-mono text-purple-400 font-extrabold mt-1">{computedStats.totalChallengers}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl flex flex-col justify-between">
                <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Certs Issued</span>
                <span className="text-xl font-mono text-[#fbbf24] font-extrabold mt-1">{computedStats.totalCerts}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl flex flex-col justify-between">
                <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Users Online</span>
                <span className="text-xl font-mono text-emerald-400 font-extrabold mt-1 flex items-center gap-1">
                  ⚡ {onlineUsers}
                </span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl flex flex-col justify-between">
                <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">HQ Location</span>
                <span className="text-xs font-mono text-cyan-400 font-bold mt-2 truncate flex items-center gap-1">
                  <span>🇮🇳 Primary</span>
                </span>
              </div>
            </div>

            {/* Countries Visited Grid */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2.5">
              <span className="text-[9px] uppercase font-mono text-gray-500 tracking-wider">Active Visitors Visited From:</span>
              <div className="flex items-center gap-2 text-sm">
                <span title="India" className="cursor-help filter hover:grayscale-0 grayscale transition-all">🇮🇳</span>
                <span title="United States" className="cursor-help filter hover:grayscale-0 grayscale transition-all">🇺🇸</span>
                <span title="United Kingdom" className="cursor-help filter hover:grayscale-0 grayscale transition-all">🇬🇧</span>
                <span title="Singapore" className="cursor-help filter hover:grayscale-0 grayscale transition-all">🇸🇬</span>
                <span title="Canada" className="cursor-help filter hover:grayscale-0 grayscale transition-all">🇨🇦</span>
                <span title="Germany" className="cursor-help filter hover:grayscale-0 grayscale transition-all">🇩🇪</span>
                <span title="Japan" className="cursor-help filter hover:grayscale-0 grayscale transition-all">🇯🇵</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Card & Gameplay Frames */}
        <div className="w-full lg:max-w-[540px] flex flex-col items-stretch justify-center relative">
          
          {/* Shadow aesthetic cards behind */}
          <div className="absolute -top-3 -right-3 w-full h-full glass rounded-[40px] -z-10 opacity-30 rotate-3 border border-white/5" />

          {/* Core game screen with spring animations */}
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
              
              {/* PHASE 0: COGNITIVE CHALLENGE START SCREEN */}
              {phase === 'welcome' && (
                <motion.div
                  key="welcome"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="glass rounded-[40px] p-6 sm:p-10 flex flex-col relative z-20 text-white shadow-2xl border border-white/10"
                >
                  <div className="bg-[#fbbf24]/10 text-[#fbbf24] px-4 py-1.5 rounded-full text-[10px] font-bold mb-6 uppercase tracking-widest self-center border border-[#fbbf24]/20 shadow-sm">
                    📜 TRIAL PROTOCOL
                  </div>

                  {/* Satyam Character Avatar Head */}
                  <div className="relative mb-6 self-center group">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-purple-600 blur-md opacity-75 group-hover:opacity-100 transition-opacity animate-pulse w-24 h-24" />
                    <div className="relative w-24 h-24 rounded-full border-2 border-yellow-400/50 bg-slate-950 flex items-center justify-center">
                      <span className="text-4xl text-yellow-300 filter drop-shadow">😎</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                      CREATOR
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight font-display text-center">
                    The Ultimate <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 font-extrabold font-display">
                      Satyam Challenge
                    </span>
                  </h2>

                  <p className="text-gray-400 text-xs sm:text-sm mt-3 leading-relaxed text-center">
                    Only true followers can complete this quest. Note: This software implements absolute obedience check. Error rate: 0.00%.
                  </p>

                  {/* Active credentials preview */}
                  <div className="mt-5 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-left text-xs font-mono">
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase text-yellow-400 tracking-wider">Supporter Core account</span>
                      <span className="text-gray-200 font-bold">satyam000108@gmail.com</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] block uppercase text-yellow-400 tracking-wider font-bold">Anonymous Login</span>
                      <span className="text-emerald-400 animate-pulse font-extrabold flex items-center justify-end gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-400" /> Active
                      </span>
                    </div>
                  </div>

                  {/* Anti-spam safeguards / Rules */}
                  <div className="mt-5 text-left space-y-2.5 bg-yellow-950/10 rounded-2xl p-4 border border-yellow-500/10">
                    <h4 className="text-yellow-400 text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Anti-Spam Gateways Engaged
                    </h4>
                    <div className="space-y-1.5 text-xs text-gray-300">
                      <div className="flex items-start gap-2">
                        <span className="text-yellow-400">•</span>
                        <span>Name must be between 2 and 25 characters.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-yellow-400">•</span>
                        <span>Duplicate or spoofed certifications blocked immediately.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-yellow-400">•</span>
                        <span>Anti-robot protection honeypots loaded into forms.</span>
                      </div>
                    </div>
                  </div>

                  {/* Big Trigger Challenge */}
                  <button
                    id="btn-start"
                    onClick={handleStartChallenge}
                    onPointerEnter={() => sound.playHover()}
                    className="mt-8 overflow-hidden group relative w-full py-4 text-center text-xs font-bold uppercase tracking-widest rounded-2xl cursor-pointer bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-500 text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.35)] hover:shadow-[0_0_40px_rgba(245,158,11,0.55)] active:scale-95 transition-all border border-yellow-500/10 outline-none"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Play className="w-4 h-4 fill-current" />
                      Embark on Pilgrim 🚀
                    </span>
                    <div className="absolute inset-0 bg-white/10 translate-y-12 group-hover:translate-y-0 transition-transform duration-300" />
                  </button>
                </motion.div>
              )}

              {/* LEVEL 1: DO YOU KNOW SATYAM */}
              {phase === 'q1' && (
                <motion.div
                  key="q1"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  className="glass rounded-[40px] p-6 sm:p-10 flex flex-col text-white shadow-2xl border border-white/10"
                >
                  <div className="bg-purple-600/20 text-purple-400 px-4 py-1.5 rounded-full text-[10px] font-bold mb-6 uppercase tracking-widest self-center border border-purple-500/20 shadow-sm">
                    LEVEL 01 • Sane Logic Evaluation
                  </div>

                  <div className="text-center mb-6">
                    <div className="text-5xl mb-4 animate-bounce">🤔</div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                      Do you know Satyam?
                    </h3>
                    <p className="text-xs text-gray-400 mt-2">
                      Consider extremely wisely before selecting answer.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center py-6 min-h-[140px] relative">
                    <motion.button
                      id="btn-q1-yes"
                      onClick={handleQ1Success}
                      onPointerEnter={() => sound.playHover()}
                      className="w-full sm:w-1/2 py-4 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500 text-white font-extrabold text-sm uppercase rounded-2xl shadow-[0_8px_25px_rgba(139,92,246,0.3)] cursor-pointer order-2 sm:order-1 outline-none border border-violet-400/20"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Yes, perfectly! ✅
                    </motion.button>

                    <div className="w-full sm:w-1/2 flex items-center justify-center order-1 sm:order-2">
                      <RunningButton
                        idText="btn-q1-no"
                        text="No, who? ❌"
                        funnyMessages={[
                          '😂 "Nice try!"',
                          '🏃 "Over here!"',
                          '😎 "Literally everyone knows Satyam!"',
                          '🚀 "Selection prohibited!"',
                        ]}
                        onEscape={(msg) => {
                          setEscapeCount((c) => c + 1);
                          setTurns((t) => t + 1);
                          setActiveMessage(msg);
                        }}
                        className="bg-rose-600/80 hover:bg-rose-500 text-white w-full sm:w-auto font-bold"
                      />
                    </div>
                  </div>

                  <div className="mt-4 border border-dashed border-purple-500/20 rounded-xl p-3 bg-black/60 font-mono text-[10px] text-center text-gray-500">
                    <span className="text-purple-400 font-bold">Status:</span> Avoided {escapeCount} runaways |{' '}
                    <span className="text-gray-300 italic">{activeMessage}</span>
                  </div>
                </motion.div>
              )}

              {/* LEVEL 2: REGISTRATION & DETAILED BOT CHECK */}
              {phase === 'q2' && (
                <motion.div
                  key="q2"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  className="glass rounded-[40px] p-6 sm:p-10 flex flex-col text-white shadow-2xl border border-white/10"
                >
                  <div className="bg-purple-600/20 text-purple-400 px-4 py-1.5 rounded-full text-[10px] font-bold mb-6 uppercase tracking-widest self-center border border-purple-500/20 shadow-sm">
                    LEVEL 02 • Citizen Identity Registry
                  </div>

                  <div className="text-center mb-6">
                    <div className="text-5xl mb-4">👤</div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                      Declare Your Identity
                    </h3>
                    <p className="text-xs text-gray-400 mt-2 font-sans">
                      Provide your natural name to forge your Elite PDF Certificate.
                    </p>
                  </div>

                  {/* Honeypot hidden element is strictly loaded outside standard layout flow */}
                  <div className="opacity-0 absolute -top-96 pointer-events-none">
                    <input
                      type="text"
                      name="satyam_honeypot"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      placeholder="Leave this completely blank"
                      tabIndex={-1}
                    />
                  </div>

                  <form onSubmit={handleQ2Submit} className="space-y-4">
                    <div className="space-y-1 text-left">
                      <label htmlFor="input-name" className="text-[10px] uppercase text-purple-400 tracking-wider font-mono font-bold block">Genuine Supporter Name (2-25 chars)</label>
                      <div className="relative">
                        <input
                          id="input-name"
                          type="text"
                          maxLength={35}
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

                    {/* Pre-validation feedback */}
                    {(nameInput.trim() || emailInput.trim()) && (
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center text-purple-300 font-mono text-xs py-1"
                      >
                        ✨ Target Account Holder: <span className="text-cyan-400 font-bold">{nameInput}</span> ✨
                        <span className="block text-[10px] text-gray-500">{emailInput}</span>
                      </motion.div>
                    )}

                    <button
                      id="btn-name-submit"
                      type="submit"
                      onPointerEnter={() => sound.playHover()}
                      className="w-full py-4 mt-2 text-center text-xs font-bold uppercase tracking-widest rounded-2xl cursor-pointer bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500 text-white shadow-[0_5px_15px_rgba(139,92,246,0.3)] hover:shadow-[0_8px_25px_rgba(139,92,246,0.5)] active:scale-95 transition-all outline-none border border-violet-500/20"
                    >
                      Lock In Verification 🚀
                    </button>
                  </form>
                </motion.div>
              )}

              {/* LEVEL 3: FAITH DISGUST OVERRIDE */}
              {phase === 'q3' && (
                <motion.div
                  key="q3"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  className="glass rounded-[40px] p-6 sm:p-10 flex flex-col text-white shadow-2xl border border-white/10"
                >
                  <div className="bg-purple-600/20 text-purple-400 px-4 py-1.5 rounded-full text-[10px] font-bold mb-6 uppercase tracking-widest self-center border border-purple-500/20 shadow-sm">
                    LEVEL 03 • Absolute Faith Confirmation
                  </div>

                  <div className="text-center mb-8">
                    <div className="text-5xl mb-4 animate-pulse">💎</div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                      Do you believe in Satyam?
                    </h3>
                    <p className="text-xs text-gray-400 mt-2">
                      Dear <span className="text-purple-400 font-bold uppercase">{name}</span>. Declare your cosmic layout model.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center py-6 min-h-[140px] relative">
                    <motion.button
                      id="btn-q3-yes"
                      onClick={handleQ3Success}
                      onPointerEnter={() => sound.playHover()}
                      className="w-full sm:w-1/2 py-4 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500 text-white font-extrabold text-sm uppercase rounded-2xl shadow-[0_8px_25px_rgba(139,92,246,0.3)] cursor-pointer order-2 sm:order-1 outline-none border border-purple-500/20"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Absolutely YES! 💎
                    </motion.button>

                    <div className="w-full sm:w-1/2 flex items-center justify-center order-1 sm:order-2">
                      <RunningButton
                        idText="btn-q3-no"
                        text="No ❌"
                        funnyMessages={[
                          '😂 "Wrong answer!"',
                          '🔥 "Defiance is futile!"',
                          '😎 "Satyam creates the path"',
                        ]}
                        onEscape={(msg) => {
                          setEscapeCount((c) => c + 1);
                          setTurns((t) => t + 1);
                          setActiveMessage(msg);
                        }}
                        className="bg-rose-600/80 hover:bg-rose-500 text-white w-full sm:w-auto font-bold"
                      />
                    </div>
                  </div>

                  <div className="mt-4 border border-dashed border-purple-500/20 rounded-xl p-3 bg-black/60 font-mono text-[10px] text-center text-gray-500">
                    <span className="text-purple-400 font-bold">Faith Engine:</span> Active check |{' '}
                    <span className="text-gray-300 italic">{activeMessage}</span>
                  </div>
                </motion.div>
              )}

              {/* LEVEL 4: WEALTH EMPIRE */}
              {phase === 'q4' && (
                <motion.div
                  key="q4"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  className="glass rounded-[40px] p-6 sm:p-10 flex flex-col text-white shadow-2xl border border-white/10"
                >
                  <div className="bg-yellow-500/10 text-yellow-400 px-4 py-1.5 rounded-full text-[10px] font-bold mb-6 uppercase tracking-widest self-center border border-yellow-500/20 shadow-sm">
                    LEVEL 04 • Undivided Wealth Supremacy
                  </div>

                  <div className="text-center mb-8">
                    <div className="text-5xl mb-4 animate-bounce">💸</div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                      Who is ultimately richer?
                    </h3>
                    <p className="text-xs text-gray-400 mt-2 font-sans">
                      Final verification to forge the supreme supporter archive entries.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center py-6 min-h-[140px] relative">
                    <motion.button
                      id="btn-q4-satyam"
                      onClick={handleQ4Success}
                      onPointerEnter={() => sound.playHover()}
                      className="w-full sm:w-1/2 py-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-slate-950 font-extrabold text-sm uppercase rounded-2xl shadow-[0_8px_25px_rgba(245,158,11,0.3)] cursor-pointer order-2 sm:order-1 border border-yellow-500/20"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      👑 SATYAM TIWARI
                    </motion.button>

                    <div className="w-full sm:w-1/2 flex items-center justify-center order-1 sm:order-2">
                      <RunningButton
                        idText="btn-q4-me"
                        text="💰 ME"
                        funnyMessages={[
                          '😂 "Inflation adjusted: NO"',
                          '😎 "Satyam has the Presidency!"',
                          '🚀 "Keep dreaming!"',
                        ]}
                        onEscape={(msg) => {
                          setEscapeCount((c) => c + 1);
                          setTurns((t) => t + 1);
                          setActiveMessage(msg);
                          sound.playBlink();
                        }}
                        className="bg-rose-600/80 hover:bg-rose-500 text-white w-full sm:w-auto font-bold"
                      />
                    </div>
                  </div>

                  <div className="mt-4 border border-dashed border-red-500/30 rounded-xl p-3 bg-red-950/20 font-mono text-[10px] text-center text-red-300">
                    ⚠️ <span className="font-bold">Presidential Override:</span> {activeMessage}
                  </div>
                </motion.div>
              )}

              {/* PHASE 5: CELEBRATION / DYNAMIC PDF CERTIFICATE & SEARCHABLE LEADERBOARD */}
              {phase === 'final' && (
                <motion.div
                  key="final"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="w-full space-y-8 pb-12"
                >
                  {/* Results box banner */}
                  <div className="rounded-3xl border border-white/10 bg-[#0e081e]/80 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(245,158,11,0.15)] text-center relative overflow-hidden">
                    
                    <div className="absolute top-0 right-0 p-4 pointer-events-none text-yellow-400 opacity-20">
                      <Trophy className="w-16 h-16 animate-pulse" />
                    </div>

                    <div className="mb-4 inline-flex items-center gap-1.5 bg-yellow-500/10 py-1 px-4.5 rounded-full border border-yellow-500/20 text-yellow-400 text-xs font-black uppercase font-mono">
                      <Sparkles className="w-4 h-4 animate-spin-slow" />
                      Supporter Credentials Forged 🏆
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-sans font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-rose-400 uppercase tracking-tight">
                      Trial Complete!
                    </h2>
                    <h4 className="text-lg font-bold text-white mt-1">
                      {name || 'The Supporter'} is Officially Certified! 🎉
                    </h4>

                    <p className="text-gray-400 text-xs mt-3 max-w-sm mx-auto leading-relaxed">
                      Your commitment entries have been securely transmitted to the live Firestore repository in <span className="text-purple-400 font-bold">{turns} interaction.turns</span>.
                    </p>

                    {/* Dynamic achievements badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 text-left">
                      {achievements.map((ach) => (
                        <div
                          key={ach.id}
                          className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-emerald-500/20 transition-all hover:bg-white/[0.04]"
                        >
                          <CheckCircle className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0" />
                          <div>
                            <h5 className="text-[10px] font-black text-white uppercase font-mono">{ach.title}</h5>
                            <p className="text-[9px] text-gray-500 font-mono italic">{ach.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Trigger Confetti explosion */}
                    <button
                      onClick={() => {
                        sound.playTriumph();
                        launchEpicConfetti();
                      }}
                      className="mt-6 inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-4.5 h-4.5 shrink-0" /> Spawn Fireworks
                    </button>
                  </div>

                  {/* HIGH-DPI LIVE CERTIFICATE CANVAS FOR PDF DOWNLOAD */}
                  <div className="relative">
                    <Certificate name={name} email={email} turns={turns} certificateId={generatedCertId} />
                  </div>

                  {/* SUPPORTERS HALL OF FAME & REAL-TIME LEADERBOARD */}
                  <div className="rounded-3xl border border-white/10 bg-[#0c0821]/90 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-6">
                    
                    {/* Header bar controls */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                      <div>
                        <h4 className="text-base font-black uppercase tracking-wider text-[#fbbf24] flex items-center gap-2">
                          <Users className="w-5 h-5 shrink-0 text-[#fbbf24]" />
                          🏆 SATYAM SUPPORTERS HALL OF FAME
                        </h4>
                        <p className="text-[10px] text-gray-400 font-mono tracking-wide mt-0.5 uppercase">
                          Displaying live entries from decentralized registry ({filteredSupporters.length} matching)
                        </p>
                      </div>

                      {/* Header filters */}
                      <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl shrink-0 border border-white/10">
                        <button
                          onClick={() => setLeaderboardFilter('all')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase cursor-pointer transition-all ${
                            leaderboardFilter === 'all' ? 'bg-[#fbbf24] text-slate-950 shadow-sm' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setLeaderboardFilter('elite')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase cursor-pointer transition-all ${
                            leaderboardFilter === 'elite' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Elite Players
                        </button>
                        <button
                          onClick={() => setLeaderboardFilter('fastest')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase cursor-pointer transition-all ${
                            leaderboardFilter === 'fastest' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Fewest Turns
                        </button>
                      </div>
                    </div>

                    {/* Real-time search engine block */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500">
                        <Search className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search certified believer archive by Name, Email or Certificate ID..."
                        className="w-full bg-slate-950/60 border border-white/10 focus:border-yellow-400/50 rounded-2xl pl-11 pr-5 py-3.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-all font-mono"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-gray-400 hover:text-white uppercase font-bold"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Master Leaderboard records stream listing */}
                    <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                      <AnimatePresence mode="popLayout">
                        {/* Rank #1: Satyam Himself (Persistent) */}
                        <motion.div
                          layout
                          key="satyam-creator"
                          initial={{ opacity: 0, scale: 0.98, y: 15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                          className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/25 rounded-2xl shadow-sm"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span className="text-xl shrink-0">🥇</span>
                            <div className="overflow-hidden">
                              <div className="text-sm font-black text-yellow-400 uppercase flex items-center gap-2 font-display">
                                Satyam Tiwari <span className="text-[9px] bg-yellow-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full uppercase">Creator</span>
                                <EliteBadge turns={0} isCreator={true} />
                              </div>
                              <span className="text-[9px] text-yellow-400/50 font-mono tracking-widest block mt-0.5">CREATOR • INFINITE RESPECT • PRESIDENT</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono text-sm font-black text-yellow-400">999,999,999 respect</span>
                          </div>
                        </motion.div>

                        {/* Rank #2: Active candidate user status */}
                        <motion.div
                          layout
                          key="active-user-status"
                          initial={{ opacity: 0, scale: 0.98, y: 15 }}
                          animate={{ scale: [1, 1.005, 1], opacity: 1, y: 0 }}
                          transition={{
                            scale: { duration: 3, repeat: Infinity },
                            y: { type: 'spring', stiffness: 350, damping: 30 },
                            opacity: { duration: 0.3 },
                            layout: { type: 'spring', stiffness: 350, damping: 30 }
                          }}
                          className="flex items-center justify-between p-4 bg-cyan-500/10 border border-cyan-500/25 rounded-2xl shadow-sm"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span className="text-xl shrink-0">🥈</span>
                            <div className="overflow-hidden">
                              <div className="text-sm font-black text-white uppercase flex items-center gap-2 font-display animate-pulse-subtle">
                                {name} <span className="text-[9px] bg-cyan-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full uppercase">YOU</span>
                                <EliteBadge turns={turns} />
                              </div>
                              <span className="text-[9px] text-cyan-400/70 font-mono tracking-wider block mt-0.5">
                                ID: {generatedCertId || 'FORGING...'} • {turns} TURNS • {email}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono text-sm font-black text-cyan-400">99,999,999 respect</span>
                          </div>
                        </motion.div>

                        {/* Streamed synchronized Firestore supporters list */}
                        {filteredSupporters.filter((s) => s.email !== email || !email).map((sup, idx) => {
                          // Calculate visual index rank values nicely offsetted 
                          const visualRank = idx + 3;
                          let rankBadge = '🎖️';
                          if (visualRank === 3) rankBadge = '🥉';

                          return (
                            <motion.div
                              layout
                              key={sup.id || sup.name || `supporter-${idx}`}
                              initial={{ opacity: 0, scale: 0.98, y: 15 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                              className="flex items-center justify-between p-4 bg-purple-500/[0.03] border border-purple-500/10 hover:border-purple-500/25 rounded-2xl transition-all"
                            >
                              <div className="flex items-center gap-3 overflow-hidden">
                                <span className="text-lg shrink-0">{rankBadge}</span>
                                <div className="overflow-hidden">
                                  <div className="text-sm font-bold text-gray-200 uppercase flex items-center gap-2 truncate">
                                    {sup.name}
                                    <EliteBadge turns={sup.turns} />
                                  </div>
                                  <span className="text-[9px] text-purple-400/70 font-mono truncate block mt-0.5">
                                    {sup.certificateId} • {sup.turns} TURNS • {sup.email}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-mono text-xs font-bold text-purple-400">99,999 respect</span>
                              </div>
                            </motion.div>
                          );
                        })}

                        {/* Empty search matches placeholder */}
                        {filteredSupporters.length === 0 && (
                          <motion.div
                            layout
                            key="no-matches"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-10 text-gray-500 font-mono text-xs italic"
                          >
                            No certified supporter record matching "{searchQuery}" found in database.
                          </motion.div>
                        )}

                        {/* Fictional static players representing elons etc */}
                        <motion.div
                          layout
                          key="static-elon"
                          initial={{ opacity: 0, scale: 0.98, y: 15 }}
                          animate={{ opacity: 0.5, scale: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                          className="flex items-center justify-between p-4 bg-slate-900/40 border border-white/5 rounded-2xl opacity-50"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">👤</span>
                            <div>
                              <div className="text-xs font-bold text-gray-400 uppercase">Elon Musk</div>
                              <span className="text-[9px] text-gray-600 font-mono">Attempted custom parameters override</span>
                            </div>
                          </div>
                          <span className="font-mono text-xs text-gray-600 font-bold">12,040 respect</span>
                        </motion.div>
                      </AnimatePresence>

                    </div>
                  </div>

                  {/* Reset Actions Tray */}
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={handleReset}
                      onPointerEnter={() => sound.playHover()}
                      className="inline-flex items-center gap-1.5 px-6 py-3.5 rounded-2xl bg-slate-900 border border-white/10 text-gray-400 hover:text-white hover:bg-slate-800 font-black uppercase tracking-widest text-[10px] transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Retry The Pilgrimage
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Floating global dynamic message helper */}
      <AnimatePresence>
        {toast.active && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -40 }}
            className="fixed top-24 right-4 z-50 rounded-2xl bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-slate-950 px-5 py-4 shadow-[0_10px_30px_rgba(245,158,11,0.30)] flex items-center gap-3.5 border border-yellow-400/40"
          >
            <div className="bg-slate-950 text-yellow-400 rounded-full w-10 h-10 flex items-center justify-center border border-yellow-400/20">
              <Trophy className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider leading-none">
                {toast.title}
              </div>
              <div className="text-sm font-bold mt-1 text-slate-905 leading-none">
                {toast.desc}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent global visual footer */}
      <footer className="w-full py-6 flex flex-col md:flex-row items-center justify-between px-6 sm:px-12 border-t border-white/10 glass z-20 mt-auto gap-4">
        <div className="flex flex-wrap gap-4 sm:gap-8 text-[10px] font-black uppercase tracking-widest text-gray-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            Global Registry: Synchronized
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">Sovereign Node:</span> 🇮🇳 Primary
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">Database:</span> Enterprise Firestore
          </div>
        </div>
        <div className="text-[10px] text-gray-600 font-mono uppercase tracking-widest font-black">
          &copy; 2026 SATYAM EMPIRE — EST. FOREVER 😎👑
        </div>
      </footer>
    </main>
  );
}
