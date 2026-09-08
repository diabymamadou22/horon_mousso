import React from 'react';
import { motion } from 'framer-motion';

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  duration?: number;
  withScale?: boolean;
  once?: boolean;
  amount?: number | 'some' | 'all';
  className?: string;
  id?: string;
}

export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  delay = 0,
  direction = 'up',
  distance = 28,
  duration = 0.6,
  withScale = false,
  once = true,
  amount = 0.15,
  className = '',
  id,
}) => {
  const getInitial = () => {
    const base: { opacity: number; scale?: number; x?: number; y?: number } = {
      opacity: 0,
      ...(withScale ? { scale: 0.97 } : {}),
    };

    switch (direction) {
      case 'up':
        return { ...base, y: distance };
      case 'down':
        return { ...base, y: -distance };
      case 'left':
        return { ...base, x: distance };
      case 'right':
        return { ...base, x: -distance };
      case 'none':
      default:
        return base;
    }
  };

  const getTarget = () => {
    return {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
    };
  };

  return (
    <motion.div
      id={id}
      initial={getInitial()}
      whileInView={getTarget()}
      viewport={{ once, amount, margin: '-30px' }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // Smooth organic deceleration
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const FadeInStagger: React.FC<{
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
  id?: string;
  once?: boolean;
  amount?: number | 'some' | 'all';
}> = ({
  children,
  className = '',
  staggerDelay = 0.09,
  delayChildren = 0.05,
  id,
  once = true,
  amount = 0.15,
}) => {
  return (
    <motion.div
      id={id}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount, margin: '-30px' }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const FadeInItem: React.FC<{
  children: React.ReactNode;
  className?: string;
  distance?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  withScale?: boolean;
  duration?: number;
}> = ({
  children,
  className = '',
  distance = 24,
  direction = 'up',
  withScale = false,
  duration = 0.55,
}) => {
  const getHidden = () => {
    const base: { opacity: number; scale?: number; x?: number; y?: number } = {
      opacity: 0,
      ...(withScale ? { scale: 0.96 } : {}),
    };

    switch (direction) {
      case 'up':
        return { ...base, y: distance };
      case 'down':
        return { ...base, y: -distance };
      case 'left':
        return { ...base, x: distance };
      case 'right':
        return { ...base, x: -distance };
      case 'none':
      default:
        return base;
    }
  };

  return (
    <motion.div
      variants={{
        hidden: getHidden(),
        show: {
          opacity: 1,
          scale: 1,
          x: 0,
          y: 0,
          transition: {
            duration,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
