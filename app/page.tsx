'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button, Input, Card } from '@/components/ui';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { validatePlayerName, validateRoomCode } from '@/lib/utils';
import {Image} from "next/dist/client/image-component";

export default function Home() {
  const router = useRouter();
  const t = useTranslations();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleCreateGame = async () => {
    const validation = validatePlayerName(playerName);
    if (!validation.valid) {
      setError(validation.errorKey ? t(validation.errorKey) : t('validation.invalidName'));
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
        throw new Error(data.error || t('errors.createRoomError'));
      }

      // Guardar ID del jugador en localStorage
      localStorage.setItem('playerId', data.playerId);
      localStorage.setItem('playerName', playerName.trim());

      // Navegar a la sala
      router.push(`/game/${data.roomCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.createRoomError'));
      setIsCreating(false);
    }
  };

  const handleJoinGame = async () => {
    const nameValidation = validatePlayerName(playerName);
    if (!nameValidation.valid) {
      setError(nameValidation.errorKey ? t(nameValidation.errorKey) : t('validation.invalidName'));
      return;
    }

    const codeValidation = validateRoomCode(roomCode);
    if (!codeValidation.valid) {
      setError(codeValidation.errorKey ? t(codeValidation.errorKey) : t('validation.invalidCode'));
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
        throw new Error(data.error || t('errors.joinRoomError'));
      }

      // Guardar ID del jugador en localStorage
      localStorage.setItem('playerId', data.playerId);
      localStorage.setItem('playerName', playerName.trim());

      // Navegar a la sala
      router.push(`/game/${roomCode.trim().toUpperCase()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.joinRoomError'));
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      {/* Language selector */}
      <div className="absolute top-4 right-4">
        <LanguageSelector variant="compact" />
      </div>

      <Card variant="elevated" padding="lg" className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mb-3 sm:mb-4 flex justify-center">
            <Image alt="Imposter" src="/imposter192x192.png" width={80} height={80} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
            {t('home.title')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {t('home.subtitle')}
          </p>
        </div>

        {/* Formulario */}
        <div className="space-y-4 sm:space-y-6">
          {/* Nombre del jugador */}
          <Input
            label={t('home.nameLabel')}
            placeholder={t('home.namePlaceholder')}
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
            {t('home.createGame')}
          </Button>

          {/* Separador */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">
                {t('home.joinSeparator')}
              </span>
            </div>
          </div>

          {/* Unirse a partida */}
          <div className="space-y-3">
            <Input
              placeholder={t('home.roomCodePlaceholder')}
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
              {t('home.joinGame')}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {t('home.footer')}
          </p>
        </div>
      </Card>
    </div>
  );
}
