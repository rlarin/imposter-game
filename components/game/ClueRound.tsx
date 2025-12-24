'use client';

import { useState } from 'react';
import { GameRoom } from '@/lib/types';
import { Button, Input, Card, Timer } from '@/components/ui';
import { validateClue } from '@/lib/utils';
import { getCategoryById } from '@/lib/words';
import PlayerList from './PlayerList';

interface ClueRoundProps {
  room: GameRoom;
  playerId: string;
  onSubmitClue: (word: string) => void;
}

export default function ClueRound({ room, playerId, onSubmitClue }: ClueRoundProps) {
  const [clue, setClue] = useState('');
  const [error, setError] = useState('');

  const currentPlayer = room.players.find(p => p.id === playerId);
  const hasSubmitted = currentPlayer?.hasSubmittedClue ?? false;
  const isImposter = currentPlayer?.isImposter ?? false;
  const category = getCategoryById(room.settings.category);

  // Pistas de rondas anteriores
  const previousClues = room.clues.filter(c => c.round < room.currentRound);

  const handleSubmit = () => {
    const trimmed = clue.trim();

    // Para el impostor, no validar contra la palabra secreta
    if (!isImposter && room.secretWord) {
      const validation = validateClue(trimmed, room.secretWord);
      if (!validation.valid) {
        setError(validation.error || 'Pista inválida');
        return;
      }
    }

    if (trimmed.length === 0) {
      setError('Escribe una pista');
      return;
    }

    if (trimmed.includes(' ')) {
      setError('La pista debe ser una sola palabra');
      return;
    }

    setError('');
    onSubmitClue(trimmed);
    setClue('');
  };

  return (
    <div className="space-y-6">
      {/* Header con timer */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Ronda {room.currentRound} de {room.settings.clueRounds}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {category?.emoji} {category?.name}
          </p>
        </div>
        <Timer endTime={room.phaseEndsAt} />
      </div>

      {/* Palabra secreta (si no es impostor) */}
      {!isImposter && room.secretWord && (
        <Card className="text-center bg-indigo-50 dark:bg-indigo-900/20">
          <p className="text-sm text-gray-500 dark:text-gray-400">Palabra secreta</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 uppercase">
            {room.secretWord}
          </p>
        </Card>
      )}

      {/* Indicador de impostor */}
      {isImposter && (
        <Card className="text-center bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-500">Eres el impostor</p>
          <p className="text-lg font-bold text-red-600 dark:text-red-400">
            Inventa una pista convincente
          </p>
        </Card>
      )}

      {/* Pistas de rondas anteriores */}
      {previousClues.length > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Pistas anteriores
          </h3>
          <div className="flex flex-wrap gap-2">
            {previousClues.map((c, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
              >
                <span className="font-medium">{c.playerName}:</span>{' '}
                <span className="text-indigo-600 dark:text-indigo-400">{c.word}</span>
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Input de pista */}
      {!hasSubmitted ? (
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Tu pista (una sola palabra)
          </h3>
          <div className="space-y-3">
            <Input
              value={clue}
              onChange={(e) => setClue(e.target.value.replace(/\s/g, ''))}
              placeholder="Escribe tu pista..."
              maxLength={20}
              error={error}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
            />
            <Button onClick={handleSubmit} className="w-full">
              Enviar Pista
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="text-center bg-green-50 dark:bg-green-900/20">
          <div className="text-4xl mb-2">✓</div>
          <p className="font-semibold text-green-600 dark:text-green-400">
            Pista enviada
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Esperando a los demás jugadores...
          </p>
        </Card>
      )}

      {/* Estado de jugadores */}
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          Jugadores
        </h3>
        <PlayerList
          players={room.players.filter(p => p.isConnected && !p.isEliminated)}
          currentPlayerId={playerId}
          hostId={room.hostId}
        />
      </Card>
    </div>
  );
}
