'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { GameRoom } from '@/lib/types';
import { Button, Input, Timer } from '@/components/ui';
import { Stage, StageIcon } from './Stage';

interface ImposterGuessProps {
  room: GameRoom;
  playerId: string;
  onGuess: (word: string) => void;
}

export default function ImposterGuess({ room, playerId, onGuess }: ImposterGuessProps) {
  const t = useTranslations();
  const [guess, setGuess] = useState('');

  const isImposter = playerId === room.imposterId;
  const imposterPlayer = room.players.find((p) => p.id === room.imposterId);

  const handleSubmit = () => {
    if (guess.trim()) {
      onGuess(guess.trim());
    }
  };

  return (
    <Stage>
      {isImposter ? (
        <>
          <StageIcon name="target" tone="danger" />
          <div>
            <h1 className="font-display text-2xl font-bold lg:text-3xl">
              {t('imposterGuess.lastChance')}
            </h1>
            <p className="mt-1.5 text-muted">{t('imposterGuess.discovered')}</p>
          </div>
          <Timer endTime={room.phaseEndsAt} />
          <form
            className="flex w-full flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <Input
              label={t('imposterGuess.whatWasWord')}
              hideLabel
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder={t('imposterGuess.whatWasWord')}
              className="text-center text-lg"
              autoComplete="off"
              autoFocus
            />
            <Button type="submit" size="lg" disabled={!guess.trim()} className="w-full">
              {t('imposterGuess.guess')}
            </Button>
          </form>
          <p className="text-sm text-muted">
            {t('game.category')}: {t(`categories.${room.settings.category}`)}
          </p>
        </>
      ) : (
        <>
          <StageIcon name="hourglass" tone="hint" />
          <div>
            <h1 className="font-display text-2xl font-bold lg:text-3xl">
              {t('imposterGuess.waiting')}
            </h1>
            <p className="mt-1.5 text-muted">
              {t('imposterGuess.lastChanceDesc', { name: imposterPlayer?.name || '' })}
            </p>
          </div>
          <Timer endTime={room.phaseEndsAt} />
          <div className="w-full rounded-2xl border border-accent-soft/35 bg-accent/16 p-4">
            <p className="text-xs font-semibold text-accent-fg">{t('imposterGuess.wordWas')}</p>
            <p className="font-display text-3xl font-bold uppercase">{room.secretWord}</p>
          </div>
          <p className="animate-pulse text-sm text-muted">{t('imposterGuess.ifGuesses')}</p>
        </>
      )}
    </Stage>
  );
}
