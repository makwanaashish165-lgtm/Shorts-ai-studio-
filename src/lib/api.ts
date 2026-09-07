import type { Project, MediaItem, GenerationJob, VideoTemplate, UserProfile, CreditUsageLog, EnhancedPromptResult } from '../types.js';

export const api = {
  // Health
  async getHealth() {
    const res = await fetch('/api/health');
    return res.json();
  },

  // Auth
  async getMe(): Promise<{ user: UserProfile }> {
    const res = await fetch('/api/auth/me');
    return res.json();
  },

  async login(email: string, name?: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    return res.json();
  },

  async signup(email: string, name?: string) {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    return res.json();
  },

  // AI Script Generation
  async generateScript(params: {
    topic: string;
    duration?: number;
    platform?: string;
    style?: string;
    tone?: string;
    language?: string;
    audience?: string;
  }) {
    const res = await fetch('/api/ai/script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Script generation failed');
    return data;
  },

  // AI Prompt Enhancer
  async enhancePrompt(prompt: string): Promise<{ success: boolean; data: EnhancedPromptResult; remainingCredits: number }> {
    const res = await fetch('/api/ai/enhance-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Prompt enhancement failed');
    return data;
  },

  // AI Long Video Plan
  async generateLongVideoPlan(params: {
    topic: string;
    duration?: number;
    tone?: string;
    style?: string;
    language?: string;
    audience?: string;
  }) {
    const res = await fetch('/api/ai/long-video-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Long video planning failed');
    return data;
  },

  // Script to Scenes
  async parseScriptToScenes(script: string, style?: string) {
    const res = await fetch('/api/ai/parse-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script, style }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to parse script');
    return data;
  },

  // AI Image Generation
  async generateImage(prompt: string, style?: string, aspectRatio?: string) {
    const res = await fetch('/api/ai/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, style, aspectRatio }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Image generation failed');
    return data;
  },

  // AI Video Generation
  async generateVideo(params: { prompt: string; aspectRatio?: string; resolution?: string; duration?: number }) {
    const res = await fetch('/api/ai/video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Video generation failed');
    return data;
  },

  // AI Image to Video Generation (Multipart FormData or JSON)
  async generateImageToVideo(
    payload:
      | FormData
      | {
          image: string;
          prompt: string;
          duration?: number;
          aspectRatio?: string;
          motionStrength?: string;
          camera?: string;
          style?: string;
          referenceImages?: string[];
        }
  ) {
    let res: Response;
    if (payload instanceof FormData) {
      res = await fetch('/api/ai/image-to-video', {
        method: 'POST',
        // When sending FormData, the browser automatically sets Content-Type with multipart boundary
        body: payload,
      });
    } else {
      res = await fetch('/api/ai/image-to-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Image-to-video generation failed');
    return data;
  },

  // AI Voice Synthesis
  async generateVoice(params: { text: string; voiceName?: string; language?: string; speed?: number; pitch?: number }) {
    const res = await fetch('/api/ai/voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Voice generation failed');
    return data;
  },

  // AI Captions
  async generateCaptions(script: string, preset?: string) {
    const res = await fetch('/api/ai/captions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script, preset }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Captions generation failed');
    return data;
  },

  // AI Thumbnails
  async generateThumbnails(title: string, description?: string, style?: string) {
    const res = await fetch('/api/ai/thumbnail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, style }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Thumbnail generation failed');
    return data;
  },

  // AI Chat Assistant
  async chatAssistant(message: string, projectContext: any) {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, projectContext }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'AI Assistant failed');
    return data;
  },

  // Projects
  async getProjects(): Promise<{ success: boolean; projects: Project[] }> {
    const res = await fetch('/api/projects');
    return res.json();
  },

  async getProject(id: string): Promise<{ success: boolean; project: Project }> {
    const res = await fetch(`/api/projects/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch project');
    return data;
  },

  async createProject(projectData: Partial<Project>): Promise<{ success: boolean; project: Project }> {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create project');
    return data;
  },

  async updateProject(id: string, projectData: Partial<Project>): Promise<{ success: boolean; project: Project }> {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update project');
    return data;
  },

  async deleteProject(id: string): Promise<{ success: boolean; project: Project }> {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async duplicateProject(id: string): Promise<{ success: boolean; project: Project }> {
    const res = await fetch(`/api/projects/${id}/duplicate`, {
      method: 'POST',
    });
    return res.json();
  },

  // Media
  async getMedia(): Promise<{ success: boolean; media: MediaItem[] }> {
    const res = await fetch('/api/media');
    return res.json();
  },

  async uploadMedia(mediaData: Partial<MediaItem>): Promise<{ success: boolean; mediaItem: MediaItem }> {
    const res = await fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mediaData),
    });
    return res.json();
  },

  async deleteMedia(id: string) {
    const res = await fetch(`/api/media/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Templates
  async getTemplates(): Promise<{ success: boolean; templates: VideoTemplate[] }> {
    const res = await fetch('/api/templates');
    return res.json();
  },

  // Credits & Points Engine
  async getCredits(): Promise<{
    success: boolean;
    credits: number;
    maxCredits?: number;
    plan: string;
    planId?: string;
    wallet?: any;
    subscription?: any;
    transactions?: any[];
    usageLogs: CreditUsageLog[];
  }> {
    const res = await fetch('/api/credits');
    return res.json();
  },

  async getWallet() {
    const res = await fetch('/api/points/wallet');
    return res.json();
  },

  async getTransactions() {
    const res = await fetch('/api/points/transactions');
    return res.json();
  },

  async getPlans() {
    const res = await fetch('/api/plans');
    return res.json();
  },

  async checkPointCost(duration: number) {
    const res = await fetch('/api/points/check-cost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration }),
    });
    return res.json();
  },

  async deductPoints(params: { duration: number; videoType: string; title: string }) {
    const res = await fetch('/api/points/deduct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) {
      const err: any = new Error(data.error || 'Failed to deduct points');
      err.requiredPoints = data.requiredPoints;
      err.balance = data.balance;
      err.status = res.status;
      throw err;
    }
    return data;
  },

  async refundPoints(params: { generationId: string; reason?: string }) {
    const res = await fetch('/api/points/refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  // Payments (Razorpay)
  async createPaymentOrder(planId: string) {
    const res = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create payment order');
    return data;
  },

  async verifyPayment(params: { orderId: string; paymentId: string; signature?: string; planId: string }) {
    const res = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Payment verification failed');
    return data;
  },

  // Admin Panel
  async getAdminStats() {
    const res = await fetch('/api/admin/stats');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch admin stats');
    return data;
  },

  async adminAdjustPoints(userId: string, amount: number, reason: string = 'Admin Adjustment') {
    const res = await fetch(`/api/admin/users/${userId}/points`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, reason }),
    });
    return res.json();
  },

  async adminChangePlan(userId: string, planId: string) {
    const res = await fetch(`/api/admin/users/${userId}/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    });
    return res.json();
  },

  // Render Video
  async renderVideo(projectId: string, resolution?: string) {
    const res = await fetch('/api/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, resolution }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to render video');
    return data;
  },

  // Settings: API Keys
  async getApiKeys() {
    const res = await fetch('/api/settings/api-keys');
    return res.json();
  },

  async testApiKey() {
    const res = await fetch('/api/settings/api-keys/test', {
      method: 'POST',
    });
    return res.json();
  },

  async updateApiKey(apiKey: string) {
    const res = await fetch('/api/settings/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update API key');
    return data;
  },
};
