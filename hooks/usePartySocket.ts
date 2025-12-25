'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import PartySocket from 'partysocket';
import { GameRoom, ClientMessage, ServerMessage } from '@/lib/types';

const PARTYKIT_HOST = process.env.NEXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999';

interface UsePartySocketOptions {
  roomCode: string;
  onGameSettings?: (settings: GameRoom['settings']) => void;
  onRoomState?: (room: GameRoom, playerId: string) => void;
  onError?: (message: string) => void;
  onPlayerJoined?: (player: GameRoom['players'][0]) => void;
  onPlayerLeft?: (playerId: string) => void;
  onPhaseChanged?: (phase: GameRoom['phase']) => void;
  onRoomClosed?: (reason: 'host-left') => void;
  onWordChangeVoteStarted?: (initiatorId: string, initiatorName: string) => void;
  onWordChangeVoteCast?: (voterId: string) => void;
  onWordChangeVoteResult?: (passed: boolean, newHintsCount: number) => void;
}

type ConnectionState = 'connecting' | 'connected' | 'disconnected';

export function usePartySocket({
  roomCode,
  onGameSettings,
  onRoomState,
  onError,
  onPlayerJoined,
  onPlayerLeft,
  onPhaseChanged,
  onRoomClosed,
  onWordChangeVoteStarted,
  onWordChangeVoteCast,
  onWordChangeVoteResult
}: UsePartySocketOptions) {
  const socketRef = useRef<PartySocket | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');

  // Refs para callbacks para evitar re-renders
  const callbacksRef = useRef({
    onRoomState,
    onGameSettings,
    onError,
    onPlayerJoined,
    onPlayerLeft,
    onPhaseChanged,
    onRoomClosed,
    onWordChangeVoteStarted,
    onWordChangeVoteCast,
    onWordChangeVoteResult
  });

  // Actualizar refs cuando cambian los callbacks
  useEffect(() => {
    callbacksRef.current = {
      onRoomState,
      onGameSettings,
      onError,
      onPlayerJoined,
      onPlayerLeft,
      onPhaseChanged,
      onRoomClosed,
      onWordChangeVoteStarted,
      onWordChangeVoteCast,
      onWordChangeVoteResult
    };
  }, [onRoomState, onGameSettings, onError, onPlayerJoined, onPlayerLeft, onPhaseChanged, onRoomClosed, onWordChangeVoteStarted, onWordChangeVoteCast, onWordChangeVoteResult]);

  // Conectar al servidor
  useEffect(() => {
    if (!roomCode) return;

    const socket = new PartySocket({
      host: PARTYKIT_HOST,
      room: roomCode
    });

    socketRef.current = socket;

    const handleOpen = () => {
      setConnectionState('connected');
    };

    const handleClose = () => {
      setConnectionState('disconnected');
    };

    const handleError = () => {
      setConnectionState('disconnected');
      callbacksRef.current.onError?.('Error de conexión');
    };

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data) as ServerMessage;

        switch (message.type) {
          case 'settings-updated':
            callbacksRef.current.onGameSettings?.(message.settings);
            break;

          case 'room-state':
            callbacksRef.current.onRoomState?.(message.room, message.playerId);
            break;

          case 'player-joined':
            callbacksRef.current.onPlayerJoined?.(message.player);
            break;

          case 'player-left':
          case 'player-kicked':
            callbacksRef.current.onPlayerLeft?.(message.playerId);
            break;

          case 'room-closed':
            callbacksRef.current.onRoomClosed?.(message.reason);
            break;

          case 'phase-changed':
            callbacksRef.current.onPhaseChanged?.(message.phase);
            break;

          case 'error':
            callbacksRef.current.onError?.(message.message);
            break;

          case 'word-change-vote-started':
            callbacksRef.current.onWordChangeVoteStarted?.(message.initiatorId, message.initiatorName);
            break;

          case 'word-change-vote-cast':
            callbacksRef.current.onWordChangeVoteCast?.(message.voterId);
            break;

          case 'word-change-vote-result':
            callbacksRef.current.onWordChangeVoteResult?.(message.passed, message.newHintsCount || 0);
            break;
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    socket.addEventListener('open', handleOpen);
    socket.addEventListener('close', handleClose);
    socket.addEventListener('error', handleError);
    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('open', handleOpen);
      socket.removeEventListener('close', handleClose);
      socket.removeEventListener('error', handleError);
      socket.removeEventListener('message', handleMessage);
      socket.close();
      socketRef.current = null;
    };
  }, [roomCode]);

  // Enviar mensaje al servidor
  const send = useCallback((message: ClientMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Acciones del juego
  const join = useCallback((playerName: string) => {
    send({ type: 'join', playerName });
  }, [send]);

  const leave = useCallback(() => {
    send({ type: 'leave' });
  }, [send]);

  const startGame = useCallback((category: string, locale?: string) => {
    send({ type: 'start-game', category, locale });
  }, [send]);

  const submitClue = useCallback((word: string) => {
    send({ type: 'submit-clue', word });
  }, [send]);

  const castVote = useCallback((targetId: string) => {
    send({ type: 'cast-vote', targetId });
  }, [send]);

  const guessWord = useCallback((word: string) => {
    send({ type: 'imposter-guess', word });
  }, [send]);

  const playAgain = useCallback(() => {
    send({ type: 'play-again' });
  }, [send]);

  const resetGame = useCallback(() => {
    send({ type: 'reset-game' });
  }, [send]);

  const kickPlayer = useCallback((playerId: string) => {
    send({ type: 'kick-player', playerId });
  }, [send]);

  const updateSettings = useCallback((settings: Partial<GameRoom['settings']>) => {
    send({ type: 'update-settings', settings });
  }, [send]);

  const initiateWordChange = useCallback(() => {
    send({ type: 'initiate-word-change' });
  }, [send]);

  const voteWordChange = useCallback((vote: boolean) => {
    send({ type: 'vote-word-change', vote });
  }, [send]);

  const result = useMemo(() => ({
    isConnected: connectionState === 'connected',
    isConnecting: connectionState === 'connecting',
    join,
    leave,
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
    send
  }), [connectionState, join, leave, startGame, submitClue, castVote, guessWord, playAgain, resetGame, kickPlayer, updateSettings, initiateWordChange, voteWordChange, send]);

  return result;
}
