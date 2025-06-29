import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { LobbyModule } from '../lobby/lobby.module';
import { AiModule } from '../ai/ai.module';
import { PromptModule } from '../prompt/prompt.module';

@Module({
  imports: [LobbyModule, AiModule, PromptModule],
  providers: [GameGateway, GameService],
  exports: [GameService],
})
export class GameModule {}
