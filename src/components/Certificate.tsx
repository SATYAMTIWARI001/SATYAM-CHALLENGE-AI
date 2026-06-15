import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Award, Sparkles, Trophy, Download, Check, Share2, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import html2canvas from 'html2canvas';

interface CertificateProps {
  name: string;
  email?: string;
  turns?: number;
}

export default function Certificate({ name, email = 'satyam000108@gmail.com', turns = 4 }: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate dynamic certification hash/ID
  const pseudoHash = `SATYAM-TRUE-${turns}-${name.replace(/\s+/g, '').slice(0, 4).toUpperCase() || 'BEL'}#${Math.floor(100000 + Math.random() * 900000)}`;

  const triggerDownload = async () => {
    if (!certificateRef.current || downloading) return;
    setDownloading(true);
    
    try {
      // Small timeout to allow state changes or animations to settle
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const element = certificateRef.current;
      
      // Compute actual dimensional aspect ratio for crisp rendering
      const canvas = await html2canvas(element, {
        backgroundColor: '#0a051d',
        useCORS: true,
        scale: 2.2, // Ultra High DPI capture for crispness
        logging: false,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Keep styles intact on captured clone
          const cloneContainer = clonedDoc.querySelector('#certificate-capture-container');
          if (cloneContainer) {
            (cloneContainer as HTMLElement).style.transform = 'none';
            (cloneContainer as HTMLElement).style.borderRadius = '24px';
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `Certified_Satyam_Supporter_${name.trim().replace(/\s+/g, '_') || 'Believer'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to capture certificate screenshot:', err);
    } finally {
      setDownloading(false);
    }
  };

  const shareText = `👑 I officially completed "The Satyam Challenge" in ${turns} turns and became a Certified Elite Supporter! Checked & verified by Satyam Tiwari himself! 😎 Try to beat me: ${encodeURIComponent(window.location.origin)}`;

  const shareSocial = (platform: 'x' | 'whatsapp' | 'linkedin') => {
    let url = '';
    if (platform === 'x') {
      url = `https://twitter.com/intent/tweet?text=${shareText}`;
    } else if (platform === 'whatsapp') {
      url = `https://api.whatsapp.com/send?text=${shareText}`;
    } else if (platform === 'linkedin') {
      url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`;
    }
    window.open(url, '_blank');
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Scrollable Container just in case mobile viewport is small */}
      <div className="w-full overflow-x-auto py-2 flex justify-center">
        <motion.div
          id="certificate-capture-container"
          ref={certificateRef}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="relative w-full max-w-2xl mx-auto rounded-3xl p-[3px] bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 shadow-[0_0_50px_rgba(234,179,8,0.25)] overflow-hidden text-left flex-shrink-0"
          style={{ minWidth: '320px', maxWidth: '640px' }}
        >
          {/* Animated metal sheen reflection */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent -skew-y-12 pointer-events-none" />

          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none" />

          {/* Glass interior canvas with a deep midnight/indigo certificate tint */}
          <div className="relative rounded-[22px] bg-[#0c0821]/95 backdrop-blur-xl px-6 py-10 sm:px-12 border border-yellow-500/30 text-white text-center flex flex-col items-center overflow-hidden">
            
            {/* Elegant watermark emblem in background */}
            <div className="absolute -bottom-10 -right-10 text-[200px] text-yellow-500/[0.03] select-none font-bold uppercase tracking-tight font-serif pointer-events-none">
              👑
            </div>

            {/* Certificate Holographic Gold Rosette Seal */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-20 h-20 rounded-full border-2 border-yellow-500/50 bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-200 p-0.5 shadow-[0_0_20px_rgba(234,179,8,0.30)] flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#0a051d] flex flex-col items-center justify-center text-center p-1 border border-yellow-500/30">
                <span className="text-[7px] font-mono text-yellow-500 uppercase tracking-widest font-black leading-none">SATYAM</span>
                <Award className="w-6 h-6 text-yellow-400 animate-pulse my-0.5" />
                <span className="text-[7px] font-mono text-yellow-500 uppercase tracking-widest font-black leading-none">TIWARI</span>
              </div>
              <div className="absolute inset-0 rounded-full border border-dashed border-yellow-400/50 w-16 h-16 m-auto animate-[spin_40s_linear_infinite]" />
            </div>

            {/* Header Ribbon / Badge */}
            <div className="mb-4">
              <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5 text-yellow-300" />
                Certified Supporter Hub
              </div>
            </div>

            {/* Header Titles */}
            <h3 className="font-display font-extrabold text-2xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 uppercase tracking-tight">
              Certificate of Support
            </h3>
            <p className="text-gray-400 text-[10px] sm:text-xs font-mono mt-1 tracking-wider uppercase">
              GLOBAL VERIFIED CREDENTIAL: <span className="text-yellow-400">{pseudoHash}</span>
            </p>

            {/* Divider line */}
            <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent my-6" />

            {/* Prominent main text */}
            <p className="text-gray-300 text-sm sm:text-base font-light max-w-md">
              This document proudly certifies that the brave, unwavering supporter
            </p>

            {/* Generated Supporter's Name with intense gold glows */}
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="my-5 text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-300 to-amber-200 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] font-display tracking-tight px-4 py-1 uppercase"
            >
              {name || 'Satyam Supporter'} 😎
            </motion.div>

            <p className="text-gray-300 text-xs sm:text-sm font-light max-w-lg mb-8 leading-relaxed">
              has successfully passed every level of the grueling, logic-defying{' '}
              <span className="text-yellow-400 font-bold">Satyam Challenge</span>. They demonstrated absolute faith, bypassed running buttons, and formally established their elite loyalty to{' '}
              <span className="text-purple-400 italic font-medium">Satyam Tiwari's undivided wealth presidency</span>.
            </p>

            {/* Core Stats / Grid matching SPECIFIC instructions */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-md mb-8">
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 flex flex-col items-center">
                <span className="text-gray-500 text-[9px] sm:text-[10px] font-mono uppercase tracking-widest">Rank</span>
                <span className="text-yellow-400 font-bold text-xs sm:text-sm flex items-center mt-1">
                  Elite Level
                </span>
              </div>
              
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-3 flex flex-col items-center">
                <span className="text-gray-500 text-[9px] sm:text-[10px] font-mono uppercase tracking-widest">Power</span>
                <span className="text-purple-400 font-bold text-xs sm:text-sm flex items-center mt-1">
                  9999+
                </span>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 flex flex-col items-center">
                <span className="text-gray-500 text-[9px] sm:text-[10px] font-mono uppercase tracking-widest">Respect</span>
                <span className="text-blue-400 font-bold text-xs sm:text-sm flex items-center mt-1">
                  Maximum
                </span>
              </div>
            </div>

            {/* Diagnostic Metadata Badge for Real-time Identity & Turns */}
            <div className="w-full max-w-md bg-white/[0.02] border border-white/5 rounded-2xl p-3 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex flex-col">
                <span className="text-[9px] font-mono uppercase text-gray-500 tracking-wider">Candidate Account</span>
                <span className="text-xs font-bold text-gray-300 font-mono truncate max-w-[200px]">{email}</span>
              </div>
              <div className="flex flex-col text-center sm:text-right">
                <span className="text-[9px] font-mono uppercase text-gray-500 tracking-wider">Evaluated In</span>
                <span className="text-xs font-bold text-purple-400 font-mono">{turns} Cycles/Turns</span>
              </div>
            </div>

            {/* Footer info: Date, Signature and Stamp featuring SATYAM TIWARI */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-8 pt-4 border-t border-gray-800 font-mono text-xs text-gray-500">
              <div className="text-center sm:text-left">
                <span className="block text-[9px] uppercase tracking-wider text-gray-600">Issued On</span>
                <span className="text-gray-300 font-semibold">{currentDate}</span>
              </div>

              {/* Satyam Tiwari signature */}
              <div className="text-center sm:text-right flex flex-col items-center sm:items-end">
                <span className="block text-[9px] uppercase tracking-wider text-gray-600">Supreme Creator & Signee</span>
                <div className="text-yellow-400 text-lg font-serif italic font-bold tracking-widest my-1 flex items-center gap-1">
                  Satyam Tiwari <span className="text-yellow-500 font-sans text-[11px] not-italic p-0.5 rounded border border-yellow-500/20">Sign</span>
                </div>
                <div className="w-24 h-[1px] bg-gradient-to-r from-transparent to-yellow-500/50 my-0.5" />
                <span className="text-[9px] text-gray-600">Founder, Satyam Empire Inc.</span>
              </div>
            </div>

            {/* Embedded sparkles of light */}
            <div className="absolute bottom-4 left-6 flex gap-1.5 text-yellow-500/10">
              <Sparkles className="w-3.5 h-3.5 animate-bounce" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Primary Download Button for Screenshot Capture */}
      <div className="w-full max-w-md flex flex-col gap-4">
        <motion.button
          onClick={triggerDownload}
          disabled={downloading}
          className={`w-full py-3.5 px-6 rounded-2xl font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer border ${
            downloadSuccess
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
              : 'bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-400 border-yellow-400/20 text-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.25)] active:scale-95'
          }`}
        >
          {downloading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              Generating High DPI Image...
            </>
          ) : downloadSuccess ? (
            <>
              <Check className="w-4 h-4" />
              Certificate Downloaded! PNG
            </>
          ) : (
            <>
              <Download className="w-4.5 h-4.5" />
              Download Official Certificate (PNG)
            </>
          )}
        </motion.button>

        {/* Quick Social Share Action Grid */}
        <div className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
          <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider text-center font-bold flex items-center justify-center gap-1.5">
            <Share2 className="w-3 h-3 text-purple-400" /> Share Honor to Social Media
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => shareSocial('x')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-black/40 hover:bg-black border border-white/10 hover:border-white/20 transition-all text-xs font-semibold cursor-pointer"
            >
              <Twitter className="w-3.5 h-3.5 text-sky-400" />
              X / Twitter
            </button>
            <button
              onClick={() => shareSocial('whatsapp')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/10 hover:border-emerald-500/20 transition-all text-xs font-semibold cursor-pointer text-emerald-400"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              WhatsApp
            </button>
            <button
              onClick={() => shareSocial('linkedin')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-950/20 hover:bg-blue-950/40 border border-blue-500/10 hover:border-blue-500/20 transition-all text-xs font-semibold cursor-pointer text-blue-400"
            >
              <Linkedin className="w-3.5 h-3.5 text-blue-400" />
              LinkedIn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
