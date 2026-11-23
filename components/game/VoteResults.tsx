'use client';

import { useTranslations } from 'next-intl';
import { GameRoom } from '@/lib/types';
import { Avatar } from '@/components/ui';
import { getVoteCounts } from '@/lib/game-logic';
import { Stage } from './Stage';

interface VoteResultsProps {
  room: GameRoom;
  playerId: string;
}

export default function VoteResults({ room, playerId }: VoteResultsProps) {
  const t = useTranslations();
  const voteCounts = getVoteCounts(room);
  const eliminatedPlayer = room.players.find((p) => p.id === room.eliminatedPlayerId);
  const wasImposterCaught = room.eliminatedPlayerId === room.imposterId;
  const maxVotes = Math.max(1, ...Object.values(voteCounts));

  // Ordenar jugadores por votos recibidos
  const sortedPlayers = [...room.players]
    .filter((p) => !p.isEliminated || p.id === room.eliminatedPlayerId)
    .sort((a, b) => (voteCounts[b.id] || 0) - (voteCounts[a.id] || 0));

  return (
    <Stage>
      <h1 className="font-display text-2xl font-bold lg:text-3xl">{t('results.title')}</h1>

      <ul className="flex w-full flex-col gap-2">
        {sortedPlayers.map((player) => {
          const votes = voteCounts[player.id] || 0;
          const isOut = player.id === room.eliminatedPlayerId;
          return (
            <li
              key={player.id}
              className={`relative flex items-center gap-3 overflow-hidden rounded-2xl border p-2.5 ${
                isOut ? 'border-danger-fg/50 bg-danger/12' : 'border-white/6 bg-surface-2'
              }`}
            >
              <span
                aria-hidden="true"
                className={`absolute inset-y-0 left-0 ${isOut ? 'bg-danger/14' : 'bg-white/4'}`}
                style={{ width: `${(votes / maxVotes) * 100}%` }}
              />
              <Avatar
                name={player.name}
                color={player.avatarColor}
                size="sm"
                isEliminated={isOut}
                className="relative"
              />
              <span className="relative min-w-0 flex-1 truncate text-left text-[15px] font-semibold">
                {player.name}
                {player.id === playerId && (
                  <span className="ml-1.5 text-xs font-normal text-muted">({t('player.you')})</span>
                )}
              </span>
              <span
                className={`relative flex h-8 min-w-8 items-center justify-center rounded-full px-2 font-mono text-sm font-bold ${
                  votes > 0 ? 'bg-danger text-white' : 'bg-white/8 text-muted'
                }`}
              >
                {votes}
              </span>
            </li>
          );
        })}
      </ul>

      {eliminatedPlayer ? (
        <div
          className={`w-full rounded-2xl border p-4 ${
            wasImposterCaught ? 'border-success/35 bg-success/10' : 'border-hint/30 bg-hint/10'
          }`}
        >
          <p className="font-display text-lg font-bold">
            {t('results.eliminated', { name: eliminatedPlayer.name })}
          </p>
          {wasImposterCaught ? (
            <>
              <p className="mt-1 font-display text-2xl font-bold text-success">
                {t('results.wasImposter')}
              </p>
              <p className="mt-1 text-sm text-muted">{t('results.canGuess')}</p>
            </>
          ) : (
            <p className="mt-1 text-hint">{t('results.wasInnocent')}</p>
          )}
        </div>
      ) : (
        <div className="w-full rounded-2xl bg-white/6 p-4">
          <p className="font-display text-lg font-bold text-fg-soft">{t('results.tie')}</p>
        </div>
      )}

      <p className="animate-pulse text-sm text-muted">{t('results.continuing')}</p>
    </Stage>
  );
}
