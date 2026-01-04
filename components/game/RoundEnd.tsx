'use client';

import { useTranslations } from 'next-intl';
import { Card, Button } from '@/components/ui';
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
    <div className="space-y-4 sm:space-y-6">
      <Card className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('roundEnd.title', { round: room.currentRound })}
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          {t('roundEnd.subtitle', {
            current: room.currentRound,
            total: room.settings.clueRounds,
          })}
        </p>
      </Card>

      {/* All clues grouped by player */}
      <CluesByPlayer
        clues={room.clues}
        players={room.players}
        currentRound={room.currentRound}
        title={t('clue.allClues')}
      />

      {/* Next round button - only for host */}
      {isHost ? (
        <Button onClick={onNextRound} size="lg" className="w-full">
          {t('roundEnd.nextRound')}
        </Button>
      ) : (
        <Card className="text-center">
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {t('roundEnd.waitingForHost')}
          </p>
        </Card>
      )}
    </div>
  );
}
