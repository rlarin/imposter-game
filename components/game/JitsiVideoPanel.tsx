'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui';

// Public Jitsi server; must allow iframe embedding (no X-Frame-Options / frame-ancestors block).
// meet.ffmuc.net stopped allowing embeds in 2026. Override with NEXT_PUBLIC_JITSI_DOMAIN.
const JITSI_DOMAIN = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.element.io';

interface JitsiVideoPanelProps {
  roomCode: string;
  playerName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function JitsiVideoPanel({
  roomCode,
  playerName,
  isOpen,
  onClose,
}: JitsiVideoPanelProps) {
  const t = useTranslations();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Build the Jitsi URL with config parameters
  const configParams = new URLSearchParams({
    'config.prejoinConfig.enabled': 'false',
    'config.prejoinPageEnabled': 'false',
    'config.startWithAudioMuted': 'true',
    'config.startWithVideoMuted': 'false',
    'config.disableDeepLinking': 'true',
    'config.hideConferenceSubject': 'true',
    'config.enableLobby': 'false',
    'config.requireDisplayName': 'false',
    'config.enableWelcomePage': 'false',
    'interfaceConfig.SHOW_JITSI_WATERMARK': 'false',
    'interfaceConfig.SHOW_BRAND_WATERMARK': 'false',
    'interfaceConfig.MOBILE_APP_PROMO': 'false',
    'interfaceConfig.DISABLE_JOIN_LEAVE_NOTIFICATIONS': 'true',
    'userInfo.displayName': playerName,
  });

  const jitsiUrl = `https://${JITSI_DOMAIN}/ElImpostor-${roomCode}#${configParams.toString()}`;

  if (!isOpen) return null;

  const iconButton =
    'flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/8 hover:text-fg';

  // Floating window on mobile/tablet (never pushes the game content);
  // docked into the right column on large desktops (xl:static inside the aside).
  return (
    <section
      aria-label={t('ui.videoTitle')}
      className={`fixed z-40 flex flex-col overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-[0_16px_40px_rgba(0,0,0,0.55)] transition-all duration-300 animate-rise xl:static xl:z-auto xl:w-full xl:rounded-[20px] xl:border-line xl:shadow-none ${
        isExpanded
          ? 'inset-x-2 top-[76px] h-[45dvh] sm:inset-x-6 xl:h-[520px]'
          : 'right-3 bottom-28 h-60 w-44 sm:h-72 sm:w-60 xl:h-[340px]'
      }`}
    >
      <div className="flex h-11 shrink-0 items-center gap-1 pl-3 pr-1">
        <span className="size-2 rounded-full bg-danger-fg" />
        <span className="ml-1.5 flex-1 truncate text-xs font-semibold xl:text-sm">
          {isLoading ? t('video.connecting') : t('ui.videoTitle')}
        </span>
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className={iconButton}
          aria-label={isExpanded ? t('video.minimize') : t('video.expand')}
          title={isExpanded ? t('video.minimize') : t('video.expand')}
        >
          <Icon name={isExpanded ? 'minimize' : 'maximize'} className="size-4" />
        </button>
        <a
          href={jitsiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${iconButton} hidden sm:flex`}
          aria-label={t('ui.openInNewTab')}
          title={t('ui.openInNewTab')}
        >
          <Icon name="external" className="size-4" />
        </a>
        <button
          type="button"
          onClick={handleClose}
          className={`${iconButton} hover:text-danger-fg`}
          aria-label={t('video.close')}
          title={t('video.close')}
        >
          <Icon name="x" className="size-4" />
        </button>
      </div>

      <iframe
        src={jitsiUrl}
        title={t('ui.videoTitle')}
        className="w-full flex-1 bg-surface-3"
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        onLoad={() => setIsLoading(false)}
      />
    </section>
  );
}

export function VideoInvite({ onJoin }: { onJoin: () => void }) {
  const t = useTranslations();
  return (
    <section className="flex flex-col gap-3 rounded-[20px] border border-line bg-surface p-4">
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-subtle" />
        <h2 className="font-display text-lg font-semibold">{t('ui.videoTitle')}</h2>
      </div>
      <p className="text-sm leading-relaxed text-muted">{t('ui.videoHint')}</p>
      <button
        type="button"
        onClick={onJoin}
        className="flex h-11 items-center justify-center gap-2 rounded-xl border border-accent-soft/40 bg-accent/18 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent/26"
      >
        <Icon name="video" className="size-4" />
        {t('ui.videoJoin')}
      </button>
    </section>
  );
}
