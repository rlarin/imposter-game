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
        flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all
        ${
          hasLiked
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 cursor-default'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 cursor-pointer active:scale-95'
        }
      `}
    >
      <span className={`text-lg ${hasLiked ? 'animate-pulse' : ''}`}>❤️</span>
      <span className="text-sm font-semibold">{formatLikeCount(likes)}</span>
    </button>
  );
}
