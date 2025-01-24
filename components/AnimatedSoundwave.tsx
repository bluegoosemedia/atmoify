import React from 'react';
import { motion } from 'framer-motion';

export function AnimatedSoundwave() {
  const bars = 5;
  const barWidth = 2;
  const gap = 2;
  const duration = 1.5;

  return (
    <div className="w-6 h-6 flex items-center justify-center">
      <svg width="24" height="24" viewBox="0 0 24 24">
        {[...Array(bars)].map((_, i) => (
          <motion.rect
            key={i}
            x={i * (barWidth + gap) + (24 - bars * (barWidth + gap) + gap) / 2}
            y={12}
            width={barWidth}
            height={0}
            fill="currentColor"
            initial={{ height: 0 }}
            animate={{
              height: [0, 12, 0],
              y: [12, 6, 12],
            }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: duration,
              delay: i * (duration / bars),
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

