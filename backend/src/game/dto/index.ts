import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class StartRoundDto {
  @IsString()
  roomId: string;
}

export class SubmitDrawingDto {
  @IsString()
  roomId: string;

  @IsString()
  imageBase64: string;

  @IsOptional()
  @IsBoolean()
  isSequenceComplete?: boolean;
}

export class SubmitGuessDto {
  @IsString()
  roomId: string;

  @IsString()
  guess: string;
}

export class SubmitTextDto {
  @IsString()
  roomId: string;

  @IsString()
  text: string;
}
