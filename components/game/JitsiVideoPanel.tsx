'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';

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
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Build the Jitsi URL with config parameters
  // Using meet.ffmuc.net - reliable German public Jitsi server without auth requirements
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

  // Using meet.ffmuc.net - reliable German public Jitsi server
  const jitsiUrl = `https://meet.ffmuc.net/ElImpostor-${roomCode}#${configParams.toString()}`;

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ease-in-out ${
        isMinimized
          ? 'bottom-4 right-4 w-24 h-24 rounded-full overflow-hidden shadow-lg'
          : 'top-0 left-0 right-0 h-[35vh] sm:h-[30vh] bg-gray-900/95 shadow-xl'
      }`}
    >
      {/* Header - only show when not minimized */}
      {!isMinimized && (
        <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-white/80 text-sm font-medium">{t('video.title')}</span>
            {isLoading && (
              <span className="text-xs text-gray-400 animate-pulse">{t('video.connecting')}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Open in new tab button */}
            <a
              href={jitsiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Open in new tab"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title={t('video.minimize')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
              title={t('video.close')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Jitsi iframe */}
      <iframe
        src={jitsiUrl}
        className={`bg-gray-900 ${isMinimized ? 'w-full h-full' : 'w-full h-[calc(100%-40px)]'}`}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        onLoad={() => setIsLoading(false)}
      />

      {/* Minimized expand button */}
      {isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-colors"
          title={t('video.expand')}
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
