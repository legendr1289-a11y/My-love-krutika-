import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ExternalLink,
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

export const BUMBLE_START_SEC = 30; // 0:30
export const BUMBLE_END_SEC = 120; // 2:00
const BUMBLE_VIDEO_ID = '230Z9WC-7nk';

interface BumbleBeePlayerProps {
  onSpawnEmoji: (emoji: string, count?: number) => void;
}

function formatSeconds(sec: number): string {
  const clamped = Math.max(0, Math.floor(sec));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function BumbleBeePlayer({ onSpawnEmoji }: BumbleBeePlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const isLoopingRef = useRef(true);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(BUMBLE_START_SEC);

  useEffect(() => {
    isLoopingRef.current = isLooping;
  }, [isLooping]);

  const initPlayer = useCallback(() => {
    if (!containerRef.current || !window.YT?.Player || playerRef.current) return;

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId: BUMBLE_VIDEO_ID,
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        start: BUMBLE_START_SEC,
        end: BUMBLE_END_SEC,
        playsinline: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: (event) => {
          setIsReady(true);
          setHasError(false);
          event.target.seekTo(BUMBLE_START_SEC, true);
          event.target.playVideo();
        },
        onStateChange: (event) => {
          const YTState = window.YT?.PlayerState;
          if (!YTState) return;
          if (event.data === YTState.PLAYING) {
            setIsPlaying(true);
            const now = event.target.getCurrentTime();
            if (now < BUMBLE_START_SEC - 0.5 || now >= BUMBLE_END_SEC) {
              event.target.seekTo(BUMBLE_START_SEC, true);
            }
          } else if (event.data === YTState.PAUSED) {
            setIsPlaying(false);
          } else if (event.data === YTState.ENDED) {
            if (isLoopingRef.current) {
              event.target.seekTo(BUMBLE_START_SEC, true);
              event.target.playVideo();
            } else {
              setIsPlaying(false);
              setCurrentTime(BUMBLE_END_SEC);
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

  // Enforce 0:30 - 2:00 timelapse loop while playing
  useEffect(() => {
    if (!isPlaying || !playerRef.current) return;

    const timer = window.setInterval(() => {
      const player = playerRef.current;
      if (!player || typeof player.getCurrentTime !== 'function') return;

      const t = player.getCurrentTime();
      if (Number.isNaN(t)) return;

      if (t < BUMBLE_START_SEC - 0.5) {
        player.seekTo(BUMBLE_START_SEC, true);
        setCurrentTime(BUMBLE_START_SEC);
        return;
      }

      if (t >= BUMBLE_END_SEC) {
        if (isLoopingRef.current) {
          player.seekTo(BUMBLE_START_SEC, true);
          setCurrentTime(BUMBLE_START_SEC);
        } else {
          player.pauseVideo();
          player.seekTo(BUMBLE_START_SEC, true);
          setIsPlaying(false);
          setCurrentTime(BUMBLE_START_SEC);
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
      if (now < BUMBLE_START_SEC || now >= BUMBLE_END_SEC) {
        player.seekTo(BUMBLE_START_SEC, true);
        setCurrentTime(BUMBLE_START_SEC);
      }
      if (isMuted) {
        player.unMute();
        setIsMuted(false);
      }
      player.playVideo();
      onSpawnEmoji('🐝', 2);
    }
  };

  const handleRestart = () => {
    const player = playerRef.current;
    if (!player || !isReady) return;
    player.seekTo(BUMBLE_START_SEC, true);
    setCurrentTime(BUMBLE_START_SEC);
    player.playVideo();
    onSpawnEmoji('✨', 2);
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
    const clamped = Math.min(BUMBLE_END_SEC - 0.5, Math.max(BUMBLE_START_SEC, val));
    setCurrentTime(clamped);
    if (playerRef.current && isReady) {
      playerRef.current.seekTo(clamped, true);
    }
  };

  const totalWindow = BUMBLE_END_SEC - BUMBLE_START_SEC;
  const progressPercent = Math.min(
    100,
    Math.max(0, ((currentTime - BUMBLE_START_SEC) / totalWindow) * 100)
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Bumble Bee by Bambee music player"
      className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {/* Compact Video / Animated Music Orb */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-white/85 bg-gradient-to-br from-[#fde7ef] via-[#fbd4e2] to-[#fce7d8] shrink-0 shadow-sm">
            <div
              ref={containerRef}
              className={`w-full h-full transition-opacity duration-300 ${
                showVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            />
            {!showVideo && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <span className="ios-emoji text-2xl sm:text-3xl">🐝</span>
                <div aria-hidden="true" className="flex items-end gap-0.5 h-3">
                  {[0.5, 1, 0.7, 0.9].map((peak, idx) => (
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
                              duration: 0.75 + idx * 0.1,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }
                          : { duration: 0.2 }
                      }
                      style={{ originY: 1 }}
                      className="w-1 h-3 rounded-full bg-[#c94a6a]"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium text-[#8c5a6a]">
              Gallery Soundtrack · 0:30 – 2:00 Timelapse <span className="ios-emoji">🎶</span>
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#351d26] truncate">
              Bumble Bee
            </h2>
            <p className="text-xs sm:text-sm text-[#6e4956]">Bambee · Cute Smiles Mix</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRestart}
            disabled={!isReady}
            title="Restart from 0:30"
            aria-label="Restart from 0:30"
            className="glass-pill-button inline-flex items-center justify-center w-10 h-10 rounded-full text-[#5c3543] transition-transform duration-150 hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsLooping((prev) => !prev)}
            aria-pressed={isLooping}
            className={`inline-flex items-center gap-1.5 h-10 px-3.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${
              isLooping
                ? 'bg-[#c94a6a]/15 text-[#a83152] border border-[#c94a6a]/30'
                : 'glass-pill-button text-[#6e4956]'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Loop</span>
          </button>

          <button
            type="button"
            onClick={() => setShowVideo((prev) => !prev)}
            aria-pressed={showVideo}
            className="glass-pill-button inline-flex items-center gap-1.5 h-10 px-3.5 rounded-full text-xs font-medium text-[#5c3543] transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] cursor-pointer whitespace-nowrap"
          >
            <Video className="w-3.5 h-3.5 text-[#c94a6a]" />
            <span>{showVideo ? 'Hide Video' : 'Video'}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleMute}
            disabled={!isReady}
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="glass-pill-button inline-flex items-center justify-center w-10 h-10 rounded-full text-[#5c3543] transition-transform duration-150 hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-[#c94a6a]" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={handleTogglePlay}
            disabled={!isReady && !hasError}
            className="glass-accent-button inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full text-xs sm:text-sm font-semibold text-white transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-60 cursor-pointer whitespace-nowrap"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                <span>{isReady ? 'Play 0:30 – 2:00' : 'Loading...'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Timelapse Scrubber (0:30 -> 2:00) */}
      <div className="space-y-1.5">
        <div className="relative flex items-center">
          <input
            type="range"
            aria-label="Bumble Bee song timelapse between 0:30 and 2:00"
            min={BUMBLE_START_SEC}
            max={BUMBLE_END_SEC}
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
          <span className="text-[#9e6e7d]">0:30 — 2:00 Window</span>
          <span>2:00</span>
        </div>
      </div>

      {hasError && (
        <div className="rounded-2xl bg-white/75 border border-rose-200 px-4 py-2.5 text-xs text-[#6e4956] flex items-center justify-between gap-3">
          <span>
            Playback was blocked by browser settings. Open Bumble Bee directly at 0:30:
          </span>
          <a
            href={`https://www.youtube.com/watch?v=${BUMBLE_VIDEO_ID}&t=${BUMBLE_START_SEC}s`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[#b83b5e] hover:underline whitespace-nowrap shrink-0"
          >
            <span>Open Track</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </motion.section>
  );
}
