import React from 'react';
import { motion } from 'framer-motion';

export function AnimatedSoundwave() {
  const ripples = 3;

  return (
    <div className="w-6 h-6 flex items-center justify-center relative">
      <svg width="24" height="24" viewBox="0 0 24 24">
        {/* Ripple effects */}
        {[...Array(ripples)].map((_, i) => (
          <motion.circle
            key={`ripple-${i}`}
            cx={12}
            cy={12}
            r={3}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            initial={{ r: 3, opacity: 0.8 }}
            animate={{
              r: [3, 10],
              opacity: [0.8, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              delay: i * 0.6,
              ease: "easeOut",
            }}
          />
        ))}
        {/* Center circle */}
        <motion.circle
          cx={12}
          cy={12}
          r={3}
          fill="currentColor"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
          }}
        />
      </svg>
    </div>
  );
}

