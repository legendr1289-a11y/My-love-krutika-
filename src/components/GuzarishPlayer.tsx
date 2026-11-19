import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ExternalLink,
  Music2,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  Sparkles,
  Video,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { YTPlayerInstance } from '../types/youtube';

export const GUZARISH_START_SEC = 20; // 0:20
export const GUZARISH_END_SEC = 90; // 1:30
const YOUTUBE_VIDEO_ID = 'clzuRgaV5dw';

interface GuzarishPlayerProps {
  playTrigger: number;
  pauseTrigger: number;
  onPlayingChange: (playing: boolean) => void;
  onSyncPoetryFade: () => void;
  onSpawnEmoji: (emoji: string) => void;
}

function formatSeconds(sec: number): string {
  const clamped = Math.max(0, Math.floor(sec));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function GuzarishPlayer({
  playTrigger,
  pauseTrigger,
  onPlayingChange,
  onSyncPoetryFade,
  onSpawnEmoji,
}: GuzarishPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const isLoopingRef = useRef(true);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(GUZARISH_START_SEC);
  const [coverImageError, setCoverImageError] = useState(false);

  useEffect(() => {
    isLoopingRef.current = isLooping;
  }, [isLooping]);

  useEffect(() => {
    onPlayingChange(isPlaying);
  }, [isPlaying, onPlayingChange]);

  const initPlayer = useCallback(() => {
    if (!containerRef.current || !window.YT?.Player || playerRef.current) return;

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId: YOUTUBE_VIDEO_ID,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        start: GUZARISH_START_SEC,
        end: GUZARISH_END_SEC,
        playsinline: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: (event) => {
          setIsReady(true);
          setHasError(false);
          event.target.seekTo(GUZARISH_START_SEC, true);
        },
        onStateChange: (event) => {
          const YTState = window.YT?.PlayerState;
          if (!YTState) return;
          if (event.data === YTState.PLAYING) {
            setIsPlaying(true);
            const now = event.target.getCurrentTime();
            if (now < GUZARISH_START_SEC - 0.5 || now >= GUZARISH_END_SEC) {
              event.target.seekTo(GUZARISH_START_SEC, true);
            }
          } else if (event.data === YTState.PAUSED) {
            setIsPlaying(false);
          } else if (event.data === YTState.ENDED) {
            if (isLoopingRef.current) {
              event.target.seekTo(GUZARISH_START_SEC, true);
              event.target.playVideo();
            } else {
              setIsPlaying(false);
              setCurrentTime(GUZARISH_END_SEC);
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

  // Enforce 0:20 - 1:30 timelapse window continuously while playing
  useEffect(() => {
    if (!isPlaying || !playerRef.current) return;

    const timer = window.setInterval(() => {
      const player = playerRef.current;
      if (!player || typeof player.getCurrentTime !== 'function') return;

      const t = player.getCurrentTime();
      if (Number.isNaN(t)) return;

      if (t < GUZARISH_START_SEC - 0.5) {
        player.seekTo(GUZARISH_START_SEC, true);
        setCurrentTime(GUZARISH_START_SEC);
        return;
      }

      if (t >= GUZARISH_END_SEC) {
        if (isLoopingRef.current) {
          player.seekTo(GUZARISH_START_SEC, true);
          setCurrentTime(GUZARISH_START_SEC);
        } else {
          player.pauseVideo();
          player.seekTo(GUZARISH_START_SEC, true);
          setIsPlaying(false);
          setCurrentTime(GUZARISH_START_SEC);
        }
        return;
      }

      setCurrentTime(t);
    }, 220);

    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const startFromTwenty = useCallback(
    (alsoSyncLetter = false) => {
      const player = playerRef.current;
      if (player && isReady) {
        const now = player.getCurrentTime();
        if (now < GUZARISH_START_SEC || now >= GUZARISH_END_SEC) {
          player.seekTo(GUZARISH_START_SEC, true);
          setCurrentTime(GUZARISH_START_SEC);
        }
        if (isMuted) {
          player.unMute();
          setIsMuted(false);
        }
        player.playVideo();
      }
      if (alsoSyncLetter) {
        onSyncPoetryFade();
      }
      onSpawnEmoji('🎶');
    },
    [isReady, isMuted, onSyncPoetryFade, onSpawnEmoji]
  );

  useEffect(() => {
    if (playTrigger > 0) {
      startFromTwenty(true);
    }
  }, [playTrigger, startFromTwenty]);

  useEffect(() => {
    if (pauseTrigger > 0 && playerRef.current && isReady) {
      playerRef.current.pauseVideo();
    }
  }, [pauseTrigger, isReady]);

  const handleTogglePlay = () => {
    if (!playerRef.current || !isReady) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      startFromTwenty(false);
    }
  };

  const handleRestartSegment = () => {
    if (!playerRef.current || !isReady) return;
    playerRef.current.seekTo(GUZARISH_START_SEC, true);
    setCurrentTime(GUZARISH_START_SEC);
    playerRef.current.playVideo();
    onSyncPoetryFade();
    onSpawnEmoji('💖');
  };

  const handleToggleMute = () => {
    if (!playerRef.current || !isReady) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const handleSeek = (val: number) => {
    const clamped = Math.min(GUZARISH_END_SEC - 0.5, Math.max(GUZARISH_START_SEC, val));
    setCurrentTime(clamped);
    if (playerRef.current && isReady) {
      playerRef.current.seekTo(clamped, true);
    }
  };

  const totalWindow = GUZARISH_END_SEC - GUZARISH_START_SEC;
  const progressPercent = Math.min(
    100,
    Math.max(0, ((currentTime - GUZARISH_START_SEC) / totalWindow) * 100)
  );

  return (
    <aside
      id="guzarish-player"
      className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col justify-between gap-6"
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-[#8c5a6a]">
            Now Playing · 0:20 – 1:30 Timelapse <span className="ios-emoji">🎶</span>
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#351d26] mt-1">
            Guzarish
          </h2>
          <p className="text-sm text-[#6e4956]">Javed Ali · Ghajini</p>
        </div>

        <button
          type="button"
          onClick={() => setShowVideo((prev) => !prev)}
          className="glass-pill-button inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium text-[#5c3543] transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer"
          aria-pressed={showVideo}
        >
          <Video className="w-3.5 h-3.5 text-[#c94a6a]" />
          <span>{showVideo ? 'Artwork View' : 'Video View'}</span>
        </button>
      </div>

      {/* Media Frame (YouTube IFrame always mounted for reliable API playback; Artwork overlay in Cover Mode) */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/80 bg-[#f6e3e8] shadow-[inset_0_1px_12px_rgba(160,85,110,0.12)]">
        <div
          ref={containerRef}
          className={`w-full h-full transition-opacity duration-500 ${
            showVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        />

        {!showVideo && (
          <div className="absolute inset-0">
            {!coverImageError ? (
              <img
                src="/src/assets/images/guzarish_vinyl_art_1795037265702.jpg"
                alt="Jasmine flowers, blush pink silk, and warm candlelight representing Guzarish"
                referrerPolicy="no-referrer"
                onError={() => setCoverImageError(true)}
                className={`w-full h-full object-cover transition-transform duration-1000 ease-out ${
                  isPlaying ? 'scale-[1.04]' : 'scale-100'
                }`}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#fae4ea] via-[#f6d6e0] to-[#fbe8df] text-[#6e4956] p-6 text-center">
                <Music2 className="w-10 h-10 text-[#c94a6a] mb-2" />
                <span className="font-display text-xl font-semibold text-[#351d26]">
                  Guzarish · Javed Ali
                </span>
              </div>
            )}

            {/* Soft contrast scrim & animated visualizer bars */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2a131c]/70 via-[#2a131c]/10 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
              <div className="text-white">
                <p className="font-hindi text-sm sm:text-base font-medium leading-snug drop-shadow-sm">
                  “तू मेरी अधूरी प्यास-प्यास...”
                </p>
                <p className="text-xs text-white/85 mt-0.5">
                  Romantic Segment · 0:20 to 1:30
                </p>
              </div>

              {/* Animated Equalizer Bars when playing */}
              <div
                aria-hidden="true"
                className="flex items-end gap-1 h-6 px-2.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shrink-0"
              >
                {[0.55, 0.95, 0.7, 1, 0.6].map((peak, idx) => (
                  <motion.span
                    key={idx}
                    animate={
                      isPlaying
                        ? {
                            scaleY: [0.3, peak, 0.45, peak * 0.85, 0.3],
                          }
                        : { scaleY: 0.3 }
                    }
                    transition={
                      isPlaying
                        ? {
                            duration: 0.9 + idx * 0.12,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }
                        : { duration: 0.2 }
                    }
                    style={{ originY: 1 }}
                    className="w-1 h-3.5 rounded-full bg-white"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error / Fallback notice if embed blocked */}
      {hasError && (
        <div className="rounded-2xl bg-white/75 border border-rose-200 px-4 py-3 text-xs text-[#6e4956] flex items-center justify-between gap-3">
          <span>
            Playback was blocked by browser settings. You can open the exact 0:20 mark directly:
          </span>
          <a
            href={`https://www.youtube.com/watch?v=${YOUTUBE_VIDEO_ID}&t=${GUZARISH_START_SEC}s`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[#b83b5e] hover:underline whitespace-nowrap shrink-0"
          >
            <span>Open Track</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Timelapse Scrubber (0:20 -> 1:30) */}
      <div className="space-y-2">
        <div className="relative flex items-center">
          <input
            type="range"
            aria-label="Guzarish song timelapse between 0:20 and 1:30"
            min={GUZARISH_START_SEC}
            max={GUZARISH_END_SEC}
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
          <span className="text-[#9e6e7d]">0:20 — 1:30 Window</span>
          <span>1:30</span>
        </div>
      </div>

      {/* Player Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRestartSegment}
            disabled={!isReady}
            title="Restart from 0:20"
            aria-label="Restart from 0:20"
            className="glass-pill-button inline-flex items-center justify-center w-11 h-11 rounded-full text-[#5c3543] transition-transform duration-150 hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsLooping((prev) => !prev)}
            aria-pressed={isLooping}
            title="Loop 0:20 – 1:30"
            className={`inline-flex items-center gap-1.5 h-11 px-3.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
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
          className="glass-accent-button inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full text-sm font-semibold text-white transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-60 cursor-pointer whitespace-nowrap shrink-0"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>{isReady ? 'Play 0:20 – 1:30' : 'Loading...'}</span>
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

      {/* Sync Poetry Fade-In Action */}
      <button
        type="button"
        onClick={() => {
          onSyncPoetryFade();
          if (playerRef.current && isReady && !isPlaying) {
            startFromTwenty(false);
          } else {
            onSpawnEmoji('✨');
          }
        }}
        className="w-full glass-pill-button rounded-2xl py-3 px-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-[#5c3543] transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-[#c94a6a]" />
        <span>Replay Letter Fade-In With Guzarish</span>
        <span className="ios-emoji">🥹💖</span>
      </button>
    </aside>
  );
}
