
export enum ThemeType {
  LIGHT = 'light',
  DARK = 'dark',
  GLASS = 'glass',
  YOUTUBE = 'youtube',
}

export enum RecencyLevel {
  VERY_RECENT = 0,
  RECENT_ENOUGH = 1,
  NOT_RECENT = 2,
  OLD_MOVIE = 3,
}

export enum ChannelPreset {
  MOVIE_RECAP = 'Movie Recap',
  TUTORIAL = 'Tutorial/How-To',
  GAMING = 'Gaming',
  VLOG = 'Vlog/Lifestyle',
  COOKING = 'Cooking',
  ANIMATION = 'Animation',
  TECH = 'Tech Review',
}

export enum SoundType {
  GLASSY = 'glassy',
  CLICK = 'click',
  POP = 'pop',
}

export enum ModelType {
  STANDARD = 'gemini-2.5-flash',
  PRO = 'gemini-3-pro-preview',
  LITE = 'gemini-2.5-flash-lite-latest',
}

export interface TrainingExample {
  id: string;
  title: string;
  scriptExcerpt: string;
  notes?: string; // New field for user to explain the "why"
  dateAdded: number;
}

export interface StudioItem {
  id: string;
  title: string;
  generatedDate: number;
  scriptExcerpt: string;
  stats?: {
    views: number;
    ctr: number;
    impressions: number;
  };
}

export interface GenerationHistorySession {
  id: string;
  timestamp: number;
  scriptExcerpt: string;
  titles: GeneratedTitle[];
  preset: ChannelPreset;
}

export interface UserProfile {
  name: string;
  theme: ThemeType;
  preset: ChannelPreset;
  avatar?: string;
  motionBlur: boolean;
  soundType: SoundType;
  soundVolume: number; // 0.0 to 1.0
  preferredModel: ModelType;
}

export interface TitleGenerationParams {
  scriptContent: string;
  thumbnailBase64: string | null;
  subscribers: number;
  recency: RecencyLevel;
  trainingData: TrainingExample[];
  preset: ChannelPreset;
  studioHistory: StudioItem[]; // Feed high performing past titles back into AI
  model: ModelType;
  count: number;
  userGuidance?: string; // New field for specific user direction
}

export interface GeneratedTitle {
  title: string;
  reasoning: string;
  score: number;
}

// State for the Home page to persist across tab switches
export interface HomeState {
  scriptFile: File | null;
  scriptContent: string;
  subscribers: number;
  recency: RecencyLevel;
  thumbnail: string | null;
  titleCount: number;
  loading: boolean;
  results: GeneratedTitle[];
  error: string | null;
  trackedIndices: number[];
  guidance: string; // New field for UI state
}
