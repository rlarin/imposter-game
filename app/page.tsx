'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button, Card, Input } from '@/components/ui';
import LanguageSelector from '@/components/ui/LanguageSelector';
import Instructions from '@/components/ui/Instructions';
import { validatePlayerName, validateRoomCode } from '@/lib/utils';
import { Image } from 'next/dist/client/image-component';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  // Check for room code in URL params
  const urlRoomCode = searchParams.get('room') || searchParams.get('code') || '';
  const hasUrlRoomCode = urlRoomCode.length > 0;

  // Prefill room code from URL on mount
  useEffect(() => {
    if (urlRoomCode) {
      setRoomCode(urlRoomCode.toUpperCase());
    }
  }, [urlRoomCode]);

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
        body: JSON.stringify({ playerName: playerName.trim() }),
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
          roomCode: roomCode.trim().toUpperCase(),
        }),
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
      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <a
          href="https://www.buymeacoffee.com/rlarin"
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-50 hover:opacity-100 transition-opacity"
        >
          <img
            src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=rlarin&button_colour=FFDD00&font_colour=000000&font_family=Inter&outline_colour=000000&coffee_colour=ffffff"
            alt="Buy me a coffee"
            className="h-5 sm:h-7"
          />
        </a>
        <LanguageSelector variant="compact" />
      </div>

      <Card variant="elevated" padding="lg" className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mb-3 sm:mb-4 flex justify-center">
            <Image
              alt="Imposter"
              src="/imposter192x192.png"
              loading="eager"
              width={80}
              height={80}
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
            />
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

          {/* Crear partida - hide when joining via URL */}
          {!hasUrlRoomCode && (
            <>
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
            </>
          )}

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
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700 text-center space-y-3">
          {/* How to play button */}
          <button
            onClick={() => setShowInstructions(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
          >
            <span>📖</span>
            {t('instructions.howToPlay')}
          </button>

          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t('home.footer')}</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
            v{process.env.APP_VERSION}
          </p>
        </div>
      </Card>

      {/* Instructions Modal */}
      <Instructions isOpen={showInstructions} onClose={() => setShowInstructions(false)} />
    </div>
  );
}
