import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { GameMode } from '../../common/types';

export class CreateRoomDto {
  @IsString()
  playerName: string;

  @IsOptional()
  @IsEnum(GameMode)
  mode?: GameMode = GameMode.CLASSIC;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxRounds?: number = 5;
}

export class JoinRoomDto {
  @IsString()
  roomId: string;

  @IsString()
  playerName: string;
}

export class RoomResponseDto {
  id: string;
  players: Array<{
    id: string;
    name: string;
    isHost: boolean;
    score: number;
    isConnected: boolean;
  }>;
  state: string;
  mode: string;
  roundNumber: number;
  maxRounds: number;
}
