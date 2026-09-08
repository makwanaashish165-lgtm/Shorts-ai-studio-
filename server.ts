import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { geminiService } from './services/ai/gemini.js';
import { textProvider, imageProvider, videoProvider, speechProvider } from './services/providers/index.js';
import type { Project, Scene } from './src/types.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 30 * 1024 * 1024 }, // 30MB max
  });

  const handleUploadMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
      upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'referenceImages', maxCount: 5 },
      ])(req, res, next);
    } else {
      next();
    }
  };

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // --- API Routes ---

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'FIRE AI TOOL API',
      timestamp: new Date().toISOString(),
      providers: {
        gemini: !!process.env.GEMINI_API_KEY,
        video: videoProvider.isConfigured(),
        voice: speechProvider.isConfigured(),
      },
    });
  });

  // Settings: API Keys status
  app.get('/api/settings/api-keys', (req, res) => {
    const key = process.env.GEMINI_API_KEY || '';
    const maskedKey = key ? `${key.slice(0, 7)}...${key.slice(-4)}` : '';
    res.json({
      gemini: {
        configured: !!key,
        masked: maskedKey,
        keyLength: key.length,
      },
      videoProvider: {
        configured: videoProvider.isConfigured(),
      },
      speechProvider: {
        configured: speechProvider.isConfigured(),
      },
    });
  });

  // Settings: Verify Gemini API Connection
  app.post('/api/settings/api-keys/test', async (req, res) => {
    try {
      const result = await geminiService.verifyConnection();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ ok: false, message: err.message || 'Verification failed.' });
    }
  });

  // Settings: Update or Set API Key
  app.post('/api/settings/api-keys', (req, res) => {
    try {
      const { apiKey } = req.body;
      if (!apiKey || typeof apiKey !== 'string') {
        return res.status(400).json({ error: 'Valid apiKey string is required.' });
      }

      const trimmedKey = apiKey.trim();
      process.env.GEMINI_API_KEY = trimmedKey;

      // Persist to .env
      try {
        const envPath = path.join(process.cwd(), '.env');
        let currentEnv = '';
        if (fs.existsSync(envPath)) {
          currentEnv = fs.readFileSync(envPath, 'utf-8');
        }
        if (currentEnv.includes('GEMINI_API_KEY=')) {
          currentEnv = currentEnv.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY="${trimmedKey}"`);
        } else {
          currentEnv += `\nGEMINI_API_KEY="${trimmedKey}"\n`;
        }
        fs.writeFileSync(envPath, currentEnv.trim() + '\n', 'utf-8');
      } catch (fileErr) {
        console.warn('Could not write to .env file:', fileErr);
      }

      const maskedKey = `${trimmedKey.slice(0, 7)}...${trimmedKey.slice(-4)}`;
      res.json({
        success: true,
        message: 'API Key updated and activated successfully.',
        masked: maskedKey,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update API key.' });
    }
  });

  // Auth Endpoints
  app.get('/api/auth/me', (req, res) => {
    const wallet = db.getUserWallet(db.user.id);
    const subscription = db.getUserSubscription(db.user.id);
    res.json({
      user: {
        ...db.user,
        credits: wallet.remainingPoints,
        maxCredits: wallet.dailyLimit,
        wallet,
        subscription,
      },
      wallet,
      subscription,
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, name } = req.body;
    if (email) {
      db.user.email = email;
      if (name) db.user.name = name;
    }
    const wallet = db.getUserWallet(db.user.id);
    const subscription = db.getUserSubscription(db.user.id);
    res.json({ success: true, user: db.user, wallet, subscription });
  });

  app.post('/api/auth/signup', (req, res) => {
    const { email, name } = req.body;
    if (email) {
      db.user.email = email;
      if (name) db.user.name = name;
      db.user.plan = 'Free';
      db.user.planId = 'free';
      const wallet = db.getUserWallet(db.user.id);
      wallet.remainingPoints = 1000;
      wallet.dailyLimit = 1000;
      wallet.usedToday = 0;
      wallet.isUnlimited = false;
      db.user.credits = 1000;
      db.user.maxCredits = 1000;
    }
    const wallet = db.getUserWallet(db.user.id);
    const subscription = db.getUserSubscription(db.user.id);
    res.json({ success: true, user: db.user, wallet, subscription });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
  });

  // Points & Wallet Endpoints
  app.get('/api/points/wallet', (req, res) => {
    const wallet = db.getUserWallet(db.user.id);
    const subscription = db.getUserSubscription(db.user.id);
    res.json({
      success: true,
      wallet,
      subscription,
      user: db.user,
    });
  });

  app.get('/api/points/transactions', (req, res) => {
    // Ensure daily reset check ran
    db.getUserWallet(db.user.id);
    const userTx = db.pointTransactions.filter((tx) => tx.userId === db.user.id);
    res.json({ success: true, transactions: userTx });
  });

  app.get('/api/plans', (req, res) => {
    res.json({ success: true, plans: db.plans });
  });

  // Calculate video point cost on the SERVER
  app.post('/api/points/check-cost', (req, res) => {
    const { duration = 10 } = req.body;
    const wallet = db.getUserWallet(db.user.id);
    const effectiveSecs = Math.max(10, Math.round(Number(duration) || 10));
    const cost = db.calculateVideoPointCost(effectiveSecs, wallet.isUnlimited);
    const canAfford = wallet.isUnlimited || wallet.remainingPoints >= cost;

    res.json({
      duration: effectiveSecs,
      cost,
      isUnlimited: wallet.isUnlimited,
      availablePoints: wallet.remainingPoints,
      canAfford,
      dailyLimit: wallet.dailyLimit,
      usedToday: wallet.usedToday,
      nextResetTime: wallet.nextResetTime,
    });
  });

  // Atomic deduction endpoint for custom video pipelines
  app.post('/api/points/deduct', (req, res) => {
    const { duration = 10, videoType = 'shorts', title = 'AI Video' } = req.body;
    const deduction = db.deductPointsForVideo(db.user.id, Number(duration), videoType, title);

    if (!deduction.success) {
      return res.status(402).json({
        error: 'Not Enough Points',
        message: deduction.error,
        requiredPoints: deduction.cost,
        balance: deduction.remainingPoints,
        isUnlimited: false,
      });
    }

    res.json({
      success: true,
      ...deduction,
    });
  });

  // Point refund endpoint
  app.post('/api/points/refund', (req, res) => {
    const { generationId, reason = 'Generation failed or cancelled' } = req.body;
    if (!generationId) {
      return res.status(400).json({ error: 'generationId is required.' });
    }
    const refunded = db.refundVideoPoints(db.user.id, generationId, reason);
    const wallet = db.getUserWallet(db.user.id);
    res.json({ success: refunded, wallet });
  });

  // Razorpay Payment Endpoints
  app.post('/api/payments/create-order', async (req, res) => {
    try {
      const { planId } = req.body;
      const plan = db.plans.find((p) => p.id === planId);
      if (!plan || plan.id === 'free') {
        return res.status(400).json({ error: 'Please choose a valid premium plan.' });
      }

      const amountInPaise = plan.price * 100;
      const razorpayKeyId = process.env.RAZORPAY_KEY_ID?.trim();
      const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

      // If live/test Razorpay API credentials are configured, create real Razorpay order
      if (razorpayKeyId && razorpayKeySecret) {
        const authHeader = 'Basic ' + Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');
        const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `rcpt_${Date.now().toString().slice(-8)}`,
            notes: {
              userId: db.user.id,
              planId: plan.id,
              planName: plan.name,
            },
          }),
        });

        const orderData = await rzpResponse.json();
        if (!rzpResponse.ok) {
          console.error('Razorpay API error:', orderData);
          throw new Error(orderData.error?.description || 'Failed to create order on Razorpay.');
        }

        return res.json({
          success: true,
          orderId: orderData.id,
          amount: plan.price,
          amountPaise: amountInPaise,
          currency: 'INR',
          keyId: razorpayKeyId,
          plan,
          isSandbox: false,
        });
      }

      // Seamless built-in testing & preview sandbox (safe development fallback)
      const simulatedOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      return res.json({
        success: true,
        orderId: simulatedOrderId,
        amount: plan.price,
        amountPaise: amountInPaise,
        currency: 'INR',
        keyId: 'rzp_test_shortsai_sandbox',
        plan,
        isSandbox: true,
      });
    } catch (err: any) {
      console.error('Error in /api/payments/create-order:', err);
      res.status(500).json({ error: err.message || 'Payment initiation failed.' });
    }
  });

  app.post('/api/payments/verify', (req, res) => {
    try {
      const { orderId, paymentId, signature, planId } = req.body;
      if (!orderId || !paymentId || !planId) {
        return res.status(400).json({ error: 'Missing required payment verification fields.' });
      }

      const plan = db.plans.find((p) => p.id === planId);
      if (!plan) {
        return res.status(400).json({ error: 'Invalid plan selected.' });
      }

      const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
      if (razorpayKeySecret && signature) {
        const expectedSignature = crypto
          .createHmac('sha256', razorpayKeySecret)
          .update(`${orderId}|${paymentId}`)
          .digest('hex');

        if (expectedSignature !== signature) {
          return res.status(400).json({ error: 'Payment signature verification failed.' });
        }
      }

      // Check if order was already activated
      const alreadyProcessed = db.payments.some((p) => p.orderId === orderId && p.status === 'paid');
      if (alreadyProcessed) {
        const wallet = db.getUserWallet(db.user.id);
        return res.json({
          success: true,
          alreadyProcessed: true,
          user: db.user,
          wallet,
          subscription: db.getUserSubscription(db.user.id),
        });
      }

      // Server-authoritative subscription activation
      const result = db.activateSubscription(db.user.id, planId, {
        orderId,
        paymentId,
        signature,
        amount: plan.price,
      });

      res.json({
        success: true,
        message: `Subscription successfully activated! Enjoy your ${plan.name} plan.`,
        user: result.user,
        subscription: result.subscription,
        wallet: result.wallet,
      });
    } catch (err: any) {
      console.error('Error in /api/payments/verify:', err);
      res.status(500).json({ error: err.message || 'Payment verification failed.' });
    }
  });

  // Admin Dashboard Endpoints
  app.get('/api/admin/stats', (req, res) => {
    const stats = db.getAdminStats();
    res.json({ success: true, ...stats });
  });

  app.post('/api/admin/users/:id/points', (req, res) => {
    const { id } = req.params;
    const { amount = 1000, reason = 'Admin Adjustment' } = req.body;
    const wallet = db.getUserWallet(id);
    wallet.remainingPoints = Math.max(0, wallet.remainingPoints + Number(amount));

    db.pointTransactions.unshift({
      id: `tx_adm_${Date.now()}`,
      userId: id,
      type: 'admin_adjustment',
      amount: Number(amount),
      balanceAfter: wallet.remainingPoints,
      description: `Admin: ${reason}`,
      createdAt: new Date().toISOString(),
    });

    const user = db.getUser(id);
    user.credits = wallet.remainingPoints;
    res.json({ success: true, user, wallet });
  });

  app.post('/api/admin/users/:id/plan', (req, res) => {
    const { id } = req.params;
    const { planId } = req.body;
    const plan = db.plans.find((p) => p.id === planId);
    if (!plan) return res.status(400).json({ error: 'Invalid plan' });

    const result = db.activateSubscription(id, plan.id, {
      orderId: `adm_ord_${Date.now()}`,
      paymentId: `adm_pay_${Date.now()}`,
      amount: plan.price,
    });

    res.json({ success: true, user: result.user, wallet: result.wallet });
  });

  // AI Script Generation
  app.post('/api/ai/script', async (req, res) => {
    try {
      const { topic, duration = 30, platform = 'YouTube Shorts', style = 'Cinematic', tone = 'Engaging', language = 'English', audience } = req.body;
      if (!topic) {
        return res.status(400).json({ error: 'Topic is required.' });
      }

      // Check & deduct credits
      const creditCost = 15;
      if (!db.deductCredits(creditCost, 'Text Generation', topic)) {
        return res.status(402).json({ error: 'Insufficient AI credits. Please upgrade your plan or purchase more credits.' });
      }

      const result = await textProvider.generateScript({
        topic,
        duration: Number(duration),
        platform,
        style,
        tone,
        language,
        audience,
      });

      res.json({ success: true, data: result, remainingCredits: db.user.credits });
    } catch (err: any) {
      console.error('Error generating script:', err);
      res.status(500).json({ error: err.message || 'Failed to generate script.' });
    }
  });

  // AI Prompt Enhancer
  app.post('/api/ai/enhance-prompt', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
      }

      db.deductCredits(2, 'Text Generation', 'Prompt Enhancer');
      const result = await textProvider.enhancePrompt(prompt);
      res.json({ success: true, data: result, remainingCredits: db.user.credits });
    } catch (err: any) {
      console.error('Error enhancing prompt:', err);
      res.status(500).json({ error: err.message || 'Failed to enhance prompt.' });
    }
  });

  // AI Long Video Plan
  app.post('/api/ai/long-video-plan', async (req, res) => {
    try {
      const { topic, duration = 5, tone = 'Informative', style = 'Documentary', language = 'English', audience } = req.body;
      if (!topic) {
        return res.status(400).json({ error: 'Topic is required.' });
      }

      db.deductCredits(30, 'Text Generation', topic);
      const result = await textProvider.generateLongVideoPlan({
        topic,
        duration: Number(duration),
        tone,
        style,
        language,
      });

      res.json({ success: true, data: result, remainingCredits: db.user.credits });
    } catch (err: any) {
      console.error('Error generating long video plan:', err);
      res.status(500).json({ error: err.message || 'Failed to generate long video plan.' });
    }
  });

  // AI Script to Scenes Parser
  app.post('/api/ai/parse-script', async (req, res) => {
    try {
      const { script, style = 'Cinematic' } = req.body;
      if (!script) {
        return res.status(400).json({ error: 'Script text is required.' });
      }

      db.deductCredits(10, 'Text Generation', 'Script to Scenes');
      const result = await geminiService.parseScriptToScenes(script, style);
      res.json({ success: true, data: result, remainingCredits: db.user.credits });
    } catch (err: any) {
      console.error('Error parsing script to scenes:', err);
      res.status(500).json({ error: err.message || 'Failed to parse script.' });
    }
  });

  // AI Image Generator
  app.post('/api/ai/image', async (req, res) => {
    try {
      const { prompt, style = 'Cinematic', aspectRatio = '9:16' } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
      }

      if (!db.deductCredits(10, 'Image Generation', prompt.slice(0, 30))) {
        return res.status(402).json({ error: 'Insufficient AI credits for image generation.' });
      }

      const result = await imageProvider.generateImage({
        prompt,
        style,
        aspectRatio,
      });

      // Save to media library
      const newMedia = {
        id: `med_${Date.now()}`,
        name: `AI Image: ${prompt.slice(0, 24)}...`,
        type: 'image' as const,
        url: result.imageUrl,
        thumbnailUrl: result.imageUrl,
        size: 1024000,
        category: 'Generated Assets' as const,
        createdAt: new Date().toISOString(),
      };
      db.media.unshift(newMedia);

      res.json({ success: true, data: result, mediaItem: newMedia, remainingCredits: db.user.credits });
    } catch (err: any) {
      console.error('Error generating image:', err);
      res.status(500).json({ error: err.message || 'Failed to generate image.' });
    }
  });

  // AI Video Generator
  app.post('/api/ai/video', async (req, res) => {
    let deduction: any = null;
    try {
      const { prompt, aspectRatio = '9:16', resolution = '1080p', duration = 10 } = req.body;
      const effectiveDuration = Math.max(10, Math.round(Number(duration) || 10));

      // Server-authoritative point calculation and deduction: cost = durationInSeconds * 10
      deduction = db.deductPointsForVideo(
        db.user.id,
        effectiveDuration,
        'text_to_video',
        prompt?.slice(0, 30) || 'Text to Video'
      );

      if (!deduction.success) {
        return res.status(402).json({
          error: 'Not Enough Points',
          message: deduction.error,
          requiredPoints: deduction.cost,
          balance: deduction.remainingPoints,
          isUnlimited: false,
        });
      }

      const result = await videoProvider.generateVideo({
        prompt,
        aspectRatio,
        resolution,
        duration: effectiveDuration,
      });

      if (result.status === 'failed') {
        db.refundVideoPoints(db.user.id, deduction.generationId, result.message || 'Provider generation failed');
        return res.status(500).json({
          error: result.message || 'Failed to generate video.',
          refunded: true,
          remainingCredits: db.user.credits,
        });
      }

      db.completeVideoGeneration(deduction.generationId);

      // Create tracking job
      const job = {
        id: result.jobId || deduction.generationId || `job_${Date.now()}`,
        type: 'text_to_video' as const,
        status: result.status,
        progress: result.status === 'completed' ? 100 : 25,
        currentStep: result.status === 'completed' ? 'Done' : 'Processing with video engine',
        steps: ['Validating prompts', 'Allocating GPU cluster', 'Generating temporal video latents', 'Finalizing encode'],
        resultUrl: result.videoUrl,
        createdAt: new Date().toISOString(),
        error: result.message,
      };
      db.generations.unshift(job);

      const wallet = db.getUserWallet(db.user.id);
      res.json({
        success: true,
        data: result,
        job,
        pointsDeducted: deduction.cost,
        remainingCredits: wallet.remainingPoints,
        wallet,
      });
    } catch (err: any) {
      console.error('Error generating video:', err);
      if (deduction?.generationId) {
        db.refundVideoPoints(db.user.id, deduction.generationId, err.message);
      }
      res.status(500).json({ error: err.message || 'Failed to generate video.', refunded: !!deduction?.generationId });
    }
  });

  // Dedicated AI Image to Video Endpoint
  app.post('/api/ai/image-to-video', handleUploadMiddleware, async (req: any, res) => {
    let deduction: any = null;
    try {
      let image = '';
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      
      if (files?.image && files.image[0]) {
        const f = files.image[0];
        image = `data:${f.mimetype};base64,${f.buffer.toString('base64')}`;
      } else if (req.body.image) {
        image = req.body.image;
      }

      if (!image) {
        return res.status(400).json({ error: 'Please upload an image first.' });
      }

      const {
        prompt = '',
        duration = 10,
        aspectRatio = '9:16',
        motionStrength = 'Medium',
        camera = 'Auto',
        style = 'Cinematic',
      } = req.body;

      const effectiveDuration = Math.max(10, Math.round(Number(duration) || 10));

      // Server-authoritative point calculation and deduction: cost = durationInSeconds * 10
      deduction = db.deductPointsForVideo(
        db.user.id,
        effectiveDuration,
        'image_to_video',
        prompt?.slice(0, 30) || 'Image to Video'
      );

      if (!deduction.success) {
        return res.status(402).json({
          error: 'Not Enough Points',
          message: deduction.error,
          requiredPoints: deduction.cost,
          balance: deduction.remainingPoints,
          isUnlimited: false,
        });
      }

      // Extract reference images if supplied
      const referenceImages: string[] = [];
      if (files?.referenceImages) {
        for (const refFile of files.referenceImages) {
          referenceImages.push(`data:${refFile.mimetype};base64,${refFile.buffer.toString('base64')}`);
        }
      }
      if (Array.isArray(req.body.referenceImages)) {
        referenceImages.push(...req.body.referenceImages);
      } else if (typeof req.body.referenceImages === 'string') {
        try {
          const parsed = JSON.parse(req.body.referenceImages);
          if (Array.isArray(parsed)) referenceImages.push(...parsed);
          else referenceImages.push(req.body.referenceImages);
        } catch {
          referenceImages.push(req.body.referenceImages);
        }
      }

      const result = await videoProvider.generateImageToVideo({
        image,
        prompt,
        duration: effectiveDuration,
        aspectRatio,
        motionStrength,
        camera,
        style,
        referenceImages,
      });

      if (result.status === 'failed') {
        db.refundVideoPoints(db.user.id, deduction.generationId, result.message || 'Provider generation failed');
        return res.status(500).json({
          error: result.message || 'Failed to generate video.',
          refunded: true,
          remainingCredits: db.user.credits,
        });
      }

      db.completeVideoGeneration(deduction.generationId);

      // Create tracking job in generation history
      const job = {
        id: result.jobId || deduction.generationId || `job_i2v_${Date.now()}`,
        type: 'image_to_video' as const,
        status: result.status,
        progress: result.status === 'completed' ? 100 : 30,
        currentStep: result.status === 'completed'
          ? 'Done'
          : 'Synthesizing video motion from source image',
        steps: [
          'Validating source image dimensions',
          'Extracting visual composition & depth',
          'Computing camera trajectory and fluid motion vectors',
          'Rendering animated video latents',
        ],
        resultUrl: result.videoUrl,
        createdAt: new Date().toISOString(),
      };
      db.generations.unshift(job as any);

      // If a video asset is returned, add to media library
      let mediaItem: any = null;
      if (result.videoUrl) {
        mediaItem = {
          id: `med_${Date.now()}`,
          name: `Animate: ${prompt ? prompt.slice(0, 24) : 'Source Image'}...`,
          type: 'video' as const,
          url: result.videoUrl,
          thumbnailUrl: image.startsWith('data:') ? image : undefined,
          size: 4500000,
          category: 'Generated Assets' as const,
          createdAt: new Date().toISOString(),
        };
        db.media.unshift(mediaItem);
      }

      const wallet = db.getUserWallet(db.user.id);
      res.json({
        success: true,
        data: result,
        job,
        mediaItem,
        pointsDeducted: deduction.cost,
        remainingCredits: wallet.remainingPoints,
        wallet,
      });
    } catch (err: any) {
      console.error('Error generating image to video:', err);
      if (deduction?.generationId) {
        db.refundVideoPoints(db.user.id, deduction.generationId, err.message);
      }
      res.status(500).json({ error: err.message || 'Failed to generate video.', refunded: !!deduction?.generationId });
    }
  });

  // AI Voice Synthesis
  app.post('/api/ai/voice', async (req, res) => {
    try {
      const { text, voiceName = 'Zephyr', language = 'English', speed = 1.0, pitch = 1.0 } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Text is required for voiceover generation.' });
      }

      if (!db.deductCredits(8, 'Voice Generation', text.slice(0, 30))) {
        return res.status(402).json({ error: 'Insufficient AI credits for voice generation.' });
      }

      const result = await speechProvider.generateSpeech({
        text,
        voiceName,
        language,
        speed,
        pitch,
      });

      res.json({ success: true, data: result, remainingCredits: db.user.credits });
    } catch (err: any) {
      console.error('Error generating voice:', err);
      res.status(500).json({ error: err.message || 'Failed to generate voice.' });
    }
  });

  // AI Captions Generator
  app.post('/api/ai/captions', (req, res) => {
    try {
      const { script, preset = 'Viral Shorts' } = req.body;
      if (!script) {
        return res.status(400).json({ error: 'Script text is required.' });
      }

      const words = script.split(/\s+/).filter(Boolean);
      const captionsWithTimestamps = [];
      let currentTime = 0;
      const avgDurationPerWord = 0.32; // ~180 words per minute

      for (let i = 0; i < words.length; i += 4) {
        const chunk = words.slice(i, i + 4);
        const chunkDuration = chunk.length * avgDurationPerWord;
        captionsWithTimestamps.push({
          id: `cap_${i}`,
          text: chunk.join(' '),
          words: chunk.map((w: string, idx: number) => ({
            word: w,
            startTime: Number((currentTime + idx * avgDurationPerWord).toFixed(2)),
            endTime: Number((currentTime + (idx + 1) * avgDurationPerWord).toFixed(2)),
          })),
          startTime: Number(currentTime.toFixed(2)),
          endTime: Number((currentTime + chunkDuration).toFixed(2)),
        });
        currentTime += chunkDuration;
      }

      res.json({
        success: true,
        data: {
          preset,
          captions: captionsWithTimestamps,
          totalDuration: Number(currentTime.toFixed(2)),
        },
      });
    } catch (err: any) {
      console.error('Error generating captions:', err);
      res.status(500).json({ error: err.message || 'Failed to generate captions.' });
    }
  });

  // AI Thumbnail Generator
  app.post('/api/ai/thumbnail', async (req, res) => {
    try {
      const { title, description, style = 'YouTube Viral' } = req.body;
      if (!title) {
        return res.status(400).json({ error: 'Title is required.' });
      }

      db.deductCredits(10, 'Image Generation', `Thumbnail: ${title}`);
      const concepts = await geminiService.generateThumbnailConcepts({ title, description, style });

      // Build thumbnail image cards for the concepts
      const variations = (concepts.concepts || []).map((c: any, index: number) => {
        const seed = (title.length * 17 + index * 41) % 360;
        return {
          id: `thumb_${Date.now()}_${index}`,
          conceptName: c.conceptName,
          visualPrompt: c.visualPrompt,
          boldTextOverlay: c.boldTextOverlay,
          colorPalette: c.colorPalette,
          emotionalHook: c.emotionalHook,
          imageUrl: `https://images.unsplash.com/photo-${[
            '1534447677768-be436bb09401',
            '1518709268805-4e9042af9f23',
            '1451187580459-43490279c0fa',
            '1509198397868-475647b2a1e5',
          ][index % 4]}?w=800&auto=format&fit=crop&q=80`,
        };
      });

      res.json({ success: true, data: { concepts, variations }, remainingCredits: db.user.credits });
    } catch (err: any) {
      console.error('Error generating thumbnails:', err);
      res.status(500).json({ error: err.message || 'Failed to generate thumbnails.' });
    }
  });

  // AI Editor Assistant
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, projectContext } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message is required.' });
      }

      const reply = await textProvider.chatAssistant(message, projectContext);
      res.json({ success: true, reply });
    } catch (err: any) {
      console.error('Error in AI chat assistant:', err);
      res.status(500).json({ error: err.message || 'Assistant failed to respond.' });
    }
  });

  // Projects CRUD
  app.get('/api/projects', (req, res) => {
    res.json({ success: true, projects: db.projects });
  });

  app.get('/api/projects/:id', (req, res) => {
    const project = db.projects.find((p) => p.id === req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    res.json({ success: true, project });
  });

  app.post('/api/projects', (req, res) => {
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      title: req.body.title || 'Untitled Project',
      description: req.body.description || '',
      platform: req.body.platform || 'YouTube Shorts',
      aspectRatio: req.body.aspectRatio || '9:16',
      duration: Number(req.body.duration) || 30,
      style: req.body.style || 'Cinematic',
      language: req.body.language || 'English',
      voiceName: req.body.voiceName || 'Zephyr',
      thumbnailUrl: req.body.thumbnailUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      hook: req.body.hook,
      cta: req.body.cta,
      hashtags: req.body.hashtags || [],
      scenes: req.body.scenes || [],
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.projects.unshift(newProject);
    res.status(201).json({ success: true, project: newProject });
  });

  app.put('/api/projects/:id', (req, res) => {
    const index = db.projects.findIndex((p) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    db.projects[index] = {
      ...db.projects[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    res.json({ success: true, project: db.projects[index] });
  });

  app.delete('/api/projects/:id', (req, res) => {
    const index = db.projects.findIndex((p) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    const deleted = db.projects.splice(index, 1)[0];
    res.json({ success: true, project: deleted });
  });

  app.post('/api/projects/:id/duplicate', (req, res) => {
    const original = db.projects.find((p) => p.id === req.params.id);
    if (!original) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    const duplicated: Project = {
      ...JSON.parse(JSON.stringify(original)),
      id: `proj_${Date.now()}`,
      title: `${original.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.projects.unshift(duplicated);
    res.status(201).json({ success: true, project: duplicated });
  });

  // Media Library CRUD
  app.get('/api/media', (req, res) => {
    res.json({ success: true, media: db.media });
  });

  app.post('/api/media', (req, res) => {
    const newItem = {
      id: `med_${Date.now()}`,
      name: req.body.name || 'Uploaded Media',
      type: req.body.type || 'image',
      url: req.body.url,
      thumbnailUrl: req.body.thumbnailUrl || req.body.url,
      size: Number(req.body.size) || 1200000,
      duration: req.body.duration,
      category: req.body.category || 'Uploaded Files',
      createdAt: new Date().toISOString(),
    };
    db.media.unshift(newItem);
    res.status(201).json({ success: true, mediaItem: newItem });
  });

  app.delete('/api/media/:id', (req, res) => {
    const index = db.media.findIndex((m) => m.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Media not found.' });
    }
    const deleted = db.media.splice(index, 1)[0];
    res.json({ success: true, mediaItem: deleted });
  });

  // Templates
  app.get('/api/templates', (req, res) => {
    res.json({ success: true, templates: db.templates });
  });

  // Generations / Async Jobs
  app.get('/api/generations', (req, res) => {
    res.json({ success: true, generations: db.generations });
  });

  app.get('/api/generations/:id', (req, res) => {
    const job = db.generations.find((g) => g.id === req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }
    res.json({ success: true, job });
  });

  // Credits & Usage
  app.get('/api/credits', (req, res) => {
    const wallet = db.getUserWallet(db.user.id);
    const subscription = db.getUserSubscription(db.user.id);
    const transactions = db.pointTransactions.filter((tx) => tx.userId === db.user.id);
    res.json({
      success: true,
      credits: wallet.remainingPoints,
      maxCredits: wallet.dailyLimit,
      plan: db.user.plan,
      planId: db.user.planId || 'free',
      wallet,
      subscription,
      transactions,
      usageLogs: db.usageLogs,
    });
  });

  // Video Render Trigger
  app.post('/api/render', (req, res) => {
    const { projectId, resolution = '1080p' } = req.body;
    const project = db.projects.find((p) => p.id === projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    if (!db.deductCredits(25, 'Video Render', project.title)) {
      return res.status(402).json({ error: 'Insufficient credits for rendering.' });
    }

    const job = {
      id: `render_${Date.now()}`,
      type: 'render' as const,
      status: 'completed' as const,
      progress: 100,
      currentStep: 'Render complete',
      steps: ['Assembling timeline assets', 'Encoding visual frames', 'Mastering audio channels', 'Packaging MP4 stream'],
      resultUrl: project.scenes[0]?.mediaUrl || project.thumbnailUrl,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
    db.generations.unshift(job);

    res.json({
      success: true,
      jobId: job.id,
      downloadUrl: job.resultUrl,
      message: 'Video rendered successfully',
      remainingCredits: db.user.credits,
    });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FIRE AI TOOL server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
