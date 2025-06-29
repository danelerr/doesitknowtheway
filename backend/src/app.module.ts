import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './ai/ai.module';
import { LobbyModule } from './lobby/lobby.module';
import { GameModule } from './game/game.module';
import { PromptModule } from './prompt/prompt.module';
import { GeminiModule } from './gemini/gemini.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AiModule,
    LobbyModule,
    GameModule,
    PromptModule,
    GeminiModule, // Legacy compatibility
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
