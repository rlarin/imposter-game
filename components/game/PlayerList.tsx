'use client';

import { useTranslations } from 'next-intl';
import { Player } from '@/lib/types';
import { Avatar } from '@/components/ui';

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string;
  hostId?: string;
  showVoteCount?: boolean;
  voteCounts?: Record<string, number>;
  onKick?: (playerId: string) => void;
  isHost?: boolean;
  isLobby?: boolean;
}

export default function PlayerList({
  players,
  currentPlayerId,
  showVoteCount = false,
  voteCounts = {},
  onKick,
  isHost = false,
  isLobby = false
}: PlayerListProps) {
  const t = useTranslations();

  return (
    <div className="space-y-1.5 sm:space-y-2">
      {players.map((player) => (
        <div
          key={player.id}
          className={`
            flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl transition-all
            ${player.id === currentPlayerId
              ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-500'
              : 'bg-gray-50 dark:bg-gray-800/50'
            }
            ${player.isEliminated ? 'opacity-50' : ''}
          `}
        >
          <Avatar
            name={player.name}
            color={player.avatarColor}
            size="sm"
            isConnected={player.isConnected}
            isEliminated={player.isEliminated}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <span className={`text-sm sm:text-base font-medium truncate ${!player.isConnected ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                {player.name}
              </span>
              {player.id === currentPlayerId && (
                <span className="text-[10px] sm:text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 px-1.5 sm:px-2 py-0.5 rounded-full">
                  {t('player.you')}
                </span>
              )}
              {player.isHost && (
                <span className="text-[10px] sm:text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400 px-1.5 sm:px-2 py-0.5 rounded-full">
                  {t('player.host')}
                </span>
              )}
            </div>

            {player.isEliminated && (
              <span className="text-[10px] sm:text-xs text-red-500">{t('player.eliminated')}</span>
            )}

            {!player.isConnected && !player.isEliminated && (
              <span className="text-[10px] sm:text-xs text-gray-400">{t('player.disconnected')}</span>
            )}
          </div>

          {/* Indicadores de estado */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Votos recibidos */}
            {showVoteCount && voteCounts[player.id] && (
              <span className="text-xs sm:text-sm font-bold text-red-500 bg-red-100 dark:bg-red-900/30 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                {voteCounts[player.id]} {t('results.votes')}
              </span>
            )}

            {/* Indicador de pista enviada */}
            {player.hasSubmittedClue && (
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full" title={t('player.clueSubmitted')} />
            )}

            {/* Indicador de voto emitido */}
            {player.hasVoted && (
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full" title={t('player.hasVoted')} />
            )}

            {/* Botón de expulsar (solo host, solo en lobby) */}
            {isHost && isLobby && player.id !== currentPlayerId && onKick && (
              <button
                onClick={() => onKick(player.id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-0.5 sm:p-1"
                title={t('player.kick')}
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
