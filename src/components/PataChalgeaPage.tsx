import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Disc3,
  ExternalLink,
  Heart,
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

export const PATA_START_SEC = 101; // 1:41
export const PATA_END_SEC = 240; // 4:00
const PATA_VIDEO_ID = 'JOX09U8noOE';
const YT_FALLBACK_COVER = `https://i.ytimg.com/vi/${PATA_VIDEO_ID}/hqdefault.jpg`;

const VIBE_EMOJIS = ['🫠', '🌨️', '🌷', '✨', '💖', '🫶🏻'];

interface PataChalgeaPageProps {
  onBack: () => void;
  onSpawnEmoji: (emoji: string, count?: number) => void;
  onTriggerShower: () => void;
}

function formatSeconds(sec: number): string {
  const clamped = Math.max(0, Math.floor(sec));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function PataChalgeaPage({
  onBack,
  onSpawnEmoji,
  onTriggerShower,
}: PataChalgeaPageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const isLoopingRef = useRef(true);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(PATA_START_SEC);
  const [albumArtUrl, setAlbumArtUrl] = useState<string>(YT_FALLBACK_COVER);
  const [coverFailed, setCoverFailed] = useState(false);

  // Fetch the official "Unforgettable" / "Pata Chalgea" album artwork from iTunes Search API
  useEffect(() => {
    const controller = new AbortController();
    fetch(
      'https://itunes.apple.com/search?term=Imran+Khan+Pata+Chalgea&entity=song&limit=1',
      { signal: controller.signal }
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const rawArt = data?.results?.[0]?.artworkUrl100;
        if (typeof rawArt === 'string' && rawArt.length > 0) {
          setAlbumArtUrl(rawArt.replace('100x100bb', '600x600bb'));
          setCoverFailed(false);
        }
      })
      .catch(() => {
        // Keep YouTube thumbnail fallback silently
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    isLoopingRef.current = isLooping;
  }, [isLooping]);

  const initPlayer = useCallback(() => {
    if (!containerRef.current || !window.YT?.Player || playerRef.current) return;

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId: PATA_VIDEO_ID,
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        start: PATA_START_SEC,
        end: PATA_END_SEC,
        playsinline: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: (event) => {
          setIsReady(true);
          setHasError(false);
          event.target.seekTo(PATA_START_SEC, true);
          event.target.playVideo();
        },
        onStateChange: (event) => {
          const YTState = window.YT?.PlayerState;
          if (!YTState) return;
          if (event.data === YTState.PLAYING) {
            setIsPlaying(true);
            const now = event.target.getCurrentTime();
            if (now < PATA_START_SEC - 0.5 || now >= PATA_END_SEC) {
              event.target.seekTo(PATA_START_SEC, true);
            }
          } else if (event.data === YTState.PAUSED) {
            setIsPlaying(false);
          } else if (event.data === YTState.ENDED) {
            if (isLoopingRef.current) {
              event.target.seekTo(PATA_START_SEC, true);
              event.target.playVideo();
            } else {
              setIsPlaying(false);
              setCurrentTime(PATA_END_SEC);
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

  // Enforce 1:41 - 4:00 timelapse window continuously
  useEffect(() => {
    if (!isPlaying || !playerRef.current) return;

    const timer = window.setInterval(() => {
      const player = playerRef.current;
      if (!player || typeof player.getCurrentTime !== 'function') return;

      const t = player.getCurrentTime();
      if (Number.isNaN(t)) return;

      if (t < PATA_START_SEC - 0.5) {
        player.seekTo(PATA_START_SEC, true);
        setCurrentTime(PATA_START_SEC);
        return;
      }

      if (t >= PATA_END_SEC) {
        if (isLoopingRef.current) {
          player.seekTo(PATA_START_SEC, true);
          setCurrentTime(PATA_START_SEC);
        } else {
          player.pauseVideo();
          player.seekTo(PATA_START_SEC, true);
          setIsPlaying(false);
          setCurrentTime(PATA_START_SEC);
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
      if (now < PATA_START_SEC || now >= PATA_END_SEC) {
        player.seekTo(PATA_START_SEC, true);
        setCurrentTime(PATA_START_SEC);
      }
      if (isMuted) {
        player.unMute();
        setIsMuted(false);
      }
      player.playVideo();
      onSpawnEmoji('🫠', 2);
    }
  };

  const handleRestart = () => {
    const player = playerRef.current;
    if (!player || !isReady) return;
    player.seekTo(PATA_START_SEC, true);
    setCurrentTime(PATA_START_SEC);
    player.playVideo();
    onSpawnEmoji('🌨️', 2);
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
    const clamped = Math.min(PATA_END_SEC - 0.5, Math.max(PATA_START_SEC, val));
    setCurrentTime(clamped);
    if (playerRef.current && isReady) {
      playerRef.current.seekTo(clamped, true);
    }
  };

  const handleCoverError = () => {
    if (albumArtUrl !== YT_FALLBACK_COVER) {
      setAlbumArtUrl(YT_FALLBACK_COVER);
    } else {
      setCoverFailed(true);
    }
  };

  const totalWindow = PATA_END_SEC - PATA_START_SEC;
  const progressPercent = Math.min(
    100,
    Math.max(0, ((currentTime - PATA_START_SEC) / totalWindow) * 100)
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
          <span>Back to Alfaaz</span>
        </button>

        <button
          type="button"
          onClick={onTriggerShower}
          className="glass-accent-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] cursor-pointer whitespace-nowrap"
        >
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>Shower Love</span>
          <span className="ios-emoji">🫠🌷</span>
        </button>
      </div>

      {/* Cute Frosted Glass Song Player — Pata Chalgea (1:41 – 4:00) */}
      <motion.section
        initial={{ opacity: 0, y: 16, scale: 0.96, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        aria-label="Pata Chalgea by Imran Khan music player"
        className="glass-panel rounded-3xl p-6 sm:p-10 space-y-7"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#8c5a6a]">
              One More Vibe · 1:41 – 4:00 Timelapse <span className="ios-emoji">🎶</span>
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#351d26] mt-1">
              Pata Chalgea
            </h1>
            <p className="text-sm sm:text-base text-[#6e4956]">
              Imran Khan · Unforgettable
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowVideo((prev) => !prev)}
            aria-pressed={showVideo}
            className="glass-pill-button inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-[#5c3543] transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] cursor-pointer whitespace-nowrap"
          >
            <Video className="w-3.5 h-3.5 text-[#c94a6a]" />
            <span>{showVideo ? 'Album Cover' : 'Show Video'}</span>
          </button>
        </div>

        {/* Real Album Photo / Video Frame */}
        <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/85 bg-gradient-to-br from-[#fdf0f4] via-[#f9dce6] to-[#fcebe0] shadow-[inset_0_1px_14px_rgba(165,88,112,0.14)]">
          <div
            ref={containerRef}
            className={`w-full h-full transition-opacity duration-500 ${
              showVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />

          {!showVideo && (
            <div className="absolute inset-0 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 p-6 sm:p-8 bg-gradient-to-br from-[#fff5f8]/90 via-[#fce6ee]/85 to-[#fdf0e6]/90">
              {/* Real Album Photo Framed in Frosted Glass */}
              <motion.div
                animate={isPlaying ? { y: [-3, 3, -3] } : { y: 0 }}
                transition={
                  isPlaying
                    ? { duration: 4.2, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 0.4 }
                }
                className="relative w-44 h-44 sm:w-56 sm:h-56 shrink-0 rounded-2xl p-2 glass-panel shadow-[0_20px_45px_-12px_rgba(175,96,122,0.3)]"
              >
                <div className="w-full h-full rounded-xl overflow-hidden border border-white/85 bg-[#f6dce4]">
                  {!coverFailed ? (
                    <img
                      src={albumArtUrl}
                      alt="Real album cover art for Pata Chalgea by Imran Khan from Unforgettable"
                      referrerPolicy="no-referrer"
                      onError={handleCoverError}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#fadce6] to-[#fce7d8] text-[#6e4956] p-4 text-center">
                      <Disc3 className="w-10 h-10 text-[#c94a6a] mb-2" />
                      <span className="font-display text-lg font-semibold text-[#351d26]">
                        Unforgettable
                      </span>
                      <span className="text-xs">Imran Khan</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Track Meta + Animated Wave Bars */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-3">
                <div className="flex items-center gap-2.5 glass-pill-button rounded-full px-3.5 py-1.5">
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
                  <span className="text-xs font-medium text-[#5c3543]">
                    {isPlaying ? 'Vibing Now' : 'Ready to Play'} <span className="ios-emoji">🫠✨</span>
                  </span>
                </div>

                <div>
                  <p className="font-display text-2xl sm:text-3xl font-semibold text-[#351d26]">
                    Pata Chalgea
                  </p>
                  <p className="text-sm text-[#6e4956] mt-0.5">
                    Imran Khan · Unforgettable (2009)
                  </p>
                </div>

                <p className="text-xs text-[#8c5a6a] tabular-nums">
                  Playing highlight · 1:41 to 4:00
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Fallback if embed blocked */}
        {hasError && (
          <div className="rounded-2xl bg-white/75 border border-rose-200 px-4 py-3 text-xs text-[#6e4956] flex items-center justify-between gap-3">
            <span>
              Playback was blocked by browser settings. Open Pata Chalgea directly at 1:41:
            </span>
            <a
              href={`https://www.youtube.com/watch?v=${PATA_VIDEO_ID}&t=${PATA_START_SEC}s`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[#b83b5e] hover:underline whitespace-nowrap shrink-0"
            >
              <span>Open Track</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Timelapse Scrubber (1:41 -> 4:00) */}
        <div className="space-y-2">
          <div className="relative flex items-center">
            <input
              type="range"
              aria-label="Pata Chalgea song timelapse between 1:41 and 4:00"
              min={PATA_START_SEC}
              max={PATA_END_SEC}
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
            <span className="text-[#9e6e7d]">1:41 — 4:00 Window</span>
            <span>4:00</span>
          </div>
        </div>

        {/* Main Glass Player Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestart}
              disabled={!isReady}
              title="Restart from 1:41"
              aria-label="Restart from 1:41"
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
                <span>{isReady ? 'Play 1:41 – 4:00' : 'Loading...'}</span>
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
      </motion.section>

      {/* Dedicated Message Card Below Player */}
      <motion.footer
        initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.95, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="glass-panel rounded-3xl px-6 sm:px-10 py-8 sm:py-10 text-center space-y-5"
      >
        <p className="font-display text-2xl sm:text-4xl font-semibold leading-snug text-[#351d26] [text-wrap:balance]">
          “May you not understand lyrics, but u mean this to me — just enjoy the vibe my baby gurll{' '}
          <span className="ios-emoji not-italic">🫠🌨️🌷✨</span>”
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {VIBE_EMOJIS.map((emoji) => (
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
      </motion.footer>
    </motion.div>
  );
}
