// Game phase state machine
export type GamePhase =
  | 'lobby'           // Esperando jugadores
  | 'word-reveal'     // Mostrando palabra (o mensaje de impostor)
  | 'clue-round'      // Jugadores dan pistas
  | 'voting'          // Votación para eliminar
  | 'vote-results'    // Mostrando resultados de votación
  | 'imposter-guess'  // El impostor intenta adivinar la palabra
  | 'game-over';      // Fin del juego

// Jugador en la partida
export interface Player {
  id: string;              // ID único de conexión
  name: string;            // Nombre visible
  avatarColor: string;     // Color del avatar
  isHost: boolean;         // Puede iniciar el juego
  isImposter: boolean;     // Es el impostor (solo se revela al final)
  isEliminated: boolean;   // Eliminado por votación
  isConnected: boolean;    // Actualmente conectado
  hasSubmittedClue: boolean; // Ya envió pista esta ronda
  hasVoted: boolean;       // Ya votó esta ronda
  hasVotedWordChange: boolean; // Ya votó en cambio de palabra
}

// Pista enviada por un jugador
export interface Clue {
  playerId: string;
  playerName: string;
  word: string;
  round: number;
}

// Voto de un jugador
export interface Vote {
  voterId: string;
  voterName: string;
  targetId: string;
}

// Voto para cambiar la palabra secreta
export interface WordChangeVote {
  voterId: string;
  vote: boolean; // true = yes, false = no
}

// Configuración del juego
export interface GameSettings {
  clueRounds: number;        // Número de rondas de pistas (1-3)
  clueTimeLimit: number;     // Segundos por ronda de pistas
  voteTimeLimit: number;     // Segundos para votar
  category: string;          // Categoría de palabras
  timerEnabled: boolean;     // Si el timer está habilitado
  imposterHintEnabled: boolean; // Si el impostor recibe una pista
  trollModeEnabled: boolean; // Modo troll: posibilidad de que todos sean impostores
}

// Estado completo de la sala
export interface GameRoom {
  roomCode: string;           // Código de 6 caracteres
  hostId: string;             // ID del host
  players: Player[];          // Lista de jugadores
  phase: GamePhase;           // Fase actual
  settings: GameSettings;     // Configuración

  // Estado del juego activo
  currentRound: number;       // Ronda actual de pistas
  secretWord: string | null;  // Palabra secreta
  imposterHint: string | null; // Curated abstract hint for the imposter (Three-Filter Rule)
  imposterHints: string[];    // Array de pistas para el impostor (puede recibir extras)
  imposterId: string | null;  // Quién es el impostor (null si todos son impostores)
  everyoneIsImposter: boolean; // Modo troll: todos son impostores
  clues: Clue[];              // Pistas enviadas
  votes: Vote[];              // Votos de la ronda actual

  // Estado de votación de cambio de palabra
  wordChangeUsed: boolean;           // Si ya se usó el cambio de palabra esta ronda
  wordChangeVotingActive: boolean;   // Si hay una votación activa
  wordChangeVotes: WordChangeVote[]; // Votos del cambio de palabra
  wordChangeInitiatorId: string | null; // Quién inició la votación

  // Tiempos
  createdAt: number;          // Timestamp de creación
  phaseStartedAt: number;     // Cuándo empezó la fase actual
  phaseEndsAt: number | null; // Cuándo termina la fase (para timer)

  // Resultado
  winner: 'group' | 'imposter' | null;
  imposterGuess: string | null;
  eliminatedPlayerId: string | null;
}

// Mensajes del cliente al servidor
export type ClientMessage =
  | { type: 'join'; playerName: string }
  | { type: 'leave' }
  | { type: 'start-game'; category: string; locale?: string }
  | { type: 'submit-clue'; word: string }
  | { type: 'cast-vote'; targetId: string }
  | { type: 'imposter-guess'; word: string }
  | { type: 'play-again' }
  | { type: 'reset-game' }
  | { type: 'kick-player'; playerId: string }
  | { type: 'update-settings'; settings: Partial<GameSettings> }
  | { type: 'initiate-word-change' }
  | { type: 'vote-word-change'; vote: boolean };

// Mensajes del servidor al cliente
export type ServerMessage =
  | { type: 'room-state'; room: GameRoom; playerId: string }
  | { type: 'player-joined'; player: Player }
  | { type: 'player-left'; playerId: string }
  | { type: 'player-kicked'; playerId: string }
  | { type: 'room-closed'; reason: 'host-left' }
  | { type: 'game-started'; phase: GamePhase }
  | { type: 'phase-changed'; phase: GamePhase; data?: Record<string, unknown> }
  | { type: 'clue-submitted'; playerId: string }
  | { type: 'vote-cast'; voterId: string }
  | { type: 'timer-update'; remaining: number }
  | { type: 'error'; message: string }
  | { type: 'settings-updated'; settings: GameSettings }
  | { type: 'word-change-vote-started'; initiatorId: string; initiatorName: string }
  | { type: 'word-change-vote-cast'; voterId: string }
  | { type: 'word-change-vote-result'; passed: boolean; newHintsCount?: number };

// Categoría de palabras
export interface WordCategory {
  id: string;
  name: string;
  emoji: string;
  words: string[];
}

// Curated hints for imposter (follows Three-Filter Rule)
// Hints are: related but not defining, vague in interpretation, never reveal the word
export type WordHintsMap = Record<string, string[]>;

// Para almacenamiento local del jugador
export interface LocalPlayer {
  id: string;
  name: string;
}
