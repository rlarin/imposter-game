'use client';

import Icon from './Icon';

interface AvatarProps {
  name: string;
  color: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isConnected?: boolean;
  isEliminated?: boolean;
  /** Highlight ring for the current player. */
  isSelf?: boolean;
  showStatus?: boolean;
  className?: string;
}

const sizes = {
  xs: 'size-7 text-xs',
  sm: 'size-9 text-sm',
  md: 'size-12 text-lg',
  lg: 'size-14 text-xl',
  xl: 'size-16 text-2xl',
};

const dotSizes = {
  xs: 'size-2',
  sm: 'size-2.5',
  md: 'size-3',
  lg: 'size-3.5',
  xl: 'size-4',
};

export default function Avatar({
  name,
  color,
  size = 'md',
  isConnected = true,
  isEliminated = false,
  isSelf = false,
  showStatus = false,
  className = '',
}: AvatarProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      <div
        className={`
          ${sizes[size]}
          rounded-full flex items-center justify-center font-bold text-white
          [text-shadow:0_1px_2px_rgba(0,0,0,0.35)] transition-all duration-200
          ${isSelf ? 'ring-2 ring-accent-soft ring-offset-2 ring-offset-ink' : ''}
          ${isEliminated ? 'opacity-40 grayscale' : ''}
          ${!isConnected && !isEliminated ? 'opacity-50' : ''}
        `}
        style={{ backgroundColor: color }}
      >
        {isEliminated ? <Icon name="x" className="size-1/2" /> : initial}
      </div>

      {showStatus && !isEliminated && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-ink ${dotSizes[size]} ${
            isConnected ? 'bg-success' : 'bg-subtle'
          }`}
        />
      )}
    </div>
  );
}
