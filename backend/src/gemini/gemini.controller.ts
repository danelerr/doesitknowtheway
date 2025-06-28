import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { GeminiService } from './gemini.service';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('gess-word')
  async guessWord(@Body() body: { text: string }) {
    if (!body.text) {
      throw new BadRequestException('Text is required');
    }

    const words = body.text.trim().split(/\s+/);
    if (words.length > 20) {
      throw new BadRequestException('Text must be maximum 20 words');
    }

    return await this.geminiService.guessWord(body.text);
  }

  @Post('gess-draw')
  @UseInterceptors(FileInterceptor('image'))
  async guessDraw(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    return await this.geminiService.guessDraw(file);
  }

  @Post('gess-situation')
  @UseInterceptors(FilesInterceptor('images', 5))
  async guessSituation(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length !== 5) {
      throw new BadRequestException('Exactly 5 images are required');
    }

    return await this.geminiService.guessSituation(files);
  }
}
