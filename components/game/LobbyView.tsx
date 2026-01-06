'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslations } from 'next-intl';
import { GameRoom } from '@/lib/types';
import { Button, Card } from '@/components/ui';
import { copyToClipboard, generateJoinUrl } from '@/lib/utils';
import { useLocale } from '@/lib/i18n-context';
import { getWordCategories } from '@/lib/words/index';
import PlayerList from './PlayerList';

interface LobbyViewProps {
  room: GameRoom;
  playerId: string;
  onStartGame: (category: string, locale?: string) => void;
  onKickPlayer: (playerId: string) => void;
  onUpdateSettings: (settings: Partial<GameRoom['settings']>) => void;
}

export default function LobbyView({
  room,
  playerId,
  onStartGame,
  onKickPlayer,
  onUpdateSettings,
}: LobbyViewProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const [copied, setCopied] = useState(false);
  const [isQRFullscreen, setIsQRFullscreen] = useState(false);
  const selectedCategory = room.settings.category;

  const isHost = playerId === room.hostId;
  const canStart = room.players.filter((p) => p.isConnected).length >= 3;
  const joinUrl = generateJoinUrl(room.roomCode);
  const wordCategories = getWordCategories(locale);
  const timerEnabled = room.settings.timerEnabled ?? true;
  const currentTimeMinutes = Math.round((room.settings.clueTimeLimit || 180) / 60);
  const imposterHintEnabled = room.settings.imposterHintEnabled ?? false;
  const trollModeEnabled = room.settings.trollModeEnabled ?? false;

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
    if (isHost) {
      onUpdateSettings({ category });
    }
  };

  const handleTimerToggle = () => {
    if (isHost) {
      onUpdateSettings({ timerEnabled: !timerEnabled });
    }
  };

  const handleTimeLimitChange = (minutes: number) => {
    if (isHost) {
      const seconds = minutes * 60;
      onUpdateSettings({ clueTimeLimit: seconds, voteTimeLimit: seconds });
    }
  };

  const handleImposterHintToggle = () => {
    if (isHost) {
      onUpdateSettings({ imposterHintEnabled: !imposterHintEnabled });
    }
  };

  const handleTrollModeToggle = () => {
    if (isHost) {
      onUpdateSettings({ trollModeEnabled: !trollModeEnabled });
    }
  };

  const handleClueRoundsChange = (rounds: number) => {
    if (isHost) {
      onUpdateSettings({ clueRounds: rounds });
    }
  };

  const timeOptions = [1, 2, 3, 5]; // Minutes
  const roundOptions = [2, 3, 5]; // Number of rounds before voting
  const currentClueRounds = room.settings.clueRounds ?? 2;

  return (
    <div className="space-y-6">
      {/* Código de sala y QR */}
      <Card>
        <div className="flex items-center justify-between gap-4">
          {/* Room Code Section */}
          <div className="flex-1 text-center">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
              {t('lobby.roomCode')}
            </p>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400">
                {room.roomCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                title={t('lobby.copyCode')}
              >
                {copied ? (
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </button>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCopyLink} className="mt-2 sm:mt-3">
              {copied ? t('common.copied') : t('lobby.copyLink')}
            </Button>
          </div>

          {/* QR Code Section */}
          <div className="shrink-0 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
              {t('lobby.scanToJoin')}
            </p>
            <button
              onClick={() => setIsQRFullscreen(true)}
              className="p-2 bg-white rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
              title="Click to expand QR code"
            >
              <QRCodeSVG
                value={joinUrl}
                size={80}
                level="M"
                marginSize={0}
                className="w-20 h-20 sm:w-24 sm:h-24"
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Lista de jugadores */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0 mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
            {t('lobby.players')} ({room.players.filter((p) => p.isConnected).length}/15)
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
                ${
                  selectedCategory === category.id
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
      </Card>

      {/* Configuración del temporizador */}
      <Card>
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
          <span>⏳</span>
          {t('lobby.timerSettings')}
        </h3>

        {/* Toggle del timer */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {timerEnabled ? t('lobby.timerEnabled') : t('lobby.timerDisabled')}
          </span>
          {isHost && (
            <button
              onClick={handleTimerToggle}
              disabled={!isHost}
              className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${timerEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}
              ${!isHost ? 'cursor-default opacity-60' : 'cursor-pointer'}
            `}
            >
              <span
                className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${timerEnabled ? 'translate-x-6' : 'translate-x-1'}
              `}
              />
            </button>
          )}
        </div>

        {/* Selector de tiempo (solo si el timer está habilitado) */}
        {timerEnabled && (
          <div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
              {t('lobby.timeLimit')}
            </p>
            <div className="flex gap-2">
              {timeOptions.map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => handleTimeLimitChange(minutes)}
                  disabled={!isHost}
                  className={`
                    flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
                    ${
                      currentTimeMinutes === minutes
                        ? 'bg-indigo-100 dark:bg-indigo-900/50 ring-2 ring-indigo-500 text-indigo-700 dark:text-indigo-300'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                    ${!isHost ? 'cursor-default' : 'cursor-pointer'}
                  `}
                >
                  {minutes} {t('lobby.minutes')}
                </button>
              ))}
            </div>
          </div>
        )}

        {!isHost && <p className="text-xs text-gray-500 mt-3 text-center">{t('lobby.hostOnly')}</p>}

        <hr className="my-4" />

        {/* Configuración de pista para el impostor */}
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
          <span>🕵️‍♀️</span>
          {t('lobby.imposterHintSettings')}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {imposterHintEnabled
                ? t('lobby.imposterHintEnabled')
                : t('lobby.imposterHintDisabled')}
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('lobby.imposterHintDescription')}
            </p>
          </div>
          {isHost && (
            <button
              onClick={handleImposterHintToggle}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4
                ${imposterHintEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${imposterHintEnabled ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          )}
        </div>

        {!isHost && <p className="text-xs text-gray-500 mt-3 text-center">{t('lobby.hostOnly')}</p>}

        <hr className="my-4" />
        {/* Configuración de modo troll */}

        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
          <span>🎭</span>
          {t('lobby.trollModeSettings')}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {trollModeEnabled ? t('lobby.trollModeEnabled') : t('lobby.trollModeDisabled')}
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('lobby.trollModeDescription')}
            </p>
          </div>
          {isHost && (
            <button
              onClick={handleTrollModeToggle}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4
                ${trollModeEnabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${trollModeEnabled ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          )}
        </div>

        {!isHost && <p className="text-xs text-gray-500 mt-3 text-center">{t('lobby.hostOnly')}</p>}

        <hr className="my-4" />
        {/* Configuración de rondas de pistas */}

        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
          <span>📢️</span>
          {t('lobby.clueRoundsSettings')}
        </h3>

        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
          {t('lobby.clueRoundsDescription')}
        </p>
        <div className="flex gap-2">
          {roundOptions.map((rounds) => (
            <button
              key={rounds}
              onClick={() => handleClueRoundsChange(rounds)}
              disabled={!isHost}
              className={`
                                flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
                                ${
                                  currentClueRounds === rounds
                                    ? 'bg-indigo-100 dark:bg-indigo-900/50 ring-2 ring-indigo-500 text-indigo-700 dark:text-indigo-300'
                                    : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }
                                ${!isHost ? 'cursor-default' : 'cursor-pointer'}
                            `}
            >
              {rounds} {t('lobby.rounds')}
            </button>
          ))}
        </div>

        {!isHost && <p className="text-xs text-gray-500 mt-3 text-center">{t('lobby.hostOnly')}</p>}
      </Card>

      {/* Botón iniciar */}
      {isHost && (
        <Button
          onClick={() => onStartGame(selectedCategory, locale)}
          disabled={!canStart}
          size="lg"
          className="w-full"
        >
          {canStart
            ? t('lobby.startGame')
            : t('lobby.waitingPlayers', {
                current: room.players.filter((p) => p.isConnected).length,
              })}
        </Button>
      )}

      {!isHost && (
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <p className="text-gray-600 dark:text-gray-400">{t('lobby.waitingHost')}</p>
        </div>
      )}

      {/* Fullscreen QR Code Modal */}
      {isQRFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('lobby.scanToJoin')}
              </h3>
              <button
                onClick={() => setIsQRFullscreen(false)}
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* QR Code Content */}
            <div className="p-8 flex flex-col items-center justify-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {t('lobby.roomCode')}:{' '}
                <span className="font-mono font-bold text-lg text-indigo-600 dark:text-indigo-400">
                  {room.roomCode}
                </span>
              </p>
              <div className="bg-white p-6 rounded-xl">
                <QRCodeSVG
                  value={joinUrl}
                  size={300}
                  level="M"
                  marginSize={2}
                  className="w-80 h-80"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-6 text-center">
                {t('qrScanner.instructions')}
              </p>
            </div>

            {/* Footer with copy button */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <Button onClick={handleCopyLink} variant="secondary" size="sm" className="w-full">
                {copied ? t('common.copied') : t('lobby.copyLink')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
