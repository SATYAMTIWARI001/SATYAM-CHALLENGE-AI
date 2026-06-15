import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Sparkles, Trophy, Check, Share2, Twitter, Linkedin, MessageCircle, FileDown, ShieldCheck, Zap, Mail, ArrowRight, ShieldAlert } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { signInWithGoogleGmail, sendCertificateEmail, cachedAccessToken, authenticatedUser } from '../firebase';

interface CertificateProps {
  name: string;
  email?: string;
  turns?: number;
  certificateId?: string;
}

function QRMatrix({ data }: { data: string }) {
  const size = 15;
  const grid: boolean[][] = [];
  
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = data.charCodeAt(i) + ((hash << 5) - hash);
  }

  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      const isTopLeft = r < 5 && c < 5;
      const isTopRight = r < 5 && c >= size - 5;
      const isBottomLeft = r >= size - 5 && c < 5;

      if (isTopLeft || isTopRight || isBottomLeft) {
        const lr = isTopLeft ? r : isTopRight ? r : r - (size - 5);
        const lc = isTopLeft ? c : isTopRight ? c - (size - 5) : c;
        const isBorder = lr === 0 || lr === 4 || lc === 0 || lc === 4;
        const isCore = lr >= 2 && lr <= 2 && lc >= 2 && lc <= 2;
        row.push(isBorder || isCore);
      } else {
        const isAlignmentZone = r >= size - 4 && r <= size - 2 && c >= size - 4 && c <= size - 2;
        if (isAlignmentZone) {
          const ar = r - (size - 4);
          const ac = c - (size - 4);
          row.push(ar === 0 || ar === 2 || ac === 0 || ac === 2 || (ar === 1 && ac === 1));
        } else {
          const bitIndex = r * size + c;
          const val = ((Math.abs(hash) >> (bitIndex % 31)) & 1) === 1;
          const isTimingPattern = r === 6 || c === 6;
          if (isTimingPattern) {
            row.push(bitIndex % 2 === 0);
          } else {
            row.push(val);
          }
        }
      }
    }
    grid.push(row);
  }

  return (
    <svg 
      viewBox={`0 0 ${size} ${size}`} 
      className="w-full h-full"
      style={{ shapeRendering: 'crispEdges' }}
    >
      <rect x={0} y={0} width={size} height={size} fill="transparent" />
      {grid.map((row, r) => 
        row.map((active, c) => 
          active ? (
            <rect 
              key={`${r}-${c}`} 
              x={c} 
              y={r} 
              width={1.05}
              height={1.05} 
              fill="#fbbf24" 
            />
          ) : null
        )
      )}
    </svg>
  );
}

export default function Certificate({ name, email = 'satyam000108@gmail.com', turns = 4, certificateId }: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Gmail states
  const [gmailAuthorized, setGmailAuthorized] = useState(!!cachedAccessToken);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState(email || 'satyam000108@gmail.com');
  const [authorizedUserRef, setAuthorizedUserRef] = useState<any>(authenticatedUser);

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Use the provided certificateId or fallback to a persistent pseudo-random one
  const finalCertId = certificateId || `SATYAM-2026-${String(turns).padStart(2, '0')}-${name.replace(/\s+/g, '').slice(0, 3).toUpperCase() || 'BEL'}-${Math.floor(10000 + Math.random() * 90000)}`;

  const triggerPDFDownload = async () => {
    if (!certificateRef.current || downloading) return;
    setDownloading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const element = certificateRef.current;
      
      const canvas = await html2canvas(element, {
        backgroundColor: '#0a051d',
        useCORS: true,
        scale: 2.2, // Ultra High DPI capture for crispness
        logging: false,
        allowTaint: false,
        onclone: (clonedDoc) => {
          const cloneContainer = clonedDoc.querySelector('#certificate-capture-container');
          if (cloneContainer) {
            (cloneContainer as HTMLElement).style.transform = 'none';
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = 297;
      const pdfHeight = 210;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Official_Certified_Elite_Satyam_Supporter_${name.trim().replace(/\s+/g, '_') || 'Believer'}.pdf`);
      
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate secure PDF certificate:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleGmailAuthorize = async () => {
    try {
      const response = await signInWithGoogleGmail();
      setGmailAuthorized(true);
      setAuthorizedUserRef(response.user);
      if (response.user.email) {
        setUserEmail(response.user.email);
      }
      setEmailError(null);
    } catch (err: any) {
      console.error(err);
      setEmailError('Gmail authorization cancelled or failed.');
    }
  };

  const handleSendEmail = async () => {
    if (sendingEmail) return;
    setSendingEmail(true);
    setEmailError(null);
    try {
      await sendCertificateEmail(userEmail, name, finalCertId, turns, currentDate);
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 5000);
    } catch (err: any) {
      console.error(err);
      setEmailError('Could not send email. Please ensure your Gmail scope is fully authorized.');
    } finally {
      setSendingEmail(false);
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
      {/* Horizontally scrolling frame wrapper to handle mobile screens beautifully */}
      <div className="w-full overflow-x-auto py-2 flex justify-center scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <motion.div
          id="certificate-capture-container"
          ref={certificateRef}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="relative w-[840px] h-[594px] rounded-3xl p-[5px] bg-[linear-gradient(135deg,#dbaf42_0%,#f9e19d_25%,#b88a1b_50%,#f5df83_75%,#a87208_100%)] shadow-[0_0_80px_rgba(219,175,66,0.35)] overflow-hidden text-left flex-shrink-0"
        >
          {/* Subtle gold foil reflection background layers */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.08] to-transparent -skew-y-[8deg] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3.5s_infinite] pointer-events-none" />

          {/* Deep royal certificate backdrop canvas */}
          <div className="relative w-full h-full rounded-[20px] bg-[#09051d] px-14 py-11 text-white text-center flex flex-col justify-between items-center overflow-hidden">
            
            {/* INSET GOLD METALLIC OUTLINE (Double border layout) */}
            <div className="absolute inset-2 border border-dashed border-[#dbaf42]/45 pointer-events-none rounded-[16px] z-20" />
            <div className="absolute inset-2.5 border border-dashed border-[#dbaf42]/20 pointer-events-none rounded-[16px] z-20" />

            {/* WATERMARKS: Multi-diagonal premium watermark lines */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none select-none opacity-25 z-0 flex flex-col justify-around rotate-[-15deg] scale-110">
              <div className="whitespace-nowrap text-[12px] font-mono text-amber-500/[0.08] tracking-[14px] font-bold uppercase">
                VERIFIED BY SATYAM TIWARI • SECURED ARCHIVE CREDENTIAL • VERIFIED BY SATYAM TIWARI
              </div>
              <div className="whitespace-nowrap text-[12px] font-mono text-amber-500/[0.08] tracking-[14px] font-bold uppercase translate-x-[150px]">
                OFFICIAL ELITE STATUS CERTIFICATE • VERIFIED BY SATYAM TIWARI • OFFICIAL ELITE STATUS
              </div>
              <div className="whitespace-nowrap text-[12px] font-mono text-amber-500/[0.08] tracking-[14px] font-bold uppercase translate-x-[-100px]">
                VERIFIED BY SATYAM TIWARI • SECURED ARCHIVE CREDENTIAL • VERIFIED BY SATYAM TIWARI
              </div>
              <div className="whitespace-nowrap text-[12px] font-mono text-amber-500/[0.08] tracking-[14px] font-bold uppercase translate-x-[50px]">
                OFFICIAL ELITE STATUS CERTIFICATE • VERIFIED BY SATYAM TIWARI • OFFICIAL ELITE STATUS
              </div>
            </div>

            {/* Massive transparent crown watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[410px] text-yellow-500/[0.015] select-none font-bold uppercase tracking-tight pointer-events-none font-serif leading-none">
              👑
            </div>

            {/* Corner Border Accents (Traditional Premium Certificate Style) */}
            <div className="absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-[#dbaf42]/70 rounded-tl-lg z-30" />
            <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-[#dbaf42]/70 rounded-tr-lg z-30" />
            <div className="absolute bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-[#dbaf42]/70 rounded-bl-lg z-30" />
            <div className="absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-[#dbaf42]/70 rounded-br-lg z-30" />

            {/* Header section with Badge & Title */}
            <div className="flex flex-col items-center z-10">
              <div className="flex items-center gap-2 px-5 py-1.5 rounded-full bg-yellow-500/10 border border-[#dbaf42]/40 text-yellow-400 text-[10px] font-black uppercase tracking-widest font-mono">
                <Trophy className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                ELITE CREDENTIAL VERIFICATION SYSTEM
              </div>
              
              {/* Cinzel brand header typography */}
              <h3 className="font-royal font-black text-3xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#dbaf42] to-amber-500 uppercase tracking-[2px] mt-4.5">
                Certificate of Elite Support
              </h3>
              
              <p className="text-gray-400 text-[9px] font-mono mt-1 tracking-wider uppercase bg-white/5 px-2.5 py-0.5 rounded-md border border-white/5">
                SECURED REGISTRY SEQUENCE: <span className="text-yellow-400 font-bold">{finalCertId}</span>
              </p>
            </div>

            {/* Certifies that section with supreme typography layout */}
            <div className="flex flex-col items-center w-full px-4 z-10">
              <p className="text-amber-300/80 text-xs font-light tracking-wide italic uppercase font-mono">
                This honorary document is officially presented to:
              </p>
              
              {/* Custom Elegant Typography of Candidate Name */}
              <div className="relative my-3 py-1 flex flex-col items-center w-full">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-yellow-500/[0.04] blur-xl h-20 w-3/4 rounded-full" />
                <h4 className="relative text-5xl font-bold tracking-normal italic text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-200 to-amber-100 font-serif-elegant text-center leading-normal py-1">
                  {name || 'Satyam Supporter'}
                </h4>
                <div className="w-80 h-[1.5px] bg-gradient-to-r from-transparent via-[#dbaf42]/70 to-transparent mt-1" />
              </div>

              <p className="text-gray-300 text-[11px] font-light max-w-xl leading-relaxed text-center font-sans">
                who has successfully passed every logic-defying stage of <span className="text-yellow-400 font-semibold underline decoration-yellow-500/30">The Satyam Challenge</span> with divine trust & absolute perseverance. They have formally established their immortal loyalty and been verified as an elite advocate in the sacred archives of creator{' '}
                <span className="text-purple-400 font-bold">Satyam Tiwari</span>.
              </p>
            </div>

            {/* Badges, QR Verification Area & Stats Grid */}
            <div className="w-full grid grid-cols-12 gap-4 items-center px-4 z-10">
              
              {/* Left Column: Achievement Badges */}
              <div className="col-span-4 flex flex-col gap-2 text-left border-r border-[#dbaf42]/20 pr-2">
                <span className="text-[8px] uppercase font-mono text-gray-500 tracking-wider block border-b border-white/5 pb-1 font-bold">⚙️ SYSTEM DISCIPLINE</span>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] text-amber-300 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Identity Verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-purple-300 font-mono">
                    <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Command Sovereign</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-cyan-300 font-mono">
                    <Award className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Elite Supporter Status</span>
                  </div>
                </div>
              </div>

              {/* Middle Column: Core Verified Stats */}
              <div className="col-span-5 grid grid-cols-3 gap-2 px-1">
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-2.5 flex flex-col items-center justify-center">
                  <span className="text-gray-500 text-[8px] font-mono uppercase tracking-wider">RANK</span>
                  <span className="text-yellow-400 font-black text-[9px] mt-1 text-center truncate w-full font-mono">ELITE SUPPORTER</span>
                </div>
                
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-2.5 flex flex-col items-center justify-center">
                  <span className="text-gray-500 text-[8px] font-mono uppercase tracking-wider">POWER LEVEL</span>
                  <span className="text-purple-400 font-bold text-xs mt-1">9999+</span>
                </div>

                <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-2.5 flex flex-col items-center justify-center">
                  <span className="text-gray-500 text-[8px] font-mono uppercase tracking-wider">INTEGRITY</span>
                  <span className="text-cyan-400 font-bold text-xs mt-1">100% SECURE</span>
                </div>
              </div>

              {/* Right Column: QR Verification Seal & Authenticator */}
              <div className="col-span-3 flex items-center justify-end gap-3 border-l border-[#dbaf42]/20 pl-2">
                <div className="flex flex-col text-right justify-center">
                  <span className="text-[7px] text-gray-500 font-mono tracking-widest uppercase">SCAN TO VERIFY</span>
                  <span className="text-[8px] text-amber-400 font-bold font-mono">Verified by Satyam</span>
                </div>
                {/* Embedded Live QR Code */}
                <div className="w-14 h-14 bg-amber-400/5 border border-amber-400/30 p-1 rounded-lg flex items-center justify-center shrink-0">
                  <QRMatrix data={finalCertId} />
                </div>
              </div>

            </div>

            {/* Footer Signatures, Authority and Real Timestamp */}
            <div className="w-full flex items-end justify-between pt-4 border-t border-[#dbaf42]/25 font-mono text-xs text-gray-500 z-10">
              <div className="text-left flex flex-col">
                <span className="text-[8px] uppercase tracking-widest text-[#fbbf24] font-black">CANDIDATE ACCOUNT</span>
                <span className="text-[10px] text-gray-300 font-semibold truncate max-w-[240px] mt-0.5">{email}</span>
                
                <span className="text-[8px] text-gray-500 uppercase tracking-widest mt-2 block font-black">TIMESTAMP SECURED</span>
                <span className="text-[10px] text-amber-400 font-semibold mt-0.5">{currentDate}</span>
              </div>

              {/* Satyam Tiwari hand-drawn feel styled signature */}
              <div className="text-right flex flex-col items-end">
                <span className="text-[8px] uppercase tracking-widest text-purple-400 font-black">ISSUING AUTHORITY</span>
                <div className="text-yellow-400 text-lg font-serif italic font-black tracking-widest my-0.5 flex items-center gap-1.5">
                  Satyam Tiwari <span className="text-yellow-600 font-sans text-[9px] not-italic px-1 py-0.2 rounded border border-yellow-500/25 font-black bg-yellow-500/10">CEL</span>
                </div>
                <div className="w-32 h-[1px] bg-gradient-to-r from-transparent to-yellow-500/50 my-0.5" />
                <span className="text-[8px] text-gray-500 tracking-wider">Supreme Leader of Satyam Empire Inc.</span>
              </div>
            </div>

            {/* Tiny ambient bottom sparkles */}
            <div className="absolute bottom-4 left-6 flex gap-1 bg-[#09051d] px-2.5 py-0.5 border border-white/5 rounded-full text-yellow-500/40 shadow-sm z-10">
              <Sparkles className="w-3 h-3 animate-pulse" />
              <span className="text-[8px] text-gray-400 font-mono font-bold uppercase tracking-wider">Secured Verification</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Tray */}
      <div className="w-full max-w-md flex flex-col gap-4">
        
        {/* Real PDF trigger button */}
        <motion.button
          onClick={triggerPDFDownload}
          disabled={downloading}
          className={`w-full py-4 px-6 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2.5 transition-all cursor-pointer border ${
            downloadSuccess
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              : 'bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-400 border-yellow-400/20 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.3)] active:scale-[0.98]'
          }`}
        >
          {downloading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              Compiling Secure PDF Document...
            </>
          ) : downloadSuccess ? (
            <>
              <Check className="w-4.5 h-4.5" />
              Certificate Downloaded! (.PDF)
            </>
          ) : (
            <>
              <FileDown className="w-5 h-5" />
              📥 Download PDF Certificate
            </>
          )}
        </motion.button>

        {/* Gmail API emailing portal */}
        <div className="w-full bg-[#0b081e]/60 border border-purple-500/20 rounded-2xl p-4 flex flex-col gap-3">
          <span className="text-[10px] font-mono uppercase text-yellow-400 tracking-wider text-center font-bold flex items-center justify-center gap-1.5 border-b border-white/5 pb-2">
            <Mail className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> Official Gmail Delivery Portal
          </span>

          <AnimatePresence mode="wait">
            {!gmailAuthorized ? (
              <motion.div
                key="gmail-unauthorized"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-2.5"
              >
                <p className="text-gray-400 text-[11px] leading-relaxed text-center">
                  Securely deliver your credential directly to your inbox using Google Workspace's Gmail send API!
                </p>
                <button
                  type="button"
                  onClick={handleGmailAuthorize}
                  className="w-full py-3 bg-[#1e1145] hover:bg-[#2b1b5e] border border-purple-500/30 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <Mail className="w-4 h-4 text-purple-400" />
                  🔑 Authorize with Gmail via Google
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="gmail-authorized"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-mono bg-purple-950/20 px-3 py-2 border border-purple-500/10 rounded-xl">
                  <span className="text-[10px] text-purple-300">AUTHORIZED ACCOUNT:</span>
                  <span className="text-emerald-400 font-bold truncate max-w-[180px]">
                    {authorizedUserRef?.email || 'Authorized'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="gmail-recipient-email" className="text-[9px] uppercase font-mono text-gray-500 block font-bold">Recipient Mailbox Address</label>
                  <div className="flex gap-2">
                    <input
                      id="gmail-recipient-email"
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="e.g. user@gmail.com"
                      className="flex-1 bg-slate-900/50 border border-purple-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-400"
                    />
                    <button
                      type="button"
                      onClick={handleSendEmail}
                      disabled={sendingEmail || !userEmail.trim()}
                      className={`px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-slate-950 cursor-pointer ${
                        emailSuccess
                          ? 'bg-emerald-450 border border-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                          : 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-450 font-black'
                      }`}
                    >
                      {sendingEmail ? (
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      ) : emailSuccess ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5" />
                      )}
                      {emailSuccess ? 'Sent!' : 'Send'}
                    </button>
                  </div>
                </div>

                {emailSuccess && (
                  <p className="text-emerald-400 font-mono text-[10px] text-center animate-pulse">
                    ✨ Verified Mail Sent! Check your inbox/spam folder for your certified credential.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {emailError && (
            <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/20 text-rose-450 text-[10px] font-mono text-center flex items-center justify-center gap-1.5 animate-pulse">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{emailError}</span>
            </div>
          )}
        </div>

        {/* Quick Social Share Action Grid */}
        <div className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
          <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider text-center font-bold flex items-center justify-center gap-1.5">
            <Share2 className="w-3 h-3 text-purple-400 animate-pulse" /> Share Honor to Social Media
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => shareSocial('x')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-black/40 hover:bg-black border border-white/10 hover:border-white/20 transition-all text-[11px] font-semibold cursor-pointer font-mono"
            >
              <Twitter className="w-3.5 h-3.5 text-sky-400" />
              Twitter
            </button>
            <button
              onClick={() => shareSocial('whatsapp')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/10 hover:border-emerald-500/20 transition-all text-[11px] font-semibold cursor-pointer font-mono text-emerald-400"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              WhatsApp
            </button>
            <button
              onClick={() => shareSocial('linkedin')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-950/20 hover:bg-blue-950/40 border border-blue-500/10 hover:border-blue-500/20 transition-all text-[11px] font-semibold cursor-pointer font-mono text-blue-400"
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
