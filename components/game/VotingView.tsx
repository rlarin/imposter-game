'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { GameRoom } from '@/lib/types';
import { ActionBar, ActionBarSpacer, Avatar, Button, Icon, Timer } from '@/components/ui';
import { ClueChip } from './CluesByPlayer';

interface VotingViewProps {
  room: GameRoom;
  playerId: string;
  onVote: (targetId: string) => void;
}

export default function VotingView({ room, playerId, onVote }: VotingViewProps) {
  const t = useTranslations();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const currentPlayer = room.players.find((p) => p.id === playerId);
  const hasVoted = currentPlayer?.hasVoted ?? false;

  // Jugadores que pueden ser votados (conectados, no eliminados, no soy yo)
  const votablePlayers = room.players.filter(
    (p) => p.isConnected && !p.isEliminated && p.id !== playerId
  );

  const handleVote = () => {
    if (selectedId) {
      onVote(selectedId);
    }
  };

  const activePlayers = room.players.filter((p) => p.isConnected && !p.isEliminated);
  const votedCount = activePlayers.filter((p) => p.hasVoted).length;
  const selectedPlayer = votablePlayers.find((p) => p.id === selectedId);
  const myVote = room.votes?.find((v) => v.voterId === playerId);
  const votedFor = room.players.find((p) => p.id === myVote?.targetId);

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold lg:text-3xl">{t('ui.whoIsImposter')}</h1>
          <p className="mt-1 text-sm text-muted lg:text-[15px]">{t('ui.voteHelp')}</p>
        </div>
        <Timer endTime={room.phaseEndsAt} />
      </div>

      <div
        role="radiogroup"
        aria-label={t('voting.selectSuspect')}
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:gap-3 xl:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]"
      >
        {votablePlayers.map((player) => {
          const selected = selectedId === player.id;
          const playerClues = room.clues
            .filter((c) => c.playerId === player.id)
            .sort((a, b) => a.round - b.round);
          return (
            <button
              key={player.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={hasVoted}
              onClick={() => setSelectedId(player.id)}
              className={`relative flex flex-col items-center gap-2 rounded-[18px] border-[1.5px] px-2.5 py-4 text-center transition-colors disabled:cursor-default lg:gap-2.5 lg:py-5 ${
                selected
                  ? 'border-danger-fg bg-danger/16'
                  : 'border-white/8 bg-surface enabled:hover:border-white/20'
              }`}
            >
              <Avatar name={player.name} color={player.avatarColor} size="md" />
              <span className="max-w-full truncate text-[15px] font-semibold">{player.name}</span>
              <div className="flex flex-wrap justify-center gap-1">
                {playerClues.length > 0 ? (
                  playerClues.map((clue) => (
                    <ClueChip key={`${clue.playerId}-${clue.round}`} clue={clue} size="sm" />
                  ))
                ) : (
                  <span className="text-xs text-subtle">{t('ui.noClue')}</span>
                )}
              </div>
              {selected && (
                <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-danger text-white">
                  <Icon name="check" className="size-3.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Voting progress */}
      <div className="flex items-center gap-3 rounded-2xl border border-white/6 bg-surface p-3">
        <div className="flex">
          {activePlayers.map((player) => (
            <span
              key={player.id}
              title={player.name}
              className={`-mr-1.5 flex size-7 items-center justify-center rounded-full border-2 border-surface text-[11px] font-bold text-white ${
                player.hasVoted ? '' : 'opacity-40 grayscale'
              }`}
              style={{ backgroundColor: player.avatarColor }}
            >
              {player.name.charAt(0).toUpperCase()}
            </span>
          ))}
        </div>
        <span className="ml-2 text-[13px] text-muted">
          {t('ui.votedCount', { voted: votedCount, total: activePlayers.length })}
        </span>
      </div>

      <ActionBar>
        {!hasVoted ? (
          <div className="lg:flex lg:justify-end">
            <Button
              onClick={handleVote}
              disabled={!selectedId}
              variant="danger"
              size="lg"
              className="w-full lg:w-auto lg:min-w-64"
            >
              {selectedPlayer
                ? t('ui.voteFor', { name: selectedPlayer.name })
                : t('ui.pickSuspect')}
            </Button>
          </div>
        ) : (
          <div className="flex min-h-14 items-center gap-3 lg:rounded-[20px] lg:border lg:border-success/35 lg:bg-success/8 lg:p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success/16 text-success">
              <Icon name="check" className="size-5" />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[15px] font-semibold text-success">
                {votedFor ? `${t('ui.youVoted')}: ${votedFor.name}` : t('voting.voteRegistered')}
              </span>
              <span className="text-[13px] text-muted">{t('clue.waiting')}</span>
            </div>
          </div>
        )}
      </ActionBar>
      <ActionBarSpacer />
    </div>
  );
}
