'use client';

import { useTranslations } from 'next-intl';
import { GameRoom } from '@/lib/types';
import { ActionBar, ActionBarSpacer, Avatar, Button } from '@/components/ui';
import { Stage, StageIcon } from './Stage';

interface GameOverProps {
  room: GameRoom;
  playerId: string;
  onPlayAgain: () => void;
}

export default function GameOver({ room, playerId, onPlayAgain }: GameOverProps) {
  const t = useTranslations();
  const isHost = playerId === room.hostId;
  const imposterPlayer = room.players.find((p) => p.id === room.imposterId);
  const currentPlayer = room.players.find((p) => p.id === playerId);
  const wasImposter = currentPlayer?.isImposter ?? false;
  const groupWon = room.winner === 'group';
  const everyoneWasImposter = room.everyoneIsImposter;

  // Determinar si el jugador actual ganó (en troll mode todos "ganan" o "pierden" juntos)
  const playerWon = everyoneWasImposter
    ? true
    : (groupWon && !wasImposter) || (!groupWon && wasImposter);

  // Determinar razón de victoria
  const getWinReason = () => {
    if (everyoneWasImposter) {
      return t('gameOver.trollModeActivated');
    }
    if (groupWon) {
      return room.imposterGuess ? t('gameOver.caughtNoGuess') : t('gameOver.caughtTimeout');
    } else {
      return room.eliminatedPlayerId !== room.imposterId
        ? t('gameOver.wrongElimination')
        : t('gameOver.correctGuess');
    }
  };

  const guessedRight =
    room.imposterGuess && room.imposterGuess.toLowerCase() === room.secretWord?.toLowerCase();

  return (
    <>
      <Stage>
        <StageIcon
          name={everyoneWasImposter ? 'sparkles' : playerWon ? 'trophy' : 'frown'}
          tone={everyoneWasImposter ? 'accent' : playerWon ? 'success' : 'danger'}
          className={playerWon || everyoneWasImposter ? 'animate-bounce' : ''}
        />

        <div>
          <h1
            className={`font-display text-3xl font-bold lg:text-4xl ${
              everyoneWasImposter ? 'text-accent-fg' : groupWon ? 'text-success' : 'text-danger-fg'
            }`}
          >
            {everyoneWasImposter
              ? t('gameOver.everyoneWasImposter')
              : groupWon
                ? t('gameOver.groupWins')
                : t('gameOver.imposterWins')}
          </h1>
          <p className="mt-2 text-lg text-muted">
            {everyoneWasImposter
              ? t('gameOver.trollModeActivated')
              : playerWon
                ? t('gameOver.congrats')
                : t('gameOver.betterLuck')}
          </p>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-2">
          {!everyoneWasImposter && imposterPlayer && (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-danger-fg/35 bg-danger/10 p-4">
              <p className="text-xs font-semibold text-danger-fg">{t('gameOver.imposterWas')}</p>
              <div className="flex items-center gap-2.5">
                <Avatar name={imposterPlayer.name} color={imposterPlayer.avatarColor} size="sm" />
                <span className="font-display text-xl font-bold">{imposterPlayer.name}</span>
              </div>
            </div>
          )}

          <div
            className={`flex flex-col items-center gap-1 rounded-2xl border border-accent-soft/35 bg-accent/16 p-4 ${
              everyoneWasImposter || !imposterPlayer ? 'sm:col-span-2' : ''
            }`}
          >
            <p className="text-xs font-semibold text-accent-fg">{t('gameOver.secretWordWas')}</p>
            <p className="font-display text-2xl font-bold uppercase">{room.secretWord}</p>
            {room.imposterGuess && (
              <p
                className={`text-sm font-semibold ${guessedRight ? 'text-success' : 'text-danger-fg'}`}
              >
                {t('gameOver.imposterGuessed')} {room.imposterGuess} {guessedRight ? '✓' : '✗'}
              </p>
            )}
          </div>
        </div>

        <p className="text-sm text-muted">{getWinReason()}</p>
      </Stage>

      <ActionBar className="lg:mt-5">
        {isHost ? (
          <div className="mx-auto max-w-xl">
            <Button onClick={onPlayAgain} size="lg" className="w-full">
              {t('gameOver.playAgain')}
            </Button>
          </div>
        ) : (
          <div className="mx-auto flex h-14 max-w-xl items-center justify-center gap-2.5 rounded-2xl bg-white/5 text-[15px] text-fg-soft lg:border lg:border-line">
            <span className="size-2 animate-pulse rounded-full bg-accent-soft" />
            {t('gameOver.waitingHost')}
          </div>
        )}
      </ActionBar>
      <ActionBarSpacer />
    </>
  );
}
