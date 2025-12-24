'use client';

import { GameRoom } from '@/lib/types';
import { Card, Avatar } from '@/components/ui';
import { getVoteCounts } from '@/lib/game-logic';

interface VoteResultsProps {
  room: GameRoom;
  playerId: string;
}

export default function VoteResults({ room, playerId }: VoteResultsProps) {
  const voteCounts = getVoteCounts(room);
  const eliminatedPlayer = room.players.find(p => p.id === room.eliminatedPlayerId);
  const wasImposterCaught = room.eliminatedPlayerId === room.imposterId;

  // Ordenar jugadores por votos recibidos
  const sortedPlayers = [...room.players]
    .filter(p => !p.isEliminated || p.id === room.eliminatedPlayerId)
    .sort((a, b) => (voteCounts[b.id] || 0) - (voteCounts[a.id] || 0));

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card variant="elevated" padding="lg" className="text-center max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Resultados de la Votación
        </h2>

        {/* Resultados de votos */}
        <div className="space-y-3 mb-6">
          {sortedPlayers.map((player) => (
            <div
              key={player.id}
              className={`
                flex items-center gap-3 p-3 rounded-xl transition-all
                ${player.id === room.eliminatedPlayerId
                  ? 'bg-red-100 dark:bg-red-900/30 ring-2 ring-red-500'
                  : 'bg-gray-50 dark:bg-gray-800'
                }
              `}
            >
              <Avatar
                name={player.name}
                color={player.avatarColor}
                size="md"
                isEliminated={player.id === room.eliminatedPlayerId}
              />
              <div className="flex-1 text-left">
                <span className="font-medium text-gray-900 dark:text-white">
                  {player.name}
                </span>
                {player.id === playerId && (
                  <span className="text-xs ml-2 text-gray-500">(Tú)</span>
                )}
              </div>
              <span className={`
                text-lg font-bold px-3 py-1 rounded-full
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
            p-4 rounded-xl
            ${wasImposterCaught
              ? 'bg-green-100 dark:bg-green-900/30'
              : 'bg-amber-100 dark:bg-amber-900/30'
            }
          `}>
            <p className="text-lg font-bold mb-2">
              {eliminatedPlayer.name} ha sido eliminado
            </p>
            {wasImposterCaught ? (
              <>
                <p className="text-green-600 dark:text-green-400 text-2xl mb-2">
                  ¡Era el IMPOSTOR!
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pero aún puede intentar adivinar la palabra...
                </p>
              </>
            ) : (
              <p className="text-amber-600 dark:text-amber-400">
                Era inocente...
              </p>
            )}
          </div>
        ) : (
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
            <p className="text-lg font-bold text-gray-600 dark:text-gray-300">
              ¡Empate! Nadie es eliminado
            </p>
          </div>
        )}

        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 animate-pulse">
          Continuando...
        </p>
      </Card>
    </div>
  );
}
