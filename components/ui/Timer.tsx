'use client';

import { useEffect, useState, useRef } from 'react';
import { formatTime } from '@/lib/utils';

interface TimerProps {
  endTime: number | null;
  onTimeUp?: () => void;
  className?: string;
}

function calculateRemaining(endTime: number | null): number {
  if (!endTime) return 0;
  const now = Date.now();
  return Math.max(0, Math.floor((endTime - now) / 1000));
}

export default function Timer({ endTime, onTimeUp, className = '' }: TimerProps) {
  const [remaining, setRemaining] = useState(() => calculateRemaining(endTime));
  const onTimeUpRef = useRef(onTimeUp);

  // Actualizar ref cuando cambia onTimeUp
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    // Reset when endTime changes - this is intentional as we need to sync with external time
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRemaining(calculateRemaining(endTime));

    if (!endTime) return;

    const interval = setInterval(() => {
      const diff = calculateRemaining(endTime);
      setRemaining(diff);

      if (diff === 0 && onTimeUpRef.current) {
        onTimeUpRef.current();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  if (!endTime) return null;

  const isLow = remaining <= 10;
  const isCritical = remaining <= 5;

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg font-bold
        ${isCritical
          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse'
          : isLow
            ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
        }
        ${className}
      `}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {formatTime(remaining)}
    </div>
  );
}
