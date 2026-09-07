import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Download,
  Video,
  ArrowUpRight,
  Maximize2,
  CheckCircle2,
  Wand2,
} from 'lucide-react';
import type { AspectRatio } from '../../types.js';
import { Button } from '../ui/Button.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { api } from '../../lib/api.js';

interface ImageGeneratorViewProps {
  onUseInVideo?: (imageUrl: string) => void;
}

export const ImageGeneratorView: React.FC<ImageGeneratorViewProps> = ({
  onUseInVideo,
}) => {
  const [prompt, setPrompt] = useState('An hyper-detailed photorealistic portrait of an ancient samurai looking into neon rain in futuristic neo-Kyoto, 8k resolution, volumetric rim lighting, cinematic depth of field.');
  const [style, setStyle] = useState('Cinematic');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [resolution, setResolution] = useState('HD');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&auto=format&fit=crop&q=80'
  );

  const stylePresets = [
    'Realistic',
    'Cyberpunk',
    'Cinematic',
    'Anime',
    '3D Render',
    'Oil Painting',
    'Watercolor',
    'Pixel Art',
    'Vintage',
    'Comic Book',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await api.generateImage(prompt, style, aspectRatio);
      if (res.data?.imageUrl) {
        setGeneratedImageUrl(res.data.imageUrl);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpscale = () => {
    setIsUpscaling(true);
    setTimeout(() => {
      setIsUpscaling(false);
      alert('Asset upscaled to 4K Ultra-HD resolution with generative detail enhancement!');
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">
            <Palette className="w-4 h-4" />
            <span>AI Image Diffusion</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Visual & Asset Generator
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Generate cinematic 4K assets, character portraits, and scenic backdrops for your video timelines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Visual Prompt *</label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your subject, mood, environment, and camera..."
                className="w-full bg-[#0d0d14] border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500/50 resize-none leading-relaxed"
              />
            </div>

            {/* Style Presets Chips */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Style Preset</label>
              <div className="flex flex-wrap gap-1.5">
                {stylePresets.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStyle(s)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                      style === s
                        ? 'bg-rose-500 text-white border-rose-500 font-bold shadow-md shadow-rose-500/20'
                        : 'bg-[#14141e] text-zinc-400 border-white/10 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio & Resolution */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Aspect Ratio</label>
                <div className="grid grid-cols-4 gap-1">
                  {(['9:16', '16:9', '1:1', '4:5'] as AspectRatio[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAspectRatio(r)}
                      className={`py-1.5 rounded-lg text-xs font-medium border ${
                        aspectRatio === r
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500 font-bold'
                          : 'bg-[#14141e] text-zinc-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Quality / Resolution</label>
                <div className="grid grid-cols-3 gap-1">
                  {['Standard', 'HD', 'Ultra HD'].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setResolution(q)}
                      className={`py-1.5 rounded-lg text-[11px] font-medium border truncate px-1 ${
                        resolution === q
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500 font-bold'
                          : 'bg-[#14141e] text-zinc-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              size="lg"
              loading={isGenerating}
              onClick={handleGenerate}
              icon={<Sparkles className="w-4 h-4" />}
              className="w-full bg-gradient-to-r from-rose-600 to-orange-600 shadow-rose-500/20"
            >
              {isGenerating ? 'Synthesizing Image...' : 'Generate Image (10 Credits)'}
            </Button>
          </Card>
        </div>

        {/* Right Preview Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Asset Preview</span>
              <Badge variant="rose">{aspectRatio} • {resolution}</Badge>
            </div>

            {generatedImageUrl && (
              <div
                className={`relative rounded-xl overflow-hidden bg-black/60 border border-white/10 ${
                  aspectRatio === '9:16'
                    ? 'aspect-[9/16] max-h-[440px] mx-auto'
                    : aspectRatio === '1:1'
                    ? 'aspect-square'
                    : 'aspect-video'
                }`}
              >
                <img
                  src={generatedImageUrl}
                  alt="Generated"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {generatedImageUrl && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleUpscale}
                  loading={isUpscaling}
                  icon={<ArrowUpRight className="w-3.5 h-3.5" />}
                >
                  Upscale 4K
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => window.open(generatedImageUrl, '_blank')}
                  icon={<Download className="w-3.5 h-3.5" />}
                >
                  Download
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    if (onUseInVideo) onUseInVideo(generatedImageUrl);
                    alert('Asset added to timeline project!');
                  }}
                  icon={<Video className="w-3.5 h-3.5" />}
                >
                  Use in Video
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
