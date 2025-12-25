'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslations } from 'next-intl';
import { GameRoom } from '@/lib/types';
import { Button, Card } from '@/components/ui';
import { generateJoinUrl, copyToClipboard } from '@/lib/utils';
import { useLocale } from '@/lib/i18n-context';
import { getWordCategories } from '@/lib/words/index';
import PlayerList from './PlayerList';

interface LobbyViewProps {
  room: GameRoom;
  playerId: string;
  onStartGame: (category: string) => void;
  onKickPlayer: (playerId: string) => void;
  onUpdateSettings: (settings: Partial<GameRoom['settings']>) => void;
}

export default function LobbyView({
  room,
  playerId,
  onStartGame,
  onKickPlayer,
  onUpdateSettings
}: LobbyViewProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(room.settings.category);

  const isHost = playerId === room.hostId;
  const canStart = room.players.filter(p => p.isConnected).length >= 3;
  const joinUrl = generateJoinUrl(room.roomCode);
  const wordCategories = getWordCategories(locale);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(joinUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCode = async () => {
    const success = await copyToClipboard(room.roomCode);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (isHost) {
      onUpdateSettings({ category });
    }
  };

  return (
    <div className="space-y-6">
      {/* Código de sala */}
      <Card className="text-center">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">{t('lobby.roomCode')}</p>
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <span className="text-3xl sm:text-4xl font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400">
            {room.roomCode}
          </span>
          <button
            onClick={handleCopyCode}
            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
            title={t('lobby.copyCode')}
          >
            {copied ? (
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyLink}
          className="mt-3"
        >
          {copied ? t('common.copied') : t('lobby.copyLink')}
        </Button>

        {/* QR Code */}
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">
            {t('lobby.scanToJoin')}
          </p>
          <div className="inline-block p-2 sm:p-3 bg-white rounded-xl">
            <QRCodeSVG
              value={joinUrl}
              size={120}
              level="M"
              marginSize={0}
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36"
            />
          </div>
        </div>
      </Card>

      {/* Lista de jugadores */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0 mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
            {t('lobby.players')} ({room.players.filter(p => p.isConnected).length}/15)
          </h3>
          {!canStart && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              {t('lobby.minPlayers')}
            </span>
          )}
        </div>
        <PlayerList
          players={room.players}
          currentPlayerId={playerId}
          hostId={room.hostId}
          isHost={isHost}
          isLobby={true}
          onKick={onKickPlayer}
        />
      </Card>

      {/* Configuración (solo host) */}
      <Card>
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
          {t('lobby.categoryTitle')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
          {wordCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              disabled={!isHost}
              className={`
                p-2 sm:p-3 rounded-xl text-center transition-all
                ${selectedCategory === category.id
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 ring-2 ring-indigo-500'
                  : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
                ${!isHost ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              <span className="text-xl sm:text-2xl block mb-0.5 sm:mb-1">{category.emoji}</span>
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                {category.name}
              </span>
            </button>
          ))}
        </div>
        {!isHost && (
          <p className="text-xs text-gray-500 mt-3 text-center">
            {t('lobby.hostOnly')}
          </p>
        )}
      </Card>

      {/* Botón iniciar */}
      {isHost && (
        <Button
          onClick={() => onStartGame(selectedCategory)}
          disabled={!canStart}
          size="lg"
          className="w-full"
        >
          {canStart ? t('lobby.startGame') : t('lobby.waitingPlayers', { current: room.players.filter(p => p.isConnected).length })}
        </Button>
      )}

      {!isHost && (
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <p className="text-gray-600 dark:text-gray-400">
            {t('lobby.waitingHost')}
          </p>
        </div>
      )}
    </div>
  );
}
