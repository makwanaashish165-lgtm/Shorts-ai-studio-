import React, { useState, useEffect } from 'react';
import {
  Subtitles,
  Sparkles,
  Play,
  Pause,
  Sliders,
  Type,
  AlignLeft,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../ui/Button.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { api } from '../../lib/api.js';

export const CaptionsStudioView: React.FC = () => {
  const [scriptText, setScriptText] = useState('THE SECRET TO WINNING IS DOING WHAT 99% QUIT DOING AFTER 3 DAYS.');
  const [preset, setPreset] = useState('Viral Shorts');
  const [fontSize, setFontSize] = useState(28);
  const [primaryColor, setPrimaryColor] = useState('#ffffff');
  const [highlightColor, setHighlightColor] = useState('#f59e0b');
  const [position, setPosition] = useState<'top' | 'middle' | 'bottom'>('middle');
  const [allCaps, setAllCaps] = useState(true);
  const [animation, setAnimation] = useState('Pop');

  // Preview playback simulation
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const words = scriptText.split(/\s+/).filter(Boolean);

  const presets = [
    { name: 'Viral Shorts', desc: 'Big bold font, neon yellow highlight, word-by-word punch' },
    { name: 'Alex Hormozi', desc: 'High impact uppercase, green/yellow pop, thick black stroke' },
    { name: 'Minimal Modern', desc: 'Clean sans-serif, soft background pill, minimal motion' },
    { name: 'Cinematic Subtitle', desc: 'Classic cinematic letterboxed subtitle at bottom' },
    { name: 'Karaoke Highlight', desc: 'Color fills sequentially as words are spoken' },
  ];

  useEffect(() => {
    let timer: any;
    if (isPlaying && words.length > 0) {
      timer = setInterval(() => {
        setActiveWordIndex((prev) => (prev + 1) % words.length);
      }, 350);
    }
    return () => clearInterval(timer);
  }, [isPlaying, words.length]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-1">
            <Subtitles className="w-4 h-4" />
            <span>Kinetic Typography Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Captions & Kinetic Subtitles
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Render viral word-by-word animated captions calibrated for 80%+ TikTok and Shorts retention.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Script Text</label>
              <textarea
                rows={3}
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                className="w-full bg-[#0d0d14] border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-500/50 resize-none"
              />
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">Caption Style Presets</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {presets.map((p) => (
                  <div
                    key={p.name}
                    onClick={() => {
                      setPreset(p.name);
                      if (p.name === 'Alex Hormozi') {
                        setHighlightColor('#22c55e');
                        setAllCaps(true);
                      } else if (p.name === 'Viral Shorts') {
                        setHighlightColor('#f59e0b');
                        setAllCaps(true);
                      } else if (p.name === 'Minimal Modern') {
                        setHighlightColor('#38bdf8');
                        setAllCaps(false);
                      }
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      preset === p.name
                        ? 'bg-yellow-500/15 border-yellow-500 text-white'
                        : 'bg-[#14141e] border-white/10 text-zinc-300 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">{p.name}</span>
                    <p className="text-[11px] text-zinc-400 mt-1">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography & Position Controls */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Position</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['top', 'middle', 'bottom'] as const).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setPosition(pos)}
                      className={`py-1 rounded text-xs capitalize border ${
                        position === pos
                          ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500 font-bold'
                          : 'bg-[#14141e] text-zinc-400 border-white/10'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Highlight Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={highlightColor}
                    onChange={(e) => setHighlightColor(e.target.value)}
                    className="w-8 h-8 rounded border border-white/10 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono text-zinc-300">{highlightColor}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Animation</label>
                <select
                  value={animation}
                  onChange={(e) => setAnimation(e.target.value)}
                  className="w-full bg-[#0d0d14] border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                >
                  <option value="Pop">Pop</option>
                  <option value="Bounce">Bounce</option>
                  <option value="Fade">Fade</option>
                  <option value="Slide">Slide Up</option>
                </select>
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => alert('Caption preset applied to current timeline project!')}
              icon={<Sparkles className="w-4 h-4" />}
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 shadow-yellow-500/20 text-black font-bold"
            >
              Apply Kinetic Captions to Video
            </Button>
          </Card>
        </div>

        {/* Right Live Canvas Player (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Live Preview</span>
              <Badge variant="orange">{preset}</Badge>
            </div>

            {/* 9:16 Shorts Canvas Mockup with Live Kinetic Captions */}
            <div className="relative aspect-[9/16] max-h-[460px] mx-auto rounded-2xl overflow-hidden bg-black/90 border border-white/10 flex flex-col justify-between p-6 select-none shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80"
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

              <div className="relative z-10 flex justify-between items-center text-xs text-white/70">
                <span>9:16 Vertical</span>
                <span>00:04</span>
              </div>

              {/* Dynamic Animated Captions Center / Position */}
              <div
                className={`relative z-10 text-center px-4 transition-all duration-200 ${
                  position === 'top'
                    ? 'mb-auto mt-12'
                    : position === 'bottom'
                    ? 'mt-auto mb-12'
                    : 'my-auto'
                }`}
              >
                <div className="inline-flex flex-wrap justify-center gap-1.5 p-3 rounded-xl backdrop-blur-md bg-black/40 border border-white/10 shadow-2xl">
                  {words.map((word, idx) => {
                    const isHighlighted = idx === activeWordIndex;
                    return (
                      <span
                        key={idx}
                        className={`text-base sm:text-lg font-black tracking-wide transition-all duration-150 ${
                          allCaps ? 'uppercase' : ''
                        } ${
                          isHighlighted
                            ? 'scale-110 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]'
                            : 'opacity-80'
                        }`}
                        style={{
                          color: isHighlighted ? highlightColor : primaryColor,
                          textShadow: isHighlighted ? `0 0 16px ${highlightColor}66, 2px 2px 0px #000` : '2px 2px 0px #000',
                        }}
                      >
                        {word}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Play / Pause toggle */}
              <div className="relative z-10 flex justify-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
