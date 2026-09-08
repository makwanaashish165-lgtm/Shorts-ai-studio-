// Provider Abstraction Interfaces for FIRE AI TOOL

export interface ScriptGenerationParams {
  topic: string;
  duration: number; // in seconds
  platform: string;
  style: string;
  tone: string;
  language: string;
  audience?: string;
  voice?: string;
}

export interface ScriptGenerationOutput {
  title: string;
  hook: string;
  script: string;
  scenes: {
    sceneNumber: number;
    duration: number;
    narration: string;
    visualPrompt: string;
    cameraDirection: string;
    style: string;
    transition: 'cut' | 'fade' | 'zoom' | 'slide' | 'dissolve';
  }[];
  cta: string;
  hashtags: string[];
}

export interface PromptEnhanceOutput {
  original: string;
  enhanced: string;
  subject: string;
  environment: string;
  lighting: string;
  camera: string;
  lens: string;
  composition: string;
  motion: string;
  atmosphere: string;
  color: string;
  details: string;
  style: string;
}

export interface ImageGenerationParams {
  prompt: string;
  style?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  numberOfImages?: number;
}

export interface ImageGenerationResult {
  imageUrl: string;
  mimeType: string;
  revisedPrompt?: string;
}

export interface VideoGenerationParams {
  prompt?: string;
  imageUrl?: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  resolution?: '720p' | '1080p' | '4k';
  duration?: number;
  cameraMovement?: string;
  motionStrength?: number;
}

export interface ImageToVideoParams {
  image: string; // Base64 data URI or image URL
  prompt: string;
  duration?: number;
  aspectRatio?: '9:16' | '16:9' | '1:1';
  motionStrength?: 'Low' | 'Medium' | 'High' | string;
  camera?: string;
  style?: string;
  referenceImages?: string[];
}

export interface VideoGenerationResult {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  message?: string;
}

export interface SpeechGenerationParams {
  text: string;
  voiceName?: string;
  language?: string;
  speed?: number;
  pitch?: number;
}

export interface SpeechGenerationResult {
  audioBase64?: string;
  audioUrl?: string;
  duration?: number;
  provider: string;
}

export interface AITextProvider {
  name: string;
  generateScript(params: ScriptGenerationParams): Promise<ScriptGenerationOutput>;
  enhancePrompt(prompt: string): Promise<PromptEnhanceOutput>;
  generateLongVideoPlan(params: {
    topic: string;
    duration: number;
    tone: string;
    style: string;
    language: string;
  }): Promise<{
    title: string;
    outline: string;
    chapters: {
      title: string;
      description: string;
      duration: number;
      scenes: any[];
    }[];
  }>;
  chatAssistant(prompt: string, context: any): Promise<string>;
}

export interface AIImageProvider {
  name: string;
  isConfigured(): boolean;
  generateImage(params: ImageGenerationParams): Promise<ImageGenerationResult>;
}

export interface AIVideoProvider {
  name: string;
  isConfigured(): boolean;
  generateVideo(params: VideoGenerationParams): Promise<VideoGenerationResult>;
  generateImageToVideo(params: ImageToVideoParams): Promise<VideoGenerationResult>;
}

export interface AISpeechProvider {
  name: string;
  isConfigured(): boolean;
  generateSpeech(params: SpeechGenerationParams): Promise<SpeechGenerationResult>;
}
