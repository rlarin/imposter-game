'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { GameRoom } from '@/lib/types';
import { usePartySocket } from '@/hooks/usePartySocket';
import { Card, Icon } from '@/components/ui';
import GameShell, { BackgroundGlow } from '@/components/game/GameShell';

function CenteredState({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center p-4">
      <BackgroundGlow />
      <Card variant="elevated" padding="lg" className="relative w-full max-w-sm text-center">
        {children}
      </Card>
    </div>
  );
}

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
        const localeStr = localStorage.getItem('locale') as any;
        join(playerName, localeStr);
      } else {
        router.push('/');
      }
    }
  }, [isConnected, join, router]);

  // Mostrar estado de carga
  if (isConnecting) {
    return (
      <CenteredState>
        <div className="mx-auto mb-4 size-10 animate-spin rounded-full border-4 border-accent/30 border-t-accent-soft" />
        <p className="text-muted">{t('game.connecting')}</p>
      </CenteredState>
    );
  }

  // Mostrar error de conexión
  if (!isConnected && !isConnecting) {
    return (
      <CenteredState>
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-danger/15 text-danger-fg">
          <Icon name="alert" className="size-7" />
        </div>
        <h2 className="mb-2 font-display text-xl font-bold">{t('errors.connectionError')}</h2>
        <p className="mb-5 text-muted">{error || t('errors.couldNotConnect')}</p>
        <button
          onClick={() => router.push('/')}
          className="font-semibold text-accent-fg hover:underline"
        >
          {t('errors.backToHome')}
        </button>
      </CenteredState>
    );
  }

  // Esperando estado de la sala
  if (!room || !playerId) {
    return (
      <CenteredState>
        <div className="mx-auto mb-4 size-10 animate-spin rounded-full border-4 border-accent/30 border-t-accent-soft" />
        <p className="text-muted">{t('game.loadingRoom')}</p>
      </CenteredState>
    );
  }

  return (
    <GameShell
      room={room}
      playerId={playerId}
      roomCode={roomCode}
      error={error}
      actions={{
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
      }}
      onExit={() => router.push('/')}
      wordChangeResult={wordChangeResult}
      onCloseWordChangeResult={() => setWordChangeResult(null)}
    />
  );
}
