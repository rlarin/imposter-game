'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { GameRoom } from '@/lib/types';
import { usePartySocket } from '@/hooks/usePartySocket';
import { Card } from '@/components/ui';
import LanguageSelector from '@/components/ui/LanguageSelector';
import {
  LobbyView,
  WordReveal,
  ClueRound,
  VotingView,
  VoteResults,
  ImposterGuess,
  GameOver
} from '@/components/game';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations();
  const roomCode = params.roomCode as string;

  const [room, setRoom] = useState<GameRoom | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasJoinedRef = useRef(false);

  // Callbacks para el socket
  const handleRoomState = useCallback((newRoom: GameRoom, newPlayerId: string) => {
    setRoom(newRoom);
    setPlayerId(newPlayerId);
    setError(null);
  }, []);

  const handleError = useCallback((message: string) => {
    setError(message);
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
    kickPlayer,
    updateSettings
  } = usePartySocket({
    roomCode,
    onRoomState: handleRoomState,
    onError: handleError
  });

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <Card variant="elevated" padding="lg" className="text-center max-w-md">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('errors.connectionError')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || t('errors.couldNotConnect')}
          </p>
          <button
            onClick={() => router.push('/')}
            className="text-indigo-600 hover:underline"
          >
            {t('errors.backToHome')}
          </button>
        </Card>
      </div>
    );
  }

  // Esperando estado de la sala
  if (!room || !playerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <Card variant="elevated" padding="lg" className="text-center">
          <div className="animate-pulse text-4xl mb-4">🎮</div>
          <p className="text-gray-600 dark:text-gray-400">{t('game.loadingRoom')}</p>
        </Card>
      </div>
    );
  }

  const currentPlayer = room.players.find(p => p.id === playerId);
  const isImposter = currentPlayer?.isImposter ?? false;

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
          />
        );

      case 'voting':
        return (
          <VotingView
            room={room}
            playerId={playerId}
            onVote={castVote}
          />
        );

      case 'vote-results':
        return (
          <VoteResults
            room={room}
            playerId={playerId}
          />
        );

      case 'imposter-guess':
        return (
          <ImposterGuess
            room={room}
            playerId={playerId}
            onGuess={guessWord}
          />
        );

      case 'game-over':
        return (
          <GameOver
            room={room}
            playerId={playerId}
            onPlayAgain={playAgain}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-2 sm:p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 mb-4 sm:mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-white/80 hover:text-white transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">{t('common.exit')}</span>
          </button>

          <div className="text-center order-first sm:order-none w-full sm:w-auto">
            <span className="text-white/60 text-xs sm:text-sm">{t('common.room')}</span>
            <span className="text-white font-mono font-bold ml-1 sm:ml-2 text-sm sm:text-base">{roomCode}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {room.phase === 'lobby' && (
              <LanguageSelector variant="compact" />
            )}
            <div className="flex items-center gap-1 sm:gap-2">
              <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-white/60 text-xs sm:text-sm">
                {room.players.filter(p => p.isConnected).length} {t('common.players')}
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
        <main>
          {renderPhase()}
        </main>
      </div>
    </div>
  );
}
