import { useCallback, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { FloatingEmojis, FloatingEmojiItem } from './components/FloatingEmojis';
import { GuzarishPlayer } from './components/GuzarishPlayer';
import { RomanticLetter } from './components/RomanticLetter';

const SHOWER_POOL = ['💖', '🥹', '🫶🏻', '🌷', '✨', '🤍', '👀', '🌙', '🎶'];

export default function App() {
  const [isSongPlaying, setIsSongPlaying] = useState(false);
  const [fadeKey, setFadeKey] = useState(1);
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmojiItem[]>([]);
  const [loveCount, setLoveCount] = useState(0);
  const nextIdRef = useRef(1);

  const spawnEmoji = useCallback((emoji: string, count = 1) => {
    const batch: FloatingEmojiItem[] = [];
    for (let i = 0; i < count; i++) {
      const id = nextIdRef.current++;
      batch.push({
        id,
        emoji,
        xPercent: 12 + Math.random() * 76,
        driftX: (Math.random() - 0.5) * 14,
        scale: 0.88 + Math.random() * 0.42,
      });
    }

    setFloatingEmojis((prev) => [...prev.slice(-24), ...batch]);
    setLoveCount((prev) => prev + count);

    window.setTimeout(() => {
      const ids = new Set(batch.map((b) => b.id));
      setFloatingEmojis((prev) => prev.filter((item) => !ids.has(item.id)));
    }, 3800);
  }, []);

  const triggerHeartShower = useCallback(() => {
    for (let i = 0; i < 7; i++) {
      window.setTimeout(() => {
        const picked = SHOWER_POOL[i % SHOWER_POOL.length];
        spawnEmoji(picked, 1);
      }, i * 110);
    }
  }, [spawnEmoji]);

  const handleReplayFade = useCallback(() => {
    setFadeKey((prev) => prev + 1);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden text-[#351d26]">
      {/* Ambient Soft Pastel Glass Orbs */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="animate-orb-slow absolute -top-24 -left-24 w-[460px] h-[460px] rounded-full bg-[#f8c6d7]/45 blur-3xl" />
        <div className="animate-orb-slow-reverse absolute top-1/4 -right-28 w-[500px] h-[500px] rounded-full bg-[#fde0cd]/50 blur-3xl" />
        <div className="animate-orb-slow absolute -bottom-28 left-1/3 w-[520px] h-[520px] rounded-full bg-[#f5cde0]/40 blur-3xl" />
      </div>

      {/* Floating iOS Emojis Overlay */}
      <FloatingEmojis items={floatingEmojis} />

      <main id="top" className="mx-auto max-w-6xl px-5 sm:px-8 pt-10 sm:pt-14 pb-20 space-y-10 sm:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <h1 className="font-display text-5xl sm:text-6xl lg:text-[4.5rem] font-semibold tracking-tight leading-tight text-[#351d26] [text-wrap:balance]">
            My Krutika Jii <span className="ios-emoji text-4xl sm:text-5xl align-middle">🥹💖</span>
          </h1>
        </motion.div>

        {/* Main Studio: Poetic Hindi Letter + Guzarish (0:20 - 1:30) Glass Player */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <RomanticLetter
              fadeKey={fadeKey}
              onReplayFade={handleReplayFade}
              onSpawnEmoji={(emoji) => spawnEmoji(emoji, 2)}
              isSongPlaying={isSongPlaying}
            />
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-8">
            <GuzarishPlayer
              playTrigger={0}
              pauseTrigger={0}
              onPlayingChange={setIsSongPlaying}
              onSyncPoetryFade={handleReplayFade}
              onSpawnEmoji={(emoji) => spawnEmoji(emoji, 1)}
            />
          </div>
        </section>

        {/* Two Reflections: Her Eyes & Her Soul */}
        <section id="reflections" className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel rounded-3xl p-7 sm:p-8 flex flex-col justify-between gap-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-hindi text-xl sm:text-2xl font-semibold text-[#351d26]">
                  तुम्हारी आँखें
                </h3>
                <span className="ios-emoji text-2xl">👀✨</span>
              </div>
              <p className="font-hindi text-base sm:text-[17px] leading-[1.85] text-[#5c3543]">
                “इतनी सादगी और इतना नूर है तुम्हारी निगाहों में, कि बिना लफ़्ज़ों के भी हर बात सीधी दिल में उतर जाती है।”
              </p>
            </div>
            <p className="text-xs text-[#8c5a6a] pt-3 border-t border-[#b9778b]/15">
              Deep, warm, and always my favorite place to get lost in.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel rounded-3xl p-7 sm:p-8 flex flex-col justify-between gap-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-hindi text-xl sm:text-2xl font-semibold text-[#351d26]">
                  तुम्हारी रूह
                </h3>
                <span className="ios-emoji text-2xl">🌷🤍</span>
              </div>
              <p className="font-hindi text-base sm:text-[17px] leading-[1.85] text-[#5c3543]">
                “तुम्हारा दिल इतना पाक और नरम है कि तुम्हारे पास बैठते ही हर उदासी मुस्कुराहट में बदल जाती है।”
              </p>
            </div>
            <p className="text-xs text-[#8c5a6a] pt-3 border-t border-[#b9778b]/15">
              Gentle, pure, and the quiet home my heart waited for.
            </p>
          </motion.div>
        </section>

        {/* Quiet Footer */}
        <footer className="glass-panel rounded-3xl px-6 py-5 flex flex-wrap items-center justify-between gap-4 text-sm text-[#6e4956]">
          <p className="flex items-center gap-2">
            <span>Written with endless love for my cutie pie Biwi</span>
            <span className="ios-emoji">🫶🏻💖</span>
            {loveCount > 0 && (
              <span className="text-xs text-[#9e6e7d] tabular-nums">
                · {loveCount} {loveCount === 1 ? 'heart' : 'hearts'} sent
              </span>
            )}
          </p>

          <button
            type="button"
            onClick={triggerHeartShower}
            className="glass-pill-button inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-[#5c3543] transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] cursor-pointer whitespace-nowrap"
          >
            <span className="ios-emoji">🥹</span>
            <span>Send Another Smile</span>
          </button>
        </footer>
      </main>
    </div>
  );
}
