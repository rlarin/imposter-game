'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui';
import { Clue, Player } from '@/lib/types';
import { useLocale } from '@/lib/i18n-context';
import { useClueTranslation } from '@/hooks/useClueTranslation';
import { localeFlags } from '@/i18n/config';

interface CluesByPlayerProps {
  clues: Clue[];
  players: Player[];
  currentRound: number;
  title?: string;
}

function ClueItem({ clue, currentRound }: { clue: Clue; currentRound: number }) {
  const { locale } = useLocale();
  const { translatedWord, isLoading } = useClueTranslation(clue, locale);
  const showOriginalLocale = clue.originalLocale && clue.originalLocale !== locale;

  return (
    <span
      key={`${clue.playerId}-${clue.round}`}
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs sm:text-sm
        ${
          clue.round === currentRound
            ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-300 dark:ring-indigo-600'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        }
      `}
      title={
        showOriginalLocale ? `${clue.word} (${clue.originalLocale?.toUpperCase()})` : undefined
      }
    >
      <span className="opacity-50 text-[10px]">R{clue.round}</span>
      <span className="font-semibold">{isLoading ? clue.word : translatedWord}</span>
      {showOriginalLocale && clue.originalLocale && (
        <span className="text-[10px] opacity-75 ml-0.5">{localeFlags[clue.originalLocale]}</span>
      )}
    </span>
  );
}

export default function CluesByPlayer({ clues, players, currentRound, title }: CluesByPlayerProps) {
  const t = useTranslations();

  // Group clues by player
  const cluesByPlayer = players
    .filter((p) => !p.isEliminated)
    .map((player) => {
      const playerClues = clues
        .filter((c) => c.playerId === player.id)
        .sort((a, b) => a.round - b.round);
      return {
        player,
        clues: playerClues,
      };
    })
    .filter((entry) => entry.clues.length > 0);

  if (cluesByPlayer.length === 0) {
    return null;
  }

  return (
    <Card>
      <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3">
        {title || t('clue.previousClues')}
      </h3>
      <div className="space-y-2">
        {cluesByPlayer.map(({ player, clues: playerClues }) => (
          <div
            key={player.id}
            className="flex items-center gap-2 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            {/* Player name */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: player.avatarColor }}
            >
              {player.name.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-gray-900 dark:text-white text-sm min-w-[80px]">
              {player.name}
            </span>

            {/* Player's clues with round indicators */}
            <div className="flex flex-wrap gap-1.5 flex-1">
              {playerClues.map((clue) => (
                <ClueItem
                  key={`${clue.playerId}-${clue.round}`}
                  clue={clue}
                  currentRound={currentRound}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
