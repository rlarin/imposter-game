'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { GameRoom } from '@/lib/types';
import { Button, Input, Card, Timer } from '@/components/ui';

interface ImposterGuessProps {
  room: GameRoom;
  playerId: string;
  onGuess: (word: string) => void;
}

export default function ImposterGuess({ room, playerId, onGuess }: ImposterGuessProps) {
  const t = useTranslations();
  const [guess, setGuess] = useState('');

  const isImposter = playerId === room.imposterId;
  const imposterPlayer = room.players.find((p) => p.id === room.imposterId);

  const handleSubmit = () => {
    if (guess.trim()) {
      onGuess(guess.trim());
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card variant="elevated" padding="lg" className="text-center max-w-md w-full">
        {isImposter ? (
          <>
            <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🎯</div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
              {t('imposterGuess.lastChance')}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
              {t('imposterGuess.discovered')}
            </p>

            <Timer endTime={room.phaseEndsAt} className="mb-4 sm:mb-6" />

            <div className="space-y-3 sm:space-y-4">
              <Input
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder={t('imposterGuess.whatWasWord')}
                className="text-center text-lg sm:text-xl"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit();
                }}
              />
              <Button onClick={handleSubmit} className="w-full" size="lg">
                {t('imposterGuess.guess')}
              </Button>
            </div>

            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {t('game.category')}: {t(`categories.${room.settings.category}`)}
            </p>
          </>
        ) : (
          <>
            <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">⏳</div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
              {t('imposterGuess.waiting')}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
              {t('imposterGuess.lastChanceDesc', { name: imposterPlayer?.name || '' })}
            </p>

            <Timer endTime={room.phaseEndsAt} className="mb-4 sm:mb-6" />

            <div className="p-3 sm:p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {t('imposterGuess.wordWas')}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                {room.secretWord}
              </p>
            </div>

            <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400 animate-pulse">
              {t('imposterGuess.ifGuesses')}
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
