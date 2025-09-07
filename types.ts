export enum GeneratorType {
  VEO = 'veo',
  IMAGE = 'image',
  GIF = 'gif',
  HISTORY = 'history',
}

export enum HistoryItemType {
  STORYBOARD = 'storyboard',
  IMAGE = 'image',
  GIF = 'gif',
}

export interface StoryboardImage {
  url: string;
  prompt: string;
}

// Base interface for all history items
interface BaseHistoryItem {
  id: string;
  timestamp: number;
}

export interface StoryboardHistoryItem extends BaseHistoryItem {
  type: HistoryItemType.STORYBOARD;
  cinematicPrompt: string;
  storyboardImages: StoryboardImage[];
  idea: string; // The original user idea
}

export interface ImageHistoryItem extends BaseHistoryItem {
  type: HistoryItemType.IMAGE;
  imageUrl: string;
  prompt: string;
}

export interface GifHistoryItem extends BaseHistoryItem {
  type: HistoryItemType.GIF;
  generatedPrompt: string;
  gifImages: StoryboardImage[]; // The concept images
  idea: string; // The original user idea
}

export type ApiAspectRatio = '1:1' | '9:16' | '16:9' | '4:3' | '3:4';
export type HistoryItem = StoryboardHistoryItem | ImageHistoryItem | GifHistoryItem;