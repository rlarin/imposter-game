'use client';

import { useTranslations } from 'next-intl';
import { GamePhase, Player } from '@/lib/types';
import { Avatar, Icon } from '@/components/ui';

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string;
  hostId?: string;
  phase?: GamePhase;
  onKick?: (playerId: string) => void;
  isHost?: boolean;
}

type Status = { text: string; tone: 'ok' | 'muted' | 'pending' | 'danger'; done?: boolean };

function usePlayerStatus(phase: GamePhase | undefined) {
  const t = useTranslations();
  return (player: Player): Status => {
    if (player.isEliminated) return { text: t('ui.statusEliminated'), tone: 'danger' };
    if (!player.isConnected) return { text: t('ui.statusDisconnected'), tone: 'muted' };
    switch (phase) {
      case 'word-reveal':
        return { text: t('ui.statusReading'), tone: 'muted' };
      case 'clue-round':
        return player.hasSubmittedClue
          ? { text: t('ui.statusSent'), tone: 'muted', done: true }
          : { text: t('ui.thinking'), tone: 'pending' };
      case 'voting':
        return player.hasVoted
          ? { text: t('ui.statusVoted'), tone: 'muted', done: true }
          : { text: t('ui.statusDeciding'), tone: 'pending' };
      default:
        return { text: t('ui.statusConnected'), tone: 'ok' };
    }
  };
}

const toneClass = {
  ok: 'text-success',
  muted: 'text-muted',
  pending: 'text-accent-fg animate-pulse',
  danger: 'text-danger-fg',
};

export default function PlayerList({
  players,
  currentPlayerId,
  hostId,
  phase,
  onKick,
  isHost = false,
}: PlayerListProps) {
  const t = useTranslations();
  const statusOf = usePlayerStatus(phase);

  return (
    <ul className="flex flex-col gap-0.5">
      {players.map((player) => {
        const isSelf = player.id === currentPlayerId;
        const playerIsHost = hostId ? player.id === hostId : player.isHost;
        const status = statusOf(player);
        return (
          <li
            key={player.id}
            className={`flex items-center gap-3 rounded-xl p-2 ${isSelf ? 'bg-accent/12' : ''} ${
              player.isEliminated ? 'opacity-60' : ''
            }`}
          >
            <Avatar
              name={player.name}
              color={player.avatarColor}
              size="sm"
              isConnected={player.isConnected}
              isEliminated={player.isEliminated}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-semibold">{player.name}</span>
                {isSelf && (
                  <span className="rounded-md bg-accent/24 px-1.5 py-px text-[11px] font-semibold text-accent-fg">
                    {t('player.you')}
                  </span>
                )}
                {playerIsHost && (
                  <span
                    className="inline-flex items-center gap-1 rounded-md bg-hint/14 px-1.5 py-px text-[11px] font-semibold text-hint"
                    title={t('player.host')}
                  >
                    <Icon name="crown" className="size-3" />
                    <span className="hidden xl:inline">{t('player.host')}</span>
                  </span>
                )}
              </div>
              <span className={`text-xs ${toneClass[status.tone]}`}>{status.text}</span>
            </div>

            {status.done && (
              <span className="flex size-6 items-center justify-center rounded-full bg-success/16 text-success">
                <Icon name="check" className="size-3.5" />
              </span>
            )}

            {isHost && phase === 'lobby' && !isSelf && onKick && (
              <button
                type="button"
                onClick={() => onKick(player.id)}
                aria-label={`${t('player.kick')}: ${player.name}`}
                title={t('player.kick')}
                className="flex size-9 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-danger/15 hover:text-danger-fg"
              >
                <Icon name="x" className="size-4" />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
