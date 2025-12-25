'use client';

import { useTranslations } from 'next-intl';
import { GameRoom } from '@/lib/types';
import { Button, Card, Avatar } from '@/components/ui';

interface GameOverProps {
  room: GameRoom;
  playerId: string;
  onPlayAgain: () => void;
}

export default function GameOver({ room, playerId, onPlayAgain }: GameOverProps) {
  const t = useTranslations();
  const isHost = playerId === room.hostId;
  const imposterPlayer = room.players.find(p => p.id === room.imposterId);
  const currentPlayer = room.players.find(p => p.id === playerId);
  const wasImposter = currentPlayer?.isImposter ?? false;
  const groupWon = room.winner === 'group';
  const everyoneWasImposter = room.everyoneIsImposter;

  // Determinar si el jugador actual ganó (en troll mode todos "ganan" o "pierden" juntos)
  const playerWon = everyoneWasImposter ? true : (groupWon && !wasImposter) || (!groupWon && wasImposter);

  // Determinar razón de victoria
  const getWinReason = () => {
    if (everyoneWasImposter) {
      return t('gameOver.trollModeActivated');
    }
    if (groupWon) {
      return room.imposterGuess
        ? t('gameOver.caughtNoGuess')
        : t('gameOver.caughtTimeout');
    } else {
      return room.eliminatedPlayerId !== room.imposterId
        ? t('gameOver.wrongElimination')
        : t('gameOver.correctGuess');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card variant="elevated" padding="lg" className="text-center max-w-md w-full">
        {/* Resultado principal */}
        <div className={`
          text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4
          ${everyoneWasImposter ? 'animate-spin' : (playerWon ? 'animate-bounce' : 'animate-pulse')}
        `}>
          {everyoneWasImposter ? '🎭' : (playerWon ? '🎉' : '😢')}
        </div>

        <h2 className={`
          text-2xl sm:text-3xl font-bold mb-1 sm:mb-2
          ${everyoneWasImposter
            ? 'text-purple-600 dark:text-purple-400'
            : groupWon
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }
        `}>
          {everyoneWasImposter
            ? t('gameOver.everyoneWasImposter')
            : (groupWon ? t('gameOver.groupWins') : t('gameOver.imposterWins'))
          }
        </h2>

        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
          {everyoneWasImposter ? t('gameOver.trollModeActivated') : (playerWon ? t('gameOver.congrats') : t('gameOver.betterLuck'))}
        </p>

        {/* Info del impostor (solo si NO es troll mode) */}
        {!everyoneWasImposter && (
          <div className="p-3 sm:p-4 bg-gray-100 dark:bg-gray-700 rounded-xl mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
              {t('gameOver.imposterWas')}
            </p>
            {imposterPlayer && (
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <Avatar
                  name={imposterPlayer.name}
                  color={imposterPlayer.avatarColor}
                  size="md"
                />
                <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {imposterPlayer.name}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Palabra secreta */}
        <div className="p-3 sm:p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t('gameOver.secretWordWas')}</p>
          <p className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400 uppercase">
            {room.secretWord}
          </p>

          {/* Si el impostor intentó adivinar */}
          {room.imposterGuess && (
            <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-indigo-200 dark:border-indigo-800">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {t('gameOver.imposterGuessed')}
              </p>
              <p className={`
                text-lg sm:text-xl font-bold
                ${room.imposterGuess.toLowerCase() === room.secretWord?.toLowerCase()
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
                }
              `}>
                {room.imposterGuess}
                {room.imposterGuess.toLowerCase() === room.secretWord?.toLowerCase()
                  ? ' ✓'
                  : ' ✗'
                }
              </p>
            </div>
          )}
        </div>

        {/* Explicación de cómo ganó */}
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">
          {getWinReason()}
        </p>

        {/* Botón de jugar de nuevo */}
        {isHost ? (
          <Button onClick={onPlayAgain} size="lg" className="w-full">
            {t('gameOver.playAgain')}
          </Button>
        ) : (
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            {t('gameOver.waitingHost')}
          </p>
        )}
      </Card>
    </div>
  );
}
