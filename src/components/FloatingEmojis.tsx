import { AnimatePresence, motion } from 'motion/react';

export interface FloatingEmojiItem {
  id: number;
  emoji: string;
  xPercent: number;
  driftX: number;
  scale: number;
}

interface FloatingEmojisProps {
  items: FloatingEmojiItem[];
}

export function FloatingEmojis({ items }: FloatingEmojisProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      <AnimatePresence>
        {items.map((item) => (
          <motion.span
            key={item.id}
            initial={{
              opacity: 0,
              y: '92vh',
              x: `${item.xPercent}vw`,
              scale: item.scale * 0.65,
              rotate: -10,
            }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: ['90vh', '60vh', '30vh', '8vh'],
              x: [
                `${item.xPercent}vw`,
                `${item.xPercent + item.driftX * 0.5}vw`,
                `${item.xPercent - item.driftX * 0.35}vw`,
                `${item.xPercent + item.driftX}vw`,
              ],
              scale: [
                item.scale * 0.7,
                item.scale * 1.15,
                item.scale,
                item.scale * 0.85,
              ],
              rotate: [0, 8, -8, 4],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 3.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="ios-emoji absolute top-0 left-0 select-none text-3xl sm:text-4xl drop-shadow-[0_6px_14px_rgba(180,90,120,0.22)]"
          >
            {item.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
