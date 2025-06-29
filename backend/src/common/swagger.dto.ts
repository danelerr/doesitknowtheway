import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomSwaggerDto {
  @ApiProperty({
    description: 'Nombre del jugador que crea la sala',
    example: 'Juan',
  })
  playerName: string;

  @ApiProperty({
    description: 'Modo de juego',
    enum: ['CLASSIC', 'SEQUENCE', 'WORDWRAP'],
    example: 'CLASSIC',
    required: false,
  })
  mode?: string;

  @ApiProperty({
    description: 'Número máximo de rondas',
    example: 5,
    required: false,
  })
  maxRounds?: number;
}

export class JoinRoomSwaggerDto {
  @ApiProperty({
    description: 'ID de la sala a la que unirse',
    example: 'ABCD',
  })
  roomId: string;

  @ApiProperty({
    description: 'Nombre del jugador',
    example: 'María',
  })
  playerName: string;
}

export class GuessWordSwaggerDto {
  @ApiProperty({
    description: 'Texto a analizar',
    example: 'Es un animal que maúlla y tiene bigotes',
  })
  text: string;

  @ApiProperty({
    description: 'Palabra oculta (para modo WORDWRAP)',
    example: 'gato',
    required: false,
  })
  hiddenWord?: string;
}

export class GuessDrawSwaggerDto {
  @ApiProperty({
    description: 'Imagen en formato base64',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...',
  })
  imageBase64: string;
}

export class GuessSituationSwaggerDto {
  @ApiProperty({
    description: 'Array de imágenes en formato base64',
    type: [String],
    example: [
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...',
    ],
  })
  images: string[];
}

export class RoomResponseDto {
  @ApiProperty({ description: 'ID de la sala', example: 'ABCD' })
  roomId: string;

  @ApiProperty({
    description: 'Datos de la sala',
    type: 'object',
    properties: {
      id: { type: 'string' },
      players: { type: 'array' },
      state: {
        type: 'string',
        enum: ['LOBBY', 'DRAWING', 'GUESSING', 'REVEAL'],
      },
      mode: { type: 'string', enum: ['CLASSIC', 'SEQUENCE', 'WORDWRAP'] },
      maxRounds: { type: 'number' },
    },
  })
  room: object;
}

export class AIGuessResponseDto {
  @ApiProperty({
    description: 'Top 3 conjeturas de la IA',
    type: [String],
    example: ['gato', 'felino', 'animal'],
  })
  topGuesses: string[];

  @ApiProperty({
    description: 'Niveles de confianza para cada conjetura',
    type: [Number],
    example: [0.8, 0.6, 0.4],
  })
  confidence: number[];

  @ApiProperty({
    description: 'Razonamiento de la IA',
    example: 'Detecté formas que sugieren: gato, felino, animal',
    required: false,
  })
  reasoning?: string;
}

export class AISituationResponseDto {
  @ApiProperty({
    description: 'Situación detectada',
    example: 'Una persona preparando el desayuno',
  })
  situation: string;

  @ApiProperty({
    description: 'Contexto de la situación',
    example: 'Actividades matutinas en la cocina',
  })
  context: string;

  @ApiProperty({
    description: 'Secuencia sugerida de eventos',
    type: [String],
    example: [
      'Levantarse',
      'Ir a la cocina',
      'Preparar ingredientes',
      'Cocinar',
      'Servir',
    ],
  })
  suggestedSequence: string[];
}
