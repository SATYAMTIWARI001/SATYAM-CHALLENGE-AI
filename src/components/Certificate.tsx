import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Sparkles, Trophy, Check, Share2, Twitter, Linkedin, MessageCircle, FileDown, ShieldCheck, Zap, Mail, ArrowRight, ShieldAlert, X, Download, Smartphone, Image } from 'lucide-react';
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

  // Mobile compatibility states
  const [isMobile, setIsMobile] = useState(false);
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [generatedImgUrl, setGeneratedImgUrl] = useState<string | null>(null);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [imageDownloadSuccess, setImageDownloadSuccess] = useState(false);
  const [sharingNative, setSharingNative] = useState(false);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

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

  // Pure Canvas-based premium drawing for ultra-high-resolution output inside Sandboxed IFrames
  const drawDynamicCertificate = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 2100;
    const h = 1485; // Perfectly matches A4 ratio
    canvas.width = w;
    canvas.height = h;

    const safeRoundRect = (cx: CanvasRenderingContext2D, x: number, y: number, rw: number, rh: number, r: number) => {
      if (typeof cx.roundRect === 'function') {
        cx.roundRect(x, y, rw, rh, r);
      } else {
        cx.beginPath();
        cx.moveTo(x + r, y);
        cx.lineTo(x + rw - r, y);
        cx.quadraticCurveTo(x + rw, y, x + rw, y + r);
        cx.lineTo(x + rw, y + rh - r);
        cx.quadraticCurveTo(x + rw, y + rh, x + rw - r, y + rh);
        cx.lineTo(x + r, y + rh);
        cx.quadraticCurveTo(x, y + rh, x, y + rh - r);
        cx.lineTo(x, y + r);
        cx.quadraticCurveTo(x, y, x + r, y);
        cx.closePath();
      }
    };

    // 1. Rich dark background with radial cosmic glow
    const bgGrad = ctx.createRadialGradient(w/2, h/2, 200, w/2, h/2, w*0.75);
    bgGrad.addColorStop(0, '#120936');
    bgGrad.addColorStop(0.6, '#080517');
    bgGrad.addColorStop(1, '#04020a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. High-Fidelity gold metallic borders
    const goldGrad = ctx.createLinearGradient(0, 0, w, h);
    goldGrad.addColorStop(0, '#dbaf42');
    goldGrad.addColorStop(0.25, '#f9e19d');
    goldGrad.addColorStop(0.5, '#b88a1b');
    goldGrad.addColorStop(0.75, '#f5df83');
    goldGrad.addColorStop(1, '#a87208');

    // Solid outer border
    ctx.lineWidth = 14;
    ctx.strokeStyle = goldGrad;
    ctx.strokeRect(25, 25, w - 50, h - 50);

    // Inset border
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(219, 175, 66, 0.45)';
    ctx.strokeRect(42, 42, w - 84, h - 84);

    // Dashed inner border lines
    ctx.lineWidth = 2;
    ctx.setLineDash([16, 12]);
    ctx.strokeStyle = 'rgba(219, 175, 66, 0.65)';
    ctx.strokeRect(55, 55, w - 110, h - 110);
    ctx.setLineDash([]); // Reset line dash

    // 3. Diagonal repeating watermarks
    ctx.save();
    ctx.translate(w/2, h/2);
    ctx.rotate(-15 * Math.PI / 180);
    ctx.fillStyle = 'rgba(251, 191, 36, 0.018)';
    ctx.font = 'bold 26px monospace';
    ctx.textAlign = 'center';
    for (let y = -900; y <= 900; y += 140) {
      ctx.fillText('VERIFIED BY SATYAM TIWARI • SECURED ARCHIVE CREDENTIAL • VERIFIED BY SATYAM TIWARI', 0, y);
      ctx.fillText('OFFICIAL ELITE STATUS CERTIFICATE • VERIFIED BY SATYAM TIWARI • OFFICIAL ELITE STATUS', 100, y + 70);
    }
    ctx.restore();

    // Central background Crown symbol watermark
    ctx.save();
    ctx.font = '450px Arial';
    ctx.fillStyle = 'rgba(251, 191, 36, 0.025)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👑', w/2, h/2 - 10);
    ctx.restore();

    // Traditional ornamental corner accents
    const drawCornerOrnament = (cx: number, cy: number, rx: number, ry: number) => {
      ctx.save();
      ctx.strokeStyle = 'rgba(219, 175, 66, 0.85)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(cx + rx, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + ry);
      ctx.stroke();
      ctx.restore();
    };
    const cLen = 120;
    drawCornerOrnament(80, 80, cLen, cLen);
    drawCornerOrnament(w - 80, 80, -cLen, cLen);
    drawCornerOrnament(80, h - 80, cLen, -cLen);
    drawCornerOrnament(w - 80, h - 80, -cLen, -cLen);

    // 4. Header Badge (Elite Credential System)
    ctx.save();
    const badgeText = 'ELITE CREDENTIAL VERIFICATION SYSTEM';
    ctx.font = '900 24px monospace';
    const bW = ctx.measureText(badgeText).width + 85;
    const bH = 58;
    const bY = 125;

    ctx.fillStyle = 'rgba(219, 175, 66, 0.12)';
    ctx.strokeStyle = 'rgba(219, 175, 66, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    safeRoundRect(ctx, w/2 - bW/2, bY, bW, bH, 29);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏆  ' + badgeText, w/2, bY + bH/2);
    ctx.restore();

    // 5. Header Brand Title
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = goldGrad;
    ctx.shadowColor = 'rgba(219, 175, 66, 0.35)';
    ctx.shadowBlur = 12;
    ctx.font = 'bold 82px Georgia, serif';
    ctx.fillText('Certificate of Elite Support', w/2, 285);
    ctx.restore();

    // Secure Registry Sequence ID
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = '300 italic 24px monospace';
    ctx.fillText('SECURED REGISTRY SEQUENCE: ', w/2 - 145, 350);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(finalCertId, w/2 + 185, 350);
    ctx.restore();

    // 6. Presented To Section
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#dbaf42';
    ctx.font = 'italic 28px Georgia, serif';
    ctx.fillText('This honorary document is officially presented to:', w/2, 455);

    // Aura effect under name
    const aura = ctx.createRadialGradient(w/2, 565, 5, w/2, 565, 300);
    aura.addColorStop(0, 'rgba(219, 175, 66, 0.1)');
    aura.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(w/2, 565, 300, 0, Math.PI * 2);
    ctx.fill();

    // Massive Glowing Supporter Name
    const nameGrad = ctx.createLinearGradient(w/2 - 400, 0, w/2 + 400, 0);
    nameGrad.addColorStop(0, '#ffffff');
    nameGrad.addColorStop(0.5, '#fef08a');
    nameGrad.addColorStop(1, '#fef3c7');
    ctx.fillStyle = nameGrad;
    ctx.shadowColor = 'rgba(251, 191, 36, 0.45)';
    ctx.shadowBlur = 24;
    ctx.font = 'bold italic 94px Georgia, serif';
    ctx.fillText(name || 'Satyam Supporter', w/2, 575);
    ctx.shadowBlur = 0; // Reset

    // Elegant golden divider line
    const lineGrad = ctx.createLinearGradient(w/2 - 350, 0, w/2 + 350, 0);
    lineGrad.addColorStop(0, 'rgba(219, 175, 66, 0)');
    lineGrad.addColorStop(0.5, 'rgba(219, 175, 66, 0.95)');
    lineGrad.addColorStop(1, 'rgba(219, 175, 66, 0)');
    ctx.fillStyle = lineGrad;
    ctx.fillRect(w/2 - 350, 608, 700, 4);
    ctx.restore();

    // 7. Core Description Paragraphs
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '26px sans-serif';
    const dY = 675;
    const lH = 40;
    ctx.fillText('who has successfully passed every logic-defying stage of The Satyam Challenge with divine trust', w/2, dY);
    ctx.fillText('& absolute perseverance. They have formally established their immortal loyalty and been verified', w/2, dY + lH);
    ctx.fillText('as an elite advocate in the sacred archives of creator Satyam Tiwari.', w/2, dY + lH * 2);
    ctx.restore();

    // 8. Stats Area (Rank, Score, integrity)
    const sY = 855;
    const boxW = 340;
    const boxH = 145;
    const sGap = 50;
    const stX = w/2 - (boxW * 3 + sGap * 2) / 2;

    const drawDataBox = (x: number, label: string, val: string, strokeCol: string, valCol: string) => {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 3;
      ctx.beginPath();
      safeRoundRect(ctx, x, sY, boxW, boxH, 20);
      ctx.fill();
      ctx.stroke();

      // Top label
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, x + boxW/2, sY + 48);

      // Value
      ctx.fillStyle = valCol;
      ctx.font = 'bold 31px monospace';
      ctx.fillText(val, x + boxW/2, sY + 102);
      ctx.restore();
    };

    drawDataBox(stX, 'POWER LEVEL', '9999+', 'rgba(168, 85, 247, 0.25)', '#c084fc');
    drawDataBox(stX + boxW + sGap, 'INTEGRITY', '100% SECURE', 'rgba(16, 185, 129, 0.25)', '#34d399');
    drawDataBox(stX + (boxW + sGap) * 2, 'RANK', 'ELITE SUPPORTER', 'rgba(219, 175, 66, 0.25)', '#f59e0b');

    // 9. QR Seal Verification Blocks
    const qrX = w - 380;
    const qrY = 1055;
    const qrS = 190;

    ctx.save();
    ctx.fillStyle = 'rgba(219, 175, 66, 0.04)';
    ctx.strokeStyle = 'rgba(219, 175, 66, 0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    safeRoundRect(ctx, qrX, qrY, qrS, qrS, 18);
    ctx.fill();
    ctx.stroke();

    // QR blocks
    const matrix = 15;
    const sizeDot = qrS / matrix;
    let qrHash = 0;
    for (let i = 0; i < finalCertId.length; i++) {
      qrHash = finalCertId.charCodeAt(i) + ((qrHash << 5) - qrHash);
    }
    ctx.fillStyle = '#fbbf24';
    for (let r = 0; r < matrix; r++) {
      for (let c = 0; c < matrix; c++) {
        const isTopLeft = r < 5 && c < 5;
        const isTopRight = r < 5 && c >= matrix - 5;
        const isBottomLeft = r >= matrix - 5 && c < 5;
        let cellOn = false;

        if (isTopLeft || isTopRight || isBottomLeft) {
          const lr = isTopLeft ? r : isTopRight ? r : r - (matrix - 5);
          const lc = isTopLeft ? c : isTopRight ? c - (matrix - 5) : c;
          const isBorder = lr === 0 || lr === 4 || lc === 0 || lc === 4;
          const isCore = lr >= 2 && lr <= 2 && lc >= 2 && lc <= 2;
          cellOn = isBorder || isCore;
        } else {
          const isAlign = r >= matrix - 4 && r <= matrix - 2 && c >= matrix - 4 && c <= matrix - 2;
          if (isAlign) {
            const ar = r - (matrix - 4);
            const ac = c - (matrix - 4);
            cellOn = ar === 0 || ar === 2 || ac === 0 || ac === 2 || (ar === 1 && ac === 1);
          } else {
            const bit = r * matrix + c;
            const val = ((Math.abs(qrHash) >> (bit % 31)) & 1) === 1;
            const isTime = r === 6 || c === 6;
            cellOn = isTime ? (bit % 2 === 0) : val;
          }
        }

        if (cellOn) {
          ctx.fillRect(qrX + c * sizeDot + 1, qrY + r * sizeDot + 1, sizeDot - 1.2, sizeDot - 1.2);
        }
      }
    }
    ctx.restore();

    // 10. Footer info details
    ctx.save();
    ctx.textAlign = 'left';
    const fY = 1085;
    ctx.fillStyle = '#dbaf42';
    ctx.font = '900 19px monospace';
    ctx.fillText('CANDIDATE ACCOUNT', 150, fY);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '500 23px monospace';
    ctx.fillText(userEmail, 150, fY + 36);

    ctx.fillStyle = '#64748b';
    ctx.font = '900 19px monospace';
    ctx.fillText('TIMESTAMP SECURED', 150, fY + 98);
    ctx.fillStyle = '#fbbf24';
    ctx.font = '500 23px monospace';
    ctx.fillText(currentDate, 150, fY + 132);
    ctx.restore();

    // 11. Issuing hand-signed block
    ctx.save();
    ctx.textAlign = 'right';
    const sX = qrX - 50;
    ctx.fillStyle = '#c084fc';
    ctx.font = '900 19px monospace';
    ctx.fillText('ISSUING AUTHORITY', sX, fY);

    // Calligraphy signature
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'italic bold 42px Georgia, serif';
    ctx.fillText('Satyam Tiwari', sX - 70, fY + 48);

    // Dynamic CEL Badge
    ctx.fillStyle = 'rgba(251, 191, 36, 0.12)';
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    safeRoundRect(ctx, sX - 60, fY + 16, 60, 36, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fbbf24';
    ctx.font = '900 19px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CEL', sX - 30, fY + 40);

    // Line
    const sLine = ctx.createLinearGradient(sX - 320, 0, sX, 0);
    sLine.addColorStop(0, 'rgba(251,191,36,0)');
    sLine.addColorStop(1, 'rgba(251,191,36,0.5)');
    ctx.fillStyle = sLine;
    ctx.fillRect(sX - 280, fY + 70, 280, 2.5);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#64748b';
    ctx.font = '20px sans-serif';
    ctx.fillText('Supreme Leader of Satyam Empire Inc.', sX, fY + 102);
    ctx.restore();

    // System banner logo bottom
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    safeRoundRect(ctx, 150, h - 150, 350, 42, 21);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('✨ SECURED SYSTEM VERIFICATION', 325, h - 124);
    ctx.restore();
  };

  const triggerPDFDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    
    try {
      // Yield thread to let the spinner render
      await new Promise(resolve => setTimeout(resolve, 50));

      const canvas = document.createElement('canvas');
      drawDynamicCertificate(canvas);
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);
      pdf.save(`Official_Certified_Elite_Satyam_Supporter_${name.trim().replace(/\s+/g, '_') || 'Believer'}.pdf`);
      
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate secure PDF certificate:', err);
    } finally {
      setDownloading(false);
    }
  };

  const triggerImageDownload = async () => {
    if (downloadingImage) return;
    setDownloadingImage(true);
    
    try {
      // Yield thread
      await new Promise(resolve => setTimeout(resolve, 50));

      const canvas = document.createElement('canvas');
      drawDynamicCertificate(canvas);
      
      const imgData = canvas.toDataURL('image/png');
      setGeneratedImgUrl(imgData);
      
      if (isMobile) {
        setMobileModalOpen(true);
      } else {
        const link = document.createElement('a');
        link.download = `Official_Certified_Elite_Satyam_Supporter_${name.trim().replace(/\s+/g, '_') || 'Believer'}.png`;
        link.href = imgData;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setImageDownloadSuccess(true);
        setTimeout(() => setImageDownloadSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to generate secure PNG certificate:', err);
    } finally {
      setDownloadingImage(false);
    }
  };

  const triggerNativeShare = async () => {
    if (sharingNative) return;
    setSharingNative(true);
    try {
      const canvas = document.createElement('canvas');
      drawDynamicCertificate(canvas);
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setSharingNative(false);
          return;
        }
        const file = new File([blob], `Certificate_Elite_Supporter.png`, { type: 'image/png' });
        
        try {
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Official Elite Supporter Certificate',
              text: `👑 I officially completed "The Satyam Challenge" and became a Certified Elite Supporter! Checked & verified by Satyam Tiwari! Check it out:`,
            });
          } else if (navigator.share) {
            await navigator.share({
              title: 'Official Elite Supporter Certificate',
              text: `👑 I officially completed "The Satyam Challenge" and became a Certified Elite Supporter! Checked & verified by Satyam Tiwari! Check it out:`,
              url: window.location.origin
            });
          } else {
            console.warn('Native sharing not supported in this browser environment');
          }
        } catch (shareErr) {
          console.error('Active browser or sandbox policy blocked sharing:', shareErr);
          // Graceful fallback copy reference link
          try {
            await navigator.clipboard.writeText(`👑 I officially completed "The Satyam Challenge"! Check it out: ${window.location.origin}`);
          } catch (clipErr) {
            console.warn('Clipboard write block: ', clipErr);
          }
        } finally {
          setSharingNative(false);
        }
      }, 'image/png');
    } catch (err) {
      console.warn('Native share canvas or initialization error: ', err);
      setSharingNative(false);
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
    
    try {
      window.open(url, '_blank');
    } catch (openErr) {
      console.warn('Opening window blocked by sandbox policy:', openErr);
      // Fallback: copy layout share URL to clipboard
      try {
        navigator.clipboard.writeText(url);
      } catch (clipboardErr) {
        console.warn('Clipboard fallback blocked:', clipboardErr);
      }
    }
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
        
        {/* Core Multi-Format Download Options */}
        <div className="grid grid-cols-2 gap-3">
          {/* PDF Certificate Document option */}
          <motion.button
            onClick={triggerPDFDownload}
            disabled={downloading || downloadingImage}
            className={`py-3.5 px-4 rounded-xl font-black uppercase text-[10.5px] tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              downloadSuccess
                ? 'bg-emerald-500/20 border-emerald-500/35 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : 'bg-indigo-950/40 hover:bg-indigo-900/50 border-[#dbaf42]/30 text-yellow-300 shadow-[0_0_15px_rgba(219,175,66,0.06)] active:scale-[0.98]'
            }`}
          >
            {downloading ? (
              <div className="w-3.5 h-3.5 border-2 border-yellow-300 border-t-transparent rounded-full animate-spin" />
            ) : downloadSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-450" />
            ) : (
              <FileDown className="w-4 h-4 text-[#dbaf42]" />
            )}
            {downloading ? 'Compiling...' : downloadSuccess ? 'PDF Saved!' : 'Get PDF Doc'}
          </motion.button>

          {/* PNG Certificate Image option (Flawless mobile save bypass) */}
          <motion.button
            onClick={triggerImageDownload}
            disabled={downloading || downloadingImage}
            className={`py-3.5 px-4 rounded-xl font-black uppercase text-[10.5px] tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              imageDownloadSuccess
                ? 'bg-emerald-500/20 border-emerald-500/35 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : 'bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 border-yellow-400/20 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.25)] active:scale-[0.98]'
            }`}
          >
            {downloadingImage ? (
              <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : imageDownloadSuccess ? (
              <Check className="w-3.5 h-3.5 text-slate-950" />
            ) : (
              <Download className="w-4 h-4 text-slate-950" />
            )}
            {downloadingImage ? 'Rendering...' : imageDownloadSuccess ? 'Image Saved!' : isMobile ? '⚡ Get Image (Mobile)' : 'Save Photo (PNG)'}
          </motion.button>
        </div>

        {/* Dynamic Helpful Mobile Instruction Tag */}
        {isMobile && (
          <p className="text-[10px] text-amber-200/60 text-center -mt-1 font-mono tracking-wide">
            💡 Tap <span className="text-yellow-400 font-bold">"Get Image"</span> for the Mobile Save Assistant - it bypasses in-app browser blocks!
          </p>
        )}

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

      {/* MOBILE SAVE ASSISTANT OVERLAY MODAL */}
      <AnimatePresence>
        {mobileModalOpen && generatedImgUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md overflow-y-auto"
          >
            <div className="absolute top-4 right-4 z-55">
              <button
                onClick={() => setMobileModalOpen(false)}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all cursor-pointer active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full max-w-sm flex flex-col gap-4 text-center my-auto py-6">
              <div className="flex flex-col items-center gap-1">
                <div className="p-3 bg-yellow-500/15 border border-yellow-500/35 rounded-2xl text-yellow-400 mb-2">
                  <Smartphone className="w-6 h-6 animate-bounce" />
                </div>
                <h4 className="text-lg font-black text-white uppercase tracking-wider font-mono">Mobile Save Assistant</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed font-sans mt-0.5">
                  Standard program triggers can be strict inside sandbox iFrames. We have compiled your credential into a high-res image for seamless saving!
                </p>
              </div>

              {/* High-res rendered image ready for long press */}
              <div className="relative rounded-2xl overflow-hidden border border-yellow-500/30 shadow-[0_0_40px_rgba(219,175,66,0.2)] bg-black/50 p-1">
                <img
                  src={generatedImgUrl}
                  alt="Elite Support Certificate"
                  className="w-full h-auto object-contain rounded-xl select-all touch-auto"
                  style={{ WebkitTouchCallout: 'default' }}
                />
              </div>

              {/* Instructions and direct tools wrapper */}
              <div className="p-4 bg-yellow-500/10 border border-[#dbaf42]/20 rounded-2xl flex flex-col gap-1.5 text-center">
                <span className="text-[9px] font-mono text-yellow-400 font-black uppercase tracking-widest block">👇 GET IN YOUR GALLERY</span>
                <p className="text-[11px] text-amber-100/90 font-medium leading-relaxed font-sans">
                  Tap & hold (long press) the certificate image above, then select <span className="text-yellow-400 font-bold">"Save Image"</span> or <span className="text-yellow-400 font-bold">"Add to Photos"</span>.
                </p>
              </div>

              {/* Safe action stack */}
              <div className="flex flex-col gap-2">
                {navigator.share && (
                  <button
                    onClick={triggerNativeShare}
                    disabled={sharingNative}
                    className="py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center w-full cursor-pointer border border-purple-400/30"
                  >
                    {sharingNative ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                    Share to Device Apps
                  </button>
                )}

                <button
                  onClick={() => {
                    // Manual fall back anchor download click
                    const a = document.createElement('a');
                    a.href = generatedImgUrl;
                    a.download = `Certificate_Satyam_${name.trim().replace(/\s+/g, '_')}.png`;
                    a.target = '_blank';
                    a.click();
                  }}
                  className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 text-yellow-400 border border-yellow-500/20 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center w-full cursor-pointer"
                >
                  <Download className="w-4 h-4 text-yellow-300" />
                  Try Direct Web Download
                </button>

                <button
                  onClick={() => setMobileModalOpen(false)}
                  className="text-xs text-gray-500 hover:text-gray-400 underline font-semibold transition-all mt-1 cursor-pointer"
                >
                  Close Assistant
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
