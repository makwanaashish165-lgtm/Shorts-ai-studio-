export type AspectRatio = '9:16' | '16:9' | '1:1';
export type VideoPlatform = 'YouTube Shorts' | 'Instagram Reels' | 'TikTok' | 'YouTube Long';
export type VideoStyle =
  | 'Cinematic'
  | 'Realistic'
  | 'Anime'
  | '3D Animation'
  | 'Documentary'
  | 'Funny'
  | 'Motivational'
  | 'Horror'
  | 'Educational'
  | 'Gaming'
  | 'Luxury'
  | 'News'
  | 'Storytelling'
  | 'Cyberpunk';

export type CameraMovement =
  | 'Static'
  | 'Slow Zoom'
  | 'Zoom Out'
  | 'Orbit'
  | 'Pan Left'
  | 'Pan Right'
  | 'Tilt'
  | 'Handheld'
  | 'Tracking Shot'
  | 'Dolly Shot';

export interface Scene {
  id: string;
  sceneNumber: number;
  duration: number; // in seconds
  narration: string;
  visualPrompt: string;
  cameraDirection: CameraMovement;
  style: string;
  transition: 'cut' | 'fade' | 'zoom' | 'slide' | 'dissolve';
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  audioUrl?: string;
  captions?: string[];
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  scenes: Scene[];
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  platform: VideoPlatform;
  aspectRatio: AspectRatio;
  duration: number;
  style: VideoStyle;
  language: string;
  voiceName: string;
  thumbnailUrl: string;
  scenes: Scene[];
  chapters?: Chapter[];
  captionsStyle?: CaptionStyle;
  hook?: string;
  cta?: string;
  hashtags?: string[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'generating' | 'completed' | 'failed';
}

export interface CaptionStyle {
  preset: 'Viral Shorts' | 'Bold' | 'Minimal' | 'Cinematic' | 'Karaoke' | 'Creator';
  fontFamily: string;
  fontSize: number;
  textColor: string;
  highlightColor: string;
  strokeColor: string;
  strokeWidth: number;
  hasShadow: boolean;
  backgroundColor?: string;
  position: 'top' | 'center' | 'bottom';
  uppercase: boolean;
}

export interface GenerationJob {
  id: string;
  type: 'shorts' | 'long_video' | 'text_to_video' | 'image_to_video' | 'image' | 'voice' | 'render';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  steps: string[];
  error?: string;
  resultUrl?: string;
  resultData?: any;
  createdAt: string;
  completedAt?: string;
}

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'voiceover';
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  size: number;
  category: 'Uploaded Files' | 'Generated Assets' | 'Stock';
  createdAt: string;
}

export interface VideoTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  aspectRatio: AspectRatio;
  thumbnailUrl: string;
  scenesCount: number;
  style: VideoStyle;
  samplePrompt: string;
}

export type PlanId = 'free' | 'starter_weekly' | 'creator_monthly' | 'unlimited_monthly';

export interface Plan {
  id: PlanId;
  name: string;
  badge?: string;
  price: number; // in INR (₹)
  currency: 'INR';
  validityDays: number;
  dailyPointLimit: number;
  isUnlimited: boolean;
  benefits: string[];
  buttonText: string;
  popular?: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: PlanId;
  planName: string;
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  expiryDate: string;
  dailyPointLimit: number;
  isUnlimited: boolean;
}

export interface PointWallet {
  userId: string;
  dailyLimit: number;
  remainingPoints: number;
  usedToday: number;
  lastResetDate: string; // YYYY-MM-DD in Asia/Kolkata
  nextResetTime: string;
  isUnlimited: boolean;
}

export interface PointTransaction {
  id: string;
  userId: string;
  type: 'generation' | 'refund' | 'daily_reset' | 'subscription_bonus' | 'admin_adjustment';
  amount: number; // negative for spend, positive for refund/reset
  balanceAfter: number;
  videoGenerationId?: string;
  videoDuration?: number;
  description: string;
  createdAt: string;
}

export interface VideoGenerationRecord {
  id: string;
  userId: string;
  type: 'shorts' | 'long_video' | 'text_to_video' | 'image_to_video' | 'script_to_video' | 'ai_image';
  title: string;
  duration: number; // in seconds
  pointsCost: number;
  status: 'started' | 'completed' | 'failed';
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  planId: PlanId;
  planName: string;
  orderId: string;
  paymentId: string;
  signature?: string;
  amount: number; // in INR
  currency: string;
  status: 'created' | 'paid' | 'failed';
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  credits: number;
  maxCredits?: number;
  plan: 'Free' | 'Starter Weekly' | 'Creator Monthly' | 'Unlimited Monthly' | string;
  planId?: PlanId;
  role?: 'user' | 'admin';
  subscription?: Subscription;
  wallet?: PointWallet;
}

export interface CreditUsageLog {
  id: string;
  type: 'Text Generation' | 'Image Generation' | 'Video Generation' | 'Voice Generation' | 'Video Render';
  amount: number;
  projectTitle: string;
  timestamp: string;
}

export interface EnhancedPromptResult {
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
