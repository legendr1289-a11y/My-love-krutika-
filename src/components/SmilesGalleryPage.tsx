import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  Image as ImageIcon,
  Shuffle,
  Sparkles,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { BumbleBeePlayer } from './BumbleBeePlayer';

interface GalleryPhoto {
  id: string;
  src: string;
  alt: string;
  caption: string;
  emoji: string;
}

const FEATURED_THREE: GalleryPhoto[] = [
  {
    id: 'krutika-1',
    src: '/assets/aistudio/IMG-20261112-WA0013_15cec4db.jpg',
    alt: 'Krutika smiling softly under warm lights in a blue embroidered outfit',
    caption: 'चाँद सी मुस्कान',
    emoji: '🌙🥹',
  },
  {
    id: 'krutika-2',
    src: '/assets/aistudio/__20261108_230722651_16b362ee.jpg',
    alt: 'Krutika posing gracefully under fairy lights in a blue lehenga',
    caption: 'तेरी आँखों का नूर',
    emoji: '👀💖',
  },
  {
    id: 'krutika-3',
    src: '/assets/aistudio/1795049470978_55172975.png',
    alt: 'Krutika close-up portrait with warm golden bokeh and cute kiss marks',
    caption: 'मेरी क्यूटी पाई बीवी',
    emoji: '🫶🏻💋',
  },
];

const RANDOM_AFTER_THREE: GalleryPhoto[] = [
  {
    id: 'cute-1',
    src: '/assets/aistudio/57f3a701c0ae9e42472a7d126cbbdcdf_14fef3c0.jpg',
    alt: 'Cute anime neko girl cheering happily',
    caption: 'Playful Neko Mood',
    emoji: '🐱✨',
  },
  {
    id: 'cute-2',
    src: '/assets/aistudio/e183aadfac43568736f6e89c9db87ac4_a8d33614.jpg',
    alt: 'Cute anime girl in soft blue hoodie looking innocent',
    caption: 'Softest Cutie Eyes',
    emoji: '💙🥹',
  },
  {
    id: 'cute-3',
    src: '/assets/aistudio/5eae60ac13880a847ec41ac710cb7a2b_b81b7e1d.jpg',
    alt: 'Cute pink-haired anime girl with big sparkling green eyes',
    caption: 'Waku Waku Smile',
    emoji: '🌸👀',
  },
  {
    id: 'cute-4',
    src: '/assets/aistudio/bac6dc19905e23ea55961f2f07daf85e_0f013351.jpg',
    alt: 'Cute detective anime girl holding a magnifying glass',
    caption: 'Cute Little Detective',
    emoji: '🔍🤍',
  },
  {
    id: 'cute-5',
    src: '/assets/aistudio/2cc3117e8568851476ff86eb935e777f_82b3eff3.jpg',
    alt: 'Smiling silver-haired anime girl with round glasses',
    caption: 'Sweetest Vibe',
    emoji: '🤓💖',
  },
  {
    id: 'cute-6',
    src: '/assets/aistudio/fcde23d872cd8030db1872e27c991682_e4e13b11.jpg',
    alt: 'Glowing blue butterfly resting gently on a hand beneath a twilight sky',
    caption: 'Magic In Your Hands',
    emoji: '🦋✨',
  },
  {
    id: 'cute-7',
    src: '/assets/aistudio/b2873120265b598a533a6d553d39dbcb_be99dd19.jpg',
    alt: 'Romantic anime artwork offering blue flowers in gentle snowfall',
    caption: 'Flowers Only For You',
    emoji: '💐🩵',
  },
];

interface ShuffledCard extends GalleryPhoto {
  tiltDeg: number;
  floatDelay: number;
}

function buildRandomizedCards(): ShuffledCard[] {
  const pool = [...RANDOM_AFTER_THREE];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const tilts = [-2.2, 1.8, -1.4, 2.3, -1.7, 1.2, -2.0];
  return pool.map((photo, index) => ({
    ...photo,
    tiltDeg: tilts[index % tilts.length],
    floatDelay: index * 0.11,
  }));
}

interface SmilesGalleryPageProps {
  onBack: () => void;
  onSpawnEmoji: (emoji: string, count?: number) => void;
  onTriggerShower: () => void;
  onOpenAgreement: () => void;
}

export function SmilesGalleryPage({
  onBack,
  onSpawnEmoji,
  onTriggerShower,
  onOpenAgreement,
}: SmilesGalleryPageProps) {
  const [shuffleRound, setShuffleRound] = useState(1);
  const [randomCards, setRandomCards] = useState<ShuffledCard[]>(() =>
    buildRandomizedCards()
  );
  const [failedIds, setFailedIds] = useState<Record<string, boolean>>({});
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const allOrderedPhotos = useMemo(
    () => [...FEATURED_THREE, ...randomCards],
    [randomCards]
  );

  const handleShuffle = useCallback(() => {
    setRandomCards(buildRandomizedCards());
    setShuffleRound((prev) => prev + 1);
    onSpawnEmoji('✨', 2);
  }, [onSpawnEmoji]);

  const handleImageError = (id: string) => {
    setFailedIds((prev) => ({ ...prev, [id]: true }));
  };

  useEffect(() => {
    if (selectedIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedIndex(null);
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) =>
          prev === null ? null : (prev + 1) % allOrderedPhotos.length
        );
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) =>
          prev === null
            ? null
            : (prev - 1 + allOrderedPhotos.length) % allOrderedPhotos.length
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedIndex, allOrderedPhotos.length]);

  const activePhoto =
    selectedIndex !== null ? allOrderedPhotos[selectedIndex] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-6xl px-5 sm:px-8 pt-8 sm:pt-12 pb-20 space-y-12"
    >
      {/* Top Frosted Navigation & Actions */}
      <div className="glass-panel rounded-3xl px-5 sm:px-7 py-4 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="glass-pill-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-medium text-[#5c3543] transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] cursor-pointer whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4 text-[#c94a6a]" />
          <span>Back to Letter</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleShuffle}
            className="glass-pill-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-medium text-[#5c3543] transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] cursor-pointer whitespace-nowrap"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#c94a6a]" />
            <span>Shuffle Cute Vibes</span>
            <span className="ios-emoji">✨</span>
          </button>

          <button
            type="button"
            onClick={onTriggerShower}
            className="glass-accent-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] cursor-pointer whitespace-nowrap"
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Shower Love</span>
            <span className="ios-emoji">🥹</span>
          </button>
        </div>
      </div>

      {/* Page Heading */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="text-center space-y-2.5"
      >
        <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-tight text-[#351d26] [text-wrap:balance]">
          My Krutika Jii · Smiles & Sparks <span className="ios-emoji">🥹💖</span>
        </h1>
        <p className="font-hindi text-sm sm:text-base text-[#6e4956]">
          तुम्हारी हर एक तस्वीर दिल को थोड़ा और सुकून दे जाती है <span className="ios-emoji">🌷🤍</span>
        </p>
      </motion.div>

      {/* Bumble Bee by Bambee (0:30 - 2:00 Timelapse) Glass Soundtrack */}
      <BumbleBeePlayer onSpawnEmoji={onSpawnEmoji} />

      {/* First 3 Uploaded Photos — Featured Frosted Glass Showcase */}
      <section aria-label="Featured photos of Krutika" className="space-y-5">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#351d26]">
            My Prettiest Three <span className="ios-emoji text-xl">🫶🏻✨</span>
          </h2>
          <span className="text-xs text-[#8c5a6a]">Tap any photo to open</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {FEATURED_THREE.map((photo, idx) => (
            <motion.button
              key={photo.id}
              type="button"
              onClick={() => {
                setSelectedIndex(idx);
                onSpawnEmoji('💖', 2);
              }}
              initial={{ opacity: 0, y: 26, scale: 0.93, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              transition={{
                duration: 0.95,
                delay: 0.15 + idx * 0.18,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group glass-panel rounded-3xl p-3.5 sm:p-4 text-left flex flex-col gap-3.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c94a6a]/50"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-white/85 bg-[#f8e4ea]">
                {!failedIds[photo.id] ? (
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    referrerPolicy="no-referrer"
                    onError={() => handleImageError(photo.id)}
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#fcebf0] to-[#f8d7e2] text-[#8c5a6a] p-6">
                    <ImageIcon className="w-8 h-8 mb-2 text-[#c94a6a]" />
                    <span className="font-hindi text-sm">{photo.caption}</span>
                  </div>
                )}

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2a131c]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="flex items-center justify-between px-1.5 pb-1">
                <span className="font-hindi text-base sm:text-lg font-medium text-[#351d26]">
                  {photo.caption}
                </span>
                <span className="ios-emoji text-lg transition-transform duration-300 group-hover:scale-125">
                  {photo.emoji}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Photos After 3 — Randomly Adjusted Smooth Glass Collage */}
      <section aria-label="Randomized cute moments" className="space-y-5 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#c94a6a]" />
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#351d26]">
              Cute Little Vibes <span className="ios-emoji text-xl">🌷🦋</span>
            </h2>
          </div>

          <button
            type="button"
            onClick={handleShuffle}
            className="text-xs font-medium text-[#b83b5e] hover:text-[#8f2444] transition-colors cursor-pointer"
          >
            Rearrange Randomly ↻
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={shuffleRound}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
          >
            {randomCards.map((card, idx) => (
              <motion.button
                key={`${shuffleRound}-${card.id}`}
                type="button"
                onClick={() => {
                  setSelectedIndex(FEATURED_THREE.length + idx);
                  onSpawnEmoji('🥹', 1);
                }}
                initial={{
                  opacity: 0,
                  y: 24,
                  scale: 0.9,
                  rotate: card.tiltDeg * 1.4,
                  filter: 'blur(10px)',
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  rotate: card.tiltDeg,
                  filter: 'blur(0px)',
                }}
                transition={{
                  duration: 0.85,
                  delay: 0.1 + card.floatDelay,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  rotate: 0,
                  y: -5,
                  scale: 1.025,
                  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
                }}
                whileTap={{ scale: 0.98 }}
                className="group break-inside-avoid mb-6 w-full glass-panel rounded-3xl p-3.5 text-left flex flex-col gap-3 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c94a6a]/50"
              >
                <div className="relative w-full overflow-hidden rounded-2xl border border-white/85 bg-[#f8e4ea]">
                  {!failedIds[card.id] ? (
                    <img
                      src={card.src}
                      alt={card.alt}
                      referrerPolicy="no-referrer"
                      onError={() => handleImageError(card.id)}
                      className="w-full h-auto block object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="aspect-square w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#fcebf0] to-[#f8d7e2] text-[#8c5a6a] p-6">
                      <ImageIcon className="w-8 h-8 mb-2 text-[#c94a6a]" />
                      <span className="text-sm">{card.caption}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between px-1.5 pb-0.5">
                  <span className="text-sm font-medium text-[#4e2a37]">
                    {card.caption}
                  </span>
                  <span className="ios-emoji text-base transition-transform duration-300 group-hover:scale-125">
                    {card.emoji}
                  </span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Romantic Closing Note */}
      <motion.footer
        initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="glass-panel rounded-3xl px-6 sm:px-10 py-8 sm:py-10 text-center space-y-4"
      >
        <p className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#351d26] [text-wrap:balance]">
          You are my princess, you are my everything{' '}
          <span className="ios-emoji text-2xl sm:text-4xl align-middle">🙈🤌🏻🌨️</span>
        </p>

        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={onOpenAgreement}
            className="glass-accent-button inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs sm:text-sm font-semibold text-white transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
          >
            <span className="ios-emoji">🙈🤌🏻🌨️</span>
            <span>Float This Love</span>
          </button>
        </div>
      </motion.footer>

      {/* Frosted Glass Lightbox Modal */}
      <AnimatePresence>
        {activePhoto && selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setSelectedIndex(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#2a131c]/45 backdrop-blur-xl p-4 sm:p-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel relative max-w-2xl w-full rounded-3xl p-4 sm:p-6 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-hindi text-base sm:text-lg font-medium text-[#351d26]">
                  {activePhoto.caption}{' '}
                  <span className="ios-emoji">{activePhoto.emoji}</span>
                </p>

                <button
                  type="button"
                  onClick={() => setSelectedIndex(null)}
                  aria-label="Close photo viewer"
                  className="glass-pill-button w-10 h-10 rounded-full flex items-center justify-center text-[#5c3543] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-white/85 bg-[#f8e4ea] flex items-center justify-center max-h-[70vh]">
                <img
                  src={activePhoto.src}
                  alt={activePhoto.alt}
                  referrerPolicy="no-referrer"
                  className="max-h-[70vh] w-auto object-contain"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedIndex(
                      (selectedIndex - 1 + allOrderedPhotos.length) %
                        allOrderedPhotos.length
                    )
                  }
                  className="glass-pill-button inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-[#5c3543] hover:scale-105 transition-transform cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSpawnEmoji('💖', 3)}
                  className="glass-accent-button inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold text-white hover:scale-105 transition-transform cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>Send Love</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedIndex(
                      (selectedIndex + 1) % allOrderedPhotos.length
                    )
                  }
                  className="glass-pill-button inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-[#5c3543] hover:scale-105 transition-transform cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
