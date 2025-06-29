import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { LobbyService } from './lobby/lobby.service';
import { GeminiService } from './ai/gemini.service';
import { PromptService } from './prompt/prompt.service';
import { CreateRoomDto, JoinRoomDto } from './lobby/dto';
import { GameMode } from './common/types';
import {
  JoinRoomSwaggerDto,
  GuessWordSwaggerDto,
  GuessDrawSwaggerDto,
  GuessSituationSwaggerDto,
  RoomResponseDto,
  AIGuessResponseDto,
  AISituationResponseDto,
} from './common/swagger.dto';

@Controller()
@ApiTags('health', 'rooms', 'prompts', 'ai')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly lobbyService: LobbyService,
    private readonly geminiService: GeminiService,
    private readonly promptService: PromptService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Saludo básico del servidor' })
  @ApiResponse({ status: 200, description: 'Mensaje de bienvenida' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Estado de salud del servidor' })
  @ApiResponse({
    status: 200,
    description: 'Estado del servidor y tiempo de actividad',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', format: 'date-time' },
        uptime: {
          type: 'number',
          description: 'Tiempo de actividad en segundos',
        },
      },
    },
  })
  getHealth(): { status: string; timestamp: string; uptime: number } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Post('rooms')
  @ApiOperation({ summary: 'Crear una nueva sala de juego' })
  @ApiBody({
    description: 'Datos para crear la sala',
    schema: {
      type: 'object',
      properties: {
        playerName: { type: 'string', example: 'Juan' },
        mode: {
          type: 'string',
          enum: ['CLASSIC', 'SEQUENCE', 'WORDWRAP'],
          example: 'CLASSIC',
        },
        maxRounds: { type: 'number', example: 5 },
      },
      required: ['playerName'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Sala creada exitosamente',
    schema: {
      type: 'object',
      properties: {
        roomId: { type: 'string', example: 'ABCD' },
        room: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            players: { type: 'array' },
            state: { type: 'string' },
            mode: { type: 'string' },
            maxRounds: { type: 'number' },
          },
        },
      },
    },
  })
  createRoom(@Body() createRoomDto: CreateRoomDto) {
    const room = this.lobbyService.createRoom(
      createRoomDto.playerName,
      createRoomDto.mode || GameMode.CLASSIC,
    );

    return {
      roomId: room.id,
      room: {
        id: room.id,
        players: room.players.map((p) => ({
          id: p.id,
          name: p.name,
          isHost: p.isHost,
          score: p.score,
        })),
        state: room.state,
        mode: room.mode,
        maxRounds: room.maxRounds,
      },
    };
  }

  @Post('rooms/:id/join')
  @ApiOperation({ summary: 'Unirse a una sala existente' })
  @ApiParam({ name: 'id', description: 'ID de la sala', example: 'ABCD' })
  @ApiBody({ type: JoinRoomSwaggerDto })
  @ApiResponse({
    status: 200,
    description: 'Unido a la sala exitosamente',
    type: RoomResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Error al unirse a la sala' })
  joinRoom(@Param('id') roomId: string, @Body() joinRoomDto: JoinRoomDto) {
    const result = this.lobbyService.joinRoom(roomId, joinRoomDto.playerName);

    if (!result) {
      return { error: 'No se pudo unir a la sala' };
    }

    const { room, playerId } = result;

    return {
      playerId,
      room: {
        id: room.id,
        players: room.players.map((p) => ({
          id: p.id,
          name: p.name,
          isHost: p.isHost,
          score: p.score,
        })),
        state: room.state,
        mode: room.mode,
        maxRounds: room.maxRounds,
      },
    };
  }

  @Get('prompts/random')
  @ApiOperation({ summary: 'Obtener una consigna aleatoria' })
  @ApiQuery({
    name: 'mode',
    description: 'Modo de juego',
    enum: ['CLASSIC', 'SEQUENCE', 'WORDWRAP'],
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Consigna obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', example: 'Dibuja un gato' },
        mode: { type: 'string', example: 'CLASSIC' },
      },
    },
  })
  getRandomPrompt(@Query('mode') mode?: string) {
    const gameMode = (mode as GameMode) || GameMode.CLASSIC;
    const prompt = this.promptService.getRandomPrompt(gameMode);

    return {
      prompt,
      mode: gameMode,
    };
  }

  @Post('ai/guess-word')
  @ApiOperation({ summary: 'IA analiza texto para adivinar palabra' })
  @ApiBody({ type: GuessWordSwaggerDto })
  @ApiResponse({
    status: 200,
    description: 'Análisis completado',
    type: AIGuessResponseDto,
  })
  async guessWord(@Body() body: { text: string; hiddenWord?: string }) {
    const result = await this.geminiService.guessFromText(
      body.text,
      body.hiddenWord,
    );
    return result;
  }

  @Post('ai/guess-draw')
  @ApiOperation({ summary: 'IA analiza dibujo para adivinarlo' })
  @ApiBody({ type: GuessDrawSwaggerDto })
  @ApiResponse({
    status: 200,
    description: 'Análisis completado',
    type: AIGuessResponseDto,
  })
  async guessDraw(@Body() body: { imageBase64: string }) {
    const result = await this.geminiService.guessDrawing(body.imageBase64);
    return result;
  }

  @Post('ai/guess-situation')
  @ApiOperation({
    summary: 'IA analiza secuencia de dibujos para determinar situación',
  })
  @ApiBody({ type: GuessSituationSwaggerDto })
  @ApiResponse({
    status: 200,
    description: 'Análisis completado',
    type: AISituationResponseDto,
  })
  async guessSituation(@Body() body: { images: string[] }) {
    const result = await this.geminiService.analyzeSituation(body.images);
    return result;
  }

  @Get('rooms/stats')
  @ApiOperation({ summary: 'Obtener estadísticas de las salas' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de las salas',
    schema: {
      type: 'object',
      properties: {
        totalRooms: { type: 'number' },
        activeRooms: { type: 'number' },
        totalPlayers: { type: 'number' },
      },
    },
  })
  getRoomStats() {
    return this.lobbyService.getRoomStats();
  }

  @Get('prompts/categories')
  @ApiOperation({ summary: 'Obtener todas las categorías de consignas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorías disponibles',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
          educationalFocus: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  })
  getPromptCategories() {
    return this.promptService.getAllCategories();
  }
}
