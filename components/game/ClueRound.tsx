'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { GameRoom } from '@/lib/types';
import { Button, Card, Input, Timer } from '@/components/ui';
import { validateClue } from '@/lib/utils';
import { useLocale } from '@/lib/i18n-context';
import { Locale } from '@/i18n/config';
import { getCategoryById } from '@/lib/words/index';
import { translateText } from '@/lib/translation-service';
import PlayerList from './PlayerList';
import WordChangeVoteModal from './WordChangeVoteModal';
import CluesByPlayer from './CluesByPlayer';

interface ClueRoundProps {
  room: GameRoom;
  playerId: string;
  onSubmitClue: (word: string, locale?: Locale) => void;
  onInitiateWordChange: () => void;
  onVoteWordChange: (vote: boolean) => void;
}

export default function ClueRound({
  room,
  playerId,
  onSubmitClue,
  onInitiateWordChange,
  onVoteWordChange,
}: ClueRoundProps) {
  const t = useTranslations();
  const { locale } = useLocale();

  const [translatedSecretWord, setTranslatedSecretWord] = useState<string | null>(null);
  const [clue, setClue] = useState('');
  const [error, setError] = useState('');

  // Traducir palabra secreta cuando cambia
  useEffect(() => {
    if (!room.secretWord) return;

    const hostLocale: Locale = 'es'; // Asumir que el host usa español

    // Si es el mismo idioma, no traducir ni tocar estado
    if (locale === hostLocale) {
      return;
    }

    translateText(room.secretWord, locale, hostLocale)
      .then((translated) => {
        setTranslatedSecretWord(translated);
      })
      .catch(() => {
        // ignore errors; keep original
      });
  }, [room.secretWord, locale]);

  const currentPlayer = room.players.find((p) => p.id === playerId);
  const hasSubmitted = currentPlayer?.hasSubmittedClue ?? false;
  const isImposter = currentPlayer?.isImposter ?? false;
  const category = getCategoryById(locale, room.settings.category);

  // Word change voting state
  const canInitiateWordChange =
    !room.wordChangeUsed && !room.wordChangeVotingActive && !currentPlayer?.isEliminated;
  const showVotingModal = room.wordChangeVotingActive;

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
    onSubmitClue(trimmed, locale);
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
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {t('game.secretWord')}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 uppercase">
            {translatedSecretWord || room.secretWord}
            {/* {isLoadingTranslation && <span className="text-sm opacity-50"> (traduciendo...)</span>} */}
          </p>
        </Card>
      )}

      {/* Indicador de impostor con hints */}
      {isImposter && (
        <Card className="text-center bg-red-50 dark:bg-red-900/20">
          <p className="text-xs sm:text-sm text-red-500">{t('game.youAreImposter')}</p>
          <p className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400 mb-2">
            {t('clue.imposterHint')}
          </p>
          {room.imposterHints && room.imposterHints.length > 0 && (
            <div className="mt-2 p-2 sm:p-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg">
              <p className="text-xs text-amber-700 dark:text-amber-400 mb-1">
                {t('game.imposterHintLabel')} ({room.imposterHints.length})
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {room.imposterHints.map((hint, i) => (
                  <span
                    key={i}
                    className="text-lg font-bold text-amber-800 dark:text-amber-300 uppercase px-2 py-1 bg-amber-200/50 dark:bg-amber-800/30 rounded"
                  >
                    {hint}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* All clues grouped by player */}
      {room.clues.length > 0 && (
        <CluesByPlayer
          clues={room.clues}
          players={room.players}
          currentRound={room.currentRound}
          title={t('clue.allClues')}
        />
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
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t('clue.waiting')}</p>
        </Card>
      )}

      {/* Estado de jugadores */}
      <Card>
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
          {t('lobby.players')}
        </h3>
        <PlayerList
          players={room.players.filter((p) => p.isConnected && !p.isEliminated)}
          currentPlayerId={playerId}
          hostId={room.hostId}
        />
      </Card>

      {/* Botón para cambiar palabra */}
      {canInitiateWordChange && (
        <Card className="text-center">
          <button
            onClick={onInitiateWordChange}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 border border-purple-300 dark:border-purple-700 rounded-lg transition-colors"
          >
            <span className="text-xl">🔄</span>
            <div className="text-left">
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                {t('wordChange.initiateButton')}
              </p>
              <p className="text-xs text-purple-600/70 dark:text-purple-400/70">
                {t('wordChange.initiateHint')}
              </p>
            </div>
          </button>
        </Card>
      )}

      {/* Indicador de que ya se usó el cambio de palabra */}
      {room.wordChangeUsed && !room.wordChangeVotingActive && (
        <div className="text-center text-xs text-gray-400 dark:text-gray-500">
          {t('wordChange.alreadyUsed')}
        </div>
      )}

      {/* Modal de votación de cambio de palabra */}
      {showVotingModal && (
        <WordChangeVoteModal room={room} playerId={playerId} onVote={onVoteWordChange} />
      )}
    </div>
  );
}
