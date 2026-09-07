import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  ArrowRight,
  Zap,
  Play,
  CheckCircle2,
} from 'lucide-react';
import type { VideoTemplate } from '../../types.js';
import { Button } from '../ui/Button.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';

interface TemplatesViewProps {
  templates?: VideoTemplate[];
  onSelectTemplate: (template: VideoTemplate) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  templates = [],
  onSelectTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Viral Shorts',
    'Documentary',
    'Storytelling',
    'Motivation',
    'Tech Review',
    'Faceless Channel',
  ];

  const filtered = (templates || []).filter((t) => {
    if (selectedCategory === 'All') return true;
    return t.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Pre-Engineered Retention Blueprints</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Video Templates Library
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            One-click viral video recipes tuned for YouTube Shorts, faceless channels, and documentary explainers.
          </p>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-[#14141e] text-zinc-400 border-white/10 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((tpl) => (
          <Card
            key={tpl.id}
            hoverable
            onClick={() => onSelectTemplate(tpl)}
            className="overflow-hidden group cursor-pointer flex flex-col justify-between"
          >
            <div className="relative aspect-video bg-black/60 overflow-hidden">
              <img
                src={tpl.thumbnailUrl}
                alt={tpl.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#14141d] via-transparent to-transparent" />
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <Badge variant="orange">{tpl.category}</Badge>
                <Badge variant="zinc">{tpl.aspectRatio}</Badge>
              </div>
              <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[11px] font-mono font-semibold text-white">
                {tpl.duration}s
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors">
                  {tpl.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {tpl.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-xs text-zinc-500">{tpl.scenesCount} Scenes Breakdown</span>
                <span className="text-xs font-bold text-orange-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Use Template</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
