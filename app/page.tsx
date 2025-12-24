'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';
import { validatePlayerName, validateRoomCode } from '@/lib/utils';

export default function Home() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleCreateGame = async () => {
    const validation = validatePlayerName(playerName);
    if (!validation.valid) {
      setError(validation.error || 'Nombre inválido');
      return;
    }

    setError('');
    setIsCreating(true);

    try {
      const res = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: playerName.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al crear la sala');
      }

      // Guardar ID del jugador en localStorage
      localStorage.setItem('playerId', data.playerId);
      localStorage.setItem('playerName', playerName.trim());

      // Navegar a la sala
      router.push(`/game/${data.roomCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la sala');
      setIsCreating(false);
    }
  };

  const handleJoinGame = async () => {
    const nameValidation = validatePlayerName(playerName);
    if (!nameValidation.valid) {
      setError(nameValidation.error || 'Nombre inválido');
      return;
    }

    const codeValidation = validateRoomCode(roomCode);
    if (!codeValidation.valid) {
      setError(codeValidation.error || 'Código inválido');
      return;
    }

    setError('');
    setIsJoining(true);

    try {
      const res = await fetch('/api/room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: playerName.trim(),
          roomCode: roomCode.trim().toUpperCase()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al unirse a la sala');
      }

      // Guardar ID del jugador en localStorage
      localStorage.setItem('playerId', data.playerId);
      localStorage.setItem('playerName', playerName.trim());

      // Navegar a la sala
      router.push(`/game/${roomCode.trim().toUpperCase()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al unirse a la sala');
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <Card variant="elevated" padding="lg" className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🕵️</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            El Impostor
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            ¿Quién es el que no conoce la palabra?
          </p>
        </div>

        {/* Formulario */}
        <div className="space-y-6">
          {/* Nombre del jugador */}
          <Input
            label="Tu nombre"
            placeholder="Escribe tu nombre..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={15}
          />

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Crear partida */}
          <Button
            onClick={handleCreateGame}
            isLoading={isCreating}
            disabled={!playerName.trim() || isJoining}
            className="w-full"
            size="lg"
          >
            Crear Partida
          </Button>

          {/* Separador */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">
                o únete a una partida
              </span>
            </div>
          </div>

          {/* Unirse a partida */}
          <div className="space-y-3">
            <Input
              placeholder="Código de sala (ej: ABC123)"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="text-center font-mono text-lg tracking-widest"
            />
            <Button
              onClick={handleJoinGame}
              isLoading={isJoining}
              disabled={!playerName.trim() || !roomCode.trim() || isCreating}
              variant="secondary"
              className="w-full"
              size="lg"
            >
              Unirse
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            3-15 jugadores • Juego de palabras y deducción
          </p>
        </div>
      </Card>
    </div>
  );
}
