import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { LobbyService } from '../lobby/lobby.service';
import { GameService } from './game.service';
import {
  Room,
  GameState,
  RoomUpdateEvent,
  TimerEvent,
  RevealEvent,
  GamePhaseEvent,
} from '../common/types';
import {
  StartRoundDto,
  SubmitDrawingDto,
  SubmitGuessDto,
  SubmitTextDto,
} from './dto';

@WebSocketGateway({
  namespace: '/game',
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GameGateway.name);
  private readonly playerRooms = new Map<string, string>(); // socketId -> roomId

  constructor(
    private lobbyService: LobbyService,
    private gameService: GameService,
  ) {}

  handleConnection(@ConnectedSocket() client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);

    const roomId = this.playerRooms.get(client.id);
    if (roomId) {
      this.handlePlayerDisconnection(client.id, roomId);
    }
  }

  @SubscribeMessage('room:join')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; playerName: string },
  ): Promise<void> {
    try {
      const result = this.lobbyService.joinRoom(data.roomId, data.playerName);
      if (!result) {
        client.emit('error', { message: 'No se pudo unir a la sala' });
        return;
      }

      const { room, playerId } = result;

      // Asociar socket con jugador y sala
      client.data.playerId = playerId;
      client.data.roomId = room.id;
      this.playerRooms.set(client.id, room.id);

      // Unir a sala de Socket.IO
      await client.join(room.id);

      // Emitir actualización a todos en la sala
      this.emitRoomUpdate(room);

      client.emit('room:joined', {
        room: this.formatRoomForClient(room),
        playerId,
      });

      this.logger.log(`Player ${data.playerName} joined room ${room.id}`);
    } catch (error) {
      this.logger.error('Error joining room:', error);
      client.emit('error', { message: 'Error al unirse a la sala' });
    }
  }

  @SubscribeMessage('round:start')
  async handleStartRound(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: StartRoundDto,
  ): Promise<void> {
    try {
      const playerId = client.data.playerId;
      const room = await this.gameService.startRound(data.roomId, playerId);

      if (!room) {
        client.emit('error', { message: 'No se pudo iniciar la ronda' });
        return;
      }

      // Emitir nueva fase a todos
      this.emitGamePhase(room);
      this.emitRoomUpdate(room);

      // Iniciar timer
      this.startTimer(room.id, 120); // 2 minutos para dibujar
    } catch (error) {
      this.logger.error('Error starting round:', error);
      client.emit('error', { message: 'Error al iniciar la ronda' });
    }
  }

  @SubscribeMessage('draw:submit')
  async handleSubmitDrawing(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SubmitDrawingDto,
  ): Promise<void> {
    try {
      const playerId = client.data.playerId;
      const room = await this.gameService.submitDrawing(
        data.roomId,
        playerId,
        data.imageBase64,
        data.isSequenceComplete,
      );

      if (!room) {
        client.emit('error', { message: 'No se pudo enviar el dibujo' });
        return;
      }

      if (room.state === GameState.GUESSING) {
        // Cambió a fase de adivinanza
        this.emitGamePhase(room);
        this.startTimer(room.id, 60); // 1 minuto para adivinar
      }

      this.emitRoomUpdate(room);
    } catch (error) {
      this.logger.error('Error submitting drawing:', error);
      client.emit('error', { message: 'Error al enviar el dibujo' });
    }
  }

  @SubscribeMessage('text:submit')
  async handleSubmitText(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SubmitTextDto,
  ): Promise<void> {
    try {
      const playerId = client.data.playerId;
      const room = await this.gameService.submitText(
        data.roomId,
        playerId,
        data.text,
      );

      if (!room) {
        client.emit('error', { message: 'No se pudo enviar el texto' });
        return;
      }

      if (room.state === GameState.GUESSING) {
        this.emitGamePhase(room);
        this.startTimer(room.id, 60);
      }

      this.emitRoomUpdate(room);
    } catch (error) {
      this.logger.error('Error submitting text:', error);
      client.emit('error', { message: 'Error al enviar el texto' });
    }
  }

  @SubscribeMessage('guess:submit')
  async handleSubmitGuess(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SubmitGuessDto,
  ): Promise<void> {
    try {
      const playerId = client.data.playerId;
      const room = this.gameService.submitGuess(
        data.roomId,
        playerId,
        data.guess,
      );

      if (!room) {
        client.emit('error', { message: 'No se pudo enviar la adivinanza' });
        return;
      }

      this.emitRoomUpdate(room);
    } catch (error) {
      this.logger.error('Error submitting guess:', error);
      client.emit('error', { message: 'Error al enviar la adivinanza' });
    }
  }

  private handlePlayerDisconnection(socketId: string, roomId: string): void {
    const playerId = this.playerRooms.get(socketId);
    if (!playerId) return;

    const room = this.lobbyService.updatePlayerConnection(
      roomId,
      playerId,
      false,
    );
    if (room) {
      this.emitRoomUpdate(room);
    }

    this.playerRooms.delete(socketId);
  }

  private emitRoomUpdate(room: Room): void {
    const roomUpdate: RoomUpdateEvent = {
      room: {
        ...room,
        guesses: Array.from(room.guesses.entries()).map(([playerId, guess]) => {
          const player = room.players.find((p) => p.id === playerId);
          return {
            playerId,
            playerName: player?.name || 'Unknown',
            hasGuessed: true,
          };
        }),
      },
    };

    this.server.to(room.id).emit('room:update', roomUpdate);
  }

  private emitGamePhase(room: Room): void {
    const drawer = room.players.find((p) => p.id === room.drawerId);

    const phaseEvent: GamePhaseEvent = {
      phase: room.state,
      drawerId: room.drawerId || undefined,
      drawerName: drawer?.name,
      prompt:
        room.state === GameState.DRAWING ? room.prompt || undefined : undefined,
      hiddenWord:
        room.state === GameState.DRAWING && room.hiddenWord
          ? room.hiddenWord
          : undefined,
      roundNumber: room.roundNumber,
      maxRounds: room.maxRounds,
      secondsLeft: this.calculateSecondsLeft(room),
    };

    // Enviar hiddenWord solo al drawer en modo WORDWRAP
    this.server.to(room.id).emit('game:phase', phaseEvent);

    if (room.hiddenWord && drawer) {
      this.server.to(drawer.id).emit('game:phase', {
        ...phaseEvent,
        hiddenWord: room.hiddenWord,
      });
    }
  }

  private startTimer(roomId: string, seconds: number): void {
    const interval = setInterval(() => {
      seconds--;

      const timerEvent: TimerEvent = {
        secondsLeft: seconds,
        totalSeconds: seconds === 59 ? 60 : 120,
      };

      this.server.to(roomId).emit('timer', timerEvent);

      if (seconds <= 0) {
        clearInterval(interval);
      }
    }, 1000);
  }

  private calculateSecondsLeft(room: Room): number {
    if (room.roundStartTime === 0) return 0;

    const elapsed = (Date.now() - room.roundStartTime) / 1000;
    const total = room.state === GameState.DRAWING ? 120 : 60;

    return Math.max(0, total - elapsed);
  }

  private formatRoomForClient(room: Room): any {
    return {
      id: room.id,
      players: room.players.map((p) => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        score: p.score,
        isConnected: p.isConnected,
      })),
      state: room.state,
      mode: room.mode,
      roundNumber: room.roundNumber,
      maxRounds: room.maxRounds,
      drawerId: room.drawerId,
      currentDrawing: room.currentDrawing,
    };
  }
}
