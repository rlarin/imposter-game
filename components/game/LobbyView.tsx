'use client';

import { useState } from 'react';
import { GameRoom } from '@/lib/types';
import { wordCategories } from '@/lib/words';
import { Button, Card } from '@/components/ui';
import { generateJoinUrl, copyToClipboard } from '@/lib/utils';
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
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(room.settings.category);

  const isHost = playerId === room.hostId;
  const canStart = room.players.filter(p => p.isConnected).length >= 3;
  const joinUrl = generateJoinUrl(room.roomCode);

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
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Código de sala</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400">
            {room.roomCode}
          </span>
          <button
            onClick={handleCopyCode}
            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
            title="Copiar código"
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
          {copied ? 'Copiado!' : 'Copiar enlace de invitación'}
        </Button>
      </Card>

      {/* Lista de jugadores */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Jugadores ({room.players.filter(p => p.isConnected).length}/15)
          </h3>
          {!canStart && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Mínimo 3 jugadores
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
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Categoría de palabras
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {wordCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              disabled={!isHost}
              className={`
                p-3 rounded-xl text-center transition-all
                ${selectedCategory === category.id
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 ring-2 ring-indigo-500'
                  : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
                ${!isHost ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              <span className="text-2xl block mb-1">{category.emoji}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {category.name}
              </span>
            </button>
          ))}
        </div>
        {!isHost && (
          <p className="text-xs text-gray-500 mt-3 text-center">
            Solo el host puede cambiar la categoría
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
          {canStart ? 'Iniciar Partida' : `Esperando jugadores (${room.players.filter(p => p.isConnected).length}/3)`}
        </Button>
      )}

      {!isHost && (
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <p className="text-gray-600 dark:text-gray-400">
            Esperando a que el host inicie la partida...
          </p>
        </div>
      )}
    </div>
  );
}
