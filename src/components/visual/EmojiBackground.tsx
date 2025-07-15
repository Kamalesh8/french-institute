"use client";

import { useMemo } from "react";

const EMOJIS = ["🚀", "📚", "✨", "🎉", "🗼", "💬", "🎬", "☕", "📝", "🎨"];

interface EmojiProps {
  id: number;
}

function RandomEmoji({ id }: EmojiProps) {
  // random values deterministically based on id for SSR/CSR mismatch safety
  const { left, top, size, duration, delay } = useMemo(() => {
    const rng = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    const rand = (min: number, max: number, seedOffset: number) =>
      rng(id * 10 + seedOffset) * (max - min) + min;

    return {
      left: rand(0, 100, 1),
      top: rand(0, 100, 2),
      size: rand(1.5, 3.5, 3), // rem units
      duration: rand(20, 40, 4), // seconds
      delay: rand(0, 20, 5), // seconds
    };
  }, [id]);

  const emoji = EMOJIS[id % EMOJIS.length];

  return (
    <span
      className="absolute select-none opacity-70 md:opacity-50"
      style={{
        left: `${left}vw`,
        top: `${top}vh`,
        fontSize: `${size}rem`,
        animation: `float ${duration}s ease-in-out ${delay}s infinite`,
        willChange: 'transform',
        opacity: 0.15,
      }}
    >
      {emoji}
    </span>
  );
}

export default function EmojiBackground() {
  const count = 15;
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Keyframes */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-40px) rotate(180deg);
          }
          100% {
            transform: translateY(0px) rotate(360deg);
          }
        }

        /* Disable animation for users who prefer reduced motion */
        @media (prefers-reduced-motion: reduce) {
          span[style*="animation:"] {
            animation: none !important;
          }
        }
      `}</style>
      {Array.from({ length: count }).map((_, idx) => (
        <RandomEmoji key={idx} id={idx} />
      ))}
    </div>
  );
}
