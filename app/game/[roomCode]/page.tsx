'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { GameRoom } from '@/lib/types';
import { usePartySocket } from '@/hooks/usePartySocket';
import { Card, LikeButton } from '@/components/ui';
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
import JitsiVideoPanel from '@/components/game/JitsiVideoPanel';

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
  const [isVideoOpen, setIsVideoOpen] = useState(false);
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
    <div
      className={`min-h-screen bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 p-2 sm:p-4 transition-all duration-300 ${
        isVideoOpen ? 'pt-[calc(35vh+8px)] sm:pt-[calc(30vh+16px)]' : ''
      }`}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
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
            <a
              href="https://www.buymeacoffee.com/rlarin"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-50 hover:opacity-100 transition-opacity"
            >
              <img
                src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=rlarin&button_colour=FFDD00&font_colour=000000&font_family=Inter&outline_colour=000000&coffee_colour=ffffff"
                alt="Buy me a coffee"
                className="h-5 sm:h-6"
              />
            </a>
          </div>

          <div className="text-center order-first sm:order-0 w-full sm:w-auto">
            <span className="text-white/60 text-xs sm:text-sm">{t('common.room')}</span>
            <span className="text-white font-mono font-bold ml-1 sm:ml-2 text-sm sm:text-base">
              {roomCode}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Video toggle button */}
            <button
              onClick={() => setIsVideoOpen(!isVideoOpen)}
              className={`px-3 py-1 sm:px-4 sm:py-2 ${
                isVideoOpen
                  ? 'bg-green-500/80 hover:bg-green-500'
                  : 'bg-indigo-500/80 hover:bg-indigo-500'
              } text-white text-sm sm:text-base rounded-xl transition-colors flex items-center gap-1.5`}
              title={t('video.toggle')}
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className="hidden sm:inline">
                {isVideoOpen ? t('video.on') : t('video.off')}
              </span>
            </button>
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
            <div className="relative">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white/80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[10px] sm:text-xs font-bold rounded-full min-w-[16px] h-4 sm:min-w-[18px] sm:h-[18px] flex items-center justify-center px-1">
                {room.players.filter((p) => p.isConnected).length}
              </span>
            </div>
            <LikeButton />
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

      {/* Jitsi Video Panel */}
      <JitsiVideoPanel
        roomCode={roomCode}
        playerName={currentPlayer?.name || 'Player'}
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
      />
    </div>
  );
}
