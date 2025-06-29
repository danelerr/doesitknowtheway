// Common types and enums for the game

export enum GameState {
  LOBBY = 'LOBBY',
  DRAWING = 'DRAWING',
  GUESSING = 'GUESSING',
  REVEAL = 'REVEAL',
}

export enum GameMode {
  CLASSIC = 'CLASSIC', // Modo outdraw.ai clásico
  SEQUENCE = 'SEQUENCE', // 5 dibujos de una situación
  WORDWRAP = 'WORDWRAP', // Describir sin mencionar
}

export interface Player {
  id: string; // socketId
  name: string;
  isHost: boolean;
  score: number;
  isConnected: boolean;
  joinedAt: number;
}

export interface Room {
  id: string; // código 4-5 letras
  players: Player[];
  state: GameState;
  mode: GameMode;
  prompt: string | null; // consigna de la ronda actual
  hiddenWord?: string; // para modo WORDWRAP
  drawerId: string | null; // socketId del jugador que dibuja
  currentDrawing?: string; // base64 del dibujo actual
  drawings: string[]; // para modo SEQUENCE (máx 5)
  guesses: Map<string, string>; // socketId → guess
  aiGuess: string | null;
  aiGuesses: string[]; // top 3 de la IA
  roundNumber: number;
  maxRounds: number;
  roundStartTime: number;
  roundDuration: number; // en segundos
  expiresAt: number; // Date.now() + 30 min
  createdAt: number;
}

export interface GameResult {
  winner: 'HUMANS' | 'AI' | 'TIE';
  prompt: string;
  aiGuess: string | null;
  humanGuesses: Array<{
    playerId: string;
    playerName: string;
    guess: string;
    correct: boolean;
  }>;
  correctHumanGuesses: number;
  aiWasCorrect: boolean;
  drawings: string[];
}

// DTOs para comunicación
export interface CreateRoomDto {
  playerName: string;
  mode?: GameMode;
  maxRounds?: number;
}

export interface JoinRoomDto {
  roomId: string;
  playerName: string;
}

export interface StartRoundDto {
  roomId: string;
}

export interface SubmitDrawingDto {
  roomId: string;
  imageBase64: string;
  isSequenceComplete?: boolean; // para modo SEQUENCE
}

export interface SubmitGuessDto {
  roomId: string;
  guess: string;
}

export interface SubmitTextDto {
  roomId: string;
  text: string; // para modo WORDWRAP
}

// Eventos WebSocket
export interface RoomUpdateEvent {
  room: Omit<Room, 'guesses'> & {
    guesses: Array<{
      playerId: string;
      playerName: string;
      hasGuessed: boolean;
    }>;
  };
}

export interface TimerEvent {
  secondsLeft: number;
  totalSeconds: number;
}

export interface RevealEvent {
  result: GameResult;
  nextDrawerId?: string;
  gameEnded: boolean;
  finalScores?: Array<{ playerId: string; playerName: string; score: number }>;
}

export interface GamePhaseEvent {
  phase: GameState;
  drawerId?: string;
  drawerName?: string;
  prompt?: string;
  hiddenWord?: string; // solo para el drawer en modo WORDWRAP
  roundNumber: number;
  maxRounds: number;
  secondsLeft: number;
}

// Prompts por categoría para el juego educativo
export interface PromptCategory {
  name: string;
  description: string;
  prompts: string[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  educationalFocus: string[];
}

// Para comunicación con IA
export interface AIGuessResponse {
  topGuesses: string[];
  confidence: number[];
  reasoning?: string;
}

export interface AISituationResponse {
  situation: string;
  context: string;
  suggestedSequence: string[];
}
