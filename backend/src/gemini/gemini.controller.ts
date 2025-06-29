import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { GeminiService } from '../ai/gemini.service';
import {
  GuessWordSwaggerDto,
  GuessDrawSwaggerDto,
  GuessSituationSwaggerDto,
  AIGuessResponseDto,
  AISituationResponseDto,
} from '../common/swagger.dto';

@Controller('gemini')
@ApiTags('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('guess-word')
  @ApiOperation({ summary: 'IA adivina palabra desde texto (legacy endpoint)' })
  @ApiBody({ type: GuessWordSwaggerDto })
  @ApiResponse({
    status: 200,
    description: 'Análisis completado',
    type: AIGuessResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async guessWord(@Body() body: { text: string; hiddenWord?: string }) {
    if (!body.text) {
      throw new BadRequestException('Text is required');
    }

    const words = body.text.trim().split(/\s+/);
    if (words.length > 20) {
      throw new BadRequestException('Text must be maximum 20 words');
    }

    const result = await this.geminiService.guessFromText(
      body.text,
      body.hiddenWord,
    );
    return result;
  }

  @Post('guess-draw')
  @ApiOperation({ summary: 'IA adivina dibujo desde imagen (legacy endpoint)' })
  @ApiBody({ type: GuessDrawSwaggerDto })
  @ApiResponse({
    status: 200,
    description: 'Análisis completado',
    type: AIGuessResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Imagen requerida' })
  async guessDraw(@Body() body: { imageBase64: string }) {
    if (!body.imageBase64) {
      throw new BadRequestException('Image is required');
    }

    const result = await this.geminiService.guessDrawing(body.imageBase64);
    return result;
  }

  @Post('guess-situation')
  @ApiOperation({
    summary: 'IA analiza situación desde múltiples imágenes (legacy endpoint)',
  })
  @ApiBody({ type: GuessSituationSwaggerDto })
  @ApiResponse({
    status: 200,
    description: 'Análisis completado',
    type: AISituationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Array de imágenes requerido (máx 5)',
  })
  async guessSituation(@Body() body: { images: string[] }) {
    if (
      !body.images ||
      !Array.isArray(body.images) ||
      body.images.length === 0
    ) {
      throw new BadRequestException('Images array is required');
    }

    if (body.images.length > 5) {
      throw new BadRequestException('Maximum 5 images allowed');
    }

    const result = await this.geminiService.analyzeSituation(body.images);
    return result;
  }
}
