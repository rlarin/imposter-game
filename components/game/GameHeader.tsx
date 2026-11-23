'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Image } from 'next/dist/client/image-component';
import { GamePhase } from '@/lib/types';
import { DONATION_URL, SHOW_DONATION_LINK } from '@/lib/config';
import { Icon, LikeButton } from '@/components/ui';
import LanguageSelector from '@/components/ui/LanguageSelector';
import Instructions from '@/components/ui/Instructions';

const STEPS = ['lobby', 'role', 'clues', 'vote', 'end'] as const;

const PHASE_STEP: Record<GamePhase, number> = {
  lobby: 0,
  'word-reveal': 1,
  'clue-round': 2,
  'round-end': 2,
  voting: 3,
  'vote-results': 3,
  'imposter-guess': 3,
  'game-over': 4,
};

interface GameHeaderProps {
  roomCode: string;
  phase: GamePhase;
  playersOnline: number;
  isVideoOpen: boolean;
  onToggleVideo: () => void;
  canReset: boolean;
  onReset: () => void;
  onExit: () => void;
  onCopyCode: () => void;
}

export default function GameHeader({
  roomCode,
  phase,
  playersOnline,
  isVideoOpen,
  onToggleVideo,
  canReset,
  onReset,
  onExit,
  onCopyCode,
}: GameHeaderProps) {
  const t = useTranslations();
  const current = PHASE_STEP[phase] ?? 0;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/95">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-2 px-3 sm:gap-3 sm:px-6">
        <div className="hidden items-center gap-2.5 sm:flex">
          <Image
            alt=""
            src="/imposter192x192.png"
            width={36}
            height={36}
            className="size-9 rounded-xl"
          />
          <span className="hidden font-display text-lg font-bold lg:inline">{t('home.title')}</span>
        </div>

        <button
          type="button"
          onClick={onCopyCode}
          aria-label={t('ui.copyRoomCode', { code: roomCode })}
          className="flex h-11 items-center gap-2 rounded-xl border border-line bg-white/5 px-3 transition-colors hover:bg-white/10"
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            {t('common.room')}
          </span>
          <span className="font-mono text-base font-bold tracking-[0.12em]">{roomCode}</span>
          <Icon name="copy" className="size-4 text-muted" />
        </button>

        <nav aria-label={t('ui.phases')} className="hidden flex-1 justify-center md:flex">
          <ol className="flex items-center gap-1 rounded-2xl border border-white/6 bg-white/4 p-1">
            {STEPS.map((step, i) => {
              const active = i === current;
              const done = i < current;
              return (
                <li
                  key={step}
                  aria-current={active ? 'step' : undefined}
                  className={`flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors ${
                    active ? 'bg-accent/24 text-fg' : done ? 'text-accent-fg' : 'text-muted'
                  }`}
                >
                  <span
                    className={`flex size-5 items-center justify-center rounded-full text-[11px] font-bold ${
                      i <= current ? 'bg-accent text-white' : 'bg-white/8 text-muted'
                    }`}
                  >
                    {done ? <Icon name="check" className="size-3" /> : i + 1}
                  </span>
                  <span className="hidden lg:inline">{t(`ui.steps.${step}`)}</span>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="flex-1 md:hidden" />

        <div
          className="flex h-11 items-center gap-1.5 rounded-xl border border-line bg-white/5 px-3 text-[15px] font-semibold"
          title={t('ui.playersOnline', { count: playersOnline })}
        >
          <Icon name="users" className="size-[18px]" />
          <span>{playersOnline}</span>
          <span className="sr-only">{t('ui.playersOnline', { count: playersOnline })}</span>
        </div>

        <button
          type="button"
          onClick={onToggleVideo}
          aria-pressed={isVideoOpen}
          aria-label={t('video.toggle')}
          className={`flex h-11 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors ${
            isVideoOpen
              ? 'border-success/45 bg-success/15 text-success'
              : 'border-line bg-white/5 text-fg hover:bg-white/10'
          }`}
        >
          <Icon name="video" className="size-5" />
          <span className="hidden lg:inline">{isVideoOpen ? t('ui.videoOn') : t('ui.video')}</span>
        </button>

        <OptionsMenu canReset={canReset} onReset={onReset} onExit={onExit} />
      </div>

      {/* Compact phase progress for small screens */}
      <div className="flex items-center gap-3 px-4 pb-2.5 md:hidden">
        <div className="grid flex-1 grid-cols-5 gap-1">
          {STEPS.map((step, i) => (
            <div
              key={step}
              className={`h-1 rounded-full ${i <= current ? 'bg-accent-soft' : 'bg-white/10'}`}
            />
          ))}
        </div>
        <span className="text-xs font-semibold text-accent-fg">
          {t(`ui.steps.${STEPS[current]}`)}
        </span>
      </div>
    </header>
  );
}

function OptionsMenu({
  canReset,
  onReset,
  onExit,
}: {
  canReset: boolean;
  onReset: () => void;
  onExit: () => void;
}) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onPointer = (e: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  const itemClass =
    'flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] font-medium transition-colors hover:bg-white/6';

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('ui.moreOptions')}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex size-11 items-center justify-center rounded-xl border border-line bg-white/5 transition-colors hover:bg-white/10"
      >
        <Icon name="more" />
      </button>

      {open && (
        <>
          {/* Backdrop (mobile bottom sheet only) */}
          <div
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/70 sm:hidden"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            aria-label={t('ui.moreOptions')}
            className="fixed inset-x-0 bottom-0 z-50 flex animate-sheet flex-col rounded-t-[28px] border-t border-line-strong bg-surface px-3 pt-2 pb-safe shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 sm:animate-rise sm:rounded-2xl sm:border sm:p-2"
          >
            <div className="mx-auto mb-3 mt-1 h-1 w-10 rounded-full bg-white/20 sm:hidden" />

            <div className="px-3 pb-2 pt-1">
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                <Icon name="globe" className="size-4" />
                {t('ui.language')}
              </p>
              <LanguageSelector />
            </div>
            <div className="my-1 h-px bg-line" />

            <button
              type="button"
              role="menuitem"
              className={itemClass}
              onClick={() => {
                setShowInstructions(true);
                setOpen(false);
              }}
            >
              <Icon name="book" />
              {t('instructions.howToPlay')}
            </button>
            <LikeButton variant="row" />
            {SHOW_DONATION_LINK && (
              <a
                role="menuitem"
                href={DONATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={itemClass}
              >
                <Icon name="coffee" />
                <span className="flex-1">{t('ui.coffee')}</span>
                <Icon name="external" className="size-4 text-muted" />
              </a>
            )}

            <div className="my-1 h-px bg-line" />
            {canReset && (
              <button
                type="button"
                role="menuitem"
                className={`${itemClass} text-danger-fg`}
                onClick={() => {
                  setOpen(false);
                  onReset();
                }}
              >
                <Icon name="refresh" />
                {t('game.resetGame')}
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              className={`${itemClass} text-danger-fg`}
              onClick={() => {
                setOpen(false);
                onExit();
              }}
            >
              <Icon name="logOut" />
              {t('ui.leaveRoom')}
            </button>
          </div>
        </>
      )}

      <Instructions isOpen={showInstructions} onClose={() => setShowInstructions(false)} />
    </div>
  );
}
