import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  Heart,
  Music2,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  Video,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { YTPlayerInstance } from '../types/youtube';

export const ALFAAZ_START_SEC = 47; // 0:47
export const ALFAAZ_END_SEC = 184; // 3:04
const ALFAAZ_VIDEO_ID = 'cQq6iLF66Gc';

const CUTE_REACTION_EMOJIS = ['🥹', '🌷', '🌨️', '💖', '🫶🏻', '🎶'];

interface AlfaazPageProps {
  onBack: () => void;
  onSpawnEmoji: (emoji: string, count?: number) => void;
  onTriggerShower: () => void;
  onOpenNext: () => void;
}

function formatSeconds(sec: number): string {
  const clamped = Math.max(0, Math.floor(sec));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function AlfaazPage({
  onBack,
  onSpawnEmoji,
  onTriggerShower,
  onOpenNext,
}: AlfaazPageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const isLoopingRef = useRef(true);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [coverImgError, setCoverImgError] = useState(false);
  const [currentTime, setCurrentTime] = useState(ALFAAZ_START_SEC);

  useEffect(() => {
    isLoopingRef.current = isLooping;
  }, [isLooping]);

  const initPlayer = useCallback(() => {
    if (!containerRef.current || !window.YT?.Player || playerRef.current) return;

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId: ALFAAZ_VIDEO_ID,
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        start: ALFAAZ_START_SEC,
        end: ALFAAZ_END_SEC,
        playsinline: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: (event) => {
          setIsReady(true);
          setHasError(false);
          event.target.seekTo(ALFAAZ_START_SEC, true);
          event.target.playVideo();
        },
        onStateChange: (event) => {
          const YTState = window.YT?.PlayerState;
          if (!YTState) return;
          if (event.data === YTState.PLAYING) {
            setIsPlaying(true);
            const now = event.target.getCurrentTime();
            if (now < ALFAAZ_START_SEC - 0.5 || now >= ALFAAZ_END_SEC) {
              event.target.seekTo(ALFAAZ_START_SEC, true);
            }
          } else if (event.data === YTState.PAUSED) {
            setIsPlaying(false);
          } else if (event.data === YTState.ENDED) {
            if (isLoopingRef.current) {
              event.target.seekTo(ALFAAZ_START_SEC, true);
              event.target.playVideo();
            } else {
              setIsPlaying(false);
              setCurrentTime(ALFAAZ_END_SEC);
            }
          }
        },
        onError: () => {
          setHasError(true);
          setIsPlaying(false);
        },
      },
    });
  }, []);

  useEffect(() => {
    if (window.YT?.Player) {
      initPlayer();
    } else {
      const existingScript = document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]'
      );
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        document.body.appendChild(script);
      }
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore cleanup errors
        }
        playerRef.current = null;
      }
    };
  }, [initPlayer]);

  // Enforce 0:47 - 3:04 timelapse window continuously
  useEffect(() => {
    if (!isPlaying || !playerRef.current) return;

    const timer = window.setInterval(() => {
      const player = playerRef.current;
      if (!player || typeof player.getCurrentTime !== 'function') return;

      const t = player.getCurrentTime();
      if (Number.isNaN(t)) return;

      if (t < ALFAAZ_START_SEC - 0.5) {
        player.seekTo(ALFAAZ_START_SEC, true);
        setCurrentTime(ALFAAZ_START_SEC);
        return;
      }

      if (t >= ALFAAZ_END_SEC) {
        if (isLoopingRef.current) {
          player.seekTo(ALFAAZ_START_SEC, true);
          setCurrentTime(ALFAAZ_START_SEC);
        } else {
          player.pauseVideo();
          player.seekTo(ALFAAZ_START_SEC, true);
          setIsPlaying(false);
          setCurrentTime(ALFAAZ_START_SEC);
        }
        return;
      }

      setCurrentTime(t);
    }, 220);

    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const handleTogglePlay = () => {
    const player = playerRef.current;
    if (!player || !isReady) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      const now = player.getCurrentTime();
      if (now < ALFAAZ_START_SEC || now >= ALFAAZ_END_SEC) {
        player.seekTo(ALFAAZ_START_SEC, true);
        setCurrentTime(ALFAAZ_START_SEC);
      }
      if (isMuted) {
        player.unMute();
        setIsMuted(false);
      }
      player.playVideo();
      onSpawnEmoji('🌷', 2);
    }
  };

  const handleRestart = () => {
    const player = playerRef.current;
    if (!player || !isReady) return;
    player.seekTo(ALFAAZ_START_SEC, true);
    setCurrentTime(ALFAAZ_START_SEC);
    player.playVideo();
    onSpawnEmoji('🥹', 2);
  };

  const handleToggleMute = () => {
    const player = playerRef.current;
    if (!player || !isReady) return;
    if (isMuted) {
      player.unMute();
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  };

  const handleSeek = (val: number) => {
    const clamped = Math.min(ALFAAZ_END_SEC - 0.5, Math.max(ALFAAZ_START_SEC, val));
    setCurrentTime(clamped);
    if (playerRef.current && isReady) {
      playerRef.current.seekTo(clamped, true);
    }
  };

  const totalWindow = ALFAAZ_END_SEC - ALFAAZ_START_SEC;
  const progressPercent = Math.min(
    100,
    Math.max(0, ((currentTime - ALFAAZ_START_SEC) / totalWindow) * 100)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-4xl px-5 sm:px-8 pt-8 sm:pt-12 pb-20 space-y-10"
    >
      {/* Top Frosted Navigation */}
      <div className="glass-panel rounded-3xl px-5 sm:px-7 py-4 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="glass-pill-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-medium text-[#5c3543] transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] cursor-pointer whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4 text-[#c94a6a]" />
          <span>Back to Agreement</span>
        </button>

        <button
          type="button"
          onClick={onTriggerShower}
          className="glass-accent-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] cursor-pointer whitespace-nowrap"
        >
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>Shower Love</span>
          <span className="ios-emoji">🥹🌷</span>
        </button>
      </div>

      {/* Top Dedication Headline */}
      <motion.header
        initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
        className="text-center space-y-3"
      >
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-[#351d26] [text-wrap:balance]">
          A Song dedicated only for you my Life line{' '}
          <span className="ios-emoji text-3xl sm:text-5xl align-middle">🥹🌷🌨️</span>
        </h1>
        <p className="text-sm sm:text-base text-[#6e4956]">
          Always yours, My Krutika Jii <span className="ios-emoji">🤍</span>
        </p>
      </motion.header>

      {/* Cute Frosted Glass Song Player — Alfaaz (0:47 – 3:04) */}
      <motion.section
        initial={{ opacity: 0, y: 18, scale: 0.96, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        aria-label="Alfaaz by Hamza Malik and Zain Zohaib music player"
        className="glass-panel rounded-3xl p-6 sm:p-10 space-y-7"
      >
        {/* Top Track Info + Video Switch */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#8c5a6a]">
              Dedicated Track · 0:47 – 3:04 Timelapse <span className="ios-emoji">🎶</span>
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#351d26] mt-1">
              Alfaaz
            </h2>
            <p className="text-sm text-[#6e4956]">Hamza Malik &amp; Zain Zohaib</p>
          </div>

          <button
            type="button"
            onClick={() => setShowVideo((prev) => !prev)}
            aria-pressed={showVideo}
            className="glass-pill-button inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-[#5c3543] transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] cursor-pointer whitespace-nowrap"
          >
            <Video className="w-3.5 h-3.5 text-[#c94a6a]" />
            <span>{showVideo ? 'Cute Glass Disc' : 'Show Video'}</span>
          </button>
        </div>

        {/* Visual Showcase: Cute Spinning Glass Vinyl Disc OR Video Frame */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/85 bg-gradient-to-br from-[#fdf0f4] via-[#f9dce6] to-[#fcebe0] shadow-[inset_0_1px_14px_rgba(165,88,112,0.14)]">
          <div
            ref={containerRef}
            className={`w-full h-full transition-opacity duration-500 ${
              showVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />

          {!showVideo && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 gap-5">
              {/* Spinning Frosted Vinyl Artwork */}
              <motion.div
                animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                transition={
                  isPlaying
                    ? { duration: 18, repeat: Infinity, ease: 'linear' }
                    : { duration: 0.6 }
                }
                className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-full p-2.5 glass-panel shadow-[0_18px_45px_-12px_rgba(184,59,94,0.3)]"
              >
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/90 bg-[#f8e4ea] relative">
                  {!coverImgError ? (
                    <img
                      src="/src/assets/images/hero_rose_glass_1795037265613.jpg"
                      alt="Soft pink rose petals and glass crystals artwork for Alfaaz"
                      referrerPolicy="no-referrer"
                      onError={() => setCoverImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#fadce6] to-[#fce7d8]">
                      <Music2 className="w-10 h-10 text-[#c94a6a]" />
                    </div>
                  )}
                  {/* Center Vinyl Spindle */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-white/85 backdrop-blur-md border border-[#c94a6a]/30 shadow-inner flex items-center justify-center">
                      <span className="ios-emoji text-base">🌷</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Animated Wave Bars & Cute Lyric Whisper */}
              <div className="flex items-center gap-3 glass-pill-button rounded-full px-4 py-2">
                <div aria-hidden="true" className="flex items-end gap-1 h-4">
                  {[0.5, 0.95, 0.65, 1, 0.55].map((peak, idx) => (
                    <motion.span
                      key={idx}
                      animate={
                        isPlaying
                          ? { scaleY: [0.3, peak, 0.4, peak * 0.85, 0.3] }
                          : { scaleY: 0.35 }
                      }
                      transition={
                        isPlaying
                          ? {
                              duration: 0.8 + idx * 0.11,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }
                          : { duration: 0.2 }
                      }
                      style={{ originY: 1 }}
                      className="w-1 h-4 rounded-full bg-[#c94a6a]"
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#5c3543]">
                  Alfaaz · Hamza Malik &amp; Zain Zohaib
                </span>
                <span className="ios-emoji text-sm">🥹🌨️</span>
              </div>
            </div>
          )}
        </div>

        {/* Fallback if embed blocked */}
        {hasError && (
          <div className="rounded-2xl bg-white/75 border border-rose-200 px-4 py-3 text-xs text-[#6e4956] flex items-center justify-between gap-3">
            <span>
              Playback was blocked by browser settings. Open Alfaaz directly at 0:47:
            </span>
            <a
              href={`https://www.youtube.com/watch?v=${ALFAAZ_VIDEO_ID}&t=${ALFAAZ_START_SEC}s`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[#b83b5e] hover:underline whitespace-nowrap shrink-0"
            >
              <span>Open Track</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Timelapse Scrubber (0:47 -> 3:04) */}
        <div className="space-y-2">
          <div className="relative flex items-center">
            <input
              type="range"
              aria-label="Alfaaz song timelapse between 0:47 and 3:04"
              min={ALFAAZ_START_SEC}
              max={ALFAAZ_END_SEC}
              step={0.5}
              value={currentTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #c94a6a 0%, #c94a6a ${progressPercent}%, rgba(180, 110, 130, 0.22) ${progressPercent}%, rgba(180, 110, 130, 0.22) 100%)`,
              }}
              className="glass-slider w-full h-1.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c94a6a]/50"
            />
          </div>
          <div className="flex items-center justify-between text-xs font-medium tabular-nums text-[#7b4c5c]">
            <span>{formatSeconds(currentTime)}</span>
            <span className="text-[#9e6e7d]">0:47 — 3:04 Window</span>
            <span>3:04</span>
          </div>
        </div>

        {/* Main Glass Player Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestart}
              disabled={!isReady}
              title="Restart from 0:47"
              aria-label="Restart from 0:47"
              className="glass-pill-button inline-flex items-center justify-center w-11 h-11 rounded-full text-[#5c3543] transition-transform duration-150 hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsLooping((prev) => !prev)}
              aria-pressed={isLooping}
              className={`inline-flex items-center gap-1.5 h-11 px-4 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${
                isLooping
                  ? 'bg-[#c94a6a]/15 text-[#a83152] border border-[#c94a6a]/30'
                  : 'glass-pill-button text-[#6e4956]'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Loop</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleTogglePlay}
            disabled={!isReady && !hasError}
            className="glass-accent-button inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full text-sm font-semibold text-white transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-60 cursor-pointer whitespace-nowrap"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>{isReady ? 'Play 0:47 – 3:04' : 'Loading...'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleToggleMute}
            disabled={!isReady}
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="glass-pill-button inline-flex items-center justify-center w-11 h-11 rounded-full text-[#5c3543] transition-transform duration-150 hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-[#c94a6a]" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Cute iOS Emoji Floating Reaction Bar */}
        <div className="pt-4 border-t border-[#b9778b]/15 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-[#7b4c5c]">
            Tap to send love while listening <span className="ios-emoji">✨</span>
          </span>
          <div className="flex items-center gap-2">
            {CUTE_REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onSpawnEmoji(emoji, 2)}
                aria-label={`Send ${emoji}`}
                className="glass-pill-button w-10 h-10 rounded-full flex items-center justify-center text-lg transition-transform duration-150 hover:scale-115 active:scale-90 cursor-pointer"
              >
                <span className="ios-emoji">{emoji}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Bottom "One More" Button */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex justify-center"
      >
        <button
          type="button"
          onClick={onOpenNext}
          className="glass-accent-button inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-3.5 text-sm sm:text-base font-semibold text-white transition-transform duration-150 hover:scale-[1.04] active:scale-[0.96] cursor-pointer whitespace-nowrap"
        >
          <span>One More</span>
          <span className="ios-emoji">🫠🌷✨</span>
        </button>
      </motion.div>
    </motion.div>
  );
}
