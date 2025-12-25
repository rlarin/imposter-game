import { GameRoom, Player, GameSettings, Clue, Vote, WordChangeVote } from './types';
import { generateRoomCode, generatePlayerId, getRandomAvatarColor, pickRandom, shuffle, tallyVotes } from './utils';
import { getRandomWord, getHintWord } from './words/index';
import { Locale } from '@/i18n/config';

// Configuración por defecto
export const defaultSettings: GameSettings = {
  clueRounds: 2,
  clueTimeLimit: 180,      // 3 minutos por defecto
  voteTimeLimit: 180,      // 3 minutos por defecto
  category: 'animals',
  timerEnabled: false,     // Timer deshabilitado por defecto
  imposterHintEnabled: true, // Pista para el impostor habilitada por defecto
  trollModeEnabled: true   // Modo troll habilitado por defecto
};

// Probabilidad de que todos sean impostores en modo troll (20%)
const TROLL_MODE_CHANCE = 0.20;

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
    hasVoted: false,
    hasVotedWordChange: false
  };

  const room: GameRoom = {
    roomCode,
    hostId: playerId,
    players: [host],
    phase: 'lobby',
    settings: { ...defaultSettings },
    currentRound: 0,
    secretWord: null,
    imposterHint: null,
    imposterHints: [],
    imposterId: null,
    everyoneIsImposter: false,
    clues: [],
    votes: [],
    wordChangeUsed: false,
    wordChangeVotingActive: false,
    wordChangeVotes: [],
    wordChangeInitiatorId: null,
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
    hasVoted: false,
    hasVotedWordChange: false
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
export function startGame(room: GameRoom, category: string, locale: Locale = 'en'): GameRoom | null {
  const connectedPlayers = room.players.filter(p => p.isConnected);
  if (connectedPlayers.length < 3) return null;
  if (room.phase !== 'lobby') return null;

  // Seleccionar palabra secreta
  const secretWord = getRandomWord(locale, category);
  if (!secretWord) return null;

  // Modo troll: posibilidad de que todos sean impostores
  const everyoneIsImposter = room.settings.trollModeEnabled && Math.random() < TROLL_MODE_CHANCE;

  // Generar pista para el impostor si está habilitado (no aplica si todos son impostores)
  let imposterHint: string | null = null;
  if (room.settings.imposterHintEnabled && !everyoneIsImposter) {
    imposterHint = getHintWord(locale, category, secretWord);
  }

  // Seleccionar impostor aleatorio (o todos si es modo troll activado)
  let imposterId: string | null = null;
  let updatedPlayers: Player[];

  if (everyoneIsImposter) {
    // Todos son impostores - nadie conoce la palabra
    updatedPlayers = room.players.map(p => ({
      ...p,
      isImposter: true,
      isEliminated: false,
      hasSubmittedClue: false,
      hasVoted: false,
      hasVotedWordChange: false
    }));
  } else {
    // Juego normal - un impostor
    const shuffledPlayers = shuffle(connectedPlayers);
    const imposter = pickRandom(shuffledPlayers);
    imposterId = imposter.id;

    updatedPlayers = room.players.map(p => ({
      ...p,
      isImposter: p.id === imposter.id,
      isEliminated: false,
      hasSubmittedClue: false,
      hasVoted: false,
      hasVotedWordChange: false
    }));
  }

  // Crear array de pistas para el impostor (inicialmente con 1 pista si está habilitado)
  const imposterHints: string[] = imposterHint ? [imposterHint] : [];

  return {
    ...room,
    players: updatedPlayers,
    phase: 'word-reveal',
    settings: { ...room.settings, category },
    currentRound: 1,
    secretWord,
    imposterHint,
    imposterHints,
    imposterId,
    everyoneIsImposter,
    clues: [],
    votes: [],
    wordChangeUsed: false,
    wordChangeVotingActive: false,
    wordChangeVotes: [],
    wordChangeInitiatorId: null,
    phaseStartedAt: Date.now(),
    phaseEndsAt: Date.now() + 5000, // 5 segundos para ver la palabra
    winner: null,
    imposterGuess: null,
    eliminatedPlayerId: null
  };
}

// Helper para calcular phaseEndsAt respetando timerEnabled
function getPhaseEndTime(room: GameRoom, durationSeconds: number): number | null {
  if (!room.settings.timerEnabled) return null;
  return Date.now() + durationSeconds * 1000;
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
        phaseEndsAt: getPhaseEndTime(room, room.settings.clueTimeLimit)
      };

    case 'clue-round':
      return {
        ...room,
        phase: 'voting',
        phaseStartedAt: now,
        phaseEndsAt: getPhaseEndTime(room, room.settings.voteTimeLimit),
        players: room.players.map(p => ({ ...p, hasVoted: false }))
      };

    case 'voting':
      return processVotes(room);

    case 'vote-results':
      // En modo troll (todos son impostores), ir directo a game-over
      if (room.everyoneIsImposter) {
        return {
          ...room,
          phase: 'game-over',
          winner: null, // No hay ganador en troll mode
          phaseStartedAt: now,
          phaseEndsAt: null
        };
      }

      // Si el impostor fue eliminado, pasa a imposter-guess
      // Si no, continúa con más rondas o termina
      if (room.eliminatedPlayerId === room.imposterId) {
        return {
          ...room,
          phase: 'imposter-guess',
          phaseStartedAt: now,
          phaseEndsAt: getPhaseEndTime(room, 30) // 30 segundos para adivinar
        };
      }

      // Si quedan más rondas
      if (room.currentRound < room.settings.clueRounds) {
        return {
          ...room,
          phase: 'clue-round',
          currentRound: room.currentRound + 1,
          phaseStartedAt: now,
          phaseEndsAt: getPhaseEndTime(room, room.settings.clueTimeLimit),
          votes: [],
          wordChangeUsed: false,
          wordChangeVotingActive: false,
          wordChangeVotes: [],
          wordChangeInitiatorId: null,
          players: room.players.map(p => ({
            ...p,
            hasSubmittedClue: false,
            hasVoted: false,
            hasVotedWordChange: false
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
    imposterHint: null,
    imposterHints: [],
    imposterId: null,
    everyoneIsImposter: false,
    clues: [],
    votes: [],
    wordChangeUsed: false,
    wordChangeVotingActive: false,
    wordChangeVotes: [],
    wordChangeInitiatorId: null,
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
      hasVoted: false,
      hasVotedWordChange: false
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

// ========== WORD CHANGE VOTING ==========

// Iniciar votación de cambio de palabra
export function initiateWordChangeVote(room: GameRoom, playerId: string): GameRoom | null {
  // Solo permitido durante clue-round
  if (room.phase !== 'clue-round') return null;

  // No permitir si ya se usó este round
  if (room.wordChangeUsed) return null;

  // No permitir si ya hay una votación activa
  if (room.wordChangeVotingActive) return null;

  // El jugador debe existir y no estar eliminado
  const player = room.players.find(p => p.id === playerId);
  if (!player || player.isEliminated) return null;

  return {
    ...room,
    wordChangeVotingActive: true,
    wordChangeVotes: [],
    wordChangeInitiatorId: playerId,
    players: room.players.map(p => ({
      ...p,
      hasVotedWordChange: false
    }))
  };
}

// Emitir voto para cambio de palabra
export function castWordChangeVote(room: GameRoom, voterId: string, vote: boolean): GameRoom | null {
  // Debe haber una votación activa
  if (!room.wordChangeVotingActive) return null;

  const voter = room.players.find(p => p.id === voterId);
  if (!voter || voter.hasVotedWordChange || voter.isEliminated) return null;

  const wordChangeVote: WordChangeVote = {
    voterId,
    vote
  };

  return {
    ...room,
    wordChangeVotes: [...room.wordChangeVotes, wordChangeVote],
    players: room.players.map(p =>
      p.id === voterId ? { ...p, hasVotedWordChange: true } : p
    )
  };
}

// Verificar si todos han votado cambio de palabra
export function allWordChangeVotesSubmitted(room: GameRoom): boolean {
  const activePlayers = room.players.filter(p => p.isConnected && !p.isEliminated);
  return activePlayers.every(p => p.hasVotedWordChange);
}

// Procesar resultado de votación de cambio de palabra
export function processWordChangeVotes(room: GameRoom, locale: Locale = 'en'): { room: GameRoom; passed: boolean; newHintsCount: number } {
  const activePlayers = room.players.filter(p => p.isConnected && !p.isEliminated);
  const requiredVotes = Math.floor(activePlayers.length / 2) + 1; // Mayoría simple

  const yesVotes = room.wordChangeVotes.filter(v => v.vote).length;
  const passed = yesVotes >= requiredVotes;

  if (!passed) {
    // La votación falló - solo marcar como usada y cerrar votación
    return {
      room: {
        ...room,
        wordChangeUsed: true,
        wordChangeVotingActive: false
      },
      passed: false,
      newHintsCount: 0
    };
  }

  // La votación pasó - cambiar palabra y dar pistas extras al impostor
  const category = room.settings.category;
  const currentWord = room.secretWord;

  // Obtener nueva palabra (diferente a la actual)
  let newWord = getRandomWord(locale, category);
  let attempts = 0;
  while (newWord === currentWord && attempts < 10) {
    newWord = getRandomWord(locale, category);
    attempts++;
  }

  if (!newWord) {
    // No se pudo obtener nueva palabra - fallback
    return {
      room: {
        ...room,
        wordChangeUsed: true,
        wordChangeVotingActive: false
      },
      passed: false,
      newHintsCount: 0
    };
  }

  // Generar 2 pistas extras para el impostor
  const newHints: string[] = [];
  if (room.settings.imposterHintEnabled && !room.everyoneIsImposter) {
    for (let i = 0; i < 2; i++) {
      const hint = getHintWord(locale, category, newWord);
      if (hint && !newHints.includes(hint)) {
        newHints.push(hint);
      }
    }
  }

  // Nueva pista principal para el impostor
  const newImposterHint = room.settings.imposterHintEnabled && !room.everyoneIsImposter
    ? getHintWord(locale, category, newWord)
    : null;

  return {
    room: {
      ...room,
      secretWord: newWord,
      imposterHint: newImposterHint,
      imposterHints: [...room.imposterHints, ...newHints],
      wordChangeUsed: true,
      wordChangeVotingActive: false
    },
    passed: true,
    newHintsCount: newHints.length
  };
}

// Obtener información segura para enviar al cliente
// (no enviar secretWord ni imposterId excepto cuando corresponda)
export function getSafeRoomState(room: GameRoom, playerId: string): GameRoom {
  const player = room.players.find(p => p.id === playerId);
  const isImposter = player?.isImposter ?? false;
  const isGameOver = room.phase === 'game-over';
  const isVoteResults = room.phase === 'vote-results';
  const isImposterGuess = room.phase === 'imposter-guess';

  return {
    ...room,
    // Solo mostrar palabra si NO es el impostor o si el juego terminó
    secretWord: (isImposter && !isGameOver) ? null : room.secretWord,
    // Solo mostrar pista al impostor (y solo si está habilitada)
    imposterHint: isImposter ? room.imposterHint : null,
    // Solo mostrar array de pistas al impostor
    imposterHints: isImposter ? room.imposterHints : [],
    // Mostrar quién es el impostor en game-over, vote-results, o imposter-guess
    imposterId: (isGameOver || isVoteResults || isImposterGuess) ? room.imposterId : null,
    // Ocultar quién es impostor en la lista de jugadores (excepto game-over)
    players: room.players.map(p => ({
      ...p,
      isImposter: isGameOver ? p.isImposter : (p.id === playerId ? p.isImposter : false)
    })),
    // Ocultar votos de cambio de palabra (votación secreta) - solo mostrar si votó
    wordChangeVotes: room.wordChangeVotes.filter(v => v.voterId === playerId)
  };
}
