'use client';

import { useState } from 'react';
import { GameRoom } from '@/lib/types';
import { Button, Input, Card, Timer } from '@/components/ui';

interface ImposterGuessProps {
  room: GameRoom;
  playerId: string;
  onGuess: (word: string) => void;
}

export default function ImposterGuess({ room, playerId, onGuess }: ImposterGuessProps) {
  const [guess, setGuess] = useState('');

  const isImposter = playerId === room.imposterId;
  const imposterPlayer = room.players.find(p => p.id === room.imposterId);

  const handleSubmit = () => {
    if (guess.trim()) {
      onGuess(guess.trim());
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card variant="elevated" padding="lg" className="text-center max-w-md w-full">
        {isImposter ? (
          <>
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Última oportunidad!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Te descubrieron, pero si adivinas la palabra secreta, ¡ganas!
            </p>

            <Timer endTime={room.phaseEndsAt} className="mb-6" />

            <div className="space-y-4">
              <Input
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="¿Cuál era la palabra?"
                className="text-center text-xl"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit();
                }}
              />
              <Button onClick={handleSubmit} className="w-full" size="lg">
                Adivinar
              </Button>
            </div>

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Categoría: {room.settings.category}
            </p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              El impostor intenta adivinar
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              <span className="font-bold">{imposterPlayer?.name}</span> tiene una última oportunidad de adivinar la palabra secreta.
            </p>

            <Timer endTime={room.phaseEndsAt} className="mb-6" />

            <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">La palabra era:</p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                {room.secretWord}
              </p>
            </div>

            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 animate-pulse">
              Si la adivina, el impostor gana...
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
