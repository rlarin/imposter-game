'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatLikeCount } from '@/lib/utils';
import Icon from './Icon';

interface LikeButtonProps {
  /** `pill`: compact standalone button; `row`: full-width menu item. */
  variant?: 'pill' | 'row';
  className?: string;
}

export default function LikeButton({ variant = 'pill', className = '' }: LikeButtonProps) {
  const t = useTranslations();
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);

  // Initialize player ID from localStorage
  useEffect(() => {
    const storedPlayerId = localStorage.getItem('playerId');
    if (storedPlayerId) {
      setPlayerId(storedPlayerId);
    } else {
      // Generate a new player ID if not exists
      const newId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('playerId', newId);
      setPlayerId(newId);
    }
  }, []);

  // Fetch initial likes count and check if player has liked
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [likesRes, checkRes] = await Promise.all([
          fetch('/api/likes/get'),
          playerId
            ? fetch('/api/likes/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId }),
              })
            : Promise.resolve(null),
        ]);

        if (likesRes.ok) {
          const data = await likesRes.json();
          setLikes(data.likes);
        }

        if (checkRes && checkRes.ok) {
          const data = await checkRes.json();
          setHasLiked(data.hasLiked);
        }
      } catch (error) {
        console.error('Error fetching likes:', error);
      }
    };

    if (playerId) {
      fetchInitialData();
    }
  }, [playerId]);

  const handleLike = async () => {
    if (!playerId || hasLiked || loading) return;

    setLoading(true);
    try {
      const response = await fetch('/api/likes/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });

      if (response.ok) {
        const data = await response.json();
        setLikes(data.likes);
        setHasLiked(true);
      } else if (response.status === 409) {
        // Player already liked
        const data = await response.json();
        setLikes(data.likes);
        setHasLiked(true);
      }
    } catch (error) {
      console.error('Error adding like:', error);
    } finally {
      setLoading(false);
    }
  };

  const heart = (
    <Icon
      name="heart"
      className={`size-5 transition-colors ${hasLiked ? 'text-danger-fg fill-danger-fg' : ''}`}
    />
  );

  if (variant === 'row') {
    return (
      <button
        type="button"
        onClick={handleLike}
        disabled={hasLiked || loading}
        title={hasLiked ? t('like.alreadyLiked') : t('like.clickToLike')}
        className={`flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] font-medium text-fg transition-colors enabled:hover:bg-white/6 disabled:cursor-default ${className}`}
      >
        {heart}
        <span className="flex-1">{hasLiked ? t('ui.liked') : t('ui.like')}</span>
        <span className="text-sm text-muted tabular-nums">{formatLikeCount(likes)}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={hasLiked || loading}
      title={hasLiked ? t('like.alreadyLiked') : t('like.clickToLike')}
      className={`inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white/5 px-4 text-sm font-semibold text-fg transition-all enabled:hover:bg-white/10 enabled:active:scale-95 disabled:cursor-default ${className}`}
    >
      {heart}
      <span className="tabular-nums">{formatLikeCount(likes)}</span>
    </button>
  );
}
