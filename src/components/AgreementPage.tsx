import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Camera, Check, Download, Heart, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface AgreementPageProps {
  onBack: () => void;
  onSpawnEmoji: (emoji: string, count?: number) => void;
  onRedirectToSong: () => void;
  agreed: boolean;
  screenshotUrl: string | null;
  onAgreementCaptured: (dataUrl: string) => void;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = words[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

function generateAgreementScreenshot(dateStr: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 980;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Soft pastel rose-pearl backdrop matching website theme
  const bgGrad = ctx.createLinearGradient(0, 0, 1400, 980);
  bgGrad.addColorStop(0, '#fef9fa');
  bgGrad.addColorStop(0.5, '#fae7ee');
  bgGrad.addColorStop(1, '#fceee6');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1400, 980);

  // Ambient soft bokeh orbs
  const orb1 = ctx.createRadialGradient(220, 180, 10, 220, 180, 340);
  orb1.addColorStop(0, 'rgba(248, 198, 215, 0.55)');
  orb1.addColorStop(1, 'rgba(248, 198, 215, 0)');
  ctx.fillStyle = orb1;
  ctx.fillRect(0, 0, 1400, 980);

  const orb2 = ctx.createRadialGradient(1180, 780, 10, 1180, 780, 380);
  orb2.addColorStop(0, 'rgba(253, 224, 205, 0.6)');
  orb2.addColorStop(1, 'rgba(253, 224, 205, 0)');
  ctx.fillStyle = orb2;
  ctx.fillRect(0, 0, 1400, 980);

  // Frosted Glass Agreement Card
  const cardX = 110;
  const cardY = 88;
  const cardW = 1180;
  const cardH = 804;

  ctx.save();
  ctx.shadowColor = 'rgba(175, 96, 122, 0.22)';
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 20;
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 42);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.84)';
  ctx.fill();
  ctx.restore();

  // Glass border highlight
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 42);
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.stroke();

  // Inner subtle rose hairline
  drawRoundedRect(ctx, cardX + 24, cardY + 24, cardW - 48, cardH - 48, 28);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(201, 74, 106, 0.16)';
  ctx.stroke();

  // Kicker & Date
  ctx.fillStyle = '#8c5a6a';
  ctx.font = '600 22px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`OFFICIAL LOVE AGREEMENT  ·  ${dateStr}`, 700, 178);

  // Heading
  ctx.fillStyle = '#351d26';
  ctx.font = '600 62px "Cormorant Garamond", Georgia, serif';
  ctx.fillText('My Krutika Jii  🫶🏻💖', 700, 260);

  // Divider line
  ctx.beginPath();
  ctx.moveTo(420, 298);
  ctx.lineTo(980, 298);
  ctx.strokeStyle = 'rgba(185, 119, 139, 0.28)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Agreement Quote
  ctx.fillStyle = '#3a1f28';
  ctx.font = '600 44px "Cormorant Garamond", Georgia, serif';
  const nextY = wrapText(
    ctx,
    '“From today onwards you belong to me and now you are only mine, okaii my lady gurll 🙈🤌🏻🌨️”',
    700,
    395,
    940,
    66
  );

  // Sub-note
  ctx.fillStyle = '#6e4956';
  ctx.font = '500 24px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.fillText(
    'Accepted wholeheartedly with “Yess Baccha” 🥹✨',
    700,
    nextY + 46
  );

  // Bottom Signature Line
  ctx.textAlign = 'left';
  ctx.fillStyle = '#351d26';
  ctx.font = '600 26px "Cormorant Garamond", Georgia, serif';
  ctx.fillText('Krutika Jii (My Lady Gurll)', 200, 770);
  ctx.fillStyle = '#8c5a6a';
  ctx.font = '500 18px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.fillText('Signed & Sealed Forever 🤍', 200, 804);

  // AGREED Stamp Seal (rotated bottom-right)
  ctx.save();
  ctx.translate(1035, 710);
  ctx.rotate((-11 * Math.PI) / 180);

  // Outer stamp ring
  ctx.beginPath();
  ctx.arc(0, 0, 108, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(201, 74, 106, 0.08)';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#c94a6a';
  ctx.stroke();

  // Inner dashed stamp ring
  ctx.beginPath();
  ctx.arc(0, 0, 92, 0, Math.PI * 2);
  ctx.setLineDash([8, 6]);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#c94a6a';
  ctx.stroke();
  ctx.setLineDash([]);

  // Stamp text
  ctx.textAlign = 'center';
  ctx.fillStyle = '#b83b5e';
  ctx.font = '700 34px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.fillText('AGREED ✓', 0, 6);
  ctx.font = '600 16px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.fillText('FOREVER YOURS 💖', 0, 36);
  ctx.restore();

  return canvas.toDataURL('image/png');
}

export function AgreementPage({
  onBack,
  onSpawnEmoji,
  onRedirectToSong,
  agreed,
  screenshotUrl,
  onAgreementCaptured,
}: AgreementPageProps) {
  const [shutterFlashKey, setShutterFlashKey] = useState(0);
  const [hasStamped, setHasStamped] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const redirectTimerRef = useRef<number | null>(null);
  const captureTimerRef = useRef<number | null>(null);
  const isAgreed = agreed || hasStamped;

  useEffect(() => {
    return () => {
      if (captureTimerRef.current) window.clearTimeout(captureTimerRef.current);
      if (redirectTimerRef.current) window.clearTimeout(redirectTimerRef.current);
    };
  }, []);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const downloadPng = useCallback((dataUrl: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'My-Krutika-Jii-Love-Agreement-Agreed.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const captureAndSave = useCallback(() => {
    setShutterFlashKey((prev) => prev + 1);
    const dataUrl = generateAgreementScreenshot(todayFormatted);
    if (dataUrl) {
      onAgreementCaptured(dataUrl);
      downloadPng(dataUrl);
    }
  }, [todayFormatted, downloadPng, onAgreementCaptured]);

  const handleAgreeClick = () => {
    if (isAgreed) {
      captureAndSave();
      onSpawnEmoji('📸', 2);
      return;
    }

    setHasStamped(true);
    onSpawnEmoji('🙈', 2);
    onSpawnEmoji('🤌🏻', 2);
    onSpawnEmoji('🌨️', 2);
    onSpawnEmoji('💖', 3);

    // Let the AGREED stamp land smoothly, then flash shutter, save screenshot, and redirect
    captureTimerRef.current = window.setTimeout(() => {
      captureAndSave();
      setIsRedirecting(true);
    }, 520);

    redirectTimerRef.current = window.setTimeout(() => {
      onRedirectToSong();
    }, 2200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-4xl px-5 sm:px-8 pt-8 sm:pt-12 pb-20 space-y-10"
    >
      {/* Top Frosted Navigation Bar */}
      <div className="glass-panel rounded-3xl px-5 sm:px-7 py-4 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="glass-pill-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-medium text-[#5c3543] transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] cursor-pointer whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4 text-[#c94a6a]" />
          <span>Back to Smiles</span>
        </button>

        <span className="text-xs sm:text-sm font-medium text-[#8c5a6a] tabular-nums">
          {todayFormatted} <span className="ios-emoji">🤍</span>
        </span>
      </div>

      {/* Main Frosted Glass Love Agreement Card */}
      <motion.section
        initial={{ opacity: 0, y: 18, scale: 0.96, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        className="glass-panel relative overflow-hidden rounded-3xl p-7 sm:p-12 text-center space-y-8"
      >
        {/* Subtle inner border frame */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-4 rounded-2xl border border-[#c94a6a]/15"
        />

        {/* Camera Shutter Flash Animation on Screenshot */}
        <AnimatePresence>
          {shutterFlashKey > 0 && (
            <motion.div
              key={shutterFlashKey}
              initial={{ opacity: 0.85 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="pointer-events-none fixed inset-0 z-50 bg-white"
            />
          )}
        </AnimatePresence>

        <div className="relative z-10 space-y-4">
          <p className="text-xs sm:text-sm font-medium tracking-wide text-[#8c5a6a]">
            Official Love Agreement · {todayFormatted} <span className="ios-emoji">🫶🏻💖</span>
          </p>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#351d26] [text-wrap:balance]">
            My Krutika Jii <span className="ios-emoji text-3xl sm:text-5xl align-middle">🥹✨</span>
          </h1>
        </div>

        {/* Agreement Statement */}
        <div className="relative z-10 mx-auto max-w-2xl py-4">
          <p className="font-display text-2xl sm:text-4xl leading-[1.45] font-semibold text-[#3a1f28] [text-wrap:balance]">
            “From today onwards you belong to me and now you are only mine, okaii my lady gurll{' '}
            <span className="ios-emoji not-italic">🙈🤌🏻🌨️</span>”
          </p>
        </div>

        {/* Signature & Animated AGREED Stamp Area */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-[#b9778b]/15 max-w-2xl mx-auto">
          <div className="text-center sm:text-left">
            <p className="font-display text-xl font-semibold text-[#351d26]">
              My Lady Gurll · Krutika Jii
            </p>
            <p className="text-xs text-[#8c5a6a] mt-0.5">
              {isAgreed ? 'Sealed with “Yess Baccha” 💖' : 'Waiting for your sweet stamp 🥹'}
            </p>
          </div>

          {/* Animated AGREED Stamp Seal */}
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            <AnimatePresence>
              {isAgreed && (
                <motion.div
                  initial={{ opacity: 0, scale: 2.3, rotate: -26 }}
                  animate={{ opacity: 1, scale: 1, rotate: -11 }}
                  transition={{
                    type: 'spring',
                    stiffness: 290,
                    damping: 18,
                  }}
                  className="w-32 h-32 rounded-full border-4 border-[#c94a6a] bg-[#c94a6a]/10 flex items-center justify-center shadow-[0_10px_30px_-8px_rgba(201,74,106,0.35)]"
                >
                  <div className="w-[108px] h-[108px] rounded-full border-2 border-dashed border-[#c94a6a] flex flex-col items-center justify-center text-[#b83b5e] px-2">
                    <span className="flex items-center gap-1 text-base font-bold tracking-wider">
                      AGREED
                      <Check className="w-4 h-4 stroke-[3]" />
                    </span>
                    <span className="text-[10px] font-semibold tracking-wide mt-0.5">
                      FOREVER YOURS <span className="ios-emoji">💖</span>
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Yess Baccha Primary Action Button */}
        <div className="relative z-10 pt-2 flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleAgreeClick}
              className="glass-accent-button inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-4 text-base sm:text-lg font-semibold text-white transition-transform duration-150 hover:scale-[1.04] active:scale-[0.96] cursor-pointer whitespace-nowrap"
            >
              {isAgreed ? (
                <>
                  <Camera className="w-5 h-5" />
                  <span>Yess Baccha — Snap Screenshot Again</span>
                  <span className="ios-emoji">📸💖</span>
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5 fill-current" />
                  <span>Yess Baccha</span>
                  <span className="ios-emoji">🙈💖</span>
                </>
              )}
            </button>

            {isAgreed && (
              <button
                type="button"
                onClick={onRedirectToSong}
                className="glass-pill-button inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm sm:text-base font-semibold text-[#5c3543] transition-transform duration-150 hover:scale-[1.04] active:scale-[0.96] cursor-pointer whitespace-nowrap"
              >
                <span>Open Your Song</span>
                <span className="ios-emoji">🥹🌷</span>
                <ArrowRight className="w-4 h-4 text-[#c94a6a]" />
              </button>
            )}
          </div>

          {isRedirecting ? (
            <p className="text-xs sm:text-sm font-medium text-[#b83b5e]">
              Screenshot saved! Taking you to your dedicated song… <span className="ios-emoji">🎶✨</span>
            </p>
          ) : (
            !isAgreed && (
              <p className="text-xs text-[#8c5a6a]">
                Tap to stamp <span className="font-semibold text-[#b83b5e]">AGREED</span> &amp; capture a screenshot <span className="ios-emoji">📸✨</span>
              </p>
            )
          )}
        </div>
      </motion.section>

      {/* Captured Screenshot Preview & Download Card */}
      <AnimatePresence>
        {screenshotUrl && (
          <motion.section
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel rounded-3xl p-6 sm:p-8 space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#c94a6a]" />
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[#351d26]">
                    Agreed Stamp Screenshot Captured <span className="ios-emoji">📸🥹</span>
                  </h2>
                  <p className="text-xs text-[#6e4956]">
                    Saved automatically — or tap below to download again anytime.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => downloadPng(screenshotUrl)}
                className="glass-accent-button inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>Save Screenshot</span>
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/85 shadow-sm bg-[#fae7ee]">
              <img
                src={screenshotUrl}
                alt="Screenshot of the agreed love agreement with stamp"
                className="w-full h-auto block"
              />
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
