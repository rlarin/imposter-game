'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { GameRoom } from '@/lib/types';
import { usePartySocket } from '@/hooks/usePartySocket';
import { Card } from '@/components/ui';
import LanguageSelector from '@/components/ui/LanguageSelector';
import {
  ClueRound,
  GameOver,
  ImposterGuess,
  LobbyView,
  VoteResults,
  VotingView,
  WordReveal,
} from '@/components/game';
import RoundEnd from '@/components/game/RoundEnd';
import WordChangeResult from '@/components/game/WordChangeResult';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations();
  const roomCode = params.roomCode as string;

  const [room, setRoom] = useState<GameRoom | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wordChangeResult, setWordChangeResult] = useState<{
    passed: boolean;
    newHintsCount: number;
  } | null>(null);
  const hasJoinedRef = useRef(false);

  // Callbacks para el socket
  const handleRoomState = useCallback((newRoom: GameRoom, newPlayerId: string) => {
    setRoom(newRoom);
    setPlayerId(newPlayerId);
    setError(null);
  }, []);

  const handleGameSettings = useCallback((settings: GameRoom['settings']) => {
    setRoom((prevRoom) => (prevRoom ? { ...prevRoom, settings } : null));
  }, []);

  const handleKickPlayer = useCallback(
    (kickedPlayerId: string) => {
      setRoom((prevRoom) =>
        prevRoom
          ? {
              ...prevRoom,
              players: prevRoom.players?.filter((p) => p.id !== kickedPlayerId) || [],
            }
          : null
      );

      if (kickedPlayerId === playerId) {
        setError(t('errors.kickedFromRoom'));
        setTimeout(() => router.push('/'), 3000);
      }
    },
    [playerId, router, t]
  );

  const handlePlayerJoined = useCallback(
    (newPlayer: GameRoom['players'][0]) => {
      setRoom((prevRoom) =>
        prevRoom
          ? {
              ...prevRoom,
              players: [...(prevRoom.players || []), newPlayer],
            }
          : null
      );
    },
    [room?.players]
  );

  const handleError = useCallback((message: string) => {
    setError(message);
  }, []);

  const handleRoomClosed = useCallback(
    (reason: 'host-left') => {
      if (reason === 'host-left') {
        setError(t('errors.hostLeft'));
        setTimeout(() => router.push('/'), 3000);
      }
    },
    [router, t]
  );

  const handleWordChangeVoteResult = useCallback((passed: boolean, newHintsCount: number) => {
    setWordChangeResult({ passed, newHintsCount });
  }, []);

  const {
    isConnected,
    isConnecting,
    join,
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
  } = usePartySocket({
    roomCode,
    onGameSettings: handleGameSettings,
    onRoomState: handleRoomState,
    onPlayerLeft: handleKickPlayer,
    onPlayerJoined: handlePlayerJoined,
    onError: handleError,
    onRoomClosed: handleRoomClosed,
    onWordChangeVoteResult: handleWordChangeVoteResult,
  });

  useEffect(() => {
    // Update room-related state when room changes
    setRoom(room);
  }, [room]);

  // Auto-unirse cuando se conecta
  useEffect(() => {
    if (isConnected && !hasJoinedRef.current) {
      const playerName = localStorage.getItem('playerName');
      if (playerName) {
        hasJoinedRef.current = true;
        join(playerName);
      } else {
        router.push('/');
      }
    }
  }, [isConnected, join, router]);

  // Mostrar estado de carga
  if (isConnecting) {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <Card variant="elevated" padding="lg" className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">{t('game.connecting')}</p>
        </Card>
      </div>
    );
  }

  // Mostrar error de conexión
  if (!isConnected && !isConnecting) {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <Card variant="elevated" padding="lg" className="text-center max-w-md">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('errors.connectionError')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || t('errors.couldNotConnect')}
          </p>
          <button onClick={() => router.push('/')} className="text-indigo-600 hover:underline">
            {t('errors.backToHome')}
          </button>
        </Card>
      </div>
    );
  }

  // Esperando estado de la sala
  if (!room || !playerId) {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <Card variant="elevated" padding="lg" className="text-center">
          <div className="animate-pulse text-4xl mb-4">🎮</div>
          <p className="text-gray-600 dark:text-gray-400">{t('game.loadingRoom')}</p>
        </Card>
      </div>
    );
  }

  const currentPlayer = room.players.find((p) => p.id === playerId);
  const isImposter = currentPlayer?.isImposter ?? false;
  const isHost = playerId === room.hostId;
  const canReset = isHost && room.phase !== 'lobby';

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
    <div className="min-h-screen bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 p-2 sm:p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 mb-4 sm:mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-white/80 hover:text-white transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="hidden sm:inline">{t('common.exit')}</span>
          </button>

          <div className="text-center order-first sm:order-0 w-full sm:w-auto">
            <span className="text-white/60 text-xs sm:text-sm">{t('common.room')}</span>
            <span className="text-white font-mono font-bold ml-1 sm:ml-2 text-sm sm:text-base">
              {roomCode}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {room.phase === 'lobby' && <LanguageSelector variant="compact" />}
            {canReset && (
              <button
                onClick={resetGame}
                className="px-2 py-1 sm:px-3 sm:py-1.5 bg-red-500/80 hover:bg-red-500 text-white text-xs sm:text-sm rounded-lg transition-colors flex items-center gap-1"
                title={t('game.resetGame')}
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="hidden sm:inline">{t('game.resetGame')}</span>
              </button>
            )}
            <div className="flex items-center gap-1 sm:gap-2">
              <span
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}
              />
              <span className="text-white/60 text-xs sm:text-sm">
                {room.players.filter((p) => p.isConnected).length} {t('common.players')}
              </span>
            </div>
          </div>
        </header>

        {/* Error banner */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Contenido principal */}
        <main>{renderPhase()}</main>
      </div>

      {/* Word Change Result Modal */}
      {wordChangeResult && (
        <WordChangeResult
          passed={wordChangeResult.passed}
          newHintsCount={wordChangeResult.newHintsCount}
          onClose={() => setWordChangeResult(null)}
        />
      )}
    </div>
  );
}
