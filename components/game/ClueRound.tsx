'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { GameRoom } from '@/lib/types';
import { ActionBar, ActionBarSpacer, Button, Card, Icon, Input, Timer } from '@/components/ui';
import { validateClue } from '@/lib/utils';
import { useLocale } from '@/lib/i18n-context';
import { Locale } from '@/i18n/config';
import { getCategoryById } from '@/lib/words/index';
import { translateText } from '@/lib/translation-service';
import WordChangeVoteModal from './WordChangeVoteModal';
import CluesByPlayer from './CluesByPlayer';

interface ClueRoundProps {
  room: GameRoom;
  playerId: string;
  onSubmitClue: (word: string, locale?: Locale) => void;
  onInitiateWordChange: () => void;
  onVoteWordChange: (vote: boolean) => void;
}

export default function ClueRound({
  room,
  playerId,
  onSubmitClue,
  onInitiateWordChange,
  onVoteWordChange,
}: ClueRoundProps) {
  const t = useTranslations();
  const { locale } = useLocale();

  const [translatedSecretWord, setTranslatedSecretWord] = useState<string | null>(null);
  const [clue, setClue] = useState('');
  const [error, setError] = useState('');

  // Traducir palabra secreta cuando cambia
  useEffect(() => {
    if (!room.secretWord) return;

    const hostLocale: Locale = 'es'; // Asumir que el host usa español

    // Si es el mismo idioma, no traducir ni tocar estado
    if (locale === hostLocale) {
      return;
    }

    translateText(room.secretWord, locale, hostLocale)
      .then((translated) => {
        setTranslatedSecretWord(translated);
      })
      .catch(() => {
        // ignore errors; keep original
      });
  }, [room.secretWord, locale]);

  const currentPlayer = room.players.find((p) => p.id === playerId);
  const hasSubmitted = currentPlayer?.hasSubmittedClue ?? false;
  const isImposter = currentPlayer?.isImposter ?? false;
  const category = getCategoryById(locale, room.settings.category);

  // Word change voting state
  const canInitiateWordChange =
    !room.wordChangeUsed && !room.wordChangeVotingActive && !currentPlayer?.isEliminated;
  const showVotingModal = room.wordChangeVotingActive;

  const handleSubmit = () => {
    const trimmed = clue.trim();

    // Para el impostor, no validar contra la palabra secreta
    if (!isImposter && room.secretWord) {
      const validation = validateClue(trimmed, room.secretWord);
      if (!validation.valid) {
        setError(validation.errorKey ? t(validation.errorKey) : t('validation.invalidClue'));
        return;
      }
    }

    if (trimmed.length === 0) {
      setError(t('validation.writeClue'));
      return;
    }

    if (trimmed.includes(' ')) {
      setError(t('validation.clueSingleWord'));
      return;
    }

    setError('');
    onSubmitClue(trimmed, locale);
    setClue('');
  };

  const activePlayers = room.players.filter((p) => p.isConnected && !p.isEliminated);
  const doneCount = activePlayers.filter((p) => p.hasSubmittedClue).length;
  const myClue = room.clues.find((c) => c.playerId === playerId && c.round === room.currentRound);
  const imposterHints =
    room.imposterHints && room.imposterHints.length > 0
      ? room.imposterHints
      : room.imposterHint
        ? [room.imposterHint]
        : [];

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      {/* Secret word / imposter banner */}
      {isImposter ? (
        <Card variant="danger" className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-danger-fg">
              <Icon name="eyeOff" className="size-4" />
              {t('game.youAreImposter')}
            </span>
            {imposterHints.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted">{t('game.imposterHintLabel')}</span>
                {imposterHints.map((hint, i) => (
                  <span
                    key={i}
                    className="font-display text-xl font-bold uppercase text-hint lg:text-2xl"
                  >
                    {hint}
                  </span>
                ))}
              </div>
            ) : (
              <span className="font-display text-lg font-semibold">{t('clue.imposterHint')}</span>
            )}
          </div>
          <span className="flex h-8 items-center rounded-full bg-white/8 px-3 text-xs text-fg-soft">
            {category?.name}
          </span>
        </Card>
      ) : (
        room.secretWord && (
          <Card variant="accent" className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-xs font-semibold text-accent-fg">{t('ui.yourWord')}</span>
              <span className="break-words font-display text-[26px] font-bold uppercase leading-tight lg:text-3xl">
                {translatedSecretWord || room.secretWord}
              </span>
            </div>
            <span className="flex h-8 items-center rounded-full bg-white/8 px-3 text-xs text-fg-soft">
              {category?.name}
            </span>
          </Card>
        )
      )}

      {/* Round status */}
      <div className="flex items-center gap-3">
        <h2 className="flex-1 font-display text-lg font-semibold lg:text-xl">
          {t('game.round', { current: room.currentRound, total: room.settings.clueRounds })}
        </h2>
        <span className="text-[13px] text-muted">
          {t('ui.submittedCount', { done: doneCount, total: activePlayers.length })}
        </span>
        <Timer endTime={room.phaseEndsAt} />
      </div>

      <CluesByPlayer
        clues={room.clues}
        players={room.players}
        currentRound={room.currentRound}
        currentPlayerId={playerId}
        showPending
      />

      {canInitiateWordChange && (
        <button
          type="button"
          onClick={onInitiateWordChange}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-dashed border-accent-soft/40 px-4 py-2 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent/10"
          title={t('wordChange.initiateHint')}
        >
          <Icon name="refresh" className="size-4" />
          {t('wordChange.initiateButton')}
        </button>
      )}
      {room.wordChangeUsed && !room.wordChangeVotingActive && (
        <p className="text-center text-xs text-subtle">{t('wordChange.alreadyUsed')}</p>
      )}

      {/* Clue input */}
      <ActionBar>
        {!hasSubmitted ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex items-start gap-2 lg:items-end lg:gap-3 lg:rounded-[20px] lg:border lg:border-accent-soft/30 lg:bg-surface lg:p-4"
          >
            <div className="min-w-0 flex-1">
              <Input
                label={t('ui.yourClueRound', { round: room.currentRound })}
                hideLabel
                value={clue}
                onChange={(e) => {
                  setClue(e.target.value.replace(/\s/g, ''));
                  if (error) setError('');
                }}
                placeholder={t('clue.placeholder')}
                maxLength={20}
                error={error}
                autoComplete="off"
                enterKeyHint="send"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={!clue.trim()}
              aria-label={t('clue.submit')}
              className="w-14 shrink-0 px-0! lg:w-auto lg:px-7!"
            >
              <Icon name="send" />
              <span className="hidden lg:inline">{t('clue.submit')}</span>
            </Button>
          </form>
        ) : (
          <div className="flex min-h-14 items-center gap-3 lg:rounded-[20px] lg:border lg:border-success/35 lg:bg-success/8 lg:p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success/16 text-success">
              <Icon name="check" className="size-5" />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[15px] font-semibold text-success">
                {myClue ? t('ui.clueSent', { word: myClue.word }) : t('clue.submitted')}
              </span>
              <span className="text-[13px] text-muted">{t('clue.waiting')}</span>
            </div>
          </div>
        )}
      </ActionBar>
      <ActionBarSpacer />

      {showVotingModal && (
        <WordChangeVoteModal room={room} playerId={playerId} onVote={onVoteWordChange} />
      )}
    </div>
  );
}
