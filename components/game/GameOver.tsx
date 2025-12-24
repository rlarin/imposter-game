'use client';

import { GameRoom } from '@/lib/types';
import { Button, Card, Avatar } from '@/components/ui';

interface GameOverProps {
  room: GameRoom;
  playerId: string;
  onPlayAgain: () => void;
}

export default function GameOver({ room, playerId, onPlayAgain }: GameOverProps) {
  const isHost = playerId === room.hostId;
  const imposterPlayer = room.players.find(p => p.id === room.imposterId);
  const currentPlayer = room.players.find(p => p.id === playerId);
  const wasImposter = currentPlayer?.isImposter ?? false;
  const groupWon = room.winner === 'group';

  // Determinar si el jugador actual ganó
  const playerWon = (groupWon && !wasImposter) || (!groupWon && wasImposter);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card variant="elevated" padding="lg" className="text-center max-w-md w-full">
        {/* Resultado principal */}
        <div className={`
          text-6xl mb-4
          ${playerWon ? 'animate-bounce' : 'animate-pulse'}
        `}>
          {playerWon ? '🎉' : '😢'}
        </div>

        <h2 className={`
          text-3xl font-bold mb-2
          ${groupWon
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
          }
        `}>
          {groupWon ? '¡El grupo gana!' : '¡El impostor gana!'}
        </h2>

        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          {playerWon ? '¡Felicidades!' : 'Mejor suerte la próxima vez'}
        </p>

        {/* Info del impostor */}
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-xl mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            El impostor era:
          </p>
          {imposterPlayer && (
            <div className="flex items-center justify-center gap-3">
              <Avatar
                name={imposterPlayer.name}
                color={imposterPlayer.avatarColor}
                size="lg"
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {imposterPlayer.name}
              </span>
            </div>
          )}
        </div>

        {/* Palabra secreta */}
        <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">La palabra secreta era:</p>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 uppercase">
            {room.secretWord}
          </p>

          {/* Si el impostor intentó adivinar */}
          {room.imposterGuess && (
            <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                El impostor adivinó:
              </p>
              <p className={`
                text-xl font-bold
                ${room.imposterGuess.toLowerCase() === room.secretWord?.toLowerCase()
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
                }
              `}>
                {room.imposterGuess}
                {room.imposterGuess.toLowerCase() === room.secretWord?.toLowerCase()
                  ? ' ✓'
                  : ' ✗'
                }
              </p>
            </div>
          )}
        </div>

        {/* Explicación de cómo ganó */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {groupWon
            ? room.imposterGuess
              ? 'El impostor fue descubierto y no adivinó la palabra.'
              : 'El impostor fue descubierto y no intentó adivinar a tiempo.'
            : room.eliminatedPlayerId !== room.imposterId
              ? 'El grupo eliminó a un jugador inocente.'
              : 'El impostor adivinó la palabra correctamente.'
          }
        </p>

        {/* Botón de jugar de nuevo */}
        {isHost ? (
          <Button onClick={onPlayAgain} size="lg" className="w-full">
            Jugar de Nuevo
          </Button>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            Esperando a que el host inicie otra partida...
          </p>
        )}
      </Card>
    </div>
  );
}
