export type LieGenre = 'all' | 'pseudoscience' | 'history' | 'daily' | 'excuse' | 'scifi';

export interface LieResponse {
  headline: string;
  story: string;
  bogusProof: string;
  flavorName: string;
  truthFact: string;
  followUps: string[];
  confidenceScore: number;
  truthScore: number;
  isFallback?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  lieData?: LieResponse;
  genre?: LieGenre;
  isFavorite?: boolean;
}

export interface GenreInfo {
  id: LieGenre;
  name: string;
  emoji: string;
  description: string;
  accentColor: string;
}
