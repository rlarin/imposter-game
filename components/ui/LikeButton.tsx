'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatLikeCount } from '@/lib/utils';

export default function LikeButton() {
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

  return (
    <button
      onClick={handleLike}
      disabled={hasLiked || loading}
      title={hasLiked ? t('like.alreadyLiked') : t('like.clickToLike')}
      className={`
        relative transition-all
        ${hasLiked ? 'cursor-default' : 'cursor-pointer active:scale-95'}
      `}
    >
      <svg
        className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
          hasLiked
            ? 'text-red-500 fill-red-500'
            : 'text-white/80 hover:text-red-400 fill-none'
        }`}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full min-w-[16px] h-4 sm:min-w-[18px] sm:h-[18px] flex items-center justify-center px-1">
        {formatLikeCount(likes)}
      </span>
    </button>
  );
}
