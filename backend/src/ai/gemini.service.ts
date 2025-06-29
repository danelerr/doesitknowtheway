import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { AIGuessResponse, AISituationResponse } from '../common/types';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;
  private visionModel: GenerativeModel;
  private textModel: GenerativeModel;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.visionModel = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });
    this.textModel = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });
  }

  async guessDrawing(imageBase64: string): Promise<AIGuessResponse> {
    try {
      const prompt = `Analiza este dibujo y proporciona las 3 respuestas más probables de lo que representa. 
      Piensa como un jugador en un juego de adivinanzas. El dibujo puede ser:
      - Un objeto común
      - Un concepto abstracto
      - Una acción o situación
      - Algo que intenta engañar a la IA siendo ambiguo o creativo
      
      Responde SOLO con 3 palabras o frases cortas separadas por comas, ordenadas por probabilidad.
      Ejemplo: "gato, felino, animal"`;

      const imagePart = {
        inlineData: {
          data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
          mimeType: 'image/png',
        },
      };

      const result = await this.visionModel.generateContent([
        prompt,
        imagePart,
      ]);
      const response = result.response;
      const text = response.text().trim();

      const guesses = text
        .split(',')
        .map((g) => g.trim())
        .slice(0, 3);

      return {
        topGuesses: guesses,
        confidence: [0.8, 0.6, 0.4], // Valores simulados
        reasoning: `Detecté formas que sugieren: ${guesses.join(', ')}`,
      };
    } catch (error) {
      this.logger.error('Error analyzing drawing:', error);
      return {
        topGuesses: ['objeto', 'forma', 'dibujo'],
        confidence: [0.3, 0.2, 0.1],
        reasoning: 'Error al analizar el dibujo',
      };
    }
  }

  async guessFromText(
    text: string,
    hiddenWord?: string,
  ): Promise<AIGuessResponse> {
    try {
      let prompt: string;

      if (hiddenWord) {
        // Modo WORDWRAP: verificar si el texto describe la palabra oculta
        prompt = `El jugador debe describir "${hiddenWord}" sin mencionarla directamente.
        Su descripción es: "${text}"
        
        ¿La descripción se refiere claramente a "${hiddenWord}"? 
        Responde SOLO: SI o NO, seguido de tu mejor interpretación de lo que describe.
        Ejemplo: "SI, ${hiddenWord}" o "NO, otra cosa"`;
      } else {
        // Modo clásico: adivinar qué describe el texto
        prompt = `Este texto describe algo específico: "${text}"
        
        ¿Qué es lo más probable que esté describiendo? Proporciona 3 opciones.
        Responde SOLO con 3 palabras o frases separadas por comas.`;
      }

      const result = await this.textModel.generateContent(prompt);
      const response = result.response;
      const responseText = response.text().trim();

      if (hiddenWord) {
        const isCorrect = responseText.toUpperCase().startsWith('SI');
        return {
          topGuesses: isCorrect ? [hiddenWord] : ['descripción incorrecta'],
          confidence: [isCorrect ? 0.9 : 0.1],
          reasoning: responseText,
        };
      } else {
        const guesses = responseText
          .split(',')
          .map((g) => g.trim())
          .slice(0, 3);
        return {
          topGuesses: guesses,
          confidence: [0.8, 0.6, 0.4],
          reasoning: `El texto sugiere: ${guesses.join(', ')}`,
        };
      }
    } catch (error) {
      this.logger.error('Error analyzing text:', error);
      return {
        topGuesses: ['texto', 'descripción', 'frase'],
        confidence: [0.3, 0.2, 0.1],
        reasoning: 'Error al analizar el texto',
      };
    }
  }

  async analyzeSituation(drawings: string[]): Promise<AISituationResponse> {
    try {
      const prompt = `Analiza esta secuencia de ${drawings.length} dibujos que representan una situación o historia.
      
      Los dibujos están en orden cronológico y juntos cuentan una situación específica.
      Proporciona:
      1. La situación general que representan
      2. El contexto o tema principal
      3. Una breve descripción de la secuencia
      
      Mantén tu respuesta educativa y apropiada para niños.`;

      // Convertir todos los dibujos para el análisis
      const imageParts = drawings.map((drawing) => ({
        inlineData: {
          data: drawing.replace(/^data:image\/[a-z]+;base64,/, ''),
          mimeType: 'image/png',
        },
      }));

      const result = await this.visionModel.generateContent([
        prompt,
        ...imageParts,
      ]);

      const response = result.response;
      const text = response.text();

      return {
        situation: text.split('\n')[0] || 'Situación detectada',
        context: 'Secuencia de eventos',
        suggestedSequence: [
          'Inicio de la situación',
          'Desarrollo',
          'Momento clave',
          'Consecuencia',
          'Final',
        ].slice(0, drawings.length),
      };
    } catch (error) {
      this.logger.error('Error analyzing situation:', error);
      return {
        situation: 'Secuencia de dibujos',
        context: 'Historia visual',
        suggestedSequence: drawings.map((_, i) => `Paso ${i + 1}`),
      };
    }
  }

  async generateHint(
    prompt: string,
    difficulty: 'EASY' | 'MEDIUM' | 'HARD',
  ): Promise<string> {
    try {
      const difficultyPrompts = {
        EASY: 'Proporciona una pista muy clara y directa',
        MEDIUM: 'Proporciona una pista que requiera pensar un poco',
        HARD: 'Proporciona una pista sutil e indirecta',
      };

      const hintPrompt = `Para la palabra/concepto "${prompt}", ${difficultyPrompts[difficulty]}.
      La pista debe ser educativa y apropiada para niños.
      Responde SOLO con la pista, máximo 20 palabras.`;

      const result = await this.textModel.generateContent(hintPrompt);
      const response = result.response;
      return response.text().trim();
    } catch (error) {
      this.logger.error('Error generating hint:', error);
      return `Pista para: algo relacionado con ${prompt}`;
    }
  }
}
