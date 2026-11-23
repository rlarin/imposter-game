'use client';

import { useTranslations } from 'next-intl';
import { ActionBar, ActionBarSpacer, Button } from '@/components/ui';
import { GameRoom } from '@/lib/types';
import CluesByPlayer from './CluesByPlayer';

interface RoundEndProps {
  room: GameRoom;
  isHost: boolean;
  onNextRound: () => void;
}

export default function RoundEnd({ room, isHost, onNextRound }: RoundEndProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold lg:text-3xl">
          {t('roundEnd.title', { round: room.currentRound })}
        </h1>
        <p className="mt-1 text-sm text-muted lg:text-[15px]">
          {t('roundEnd.subtitle', {
            current: room.currentRound,
            total: room.settings.clueRounds,
          })}
        </p>
      </div>

      <CluesByPlayer
        clues={room.clues}
        players={room.players}
        currentRound={room.currentRound}
        title={t('clue.allClues')}
      />

      <ActionBar>
        {isHost ? (
          <div className="lg:flex lg:justify-end">
            <Button onClick={onNextRound} size="lg" className="w-full lg:w-auto lg:min-w-64">
              {t('roundEnd.nextRound')}
            </Button>
          </div>
        ) : (
          <div className="flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-white/5 text-[15px] text-fg-soft lg:border lg:border-line">
            <span className="size-2 animate-pulse rounded-full bg-accent-soft" />
            {t('roundEnd.waitingForHost')}
          </div>
        )}
      </ActionBar>
      <ActionBarSpacer />
    </div>
  );
}
