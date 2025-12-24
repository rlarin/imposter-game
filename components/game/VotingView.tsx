'use client';

import { useState } from 'react';
import { GameRoom } from '@/lib/types';
import { Button, Card, Timer, Avatar } from '@/components/ui';

interface VotingViewProps {
  room: GameRoom;
  playerId: string;
  onVote: (targetId: string) => void;
}

export default function VotingView({ room, playerId, onVote }: VotingViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const currentPlayer = room.players.find(p => p.id === playerId);
  const hasVoted = currentPlayer?.hasVoted ?? false;

  // Jugadores que pueden ser votados (conectados, no eliminados, no soy yo)
  const votablePlayers = room.players.filter(
    p => p.isConnected && !p.isEliminated && p.id !== playerId
  );

  // Pistas de la ronda actual
  const currentClues = room.clues.filter(c => c.round === room.currentRound);

  const handleVote = () => {
    if (selectedId) {
      onVote(selectedId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            ¿Quién es el impostor?
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Vota por quien creas que es el impostor
          </p>
        </div>
        <Timer endTime={room.phaseEndsAt} />
      </div>

      {/* Pistas de esta ronda */}
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Pistas de esta ronda
        </h3>
        <div className="space-y-2">
          {currentClues.map((clue, i) => {
            const player = room.players.find(p => p.id === clue.playerId);
            return (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
              >
                {player && (
                  <Avatar
                    name={player.name}
                    color={player.avatarColor}
                    size="sm"
                  />
                )}
                <div className="flex-1">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {clue.playerName}
                  </span>
                </div>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  &ldquo;{clue.word}&rdquo;
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Votación */}
      {!hasVoted ? (
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Selecciona al sospechoso
          </h3>
          <div className="space-y-2 mb-4">
            {votablePlayers.map((player) => (
              <button
                key={player.id}
                onClick={() => setSelectedId(player.id)}
                className={`
                  w-full flex items-center gap-3 p-4 rounded-xl transition-all
                  ${selectedId === player.id
                    ? 'bg-red-100 dark:bg-red-900/30 ring-2 ring-red-500'
                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Avatar
                  name={player.name}
                  color={player.avatarColor}
                  size="md"
                />
                <span className="font-medium text-gray-900 dark:text-white">
                  {player.name}
                </span>
                {selectedId === player.id && (
                  <span className="ml-auto text-red-500">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
          <Button
            onClick={handleVote}
            disabled={!selectedId}
            variant="danger"
            className="w-full"
          >
            Confirmar Voto
          </Button>
        </Card>
      ) : (
        <Card className="text-center bg-blue-50 dark:bg-blue-900/20">
          <div className="text-4xl mb-2">🗳️</div>
          <p className="font-semibold text-blue-600 dark:text-blue-400">
            Voto registrado
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Esperando a los demás jugadores...
          </p>
        </Card>
      )}

      {/* Estado de votación */}
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          Estado de votación
        </h3>
        <div className="flex flex-wrap gap-2">
          {room.players.filter(p => p.isConnected && !p.isEliminated).map((player) => (
            <div
              key={player.id}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
                ${player.hasVoted
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                }
              `}
            >
              <span>{player.name}</span>
              {player.hasVoted ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
