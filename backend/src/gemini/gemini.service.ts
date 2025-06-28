import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenAI | undefined;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (typeof apiKey !== 'string' || !apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    this.genAI = new GoogleGenAI({ apiKey });
  }

  async guessWord(text: string): Promise<{ word: string }> {
    try {
      const response = await this.genAI?.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            text: `Analiza la siguiente frase que describe indirectamente un tema o tópico: "${text}". 
            Responde únicamente con UNA palabra que represente el tema al que hace referencia la frase. 
            No agregues explicaciones, puntuación ni texto adicional, solo la palabra.`,
          },
        ],
      });
      if (!response || !response.text) {
        throw new Error('No response from Gemini AI');
      }
      const word = response.text;

      return { word };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error generating word guess: ${message}`);
    }
  }

  async guessDraw(file: Express.Multer.File): Promise<{ description: string }> {
    try {
      const response = await this.genAI?.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            text: 'Mira esta imagen y responde únicamente con una palabra que describa qué es lo que está dibujado. No agregues explicaciones ni texto adicional.',
          },
          {
            inlineData: {
              data: file.buffer.toString('base64'),
              mimeType: file.mimetype,
            },
          },
        ],
      });
      if (!response || !response.text) {
        throw new Error('No response from Gemini AI');
      }
      const description = response.text.trim();

      return { description };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error analyzing image: ${message}`);
    }
  }

  async guessSituation(
    files: Express.Multer.File[],
  ): Promise<{ situation: string }> {
    try {
      const contents = [
        {
          text: `Analiza estas 5 imágenes en conjunto y determina qué situación están describiendo. 
          Responde con una frase creativa y divertida que describa la situación, como por ejemplo: 
          "un doctor le explica a su paciente que no es un vampiro". Sé imaginativo y humorístico.`,
        },
        ...files.map((file) => ({
          inlineData: {
            data: file.buffer.toString('base64'),
            mimeType: file.mimetype,
          },
        })),
      ];
      const response = await this.genAI?.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
      });
      if (!response || !response.text) {
        throw new Error('No response from Gemini AI');
      }
      const situation = response.text.trim();

      return { situation };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error analyzing situation: ${message}`);
    }
  }

  async findAll() {
    const response = await this.genAI?.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: 'Explica en 10 palabras que es nestjs' }],
    });
    if (response && response.text) {
      console.log(response.text);
    }
    return `This action returns all gemini`;
  }
}
