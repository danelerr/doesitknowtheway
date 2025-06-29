import { Injectable, Logger } from '@nestjs/common';
import { LobbyService } from '../lobby/lobby.service';
import { GeminiService } from '../ai/gemini.service';
import { PromptService } from '../prompt/prompt.service';
import {
  Room,
  Player,
  GameState,
  GameMode,
  GameResult,
  AIGuessResponse,
} from '../common/types';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);
  private readonly timers = new Map<string, NodeJS.Timeout>();

  constructor(
    private lobbyService: LobbyService,
    private geminiService: GeminiService,
    private promptService: PromptService,
  ) {}

  async startRound(roomId: string, startedBy: string): Promise<Room | null> {
    const room = this.lobbyService.getRoom(roomId);
    if (!room) return null;

    // Verificar que el jugador puede iniciar ronda
    const player = room.players.find((p) => p.id === startedBy);
    if (!player?.isHost && room.state !== GameState.LOBBY) {
      return null;
    }

    // Verificar mínimo de jugadores
    if (room.players.filter((p) => p.isConnected).length < 2) {
      return null;
    }

    // Siguiente ronda
    room.roundNumber++;

    // Elegir siguiente drawer (rotación)
    const connectedPlayers = room.players.filter((p) => p.isConnected);
    const currentDrawerIndex = room.drawerId
      ? connectedPlayers.findIndex((p) => p.id === room.drawerId)
      : -1;

    const nextDrawerIndex = (currentDrawerIndex + 1) % connectedPlayers.length;
    room.drawerId = connectedPlayers[nextDrawerIndex].id;

    // Obtener nuevo prompt según el modo
    const promptData = this.promptService.getRandomPrompt(room.mode);

    switch (room.mode) {
      case GameMode.CLASSIC:
        room.prompt = promptData.prompt;
        break;
      case GameMode.SEQUENCE:
        room.prompt = promptData.situation;
        room.drawings = []; // Reset drawings para secuencia
        break;
      case GameMode.WORDWRAP:
        room.prompt = promptData.context;
        room.hiddenWord = promptData.hiddenWord;
        break;
    }

    // Reset state
    room.state = GameState.DRAWING;
    room.guesses = new Map();
    room.aiGuess = null;
    room.aiGuesses = [];
    room.currentDrawing = undefined;
    room.roundStartTime = Date.now();

    this.lobbyService.updateRoom(room);

    // Configurar timer
    this.startRoundTimer(roomId);

    this.logger.log(
      `Round ${room.roundNumber} started in room ${roomId} by ${player?.name || 'unknown'}`,
    );

    return room;
  }

  async submitDrawing(
    roomId: string,
    playerId: string,
    imageBase64: string,
    isSequenceComplete = false,
  ): Promise<Room | null> {
    const room = this.lobbyService.getRoom(roomId);
    if (
      !room ||
      room.state !== GameState.DRAWING ||
      room.drawerId !== playerId
    ) {
      return null;
    }

    if (room.mode === GameMode.SEQUENCE) {
      // Agregar dibujo a la secuencia
      room.drawings.push(imageBase64);

      // Si no está completa la secuencia (máximo 5 dibujos)
      if (!isSequenceComplete && room.drawings.length < 5) {
        room.currentDrawing = imageBase64;
        this.lobbyService.updateRoom(room);
        return room;
      }

      // Secuencia completa, analizar con IA
      try {
        const aiResponse = await this.geminiService.analyzeSituation(
          room.drawings,
        );
        room.aiGuess = aiResponse.situation;
        room.aiGuesses = [aiResponse.situation, aiResponse.context];
      } catch (error) {
        this.logger.error('Error analyzing sequence:', error);
        room.aiGuess = 'Secuencia de eventos';
        room.aiGuesses = ['Secuencia de eventos'];
      }
    } else {
      // Modo CLASSIC: analizar dibujo único
      room.currentDrawing = imageBase64;

      try {
        const aiResponse: AIGuessResponse =
          await this.geminiService.guessDrawing(imageBase64);
        room.aiGuess = aiResponse.topGuesses[0];
        room.aiGuesses = aiResponse.topGuesses;
      } catch (error) {
        this.logger.error('Error analyzing drawing:', error);
        room.aiGuess = 'dibujo';
        room.aiGuesses = ['dibujo', 'imagen', 'arte'];
      }
    }

    // Cambiar a fase de adivinanza
    room.state = GameState.GUESSING;
    this.lobbyService.updateRoom(room);

    // Timer para fase de adivinanza
    this.startGuessTimer(roomId);

    return room;
  }

  async submitText(
    roomId: string,
    playerId: string,
    text: string,
  ): Promise<Room | null> {
    const room = this.lobbyService.getRoom(roomId);
    if (
      !room ||
      room.mode !== GameMode.WORDWRAP ||
      room.drawerId !== playerId
    ) {
      return null;
    }

    try {
      const aiResponse = await this.geminiService.guessFromText(
        text,
        room.hiddenWord,
      );
      room.aiGuess = aiResponse.topGuesses[0];
      room.aiGuesses = aiResponse.topGuesses;

      // Cambiar a fase de adivinanza
      room.state = GameState.GUESSING;
      this.lobbyService.updateRoom(room);

      this.startGuessTimer(roomId);

      return room;
    } catch (error) {
      this.logger.error('Error analyzing text:', error);
      return null;
    }
  }

  submitGuess(roomId: string, playerId: string, guess: string): Room | null {
    const room = this.lobbyService.getRoom(roomId);
    if (
      !room ||
      room.state !== GameState.GUESSING ||
      room.drawerId === playerId
    ) {
      return null;
    }

    room.guesses.set(playerId, guess.toLowerCase().trim());
    this.lobbyService.updateRoom(room);

    // Si todos han adivinado, proceder a reveal
    const nonDrawerPlayers = room.players.filter(
      (p) => p.isConnected && p.id !== room.drawerId,
    );

    if (room.guesses.size >= nonDrawerPlayers.length) {
      this.endRound(roomId);
    }

    return room;
  }

  private endRound(roomId: string): void {
    const room = this.lobbyService.getRoom(roomId);
    if (!room) return;

    this.clearTimer(roomId);

    const result = this.calculateResult(room);

    // Actualizar puntuaciones
    this.updateScores(room, result);

    room.state = GameState.REVEAL;
    this.lobbyService.updateRoom(room);

    // Timer para mostrar resultado y continuar
    setTimeout(() => {
      this.prepareNextRound(roomId);
    }, 5000); // 5 segundos para ver resultado
  }

  private calculateResult(room: Room): GameResult {
    const targetWord = (
      room.mode === GameMode.WORDWRAP ? room.hiddenWord : room.prompt
    )?.toLowerCase();

    const humanGuesses = Array.from(room.guesses.entries()).map(
      ([playerId, guess]) => {
        const player = room.players.find((p) => p.id === playerId);
        const isCorrect = guess === targetWord;

        return {
          playerId,
          playerName: player?.name || 'Unknown',
          guess,
          correct: isCorrect,
        };
      },
    );

    const correctHumanGuesses = humanGuesses.filter((g) => g.correct).length;
    const aiWasCorrect = room.aiGuess?.toLowerCase() === targetWord;

    let winner: 'HUMANS' | 'AI' | 'TIE';

    if (correctHumanGuesses > 0 && !aiWasCorrect) {
      winner = 'HUMANS';
    } else if (correctHumanGuesses === 0 && aiWasCorrect) {
      winner = 'AI';
    } else {
      winner = 'TIE';
    }

    return {
      winner,
      prompt: room.prompt || '',
      aiGuess: room.aiGuess,
      humanGuesses,
      correctHumanGuesses,
      aiWasCorrect,
      drawings:
        room.mode === GameMode.SEQUENCE
          ? room.drawings
          : [room.currentDrawing || ''],
    };
  }

  private updateScores(room: Room, result: GameResult): void {
    // Puntuación para humanos que adivinaron correctamente
    if (result.winner === 'HUMANS' || result.winner === 'TIE') {
      result.humanGuesses
        .filter((g) => g.correct)
        .forEach((g) => {
          const player = room.players.find((p) => p.id === g.playerId);
          if (player) {
            player.score += 10;
          }
        });
    }

    // Puntuación extra para el drawer si los humanos ganaron
    if (result.winner === 'HUMANS') {
      const drawer = room.players.find((p) => p.id === room.drawerId);
      if (drawer) {
        drawer.score += 5;
      }
    }
  }

  private prepareNextRound(roomId: string): void {
    const room = this.lobbyService.getRoom(roomId);
    if (!room) return;

    // Verificar si el juego terminó
    if (room.roundNumber >= room.maxRounds) {
      this.endGame(roomId);
      return;
    }

    // Volver al lobby para siguiente ronda
    room.state = GameState.LOBBY;
    this.lobbyService.updateRoom(room);
  }

  private endGame(roomId: string): void {
    const room = this.lobbyService.getRoom(roomId);
    if (!room) return;

    // El juego terminó - mantener estado REVEAL para mostrar puntuaciones finales
    room.state = GameState.REVEAL;
    this.lobbyService.updateRoom(room);

    // Después de un tiempo, volver al lobby
    setTimeout(() => {
      if (this.lobbyService.getRoom(roomId)) {
        room.state = GameState.LOBBY;
        room.roundNumber = 0;
        // Reset scores si se desea
        this.lobbyService.updateRoom(room);
      }
    }, 10000); // 10 segundos para ver puntuaciones finales
  }

  private startRoundTimer(roomId: string): void {
    this.clearTimer(roomId);

    const timer = setTimeout(() => {
      this.handleRoundTimeout(roomId);
    }, 120000); // 2 minutos para dibujar

    this.timers.set(roomId, timer);
  }

  private startGuessTimer(roomId: string): void {
    this.clearTimer(roomId);

    const timer = setTimeout(() => {
      this.endRound(roomId);
    }, 60000); // 1 minuto para adivinar

    this.timers.set(roomId, timer);
  }

  private handleRoundTimeout(roomId: string): void {
    const room = this.lobbyService.getRoom(roomId);
    if (!room) return;

    if (room.state === GameState.DRAWING) {
      // Si no se dibujó nada, skip ronda
      this.prepareNextRound(roomId);
    } else if (room.state === GameState.GUESSING) {
      // Terminar ronda con las adivinanzas actuales
      this.endRound(roomId);
    }
  }

  private clearTimer(roomId: string): void {
    const timer = this.timers.get(roomId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(roomId);
    }
  }

  // Cleanup al cerrar aplicación
  onModuleDestroy(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }
}
