'use client';

import { useEffect, useState, useRef } from 'react';
import { formatTime } from '@/lib/utils';
import Icon from './Icon';

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

  const isLow = remaining <= 30;
  const isCritical = remaining <= 10;

  return (
    <div
      role="timer"
      className={`
        inline-flex items-center gap-2 h-10 px-3.5 rounded-xl border font-mono text-base font-bold tabular-nums
        ${
          isCritical
            ? 'bg-danger/15 border-danger-fg/40 text-danger-fg animate-pulse'
            : isLow
              ? 'bg-hint/10 border-hint/30 text-hint'
              : 'bg-white/5 border-line text-fg'
        }
        ${className}
      `}
    >
      <Icon name="clock" className="size-4" />
      {formatTime(remaining)}
    </div>
  );
}
