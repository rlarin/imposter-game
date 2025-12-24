'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GameRoom } from '@/lib/types';
import { usePartySocket } from '@/hooks/usePartySocket';
import { Card } from '@/components/ui';
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
          <p className="text-gray-600 dark:text-gray-400">Conectando...</p>
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
            Error de conexión
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || 'No se pudo conectar al servidor'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="text-indigo-600 hover:underline"
          >
            Volver al inicio
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
          <p className="text-gray-600 dark:text-gray-400">Cargando sala...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Salir
          </button>

          <div className="text-center">
            <span className="text-white/60 text-sm">Sala</span>
            <span className="text-white font-mono font-bold ml-2">{roomCode}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-white/60 text-sm">
              {room.players.filter(p => p.isConnected).length} jugadores
            </span>
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
