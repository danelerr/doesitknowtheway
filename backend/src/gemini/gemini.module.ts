import { Module } from '@nestjs/common';
import { GeminiController } from './gemini.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [GeminiController],
})
export class GeminiModule {}
