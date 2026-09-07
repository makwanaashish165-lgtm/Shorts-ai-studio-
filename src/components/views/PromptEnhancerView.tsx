import React, { useState } from 'react';
import {
  Wand2,
  Sparkles,
  Copy,
  Check,
  Camera,
  Sun,
  Layers,
  Palette,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../ui/Button.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { api } from '../../lib/api.js';
import type { EnhancedPromptResult } from '../../types.js';

export const PromptEnhancerView: React.FC = () => {
  const [inputPrompt, setInputPrompt] = useState('a cybernetic samurai in rain');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState<EnhancedPromptResult | null>({
    original: 'a cybernetic samurai in rain',
    enhanced: 'Extreme wide cinematic tracking shot of an ancient cybernetic samurai standing stoically on a neo-Tokyo rooftop in torrential rain, neon reflections splashing across obsidian carbon-fiber armor, warm amber rim lighting, 35mm anamorphic lens, shallow depth of field, atmospheric steam rising, 8k photo realism.',
    subject: 'Ancient cybernetic samurai in battle-scarred carbon-fiber armor',
    environment: 'Neo-Tokyo skyscraper rooftop during torrential rain',
    lighting: 'High-contrast volumetric neon rim lighting and ambient amber reflections',
    camera: 'Low-angle tracking shot with gentle parallax drift',
    lens: '35mm anamorphic lens, f/1.4 aperture, oval bokeh',
    composition: 'Rule of thirds, strong vertical silhouettes',
    motion: 'Raindrops splashing on metal armor with slow-motion fluid physics',
    atmosphere: 'Dense atmospheric haze, cold steam, electric storm clouds',
    color: 'Teal and amber complementary palette with deep obsidian shadows',
    details: 'Intricate circuit seams, weathered battle dents, moisture beads',
    style: 'Cinematic neo-noir sci-fi photorealism',
  });
  const [copied, setCopied] = useState(false);

  const handleEnhance = async () => {
    if (!inputPrompt.trim()) return;
    setIsEnhancing(true);
    try {
      const res = await api.enhancePrompt(inputPrompt);
      if (res.data) {
        setEnhancedResult(res.data);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleCopy = () => {
    if (enhancedResult?.enhanced) {
      navigator.clipboard.writeText(enhancedResult.enhanced);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1">
            <Wand2 className="w-4 h-4" />
            <span>Cinematography Parameter Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Prompt Enhancer
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Expand basic prompts into Hollywood-grade visual instructions with lighting, lens, and camera parameters.
          </p>
        </div>
      </div>

      {/* Input Card */}
      <Card className="p-5 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-300">Basic Prompt</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="e.g. a lonely robot on mars"
              className="flex-1 bg-[#0d0d14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50"
            />
            <Button
              size="md"
              loading={isEnhancing}
              onClick={handleEnhance}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Enhance
            </Button>
          </div>
        </div>
      </Card>

      {/* Breakdown Parameters Grid */}
      {enhancedResult && (
        <div className="space-y-4 animate-in fade-in">
          {/* Master Enhanced Output */}
          <Card className="p-5 space-y-3 border-orange-500/30 bg-[#141420]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                Full Cinematic Master Prompt
              </span>
              <button
                onClick={handleCopy}
                className="text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Prompt'}</span>
              </button>
            </div>
            <p className="text-sm sm:text-base text-zinc-100 font-medium leading-relaxed bg-[#0a0a10] p-4 rounded-xl border border-white/10">
              "{enhancedResult.enhanced}"
            </p>
          </Card>

          {/* Granular Cinematic Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {[
              { label: 'Subject', value: enhancedResult.subject, icon: Eye },
              { label: 'Environment', value: enhancedResult.environment, icon: Layers },
              { label: 'Lighting', value: enhancedResult.lighting, icon: Sun },
              { label: 'Camera', value: enhancedResult.camera, icon: Camera },
              { label: 'Lens & Optics', value: enhancedResult.lens, icon: Camera },
              { label: 'Composition', value: enhancedResult.composition, icon: Layers },
              { label: 'Atmosphere', value: enhancedResult.atmosphere, icon: Sun },
              { label: 'Color Grade', value: enhancedResult.color, icon: Palette },
              { label: 'Details', value: enhancedResult.details, icon: Sparkles },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card key={idx} className="p-3.5 space-y-1 bg-[#12121b]">
                  <div className="flex items-center gap-1.5 text-orange-400 font-semibold text-[11px] uppercase tracking-wider">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </div>
                  <p className="text-zinc-300 text-xs leading-relaxed">{item.value || 'N/A'}</p>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
