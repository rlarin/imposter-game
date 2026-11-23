'use client';

import { useTranslations } from 'next-intl';
import { Avatar, Icon } from '@/components/ui';
import { Clue, Player } from '@/lib/types';
import { useLocale } from '@/lib/i18n-context';
import { useClueTranslation } from '@/hooks/useClueTranslation';
import { localeFlags } from '@/i18n/config';

interface CluesByPlayerProps {
  clues: Clue[];
  players: Player[];
  currentRound: number;
  currentPlayerId?: string;
  /** Show a "thinking…" placeholder for players that have not sent the current round's clue. */
  showPending?: boolean;
  title?: string;
}

export function ClueChip({
  clue,
  highlight = false,
  size = 'md',
}: {
  clue: Clue;
  highlight?: boolean;
  size?: 'sm' | 'md';
}) {
  const { locale } = useLocale();
  const { translatedWord, isLoading } = useClueTranslation(clue, locale);
  const showOriginalLocale = clue.originalLocale && clue.originalLocale !== locale;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-[13px]'
      } ${highlight ? 'bg-accent/24 font-semibold text-[#ede9fe]' : 'bg-white/6 text-gray-300'}`}
      title={
        showOriginalLocale ? `${clue.word} (${clue.originalLocale?.toUpperCase()})` : undefined
      }
    >
      <span className="text-[10px] font-semibold text-subtle">R{clue.round}</span>
      <span>{isLoading ? clue.word : translatedWord}</span>
      {showOriginalLocale && clue.originalLocale && (
        <span className="text-[10px] opacity-75">{localeFlags[clue.originalLocale]}</span>
      )}
    </span>
  );
}

export default function CluesByPlayer({
  clues,
  players,
  currentRound,
  currentPlayerId,
  showPending = false,
  title,
}: CluesByPlayerProps) {
  const t = useTranslations();

  const rows = players
    .filter((p) => !p.isEliminated && (p.isConnected || clues.some((c) => c.playerId === p.id)))
    .map((player) => ({
      player,
      clues: clues.filter((c) => c.playerId === player.id).sort((a, b) => a.round - b.round),
    }))
    .filter((row) => showPending || row.clues.length > 0);

  if (rows.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      {title && <h2 className="font-display text-lg font-semibold">{title}</h2>}
      <ul className="grid gap-2 sm:grid-cols-2 sm:gap-3 2xl:grid-cols-3">
        {rows.map(({ player, clues: playerClues }) => {
          const isSelf = player.id === currentPlayerId;
          const done = playerClues.some((c) => c.round === currentRound);
          return (
            <li
              key={player.id}
              className={`flex items-center gap-3 rounded-2xl border bg-surface p-3 ${
                isSelf ? 'border-accent-soft/45' : 'border-white/6'
              }`}
            >
              <Avatar name={player.name} color={player.avatarColor} size="sm" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="truncate text-sm font-semibold">
                  {isSelf ? t('player.you') : player.name}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {playerClues.map((clue) => (
                    <ClueChip
                      key={`${clue.playerId}-${clue.round}`}
                      clue={clue}
                      highlight={clue.round === currentRound}
                    />
                  ))}
                  {showPending && !done && (
                    <span className="inline-flex animate-pulse items-center rounded-lg border border-dashed border-white/22 px-2.5 py-0.5 text-[13px] text-subtle">
                      {isSelf ? t('ui.yourTurn') : t('ui.thinking')}
                    </span>
                  )}
                </div>
              </div>
              {showPending && done && (
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-full bg-success/16 text-success"
                  title={t('player.clueSubmitted')}
                >
                  <Icon name="check" className="size-4" />
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
