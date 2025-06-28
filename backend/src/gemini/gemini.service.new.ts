import { Injectable } from '@nestjs/common';
import { CreateGeminiDto } from './dto/create-gemini.dto';
import { UpdateGeminiDto } from './dto/update-gemini.dto';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async guessWord(text: string): Promise<{ word: string }> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `Analiza la siguiente frase que describe indirectamente un tema o tópico: "${text}". 
      Responde únicamente con UNA palabra que represente el tema al que hace referencia la frase. 
      No agregues explicaciones, puntuación ni texto adicional, solo la palabra.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const word = response.text().trim();

      return { word };
    } catch (error: any) {
      throw new Error(`Error generating word guess: ${error.message}`);
    }
  }

  async guessDraw(file: Express.Multer.File): Promise<{ description: string }> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });
      
      const imagePart = {
        inlineData: {
          data: file.buffer.toString('base64'),
          mimeType: file.mimetype,
        },
      };

      const prompt = 
        'Mira esta imagen y responde únicamente con una palabra que describa qué es lo que está dibujado. No agregues explicaciones ni texto adicional.';

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const description = response.text().trim();

      return { description };
    } catch (error: any) {
      throw new Error(`Error analyzing image: ${error.message}`);
    }
  }

  async guessSituation(
    files: Express.Multer.File[],
  ): Promise<{ situation: string }> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });
      
      const imageParts = files.map((file) => ({
        inlineData: {
          data: file.buffer.toString('base64'),
          mimeType: file.mimetype,
        },
      }));

      const prompt = `Analiza estas 5 imágenes en conjunto y determina qué situación están describiendo. 
      Responde con una frase creativa y divertida que describa la situación, como por ejemplo: 
      "un doctor le explica a su paciente que no es un vampiro". Sé imaginativo y humorístico.`;

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const situation = response.text().trim();

      return { situation };
    } catch (error: any) {
      throw new Error(`Error analyzing situation: ${error.message}`);
    }
  }

  create(createGeminiDto: CreateGeminiDto) {
    return 'This action adds a new gemini';
  }

  async findAll() {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Explica en 10 palabras que es nestjs');
    const response = await result.response;
    console.log(response.text());
    return 'This action returns all gemini';
  }

  findOne(id: number) {
    return `This action returns a #${id} gemini`;
  }

  update(id: number, updateGeminiDto: UpdateGeminiDto) {
    return `This action updates a #${id} gemini`;
  }

  remove(id: number) {
    return `This action removes a #${id} gemini`;
  }
}
