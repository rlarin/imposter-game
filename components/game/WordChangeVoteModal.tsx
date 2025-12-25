'use client';

import { useTranslations } from 'next-intl';
import { Button, Card } from '@/components/ui';
import { GameRoom } from '@/lib/types';

interface WordChangeVoteModalProps {
  room: GameRoom;
  playerId: string;
  onVote: (vote: boolean) => void;
}

export default function WordChangeVoteModal({ room, playerId, onVote }: WordChangeVoteModalProps) {
  const t = useTranslations();

  const currentPlayer = room.players.find(p => p.id === playerId);
  const hasVoted = currentPlayer?.hasVotedWordChange ?? false;
  const initiator = room.players.find(p => p.id === room.wordChangeInitiatorId);

  // Contar votos emitidos
  const activePlayers = room.players.filter(p => p.isConnected && !p.isEliminated);
  const votedCount = activePlayers.filter(p => p.hasVotedWordChange).length;
  const totalPlayers = activePlayers.length;

  if (!room.wordChangeVotingActive) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full bg-white dark:bg-gray-800 shadow-2xl">
        <div className="text-center space-y-4">
          {/* Header */}
          <div className="text-4xl">🔄</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('wordChange.title')}
          </h2>

          {/* Iniciador */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('wordChange.initiatedBy', { name: initiator?.name || '?' })}
          </p>

          {/* Descripción */}
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t('wordChange.description')}
          </p>

          {/* Aviso para el impostor */}
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              {t('wordChange.imposterWarning')}
            </p>
          </div>

          {/* Contador de votos */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t('wordChange.votesProgress', { voted: votedCount, total: totalPlayers })}
          </div>

          {/* Botones de voto o confirmación */}
          {!hasVoted ? (
            <div className="flex gap-3">
              <Button
                onClick={() => onVote(true)}
                variant="primary"
                className="flex-1"
              >
                {t('wordChange.voteYes')}
              </Button>
              <Button
                onClick={() => onVote(false)}
                variant="secondary"
                className="flex-1"
              >
                {t('wordChange.voteNo')}
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl mb-1">✓</div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                {t('wordChange.voteSubmitted')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('wordChange.waitingOthers')}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
