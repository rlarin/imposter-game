'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button, Card, Icon, IconName, Input, LikeButton } from '@/components/ui';
import LanguageSelector from '@/components/ui/LanguageSelector';
import Instructions from '@/components/ui/Instructions';
import QRScanner from '@/components/ui/QRScanner';
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
  const [showScanner, setShowScanner] = useState(false);

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

  const features: { icon: IconName; text: string }[] = [
    { icon: 'sparkles', text: t('ui.homeFeature1') },
    { icon: 'users', text: t('ui.homeFeature2') },
    { icon: 'video', text: t('ui.homeFeature3') },
  ];

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-280px] h-[620px] w-[1200px] max-w-[220vw] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(124,58,237,0.24),rgba(124,58,237,0))]"
      />

      {/* Top bar */}
      <header className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <Image
            alt=""
            src="/imposter192x192.png"
            loading="eager"
            width={36}
            height={36}
            className="size-9 rounded-xl"
          />
          <span className="font-display text-lg font-bold">{t('home.title')}</span>
        </div>
        <LanguageSelector variant="compact" />
      </header>

      <main className="relative mx-auto grid w-full max-w-6xl flex-1 items-center gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-12">
        {/* Hero */}
        <section className="flex flex-col items-center gap-4 text-center lg:items-start lg:gap-6 lg:text-left">
          <Image
            alt="Imposter"
            src="/imposter192x192.png"
            loading="eager"
            width={128}
            height={128}
            className="size-20 drop-shadow-[0_12px_32px_rgba(124,58,237,0.45)] sm:size-24 lg:size-32"
          />
          <div>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              {t('home.subtitle')}
            </h1>
            <p className="mt-3 text-base text-muted sm:text-lg">{t('ui.homeTagline')}</p>
          </div>
          <ul className="hidden flex-col gap-3 lg:flex">
            {features.map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-fg-soft">
                <span className="flex size-9 items-center justify-center rounded-xl bg-accent/18 text-accent-fg">
                  <Icon name={f.icon} className="size-[18px]" />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
          <div className="hidden items-center gap-3 lg:flex">
            <Button variant="secondary" onClick={() => setShowInstructions(true)}>
              <Icon name="book" className="size-4" />
              {t('instructions.howToPlay')}
            </Button>
            <LikeButton />
          </div>
        </section>

        {/* Form */}
        <Card
          variant="elevated"
          padding="lg"
          className="mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end"
        >
          <div className="flex flex-col gap-5">
            <Input
              label={t('home.nameLabel')}
              placeholder={t('home.namePlaceholder')}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={15}
              autoComplete="nickname"
            />

            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-2xl border border-danger-fg/40 bg-danger/12 p-3 text-sm text-danger-fg"
              >
                <Icon name="alert" className="size-4" />
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

                <div className="flex items-center gap-3 text-[13px] text-subtle">
                  <div className="h-px flex-1 bg-line" />
                  {t('home.joinSeparator')}
                  <div className="h-px flex-1 bg-line" />
                </div>
              </>
            )}

            {/* Unirse a partida */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Input
                  label={t('lobby.roomCode')}
                  hideLabel
                  placeholder={t('home.roomCodePlaceholder')}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  autoCapitalize="characters"
                  autoComplete="off"
                  className="text-center font-mono text-lg tracking-[0.2em] placeholder:tracking-normal placeholder:font-sans placeholder:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  aria-label={t('ui.scanQr')}
                  title={t('lobby.scanToJoin')}
                  className="flex size-13 shrink-0 items-center justify-center rounded-2xl border border-accent-soft/40 bg-accent/18 text-accent-fg transition-colors hover:bg-accent/26"
                >
                  <Icon name="camera" className="size-6" />
                </button>
              </div>
              <Button
                onClick={handleJoinGame}
                isLoading={isJoining}
                disabled={!playerName.trim() || !roomCode.trim() || isCreating}
                variant={hasUrlRoomCode ? 'primary' : 'secondary'}
                className="w-full"
                size="lg"
              >
                {t('home.joinGame')}
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 border-t border-line pt-5 lg:hidden">
              <Button variant="ghost" size="sm" onClick={() => setShowInstructions(true)}>
                <Icon name="book" className="size-4" />
                {t('instructions.howToPlay')}
              </Button>
              <LikeButton />
            </div>
          </div>
        </Card>
      </main>

      <footer className="relative mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 pb-safe pt-4 text-xs text-subtle sm:justify-between sm:px-6">
        <span>{t('home.footer')}</span>
        <span className="flex items-center gap-4">
          <a
            href="https://www.buymeacoffee.com/rlarin"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-fg"
          >
            <Icon name="coffee" className="size-4" />
            {t('ui.coffee')}
          </a>
          <span>v{process.env.APP_VERSION}</span>
        </span>
      </footer>

      {/* Instructions Modal */}
      <Instructions isOpen={showInstructions} onClose={() => setShowInstructions(false)} />

      {/* QR Scanner Modal */}
      <QRScanner isOpen={showScanner} onClose={() => setShowScanner(false)} />
    </div>
  );
}
