'use client';

import { useTranslations } from 'next-intl';
import { GameRoom } from '@/lib/types';
import { Card, Avatar } from '@/components/ui';
import { getVoteCounts } from '@/lib/game-logic';

interface VoteResultsProps {
  room: GameRoom;
  playerId: string;
}

export default function VoteResults({ room, playerId }: VoteResultsProps) {
  const t = useTranslations();
  const voteCounts = getVoteCounts(room);
  const eliminatedPlayer = room.players.find(p => p.id === room.eliminatedPlayerId);
  const wasImposterCaught = room.eliminatedPlayerId === room.imposterId;

  // Ordenar jugadores por votos recibidos
  const sortedPlayers = [...room.players]
    .filter(p => !p.isEliminated || p.id === room.eliminatedPlayerId)
    .sort((a, b) => (voteCounts[b.id] || 0) - (voteCounts[a.id] || 0));

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card variant="elevated" padding="lg" className="text-center max-w-md w-full">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
          {t('results.title')}
        </h2>

        {/* Resultados de votos */}
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          {sortedPlayers.map((player) => (
            <div
              key={player.id}
              className={`
                flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl transition-all
                ${player.id === room.eliminatedPlayerId
                  ? 'bg-red-100 dark:bg-red-900/30 ring-2 ring-red-500'
                  : 'bg-gray-50 dark:bg-gray-800'
                }
              `}
            >
              <Avatar
                name={player.name}
                color={player.avatarColor}
                size="sm"
                isEliminated={player.id === room.eliminatedPlayerId}
              />
              <div className="flex-1 text-left min-w-0">
                <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate">
                  {player.name}
                </span>
                {player.id === playerId && (
                  <span className="text-[10px] sm:text-xs ml-1 sm:ml-2 text-gray-500">({t('player.you')})</span>
                )}
              </div>
              <span className={`
                text-base sm:text-lg font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full
                ${(voteCounts[player.id] || 0) > 0
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }
              `}>
                {voteCounts[player.id] || 0}
              </span>
            </div>
          ))}
        </div>

        {/* Resultado */}
        {eliminatedPlayer ? (
          <div className={`
            p-3 sm:p-4 rounded-xl
            ${wasImposterCaught
              ? 'bg-green-100 dark:bg-green-900/30'
              : 'bg-amber-100 dark:bg-amber-900/30'
            }
          `}>
            <p className="text-base sm:text-lg font-bold mb-1 sm:mb-2">
              {t('results.eliminated', { name: eliminatedPlayer.name })}
            </p>
            {wasImposterCaught ? (
              <>
                <p className="text-green-600 dark:text-green-400 text-xl sm:text-2xl mb-1 sm:mb-2">
                  {t('results.wasImposter')}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {t('results.canGuess')}
                </p>
              </>
            ) : (
              <p className="text-sm sm:text-base text-amber-600 dark:text-amber-400">
                {t('results.wasInnocent')}
              </p>
            )}
          </div>
        ) : (
          <div className="p-3 sm:p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
            <p className="text-base sm:text-lg font-bold text-gray-600 dark:text-gray-300">
              {t('results.tie')}
            </p>
          </div>
        )}

        <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400 animate-pulse">
          {t('results.continuing')}
        </p>
      </Card>
    </div>
  );
}
