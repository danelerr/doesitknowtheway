import { Injectable, Logger } from '@nestjs/common';
import { Room, Player, GameState, GameMode } from '../common/types';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LobbyService {
  private readonly logger = new Logger(LobbyService.name);
  private readonly rooms = new Map<string, Room>();
  private readonly cleanupInterval = 60000; // 1 minuto

  constructor() {
    // Limpiar salas inactivas cada minuto
    setInterval(() => {
      this.cleanupExpiredRooms();
    }, this.cleanupInterval);
  }

  createRoom(hostName: string, mode: GameMode = GameMode.CLASSIC): Room {
    const roomId = this.generateRoomCode();
    const hostId = uuidv4();

    const host: Player = {
      id: hostId,
      name: hostName,
      isHost: true,
      score: 0,
      isConnected: true,
      joinedAt: Date.now(),
    };

    const room: Room = {
      id: roomId,
      players: [host],
      state: GameState.LOBBY,
      mode,
      prompt: null,
      drawerId: null,
      currentDrawing: undefined,
      drawings: [],
      guesses: new Map(),
      aiGuess: null,
      aiGuesses: [],
      roundNumber: 0,
      maxRounds: 5,
      roundStartTime: 0,
      roundDuration: 60, // 60 segundos por defecto
      expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutos
      createdAt: Date.now(),
    };

    this.rooms.set(roomId, room);
    this.logger.log(`Room created: ${roomId} by ${hostName}`);

    return room;
  }

  joinRoom(
    roomId: string,
    playerName: string,
  ): { room: Room; playerId: string } | null {
    const room = this.rooms.get(roomId);
    if (!room) {
      return null;
    }

    // Verificar si la sala está llena (máximo 6 jugadores)
    if (room.players.length >= 6) {
      return null;
    }

    // Verificar si el juego ya comenzó
    if (room.state !== GameState.LOBBY) {
      return null;
    }

    // Verificar si el nombre ya existe
    if (room.players.some((p) => p.name === playerName)) {
      return null;
    }

    const playerId = uuidv4();
    const newPlayer: Player = {
      id: playerId,
      name: playerName,
      isHost: false,
      score: 0,
      isConnected: true,
      joinedAt: Date.now(),
    };

    room.players.push(newPlayer);
    room.expiresAt = Date.now() + 30 * 60 * 1000; // Extender expiración

    this.logger.log(`Player ${playerName} joined room ${roomId}`);

    return { room, playerId };
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  updatePlayerConnection(
    roomId: string,
    playerId: string,
    isConnected: boolean,
  ): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return null;

    player.isConnected = isConnected;

    // Si el jugador se desconecta y es el único, marcar sala para limpieza rápida
    if (
      !isConnected &&
      room.players.filter((p) => p.isConnected).length === 0
    ) {
      room.expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutos si no hay nadie
    }

    return room;
  }

  removePlayer(roomId: string, playerId: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const playerIndex = room.players.findIndex((p) => p.id === playerId);
    if (playerIndex === -1) return null;

    const player = room.players[playerIndex];
    const wasHost = player.isHost;

    // Remover jugador
    room.players.splice(playerIndex, 1);

    // Si era el host, transferir a otro jugador
    if (wasHost && room.players.length > 0) {
      room.players[0].isHost = true;
      this.logger.log(
        `Host transferred to ${room.players[0].name} in room ${roomId}`,
      );
    }

    // Si no quedan jugadores, marcar para limpieza
    if (room.players.length === 0) {
      room.expiresAt = Date.now() + 60 * 1000; // 1 minuto
    }

    this.logger.log(`Player ${player.name} removed from room ${roomId}`);

    return room;
  }

  updateRoom(room: Room): void {
    this.rooms.set(room.id, room);
  }

  deleteRoom(roomId: string): boolean {
    const deleted = this.rooms.delete(roomId);
    if (deleted) {
      this.logger.log(`Room ${roomId} deleted`);
    }
    return deleted;
  }

  getRoomStats(): {
    totalRooms: number;
    totalPlayers: number;
    activeRooms: number;
  } {
    const totalRooms = this.rooms.size;
    let totalPlayers = 0;
    let activeRooms = 0;

    for (const room of this.rooms.values()) {
      totalPlayers += room.players.filter((p) => p.isConnected).length;
      if (room.players.some((p) => p.isConnected)) {
        activeRooms++;
      }
    }

    return { totalRooms, totalPlayers, activeRooms };
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    do {
      result = '';
      for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.rooms.has(result));

    return result;
  }

  private cleanupExpiredRooms(): void {
    const now = Date.now();
    const expiredRooms: string[] = [];

    for (const [roomId, room] of this.rooms.entries()) {
      if (room.expiresAt < now) {
        expiredRooms.push(roomId);
      }
    }

    for (const roomId of expiredRooms) {
      this.deleteRoom(roomId);
    }

    if (expiredRooms.length > 0) {
      this.logger.log(`Cleaned up ${expiredRooms.length} expired rooms`);
    }
  }

  // Métodos para debugging y monitoreo
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  getRoomsByState(state: GameState): Room[] {
    return Array.from(this.rooms.values()).filter(
      (room) => room.state === state,
    );
  }

  getPlayerRoom(playerId: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.players.some((p) => p.id === playerId)) {
        return room;
      }
    }
    return undefined;
  }
}
