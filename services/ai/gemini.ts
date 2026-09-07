import { GoogleGenAI, Type, Modality } from '@google/genai';
import type {
  ScriptGenerationParams,
  ScriptGenerationOutput,
  PromptEnhanceOutput,
} from '../providers/interfaces.js';

let genAIClient: GoogleGenAI | null = null;
let currentApiKey: string | null = null;

export function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient || currentApiKey !== apiKey) {
    currentApiKey = apiKey;
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

/**
 * Executes generateContent with automatic graceful fallback if the primary model is busy (e.g. 503 spike).
 */
async function generateWithFallback(
  ai: GoogleGenAI,
  req: {
    preferredModel?: string;
    fallbackModel?: string;
    contents: any;
    config?: any;
  }
) {
  const preferred = req.preferredModel || 'gemini-3.8-flash';
  const fallback = req.fallbackModel || 'gemini-3.1-flash-lite';
  try {
    return await ai.models.generateContent({
      model: preferred,
      contents: req.contents,
      config: req.config,
    });
  } catch (err: any) {
    const isBusy =
      err?.message?.includes('503') ||
      err?.message?.includes('UNAVAILABLE') ||
      err?.message?.includes('high demand') ||
      err?.status === 'UNAVAILABLE';
    if (isBusy && preferred !== fallback) {
      console.warn(`[Gemini API] Model ${preferred} experiencing high demand, automatically failing over to ${fallback}...`);
      return await ai.models.generateContent({
        model: fallback,
        contents: req.contents,
        config: req.config,
      });
    }
    throw err;
  }
}

export class GeminiService {
  /**
   * Generates a viral hook, title, script, detailed scene breakdown, visual prompts,
   * camera directions, voiceover script, CTA and hashtags.
   */
  async generateScript(params: ScriptGenerationParams): Promise<ScriptGenerationOutput> {
    const ai = getGenAI();
    if (!ai) {
      throw new Error('GEMINI_API_KEY is not configured on the server.');
    }

    const prompt = `You are a master viral video creator and director for YouTube Shorts, Instagram Reels, and TikTok.
Create a complete production-ready video plan for:
Topic: "${params.topic}"
Platform: "${params.platform}"
Style: "${params.style}"
Tone: "${params.tone}"
Language: "${params.language}"
Target Duration: ${params.duration} seconds
Target Audience: "${params.audience || 'General public, creators, curious minds'}"

Divide the video into concise scenes (typically 4 to 8 scenes for a ${params.duration}-second short, each 3-6 seconds long).
For each scene provide:
- sceneNumber: integer 1..N
- duration: duration in seconds (number)
- narration: engaging, fast-paced voiceover line
- visualPrompt: hyper-detailed, cinematic visual prompt describing subjects, lighting, environment, mood, and style
- cameraDirection: one of 'Static', 'Slow Zoom', 'Zoom Out', 'Orbit', 'Pan Left', 'Pan Right', 'Tilt', 'Handheld', 'Tracking Shot', 'Dolly Shot'
- style: visual style
- transition: one of 'cut', 'fade', 'zoom', 'slide', 'dissolve'

Also include:
- title: catchy, high-CTR title
- hook: powerful 3-second opening hook that stops scrolling
- script: full contiguous voiceover text
- cta: compelling call to action
- hashtags: array of 4-8 viral hashtags

Return valid JSON adhering to the specified schema.`;

    const response = await generateWithFallback(ai, {
      preferredModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            hook: { type: Type.STRING },
            script: { type: Type.STRING },
            cta: { type: Type.STRING },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sceneNumber: { type: Type.INTEGER },
                  duration: { type: Type.NUMBER },
                  narration: { type: Type.STRING },
                  visualPrompt: { type: Type.STRING },
                  cameraDirection: { type: Type.STRING },
                  style: { type: Type.STRING },
                  transition: { type: Type.STRING },
                },
                required: ['sceneNumber', 'duration', 'narration', 'visualPrompt', 'cameraDirection', 'style', 'transition'],
              },
            },
          },
          required: ['title', 'hook', 'script', 'scenes', 'cta', 'hashtags'],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);
    return parsed as ScriptGenerationOutput;
  }

  /**
   * Enhances raw user prompts into hyper-detailed 2026 cinematic generation prompts.
   */
  async enhancePrompt(rawPrompt: string): Promise<PromptEnhanceOutput> {
    const ai = getGenAI();
    if (!ai) {
      throw new Error('GEMINI_API_KEY is not configured on the server.');
    }

    const systemPrompt = `You are an elite Hollywood cinematographer and AI visual prompt engineer.
Analyze the user's raw prompt and break it down into professional photographic and cinematic parameters:
- subject: core focus and character/object details
- environment: setting, background, atmosphere, architecture
- lighting: volumetric, golden hour, neon rim lights, studio key light, etc.
- camera: ARRI Alexa 65, RED V-Raptor, Sony FX9, 70mm IMAX, 35mm film
- lens: 35mm anamorphic, 85mm f/1.2 prime, macro, ultra-wide
- composition: rule of thirds, Dutch angle, symmetrical wide shot, close-up
- motion: slow pan, gimbal dolly-in, handheld cinematic shake
- atmosphere: fog, dust motes, haze, rain reflections, dynamic tension
- color: Teal and Orange, cyberpunk neon, muted editorial tones, rich Kodak Kodachrome
- details: 8k resolution, photorealistic microtextures, high fidelity
- style: Cinematic realism, photorealism, anime, or 3D render
- enhanced: the unified master prompt combining all elements seamlessly into one cohesive, breathtaking prompt.

Return valid JSON.`;

    const response = await generateWithFallback(ai, {
      preferredModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-3.1-flash-lite',
      contents: `Raw prompt: "${rawPrompt}"\n\nEnhance this prompt into cinematic mastery.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            original: { type: Type.STRING },
            enhanced: { type: Type.STRING },
            subject: { type: Type.STRING },
            environment: { type: Type.STRING },
            lighting: { type: Type.STRING },
            camera: { type: Type.STRING },
            lens: { type: Type.STRING },
            composition: { type: Type.STRING },
            motion: { type: Type.STRING },
            atmosphere: { type: Type.STRING },
            color: { type: Type.STRING },
            details: { type: Type.STRING },
            style: { type: Type.STRING },
          },
          required: [
            'original',
            'enhanced',
            'subject',
            'environment',
            'lighting',
            'camera',
            'lens',
            'composition',
            'motion',
            'atmosphere',
            'color',
            'details',
            'style',
          ],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);
    return parsed as PromptEnhanceOutput;
  }

  /**
   * Generates a comprehensive outline and chapter-based script for long-form YouTube videos.
   */
  async generateLongVideoPlan(params: {
    topic: string;
    duration: number; // in minutes
    tone: string;
    style: string;
    language: string;
    audience?: string;
  }) {
    const ai = getGenAI();
    if (!ai) {
      throw new Error('GEMINI_API_KEY is not configured on the server.');
    }

    const prompt = `Create a comprehensive long-form documentary/educational video plan for:
Topic: "${params.topic}"
Target Duration: ${params.duration} minutes
Tone: "${params.tone}"
Style: "${params.style}"
Language: "${params.language}"
Target Audience: "${params.audience || 'Curious intellectuals, students, documentary enthusiasts'}"

Break the video into 4 core chapters:
1. Chapter 1 — Introduction (Hook, premise, importance)
2. Chapter 2 — Main Story / The Deep Dive (Historical or core technical context)
3. Chapter 3 — Critical Analysis / Climax (Key turning points, conflicts, data, implications)
4. Chapter 4 — Conclusion & Future Outlook (Takeaway message, call to action)

Each chapter should have 2 to 4 distinct scenes with narration, visual prompts, and camera directions.
Return valid JSON.`;

    const response = await generateWithFallback(ai, {
      preferredModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '{}';
    return JSON.parse(text);
  }

  /**
   * Parses a raw script pasted by the user into discrete production scenes with visual prompts and camera directions.
   */
  async parseScriptToScenes(scriptText: string, style: string = 'Cinematic') {
    const ai = getGenAI();
    if (!ai) {
      throw new Error('GEMINI_API_KEY is not configured on the server.');
    }

    const prompt = `Analyze this video script and break it down into sequential, timed visual scenes suitable for video production:
Style: "${style}"
Script:
"""
${scriptText}
"""

Divide it logically into scenes of 3-7 seconds each.
For each scene provide:
- sceneNumber: integer 1..N
- duration: number (seconds)
- narration: the exact portion of script for this scene
- visualPrompt: high-detail cinematic prompt describing what is visible on screen
- cameraDirection: e.g. 'Slow Zoom', 'Pan Right', 'Dolly Shot', etc.
- style: visual style
- transition: e.g. 'cut', 'fade', 'dissolve'

Return valid JSON with an array named "scenes" and overall "title" and "estimatedTotalDuration".`;

    const response = await generateWithFallback(ai, {
      preferredModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '{}';
    return JSON.parse(text);
  }

  /**
   * In-Editor AI Assistant that understands the current project context and adjusts scenes or responds.
   */
  async chatAssistant(userPrompt: string, projectContext: any) {
    const ai = getGenAI();
    if (!ai) {
      throw new Error('GEMINI_API_KEY is not configured on the server.');
    }

    const systemInstruction = `You are the intelligent Video Editor AI Assistant inside ShortsAI Studio.
The user is working on an active video project.
Project Context:
- Title: ${projectContext?.title || 'Untitled Project'}
- Style: ${projectContext?.style || 'Cinematic'}
- Platform: ${projectContext?.platform || 'YouTube Shorts'}
- Aspect Ratio: ${projectContext?.aspectRatio || '9:16'}
- Total Scenes: ${projectContext?.scenes?.length || 0}
- Current Scenes Summary: ${JSON.stringify(
      (projectContext?.scenes || []).map((s: any) => ({
        num: s.sceneNumber,
        dur: s.duration,
        narration: s.narration,
        camera: s.cameraDirection,
      }))
    )}

If the user asks to modify the project (e.g., "make scene 2 more dramatic", "shorten video to 30 seconds", "translate voiceover into Hindi", "create viral captions"):
1. Explain clearly what you changed or recommend.
2. If applicable, output an action JSON block wrapped in \`\`\`json_action ... \`\`\` containing:
   - "action": e.g. "update_scenes" | "update_captions" | "update_title"
   - "data": the updated scenes array or captions info.
Be concise, proactive, friendly, and helpful.`;

    const response = await generateWithFallback(ai, {
      preferredModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-3.1-flash-lite',
      contents: userPrompt,
      config: {
        systemInstruction,
      },
    });

    return response.text || 'I have analyzed your request. How else can I assist with this video?';
  }

  /**
   * Generates multiple high-CTR YouTube/TikTok thumbnail concepts.
   */
  async generateThumbnailConcepts(params: {
    title: string;
    description?: string;
    style: string;
  }) {
    const ai = getGenAI();
    if (!ai) {
      throw new Error('GEMINI_API_KEY is not configured on the server.');
    }

    const prompt = `Generate 4 distinct high-converting, viral thumbnail visual concepts for:
Title: "${params.title}"
Description: "${params.description || ''}"
Style: "${params.style}"

For each concept, provide:
- conceptName: creative title
- visualPrompt: hyper-detailed prompt for AI image generation (composition, emotional facial expression, bold lighting, contrast, high dynamic range)
- boldTextOverlay: short 2-4 word high-CTR text overlay (e.g. "THEY LIED!", "DON'T MISS THIS", "10X RESULTS")
- colorPalette: vibrant contrast description
- emotionalHook: why this drives clicks

Return valid JSON with an array of "concepts".`;

    const response = await generateWithFallback(ai, {
      preferredModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '{}';
    return JSON.parse(text);
  }

  /**
   * Generates AI Speech using Gemini 3.1 Flash TTS preview if supported
   */
  async generateTTS(text: string, voiceName: string = 'Kore'): Promise<string | null> {
    const ai = getGenAI();
    if (!ai) return null;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName || 'Kore',
              },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      return base64Audio || null;
    } catch (err) {
      console.warn('Gemini TTS preview not available or paid key required, falling back to Web Audio synthesis:', err);
      return null;
    }
  }

  /**
   * Verifies the API key connection by making a lightweight test ping to Gemini 3.8 Flash with fallback.
   */
  async verifyConnection(): Promise<{ ok: boolean; model: string; latencyMs: number; message: string }> {
    const ai = getGenAI();
    if (!ai) {
      return {
        ok: false,
        model: 'gemini-3.8-flash',
        latencyMs: 0,
        message: 'No GEMINI_API_KEY is configured on the server.',
      };
    }

    const start = Date.now();
    try {
      const response = await generateWithFallback(ai, {
        preferredModel: 'gemini-3.8-flash',
        fallbackModel: 'gemini-3.1-flash-lite',
        contents: 'Test connection. Reply with "OK".',
      });
      const latencyMs = Date.now() - start;
      const text = response.text?.trim() || 'OK';
      return {
        ok: true,
        model: 'Gemini Engine (Active & Verified)',
        latencyMs,
        message: `API Key verified active (${latencyMs}ms): ${text.slice(0, 30)}`,
      };
    } catch (err: any) {
      return {
        ok: false,
        model: 'gemini-3.8-flash',
        latencyMs: Date.now() - start,
        message: err.message || 'API connection failed.',
      };
    }
  }
}

export const geminiService = new GeminiService();
