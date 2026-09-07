import React, { useState } from 'react';
import {
  ImagePlay,
  Sparkles,
  Download,
  Smile,
  Type,
  Palette,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';
import type { AspectRatio } from '../../types.js';
import { Button } from '../ui/Button.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { api } from '../../lib/api.js';

export const ThumbnailGeneratorView: React.FC = () => {
  const [title, setTitle] = useState('DON\'T BUY THIS (Unless You Want To Go Broke)');
  const [style, setStyle] = useState('Clickbait Viral');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [faceEmotion, setFaceEmotion] = useState('Shocked');
  const [accentColor, setAccentColor] = useState('#ef4444');
  const [isGenerating, setIsGenerating] = useState(false);
  const [thumbnailResult, setThumbnailResult] = useState({
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
    boldText: 'DON\'T BUY THIS!',
    emotion: 'Shocked',
    accentColor: '#ef4444',
  });

  const styles = [
    'Clickbait Viral',
    'Minimalist',
    'High Contrast Neon',
    '3D Character',
    'Dramatic Cinematic',
  ];

  const emotions = ['Shocked', 'Happy', 'Angry', 'Curious', 'Serious'];

  const handleGenerate = async () => {
    if (!title.trim()) return;
    setIsGenerating(true);
    try {
      const res = await api.generateThumbnails(title, `Emotion: ${faceEmotion}`, style);
      if (res.data?.variations?.[0]) {
        const item = res.data.variations[0];
        setThumbnailResult({
          imageUrl: item.imageUrl,
          boldText: item.boldTextOverlay || title,
          emotion: faceEmotion,
          accentColor: accentColor,
        });
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">
            <ImagePlay className="w-4 h-4" />
            <span>Click-Through Rate Optimization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI YouTube & Shorts Thumbnail Studio
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Generate high-CTR thumbnail compositions with eye-tracking focal points, bold typography, and emotive expressions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Thumbnail Title / Big Text Overlay *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500/50 uppercase font-black tracking-wider"
              />
            </div>

            {/* Visual Style */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Visual Aesthetic Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500/50"
              >
                {styles.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Emotion & Aspect Ratio */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-rose-400" />
                  <span>Face Emotion</span>
                </label>
                <select
                  value={faceEmotion}
                  onChange={(e) => setFaceEmotion(e.target.value)}
                  className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500/50"
                >
                  {emotions.map((em) => (
                    <option key={em} value={em}>{em}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Format Ratio</label>
                <div className="grid grid-cols-2 gap-1">
                  {(['16:9', '9:16'] as AspectRatio[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAspectRatio(r)}
                      className={`py-2 rounded-lg text-xs font-bold border ${
                        aspectRatio === r
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'bg-[#14141e] text-zinc-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Color Accent Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-rose-400" />
                <span>Primary Accent & Shadow Glow</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-10 rounded-xl border border-white/10 bg-transparent cursor-pointer"
                />
                <span className="text-xs font-mono text-zinc-300 uppercase">{accentColor}</span>
              </div>
            </div>

            <Button
              size="lg"
              loading={isGenerating}
              onClick={handleGenerate}
              icon={<Sparkles className="w-4 h-4" />}
              className="w-full bg-gradient-to-r from-rose-600 to-orange-600 shadow-rose-500/20"
            >
              Generate Viral Thumbnail (10 Credits)
            </Button>
          </Card>
        </div>

        {/* Right Output Thumbnail Canvas (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Thumbnail Composition</span>
              <Badge variant="rose">{aspectRatio} • {style}</Badge>
            </div>

            {/* Realistic YouTube Thumbnail Canvas Preview */}
            <div
              className={`relative rounded-2xl overflow-hidden bg-black border border-white/10 flex items-center justify-center shadow-2xl ${
                aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[460px] mx-auto' : 'aspect-video'
              }`}
            >
              <img
                src={thumbnailResult.imageUrl}
                alt="Thumbnail"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              {/* Bold Clickbait Text Overlay */}
              <div className="absolute top-4 left-4 right-4 z-10">
                <div
                  className="inline-block p-2 px-3.5 rounded-xl uppercase font-black text-xl sm:text-2xl tracking-tighter leading-none text-white border-2 border-white/40 shadow-2xl"
                  style={{
                    backgroundColor: `${accentColor}ee`,
                    textShadow: '0 3px 6px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.8)',
                    transform: 'rotate(-2deg)',
                  }}
                >
                  {thumbnailResult.boldText}
                </div>
              </div>

              {/* Emotion Indicator Badge */}
              <div className="absolute bottom-3 left-3 z-10 px-2 py-1 rounded bg-black/80 backdrop-blur-md text-[11px] font-bold text-white uppercase border border-white/10">
                Expression: {faceEmotion}
              </div>
            </div>

            <Button
              size="md"
              variant="secondary"
              className="w-full"
              onClick={() => window.open(thumbnailResult.imageUrl, '_blank')}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Download Full-Resolution Thumbnail
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
