'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { GameRoom } from '@/lib/types';
import { Button, Input, Card, Timer } from '@/components/ui';
import { validateClue } from '@/lib/utils';
import { useLocale } from '@/lib/i18n-context';
import { getCategoryById } from '@/lib/words/index';
import PlayerList from './PlayerList';

interface ClueRoundProps {
  room: GameRoom;
  playerId: string;
  onSubmitClue: (word: string) => void;
}

export default function ClueRound({ room, playerId, onSubmitClue }: ClueRoundProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const [clue, setClue] = useState('');
  const [error, setError] = useState('');

  const currentPlayer = room.players.find(p => p.id === playerId);
  const hasSubmitted = currentPlayer?.hasSubmittedClue ?? false;
  const isImposter = currentPlayer?.isImposter ?? false;
  const category = getCategoryById(locale, room.settings.category);

  // Pistas de rondas anteriores
  const previousClues = room.clues.filter(c => c.round < room.currentRound);

  const handleSubmit = () => {
    const trimmed = clue.trim();

    // Para el impostor, no validar contra la palabra secreta
    if (!isImposter && room.secretWord) {
      const validation = validateClue(trimmed, room.secretWord);
      if (!validation.valid) {
        setError(validation.errorKey ? t(validation.errorKey) : t('validation.invalidClue'));
        return;
      }
    }

    if (trimmed.length === 0) {
      setError(t('validation.writeClue'));
      return;
    }

    if (trimmed.includes(' ')) {
      setError(t('validation.clueSingleWord'));
      return;
    }

    setError('');
    onSubmitClue(trimmed);
    setClue('');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header con timer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            {t('game.round', { current: room.currentRound, total: room.settings.clueRounds })}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {category?.emoji} {category?.name}
          </p>
        </div>
        <Timer endTime={room.phaseEndsAt} />
      </div>

      {/* Palabra secreta (si no es impostor) */}
      {!isImposter && room.secretWord && (
        <Card className="text-center bg-indigo-50 dark:bg-indigo-900/20">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t('game.secretWord')}</p>
          <p className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 uppercase">
            {room.secretWord}
          </p>
        </Card>
      )}

      {/* Indicador de impostor con hint */}
      {isImposter && (
        <Card className="text-center bg-red-50 dark:bg-red-900/20">
          <p className="text-xs sm:text-sm text-red-500">{t('game.youAreImposter')}</p>
          <p className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400 mb-2">
            {t('clue.imposterHint')}
          </p>
          {room.imposterHint && (
            <div className="mt-2 p-2 sm:p-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg">
              <p className="text-xs text-amber-700 dark:text-amber-400 mb-1">
                {t('game.imposterHintLabel')}
              </p>
              <p className="text-lg font-bold text-amber-800 dark:text-amber-300 uppercase">
                {room.imposterHint}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Pistas de rondas anteriores */}
      {previousClues.length > 0 && (
        <Card>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
            {t('clue.previousClues')}
          </h3>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {previousClues.map((c, i) => (
              <span
                key={i}
                className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs sm:text-sm"
              >
                <span className="font-medium">{c.playerName}:</span>{' '}
                <span className="text-indigo-600 dark:text-indigo-400">{c.word}</span>
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Input de pista */}
      {!hasSubmitted ? (
        <Card>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            {t('clue.yourClue')}
          </h3>
          <div className="space-y-3">
            <Input
              value={clue}
              onChange={(e) => setClue(e.target.value.replace(/\s/g, ''))}
              placeholder={t('clue.placeholder')}
              maxLength={20}
              error={error}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
            />
            <Button onClick={handleSubmit} className="w-full">
              {t('clue.submit')}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="text-center bg-green-50 dark:bg-green-900/20">
          <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">✓</div>
          <p className="text-sm sm:text-base font-semibold text-green-600 dark:text-green-400">
            {t('clue.submitted')}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {t('clue.waiting')}
          </p>
        </Card>
      )}

      {/* Estado de jugadores */}
      <Card>
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
          {t('lobby.players')}
        </h3>
        <PlayerList
          players={room.players.filter(p => p.isConnected && !p.isEliminated)}
          currentPlayerId={playerId}
          hostId={room.hostId}
        />
      </Card>
    </div>
  );
}
