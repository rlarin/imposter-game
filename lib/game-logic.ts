import { GameRoom, Player, GameSettings, Clue, Vote } from './types';
import { generateRoomCode, generatePlayerId, getRandomAvatarColor, pickRandom, tallyVotes } from './utils';
import { getRandomWord } from './words';

// Configuración por defecto
export const defaultSettings: GameSettings = {
  clueRounds: 2,
  clueTimeLimit: 60,
  voteTimeLimit: 45,
  category: 'animals'
};

// Crear una nueva sala
export function createRoom(hostName: string): { room: GameRoom; playerId: string } {
  const playerId = generatePlayerId();
  const roomCode = generateRoomCode();

  const host: Player = {
    id: playerId,
    name: hostName,
    avatarColor: getRandomAvatarColor(),
    isHost: true,
    isImposter: false,
    isEliminated: false,
    isConnected: true,
    hasSubmittedClue: false,
    hasVoted: false
  };

  const room: GameRoom = {
    roomCode,
    hostId: playerId,
    players: [host],
    phase: 'lobby',
    settings: { ...defaultSettings },
    currentRound: 0,
    secretWord: null,
    imposterId: null,
    clues: [],
    votes: [],
    createdAt: Date.now(),
    phaseStartedAt: Date.now(),
    phaseEndsAt: null,
    winner: null,
    imposterGuess: null,
    eliminatedPlayerId: null
  };

  return { room, playerId };
}

// Agregar jugador a la sala
export function addPlayer(room: GameRoom, playerName: string): { room: GameRoom; playerId: string } | null {
  if (room.phase !== 'lobby') return null;
  if (room.players.length >= 15) return null;

  const playerId = generatePlayerId();

  const player: Player = {
    id: playerId,
    name: playerName,
    avatarColor: getRandomAvatarColor(),
    isHost: false,
    isImposter: false,
    isEliminated: false,
    isConnected: true,
    hasSubmittedClue: false,
    hasVoted: false
  };

  return {
    room: {
      ...room,
      players: [...room.players, player]
    },
    playerId
  };
}

// Remover jugador de la sala
export function removePlayer(room: GameRoom, playerId: string): GameRoom {
  const newPlayers = room.players.filter(p => p.id !== playerId);

  // Si el host se va, asignar nuevo host
  let newHostId = room.hostId;
  if (playerId === room.hostId && newPlayers.length > 0) {
    newHostId = newPlayers[0].id;
    newPlayers[0] = { ...newPlayers[0], isHost: true };
  }

  return {
    ...room,
    players: newPlayers,
    hostId: newHostId
  };
}

// Marcar jugador como desconectado
export function disconnectPlayer(room: GameRoom, playerId: string): GameRoom {
  return {
    ...room,
    players: room.players.map(p =>
      p.id === playerId ? { ...p, isConnected: false } : p
    )
  };
}

// Reconectar jugador
export function reconnectPlayer(room: GameRoom, playerId: string): GameRoom {
  return {
    ...room,
    players: room.players.map(p =>
      p.id === playerId ? { ...p, isConnected: true } : p
    )
  };
}

// Iniciar el juego
export function startGame(room: GameRoom, category: string): GameRoom | null {
  const connectedPlayers = room.players.filter(p => p.isConnected);
  if (connectedPlayers.length < 3) return null;
  if (room.phase !== 'lobby') return null;

  // Seleccionar palabra secreta
  const secretWord = getRandomWord(category);
  if (!secretWord) return null;

  // Seleccionar impostor aleatorio
  const imposter = pickRandom(connectedPlayers);

  // Resetear estado de jugadores
  const updatedPlayers = room.players.map(p => ({
    ...p,
    isImposter: p.id === imposter.id,
    isEliminated: false,
    hasSubmittedClue: false,
    hasVoted: false
  }));

  return {
    ...room,
    players: updatedPlayers,
    phase: 'word-reveal',
    settings: { ...room.settings, category },
    currentRound: 1,
    secretWord,
    imposterId: imposter.id,
    clues: [],
    votes: [],
    phaseStartedAt: Date.now(),
    phaseEndsAt: Date.now() + 5000, // 5 segundos para ver la palabra
    winner: null,
    imposterGuess: null,
    eliminatedPlayerId: null
  };
}

// Avanzar a la siguiente fase
export function advancePhase(room: GameRoom): GameRoom {
  const now = Date.now();

  switch (room.phase) {
    case 'word-reveal':
      return {
        ...room,
        phase: 'clue-round',
        phaseStartedAt: now,
        phaseEndsAt: now + room.settings.clueTimeLimit * 1000
      };

    case 'clue-round':
      return {
        ...room,
        phase: 'voting',
        phaseStartedAt: now,
        phaseEndsAt: now + room.settings.voteTimeLimit * 1000,
        players: room.players.map(p => ({ ...p, hasVoted: false }))
      };

    case 'voting':
      return processVotes(room);

    case 'vote-results':
      // Si el impostor fue eliminado, pasa a imposter-guess
      // Si no, continúa con más rondas o termina
      if (room.eliminatedPlayerId === room.imposterId) {
        return {
          ...room,
          phase: 'imposter-guess',
          phaseStartedAt: now,
          phaseEndsAt: now + 30000 // 30 segundos para adivinar
        };
      }

      // Si quedan más rondas
      if (room.currentRound < room.settings.clueRounds) {
        return {
          ...room,
          phase: 'clue-round',
          currentRound: room.currentRound + 1,
          phaseStartedAt: now,
          phaseEndsAt: now + room.settings.clueTimeLimit * 1000,
          votes: [],
          players: room.players.map(p => ({
            ...p,
            hasSubmittedClue: false,
            hasVoted: false
          }))
        };
      }

      // El impostor gana si no lo descubrieron
      return {
        ...room,
        phase: 'game-over',
        winner: 'imposter',
        phaseStartedAt: now,
        phaseEndsAt: null
      };

    case 'imposter-guess':
      // Si no adivinó a tiempo, el grupo gana
      return {
        ...room,
        phase: 'game-over',
        winner: 'group',
        phaseStartedAt: now,
        phaseEndsAt: null
      };

    default:
      return room;
  }
}

// Procesar votos
function processVotes(room: GameRoom): GameRoom {
  const { winnerId, isTie } = tallyVotes(room.votes);

  if (isTie || !winnerId) {
    // Empate - nadie es eliminado
    return {
      ...room,
      phase: 'vote-results',
      eliminatedPlayerId: null,
      phaseStartedAt: Date.now(),
      phaseEndsAt: Date.now() + 5000
    };
  }

  // Eliminar al jugador con más votos
  return {
    ...room,
    phase: 'vote-results',
    eliminatedPlayerId: winnerId,
    players: room.players.map(p =>
      p.id === winnerId ? { ...p, isEliminated: true } : p
    ),
    phaseStartedAt: Date.now(),
    phaseEndsAt: Date.now() + 5000
  };
}

// Enviar pista
export function submitClue(room: GameRoom, playerId: string, word: string): GameRoom | null {
  if (room.phase !== 'clue-round') return null;

  const player = room.players.find(p => p.id === playerId);
  if (!player || player.hasSubmittedClue || player.isEliminated) return null;

  const clue: Clue = {
    playerId,
    playerName: player.name,
    word: word.toLowerCase().trim(),
    round: room.currentRound
  };

  return {
    ...room,
    clues: [...room.clues, clue],
    players: room.players.map(p =>
      p.id === playerId ? { ...p, hasSubmittedClue: true } : p
    )
  };
}

// Emitir voto
export function castVote(room: GameRoom, voterId: string, targetId: string): GameRoom | null {
  if (room.phase !== 'voting') return null;

  const voter = room.players.find(p => p.id === voterId);
  if (!voter || voter.hasVoted || voter.isEliminated) return null;

  // No puedes votarte a ti mismo
  if (voterId === targetId) return null;

  // El target debe existir y no estar eliminado
  const target = room.players.find(p => p.id === targetId);
  if (!target || target.isEliminated) return null;

  const vote: Vote = {
    voterId,
    voterName: voter.name,
    targetId
  };

  return {
    ...room,
    votes: [...room.votes, vote],
    players: room.players.map(p =>
      p.id === voterId ? { ...p, hasVoted: true } : p
    )
  };
}

// El impostor adivina la palabra
export function imposterGuess(room: GameRoom, guess: string): GameRoom {
  if (room.phase !== 'imposter-guess') return room;

  const normalizedGuess = guess.toLowerCase().trim();
  const normalizedSecret = room.secretWord?.toLowerCase().trim();

  const isCorrect = normalizedGuess === normalizedSecret;

  return {
    ...room,
    phase: 'game-over',
    imposterGuess: guess,
    winner: isCorrect ? 'imposter' : 'group',
    phaseStartedAt: Date.now(),
    phaseEndsAt: null
  };
}

// Reiniciar para jugar de nuevo
export function playAgain(room: GameRoom): GameRoom {
  return {
    ...room,
    phase: 'lobby',
    currentRound: 0,
    secretWord: null,
    imposterId: null,
    clues: [],
    votes: [],
    phaseStartedAt: Date.now(),
    phaseEndsAt: null,
    winner: null,
    imposterGuess: null,
    eliminatedPlayerId: null,
    players: room.players.map(p => ({
      ...p,
      isImposter: false,
      isEliminated: false,
      hasSubmittedClue: false,
      hasVoted: false
    }))
  };
}

// Verificar si todos han enviado pista
export function allCluesSubmitted(room: GameRoom): boolean {
  const activePlayers = room.players.filter(p => p.isConnected && !p.isEliminated);
  return activePlayers.every(p => p.hasSubmittedClue);
}

// Verificar si todos han votado
export function allVotesSubmitted(room: GameRoom): boolean {
  const activePlayers = room.players.filter(p => p.isConnected && !p.isEliminated);
  return activePlayers.every(p => p.hasVoted);
}

// Obtener pistas de la ronda actual
export function getCurrentRoundClues(room: GameRoom): Clue[] {
  return room.clues.filter(c => c.round === room.currentRound);
}

// Obtener conteo de votos para mostrar
export function getVoteCounts(room: GameRoom): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const vote of room.votes) {
    counts[vote.targetId] = (counts[vote.targetId] || 0) + 1;
  }
  return counts;
}

// Obtener información segura para enviar al cliente
// (no enviar secretWord ni imposterId excepto cuando corresponda)
export function getSafeRoomState(room: GameRoom, playerId: string): GameRoom {
  const player = room.players.find(p => p.id === playerId);
  const isImposter = player?.isImposter ?? false;
  const isGameOver = room.phase === 'game-over';
  const isVoteResults = room.phase === 'vote-results';

  return {
    ...room,
    // Solo mostrar palabra si NO es el impostor o si el juego terminó
    secretWord: (isImposter && !isGameOver) ? null : room.secretWord,
    // Solo mostrar quién es el impostor en game-over o vote-results
    imposterId: (isGameOver || isVoteResults) ? room.imposterId : null,
    // Ocultar quién es impostor en la lista de jugadores (excepto game-over)
    players: room.players.map(p => ({
      ...p,
      isImposter: isGameOver ? p.isImposter : (p.id === playerId ? p.isImposter : false)
    }))
  };
}
