import type * as Party from 'partykit/server';
import {
  GameRoom,
  Player,
  ClientMessage,
  ServerMessage,
  GameSettings
} from '../lib/types';
import {
  defaultSettings,
  startGame,
  submitClue,
  castVote,
  imposterGuess,
  playAgain,
  advancePhase,
  allCluesSubmitted,
  allVotesSubmitted,
  getSafeRoomState,
  initiateWordChangeVote,
  castWordChangeVote,
  allWordChangeVotesSubmitted,
  processWordChangeVotes
} from '../lib/game-logic';
import { Locale } from '@/i18n/config';
import { generatePlayerId, getRandomAvatarColor } from '../lib/utils';

// Mapa de conexiones a IDs de jugador
type ConnectionPlayerMap = Map<string, string>;

export default class GameServer implements Party.Server {
  room: GameRoom | null = null;
  connectionPlayers: ConnectionPlayerMap = new Map();
  phaseTimer: ReturnType<typeof setTimeout> | null = null;
  gameLocale: Locale = 'en';

  constructor(readonly party: Party.Party) {}

  // Inicializar sala cuando se crea
  async onStart() {
    // La sala se inicializa cuando el primer jugador se une
  }

  // Cuando un cliente se conecta
  async onConnect(conn: Party.Connection) {
    // Enviar estado actual si existe
    if (this.room) {
      const playerId = this.connectionPlayers.get(conn.id);
      if (playerId) {
        this.sendToConnection(conn, {
          type: 'room-state',
          room: getSafeRoomState(this.room, playerId),
          playerId
        });
      }
    }
  }

  // Cuando un cliente se desconecta
  async onClose(conn: Party.Connection) {
    const playerId = this.connectionPlayers.get(conn.id);
    if (!playerId || !this.room) return;

    // If the host disconnects, close the room for everyone
    if (playerId === this.room.hostId) {
      this.broadcast({
        type: 'room-closed',
        reason: 'host-left'
      });
      this.room = null;
      this.connectionPlayers.clear();
      this.clearPhaseTimer();
      return;
    }

    // Marcar jugador como desconectado
    this.room = {
      ...this.room,
      players: this.room.players.map(p =>
        p.id === playerId ? { ...p, isConnected: false } : p
      )
    };

    this.connectionPlayers.delete(conn.id);

    // Si no quedan jugadores conectados, limpiar la sala
    const connectedPlayers = this.room.players.filter(p => p.isConnected);
    if (connectedPlayers.length === 0) {
      this.room = null;
      this.clearPhaseTimer();
    } else {
      // Broadcast updated state to all remaining players
      this.broadcastState();
    }
  }

  // Procesar mensajes del cliente
  async onMessage(message: string, sender: Party.Connection) {
    try {
      const event = JSON.parse(message) as ClientMessage;

      switch (event.type) {
        case 'join':
          await this.handleJoin(sender, event.playerName);
          break;

        case 'leave':
          await this.handleLeave(sender);
          break;

        case 'start-game':
          await this.handleStartGame(sender, event.category, event.locale);
          break;

        case 'submit-clue':
          await this.handleSubmitClue(sender, event.word);
          break;

        case 'cast-vote':
          await this.handleCastVote(sender, event.targetId);
          break;

        case 'imposter-guess':
          await this.handleImposterGuess(sender, event.word);
          break;

        case 'play-again':
          await this.handlePlayAgain(sender);
          break;

        case 'reset-game':
          await this.handleResetGame(sender);
          break;

        case 'update-settings':
          await this.handleUpdateSettings(sender, event.settings);
          break;

        case 'kick-player':
          await this.handleKickPlayer(sender, event.playerId);
          break;

        case 'initiate-word-change':
          await this.handleInitiateWordChange(sender);
          break;

        case 'vote-word-change':
          await this.handleVoteWordChange(sender, event.vote);
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
      this.sendToConnection(sender, {
        type: 'error',
        message: 'Error procesando mensaje'
      });
    }
  }

  // Manejar jugador uniéndose
  private async handleJoin(conn: Party.Connection, playerName: string) {
    const playerId = generatePlayerId();
    this.connectionPlayers.set(conn.id, playerId);

    if (!this.room) {
      // Crear nueva sala
      const player: Player = {
        id: playerId,
        name: playerName,
        avatarColor: getRandomAvatarColor(),
        isHost: true,
        isImposter: false,
        isEliminated: false,
        isConnected: true,
        hasSubmittedClue: false,
        hasVoted: false,
        hasVotedWordChange: false
      };

      this.room = {
        roomCode: this.party.id,
        hostId: playerId,
        players: [player],
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
    } else {
      // Verificar si el jugador ya existe (reconexión)
      const existingPlayer = this.room.players.find(p => p.name === playerName);
      if (existingPlayer) {
        // Reconectar
        this.connectionPlayers.set(conn.id, existingPlayer.id);
        this.room = {
          ...this.room,
          players: this.room.players.map(p =>
            p.id === existingPlayer.id ? { ...p, isConnected: true } : p
          )
        };
        // Broadcast to all so everyone sees the reconnection
        this.broadcastState();
        return;
      } else {
        // Nuevo jugador
        if (this.room.phase !== 'lobby') {
          this.sendToConnection(conn, {
            type: 'error',
            message: 'La partida ya comenzó'
          });
          return;
        }

        if (this.room.players.length >= 15) {
          this.sendToConnection(conn, {
            type: 'error',
            message: 'La sala está llena'
          });
          return;
        }

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

        this.room = {
          ...this.room,
          players: [...this.room.players, player]
        };
      }
    }

    // Broadcast state to ALL players (including the new one)
    this.broadcastState();
  }

  // Manejar jugador saliendo
  private async handleLeave(conn: Party.Connection) {
    const playerId = this.connectionPlayers.get(conn.id);
    if (!playerId || !this.room) return;

    // If the host leaves, close the room for everyone
    if (playerId === this.room.hostId) {
      this.broadcast({
        type: 'room-closed',
        reason: 'host-left'
      });
      this.room = null;
      this.connectionPlayers.clear();
      this.clearPhaseTimer();
      return;
    }

    this.room = {
      ...this.room,
      players: this.room.players.filter(p => p.id !== playerId)
    };

    this.connectionPlayers.delete(conn.id);

    // Broadcast updated state to remaining players
    if (this.room.players.length > 0) {
      this.broadcastState();
    }
  }

  // Iniciar juego
  private async handleStartGame(conn: Party.Connection, category: string, locale?: string) {
    const playerId = this.connectionPlayers.get(conn.id);
    if (!playerId || !this.room) return;

    // Solo el host puede iniciar
    if (playerId !== this.room.hostId) {
      this.sendToConnection(conn, {
        type: 'error',
        message: 'Solo el host puede iniciar el juego'
      });
      return;
    }

    // Use provided locale or default to 'en'
    this.gameLocale = (locale as Locale) || 'en';
    const newRoom = startGame(this.room, category, this.gameLocale);
    if (!newRoom) {
      this.sendToConnection(conn, {
        type: 'error',
        message: 'Se necesitan al menos 3 jugadores para iniciar'
      });
      return;
    }

    this.room = newRoom;
    this.broadcastState();

    // Programar avance automático de fase
    this.schedulePhaseAdvance();
  }

  // Enviar pista
  private async handleSubmitClue(conn: Party.Connection, word: string) {
    const playerId = this.connectionPlayers.get(conn.id);
    if (!playerId || !this.room) return;

    const newRoom = submitClue(this.room, playerId, word);
    if (!newRoom) {
      this.sendToConnection(conn, {
        type: 'error',
        message: 'No se pudo enviar la pista'
      });
      return;
    }

    this.room = newRoom;

    // Si todos enviaron, avanzar fase
    if (allCluesSubmitted(this.room)) {
      this.clearPhaseTimer();
      this.room = advancePhase(this.room);
    }

    // Broadcast state to update hasSubmittedClue status for all players
    this.broadcastState();

    // Schedule next phase if needed
    if (this.room.phaseEndsAt) {
      this.schedulePhaseAdvance();
    }
  }

  // Votar
  private async handleCastVote(conn: Party.Connection, targetId: string) {
    const playerId = this.connectionPlayers.get(conn.id);
    if (!playerId || !this.room) return;

    const newRoom = castVote(this.room, playerId, targetId);
    if (!newRoom) {
      this.sendToConnection(conn, {
        type: 'error',
        message: 'No se pudo registrar el voto'
      });
      return;
    }

    this.room = newRoom;

    // Si todos votaron, avanzar fase
    if (allVotesSubmitted(this.room)) {
      this.clearPhaseTimer();
      this.room = advancePhase(this.room);
    }

    // Broadcast state to update hasVoted status for all players
    this.broadcastState();

    // Schedule next phase if needed
    if (this.room.phaseEndsAt) {
      this.schedulePhaseAdvance();
    }
  }

  // El impostor adivina
  private async handleImposterGuess(conn: Party.Connection, word: string) {
    const playerId = this.connectionPlayers.get(conn.id);
    if (!playerId || !this.room) return;

    // Verificar que es el impostor
    if (playerId !== this.room.imposterId) {
      this.sendToConnection(conn, {
        type: 'error',
        message: 'Solo el impostor puede adivinar'
      });
      return;
    }

    this.clearPhaseTimer();
    this.room = imposterGuess(this.room, word);
    this.broadcastState();
  }

  // Jugar de nuevo
  private async handlePlayAgain(conn: Party.Connection) {
    const playerId = this.connectionPlayers.get(conn.id);
    if (!playerId || !this.room) return;

    // Solo el host puede reiniciar
    if (playerId !== this.room.hostId) {
      this.sendToConnection(conn, {
        type: 'error',
        message: 'Solo el host puede reiniciar'
      });
      return;
    }

    this.clearPhaseTimer();
    this.room = playAgain(this.room);
    this.broadcastState();
  }

  // Reiniciar juego (desde cualquier fase)
  private async handleResetGame(conn: Party.Connection) {
    const playerId = this.connectionPlayers.get(conn.id);
    if (!playerId || !this.room) return;

    // Solo el host puede reiniciar
    if (playerId !== this.room.hostId) {
      this.sendToConnection(conn, {
        type: 'error',
        message: 'Solo el host puede reiniciar'
      });
      return;
    }

    // No permitir reiniciar si ya estamos en lobby
    if (this.room.phase === 'lobby') {
      return;
    }

    this.clearPhaseTimer();
    this.room = playAgain(this.room);
    this.broadcastState();
  }

  // Actualizar configuración
  private async handleUpdateSettings(conn: Party.Connection, settings: Partial<GameSettings>) {
    const playerId = this.connectionPlayers.get(conn.id);
    if (!playerId || !this.room) return;

    // Solo el host puede cambiar configuración
    if (playerId !== this.room.hostId) {
      this.sendToConnection(conn, {
        type: 'error',
        message: 'Solo el host puede cambiar la configuración'
      });
      return;
    }

    // Solo en lobby
    if (this.room.phase !== 'lobby') {
      return;
    }

    this.room = {
      ...this.room,
      settings: { ...this.room.settings, ...settings }
    };

    // Broadcast full state so all clients update
    this.broadcastState();
  }

  // Expulsar jugador
  private async handleKickPlayer(conn: Party.Connection, targetPlayerId: string) {
    const playerId = this.connectionPlayers.get(conn.id);
    if (!playerId || !this.room) return;

    // Solo el host puede expulsar
    if (playerId !== this.room.hostId) {
      return;
    }

    // No puede expulsarse a sí mismo
    if (targetPlayerId === playerId) {
      return;
    }

    // Solo en lobby
    if (this.room.phase !== 'lobby') {
      return;
    }

    // Find and close the kicked player's connection
    let kickedConnId: string | null = null;
    for (const [connId, pId] of this.connectionPlayers.entries()) {
      if (pId === targetPlayerId) {
        kickedConnId = connId;
        break;
      }
    }

    // Send kick notification to the kicked player before removing them
    if (kickedConnId) {
      const kickedConn = this.party.getConnection(kickedConnId);
      if (kickedConn) {
        this.sendToConnection(kickedConn, {
          type: 'player-kicked',
          playerId: targetPlayerId
        });
      }
      this.connectionPlayers.delete(kickedConnId);
    }

    this.room = {
      ...this.room,
      players: this.room.players.filter(p => p.id !== targetPlayerId)
    };

    // Broadcast updated state to remaining players
    this.broadcastState();
  }

  // Iniciar votación de cambio de palabra
  private async handleInitiateWordChange(conn: Party.Connection) {
    const playerId = this.connectionPlayers.get(conn.id);
    if (!playerId || !this.room) return;

    const newRoom = initiateWordChangeVote(this.room, playerId);
    if (!newRoom) {
      this.sendToConnection(conn, {
        type: 'error',
        message: 'No se puede iniciar votación de cambio de palabra'
      });
      return;
    }

    this.room = newRoom;

    // Obtener nombre del iniciador
    const initiator = this.room.players.find(p => p.id === playerId);

    // Broadcast que se inició la votación
    this.broadcast({
      type: 'word-change-vote-started',
      initiatorId: playerId,
      initiatorName: initiator?.name || 'Jugador'
    });

    this.broadcastState();
  }

  // Votar en cambio de palabra
  private async handleVoteWordChange(conn: Party.Connection, vote: boolean) {
    const playerId = this.connectionPlayers.get(conn.id);
    if (!playerId || !this.room) return;

    const newRoom = castWordChangeVote(this.room, playerId, vote);
    if (!newRoom) {
      this.sendToConnection(conn, {
        type: 'error',
        message: 'No se pudo registrar el voto'
      });
      return;
    }

    this.room = newRoom;

    // Broadcast que alguien votó
    this.broadcast({
      type: 'word-change-vote-cast',
      voterId: playerId
    });

    // Si todos votaron, procesar resultado
    if (allWordChangeVotesSubmitted(this.room)) {
      const result = processWordChangeVotes(this.room, this.gameLocale);
      this.room = result.room;

      // Broadcast resultado
      this.broadcast({
        type: 'word-change-vote-result',
        passed: result.passed,
        newHintsCount: result.newHintsCount
      });
    }

    this.broadcastState();
  }

  // Programar avance automático de fase
  private schedulePhaseAdvance() {
    this.clearPhaseTimer();

    if (!this.room || !this.room.phaseEndsAt) return;

    const delay = this.room.phaseEndsAt - Date.now();
    if (delay <= 0) {
      this.room = advancePhase(this.room);
      this.broadcastState();
      this.schedulePhaseAdvance();
      return;
    }

    this.phaseTimer = setTimeout(() => {
      if (!this.room) return;
      this.room = advancePhase(this.room);
      this.broadcastState();
      this.schedulePhaseAdvance();
    }, delay);
  }

  // Limpiar timer
  private clearPhaseTimer() {
    if (this.phaseTimer) {
      clearTimeout(this.phaseTimer);
      this.phaseTimer = null;
    }
  }

  // Enviar mensaje a una conexión
  private sendToConnection(conn: Party.Connection, message: ServerMessage) {
    conn.send(JSON.stringify(message));
  }

  // Broadcast a todos
  private broadcast(message: ServerMessage) {
    this.party.broadcast(JSON.stringify(message));
  }

  // Broadcast estado completo (cada jugador recibe su versión)
  private broadcastState() {
    if (!this.room) return;

    for (const [connId, playerId] of this.connectionPlayers.entries()) {
      const conn = this.party.getConnection(connId);
      if (conn) {
        this.sendToConnection(conn, {
          type: 'room-state',
          room: getSafeRoomState(this.room, playerId),
          playerId
        });
      }
    }
  }
}
