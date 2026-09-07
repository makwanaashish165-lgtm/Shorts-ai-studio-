import React, { useState } from 'react';
import {
  PenTool,
  Sparkles,
  Zap,
  RotateCcw,
  Maximize,
  Minimize,
  Languages,
  Copy,
  Check,
  Flame,
} from 'lucide-react';
import { Button } from '../ui/Button.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { api } from '../../lib/api.js';

export const ScriptWriterView: React.FC = () => {
  const [format, setFormat] = useState('YouTube Shorts');
  const [style, setStyle] = useState('High Retention Hook');
  const [topic, setTopic] = useState('The psychology of why people buy things they do not need');
  const [audience, setAudience] = useState('Gen Z and young professionals');
  const [outputScript, setOutputScript] = useState(
    `[HOOK (0-3s)]: Stop scrolling. The reason you have $14 in your bank account right now is because of a single optical trick invented in 1953.
[SCENE 1 (3-10s)]: When you walk into a store, the entrance is purposely packed with calming floral scents and low tempo music to drop your heart rate by 8%.
[SCENE 2 (10-20s)]: Retailers call this the "Gruen Transfer" — it disconnects your rational prefrontal cortex and activates emotional impulse buying.
[SCENE 3 (20-28s)]: Notice why milk and eggs are always in the farthest back corner? So you walk past 400 high-margin temptations.
[CTA (28-30s)]: Share this with someone who needs to save money, and follow for more consumer secrets.`
  );
  const [isWorking, setIsWorking] = useState(false);
  const [copied, setCopied] = useState(false);

  const formats = [
    'YouTube Shorts',
    'TikTok',
    'Reels',
    'YouTube Long Video',
    'Video Ad',
    'Explainer Video',
  ];

  const styles = [
    'High Retention Hook',
    'Storytelling',
    'Curiosity Gap',
    'Controversial Opening',
    'Fast-Paced',
    'Emotional',
  ];

  const handleGenerateScript = async () => {
    if (!topic.trim()) return;
    setIsWorking(true);
    try {
      const res = await api.generateScript({
        topic,
        platform: format,
        style,
        audience,
        duration: format === 'YouTube Long Video' ? 180 : 30,
      });
      if (res.data?.script) {
        setOutputScript(res.data.script);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsWorking(false);
    }
  };

  const handleImproveHook = async () => {
    setIsWorking(true);
    try {
      const res = await api.enhancePrompt(`Rewrite the hook of this script to be 10x more viral, unexpected, and click-worthy with a strong curiosity gap: ${(outputScript || '').slice(0, 150)}`);
      if (res.data?.enhanced) {
        setOutputScript((prev) => `[VIRAL HOOK]: ${res.data.enhanced}\n\n` + prev);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsWorking(false);
    }
  };

  const handleMakeShorter = () => {
    const lines = (outputScript || '').split('\n').filter(Boolean);
    if (lines.length > 2) {
      setOutputScript(lines.slice(0, Math.ceil(lines.length * 0.7)).join('\n\n'));
    }
  };

  const handleMakeLonger = async () => {
    setIsWorking(true);
    try {
      const res = await api.generateScript({
        topic: `${topic} (Expand in deeper detail with 2 extra concrete examples and evidence)`,
        platform: format,
        style,
        duration: 60,
      });
      if (res.data?.script) {
        setOutputScript(res.data.script);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsWorking(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <PenTool className="w-4 h-4" />
            <span>Viral Scriptwriting Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Script Writer
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Engineered for maximum watch time, retention spikes, and viral curiosity hooks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
              >
                {formats.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Hook Psychology</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
              >
                {styles.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Core Topic or Angle *</label>
              <textarea
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What is your video message?"
                className="w-full bg-[#0d0d14] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500/50 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Target Audience</label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <Button
              size="lg"
              loading={isWorking}
              onClick={handleGenerateScript}
              icon={<Sparkles className="w-4 h-4" />}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/20"
            >
              Write Complete Script
            </Button>
          </Card>
        </div>

        {/* Right Output & Transformation Bar (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Script Output
              </span>
              <button
                onClick={handleCopy}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 p-1 px-2 rounded-lg bg-white/5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Script'}</span>
              </button>
            </div>

            <textarea
              rows={12}
              value={outputScript}
              onChange={(e) => setOutputScript(e.target.value)}
              className="w-full bg-[#0d0d14] border border-white/10 rounded-xl p-3.5 text-xs sm:text-sm text-zinc-200 font-mono focus:outline-none focus:border-amber-500/50 resize-none leading-relaxed"
            />

            {/* AI Script Tuning Tools Bar */}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                onClick={handleImproveHook}
                loading={isWorking}
                icon={<Flame className="w-3.5 h-3.5 text-orange-400" />}
              >
                Improve Hook
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleMakeLonger}
                loading={isWorking}
                icon={<Maximize className="w-3.5 h-3.5 text-blue-400" />}
              >
                Make Longer
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleMakeShorter}
                icon={<Minimize className="w-3.5 h-3.5 text-amber-400" />}
              >
                Make Shorter
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerateScript}
                loading={isWorking}
                icon={<RotateCcw className="w-3.5 h-3.5 text-purple-400" />}
              >
                Rewrite
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
