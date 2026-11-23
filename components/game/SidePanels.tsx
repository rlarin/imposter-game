'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { QRCodeSVG } from 'qrcode.react';
import { GameRoom } from '@/lib/types';
import { Button, Card, Icon } from '@/components/ui';
import { copyToClipboard, generateJoinUrl } from '@/lib/utils';
import PlayerList from './PlayerList';

const MAX_PLAYERS = 15;

export function PlayersPanel({
  room,
  playerId,
  onKick,
}: {
  room: GameRoom;
  playerId: string;
  onKick?: (playerId: string) => void;
}) {
  const t = useTranslations();
  const connected = room.players.filter((p) => p.isConnected);
  const active = connected.filter((p) => !p.isEliminated);

  let caption = t('ui.playersOf', { count: connected.length, max: MAX_PLAYERS });
  if (room.phase === 'clue-round') {
    caption = t('ui.submittedCount', {
      done: active.filter((p) => p.hasSubmittedClue).length,
      total: active.length,
    });
  } else if (room.phase === 'voting') {
    caption = t('ui.votedCount', {
      voted: active.filter((p) => p.hasVoted).length,
      total: active.length,
    });
  }

  return (
    <Card padding="sm">
      <div className="mb-2 flex items-baseline justify-between px-1">
        <h2 className="font-display text-lg font-semibold">{t('lobby.players')}</h2>
        <span className="text-[13px] text-muted">{caption}</span>
      </div>
      <PlayerList
        players={room.players}
        currentPlayerId={playerId}
        hostId={room.hostId}
        phase={room.phase}
        isHost={playerId === room.hostId}
        onKick={onKick}
      />
    </Card>
  );
}

export function InvitePanel({
  roomCode,
  compact = false,
  onCopied,
}: {
  roomCode: string;
  /** Compact layout (mobile): QR hidden behind a toggle. */
  compact?: boolean;
  onCopied?: (message: string) => void;
}) {
  const t = useTranslations();
  const [showQr, setShowQr] = useState(!compact);
  const joinUrl = generateJoinUrl(roomCode);

  const copyLink = async () => {
    if (await copyToClipboard(joinUrl)) onCopied?.(t('ui.linkCopied'));
  };

  const share = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: t('home.title'), url: joinUrl });
        return;
      } catch {
        // user cancelled or share failed: fall back to copy
      }
    }
    copyLink();
  };

  return (
    <Card className="flex flex-col gap-4">
      <div
        className={`flex gap-3 ${compact ? 'items-center justify-between' : 'flex-col items-center text-center'}`}
      >
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-muted">{t('ui.inviteTitle')}</span>
          <span className="font-mono text-[30px] font-bold leading-tight tracking-[0.16em] xl:text-[34px]">
            {roomCode}
          </span>
        </div>
        {compact && (
          <button
            type="button"
            onClick={() => setShowQr((v) => !v)}
            aria-label={t('ui.showQr')}
            aria-pressed={showQr}
            className="flex size-13 items-center justify-center rounded-2xl border border-accent-soft/40 bg-accent/18 text-accent-fg transition-colors hover:bg-accent/26"
          >
            <Icon name="qr" className="size-6" />
          </button>
        )}
      </div>

      {showQr && (
        <div className="self-center rounded-2xl bg-white p-3 animate-rise">
          <QRCodeSVG
            value={joinUrl}
            size={168}
            level="M"
            marginSize={0}
            title={t('lobby.scanToJoin')}
            className="size-36 xl:size-40"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={copyLink}>
          <Icon name="copy" className="size-4" />
          {t('common.copy')}
        </Button>
        <Button variant="secondary" onClick={share}>
          <Icon name="share" className="size-4" />
          {t('ui.share')}
        </Button>
      </div>
    </Card>
  );
}

export function HowToCard() {
  const t = useTranslations();
  const steps = [t('ui.howTo1'), t('ui.howTo2'), t('ui.howTo3'), t('ui.howTo4')];
  return (
    <Card className="flex flex-col gap-3.5">
      <h2 className="font-display text-lg font-semibold">{t('ui.howToTitle')}</h2>
      <ol className="flex flex-col gap-3">
        {steps.map((text, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex size-6.5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[13px] font-bold text-accent-fg">
              {i + 1}
            </span>
            <span className="text-sm leading-relaxed text-fg-soft">{text}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
