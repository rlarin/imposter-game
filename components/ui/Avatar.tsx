'use client';

interface AvatarProps {
  name: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  isConnected?: boolean;
  isEliminated?: boolean;
  className?: string;
}

export default function Avatar({
  name,
  color,
  size = 'md',
  isConnected = true,
  isEliminated = false,
  className = ''
}: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl'
  };

  const initial = name.charAt(0).toUpperCase();

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`
          ${sizes[size]}
          rounded-full flex items-center justify-center font-bold text-white
          transition-all duration-200
          ${isEliminated ? 'opacity-40 grayscale' : ''}
          ${!isConnected && !isEliminated ? 'opacity-60' : ''}
        `}
        style={{ backgroundColor: color }}
      >
        {isEliminated ? (
          <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          initial
        )}
      </div>

      {/* Connection status indicator */}
      {!isEliminated && (
        <span
          className={`
            absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-gray-900
            ${size === 'sm' ? 'w-2.5 h-2.5' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'}
            ${isConnected ? 'bg-green-500' : 'bg-gray-400'}
          `}
        />
      )}
    </div>
  );
}
