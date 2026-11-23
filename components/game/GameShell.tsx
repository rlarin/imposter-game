'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { GameRoom, GameSettings } from '@/lib/types';
import { Locale } from '@/i18n/config';
import { Icon } from '@/components/ui';
import { copyToClipboard } from '@/lib/utils';
import ClueRound from './ClueRound';
import GameOver from './GameOver';
import ImposterGuess from './ImposterGuess';
import LobbyView from './LobbyView';
import VoteResults from './VoteResults';
import VotingView from './VotingView';
import WordReveal from './WordReveal';
import RoundEnd from './RoundEnd';
import WordChangeResult from './WordChangeResult';
import JitsiVideoPanel, { VideoInvite } from './JitsiVideoPanel';
import GameHeader from './GameHeader';
import { HowToCard, InvitePanel, PlayersPanel } from './SidePanels';

export interface GameActions {
  startGame: (category: string, locale?: Locale) => void;
  submitClue: (word: string, locale?: Locale) => void;
  castVote: (targetId: string) => void;
  guessWord: (word: string) => void;
  playAgain: () => void;
  resetGame: () => void;
  kickPlayer: (playerId: string) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  initiateWordChange: () => void;
  voteWordChange: (vote: boolean) => void;
  nextRound: () => void;
}

interface GameShellProps {
  room: GameRoom;
  playerId: string;
  roomCode: string;
  error: string | null;
  actions: GameActions;
  onExit: () => void;
  wordChangeResult: { passed: boolean; newHintsCount: number } | null;
  onCloseWordChangeResult: () => void;
}

export function BackgroundGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden"
    >
      <div className="absolute left-1/2 top-[-260px] h-[560px] w-[1100px] max-w-[200vw] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(124,58,237,0.20),rgba(124,58,237,0))]" />
    </div>
  );
}

/**
 * App shell for an active room: sticky header, players column (lg+), phase content,
 * and a right column with invite / video / tips (xl+). Below xl the video floats.
 */
export default function GameShell({
  room,
  playerId,
  roomCode,
  error,
  actions,
  onExit,
  wordChangeResult,
  onCloseWordChangeResult,
}: GameShellProps) {
  const t = useTranslations();
  const {
    startGame,
    submitClue,
    castVote,
    guessWord,
    playAgain,
    resetGame,
    kickPlayer,
    updateSettings,
    initiateWordChange,
    voteWordChange,
    nextRound,
  } = actions;
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = setTimeout(() => setToast(null), 1800);
  }, []);

  useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    },
    []
  );

  const currentPlayer = room.players.find((p) => p.id === playerId);
  const isImposter = currentPlayer?.isImposter ?? false;
  const isHost = playerId === room.hostId;
  const canReset = isHost && room.phase !== 'lobby';
  const playersOnline = room.players.filter((p) => p.isConnected).length;
  const showHowTo = room.phase === 'lobby' || room.phase === 'word-reveal';

  const handleCopyCode = async () => {
    if (await copyToClipboard(roomCode)) showToast(t('ui.codeCopied'));
  };

  // Renderizar la vista según la fase del juego
  const renderPhase = () => {
    switch (room.phase) {
      case 'lobby':
        return (
          <LobbyView
            room={room}
            playerId={playerId}
            onStartGame={startGame}
            onKickPlayer={kickPlayer}
            onUpdateSettings={updateSettings}
            onCopied={showToast}
          />
        );

      case 'word-reveal':
        return (
          <WordReveal
            secretWord={room.secretWord}
            imposterHint={room.imposterHint}
            isImposter={isImposter}
            category={room.settings.category}
          />
        );

      case 'clue-round':
        return (
          <ClueRound
            room={room}
            playerId={playerId}
            onSubmitClue={submitClue}
            onInitiateWordChange={initiateWordChange}
            onVoteWordChange={voteWordChange}
          />
        );

      case 'round-end':
        return <RoundEnd room={room} isHost={isHost} onNextRound={nextRound} />;

      case 'voting':
        return <VotingView room={room} playerId={playerId} onVote={castVote} />;

      case 'vote-results':
        return <VoteResults room={room} playerId={playerId} />;

      case 'imposter-guess':
        return <ImposterGuess room={room} playerId={playerId} onGuess={guessWord} />;

      case 'game-over':
        return <GameOver room={room} playerId={playerId} onPlayAgain={playAgain} />;

      default:
        return null;
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col">
      <BackgroundGlow />

      <GameHeader
        roomCode={roomCode}
        phase={room.phase}
        playersOnline={playersOnline}
        isVideoOpen={isVideoOpen}
        onToggleVideo={() => setIsVideoOpen((v) => !v)}
        canReset={canReset}
        onReset={resetGame}
        onExit={onExit}
        onCopyCode={handleCopyCode}
      />

      <div className="relative mx-auto grid w-full max-w-[1440px] flex-1 items-start gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)] lg:py-6 xl:grid-cols-[280px_minmax(0,1fr)_340px]">
        {/* Left column: players (desktop) */}
        <aside className="sticky top-[88px] hidden lg:block">
          <PlayersPanel room={room} playerId={playerId} onKick={kickPlayer} />
        </aside>

        {/* Center: current phase */}
        <main className="min-w-0">
          {error && (
            <div
              role="alert"
              className="mb-4 flex items-center gap-2 rounded-2xl border border-danger-fg/40 bg-danger/12 p-3 text-sm text-danger-fg"
            >
              <Icon name="alert" className="size-4" />
              {error}
            </div>
          )}
          <div key={room.phase} className="animate-fade-in">
            {renderPhase()}
          </div>
        </main>

        {/* Right column (xl): invite / video / tips. Below xl the video floats instead. */}
        <aside className="contents xl:sticky xl:top-[88px] xl:flex xl:flex-col xl:gap-4">
          {room.phase === 'lobby' && (
            <div className="hidden xl:block">
              <InvitePanel roomCode={roomCode} onCopied={showToast} />
            </div>
          )}
          <JitsiVideoPanel
            roomCode={roomCode}
            playerName={currentPlayer?.name || 'Player'}
            isOpen={isVideoOpen}
            onClose={() => setIsVideoOpen(false)}
          />
          {!isVideoOpen && room.phase !== 'lobby' && (
            <div className="hidden xl:block">
              <VideoInvite onJoin={() => setIsVideoOpen(true)} />
            </div>
          )}
          {showHowTo && (
            <div className="hidden xl:block">
              <HowToCard />
            </div>
          )}
        </aside>
      </div>

      {/* Word Change Result Modal */}
      {wordChangeResult && (
        <WordChangeResult
          passed={wordChangeResult.passed}
          newHintsCount={wordChangeResult.newHintsCount}
          onClose={onCloseWordChangeResult}
        />
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-28 left-1/2 z-50 flex -translate-x-1/2 animate-rise items-center gap-2 whitespace-nowrap rounded-full bg-fg px-4 py-2.5 text-sm font-semibold text-ink shadow-[0_10px_30px_rgba(0,0,0,0.4)] lg:bottom-8"
        >
          <Icon name="check" className="size-4 text-emerald-600" />
          {toast}
        </div>
      )}
    </div>
  );
}
