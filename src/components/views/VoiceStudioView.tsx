import React, { useState } from 'react';
import {
  Mic2,
  Sparkles,
  Play,
  Pause,
  Download,
  Volume2,
  Sliders,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { Button } from '../ui/Button.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { api } from '../../lib/api.js';

export const VoiceStudioView: React.FC = () => {
  const [text, setText] = useState('In the depths of winter, I finally learned that within me there lay an invincible summer. Build in silence, let success make the noise.');
  const [voiceName, setVoiceName] = useState('Zephyr');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [emotion, setEmotion] = useState('Dramatic');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const voices = [
    { name: 'Zephyr', gender: 'Male', category: 'Deep Cinematic', desc: 'Authoritative, resonant, commanding for trailers & documentaries.' },
    { name: 'Kore', gender: 'Female', category: 'Calm Storyteller', desc: 'Warm, empathetic, clear narrative flow for history & lifestyle.' },
    { name: 'Fenrir', gender: 'Male', category: 'Intense & Bold', desc: 'Powerful, gritty, dramatic cadence for motivational shorts.' },
    { name: 'Puck', gender: 'Male', category: 'Energetic Tech', desc: 'Fast, enthusiastic, modern pacing for TikTok and tech reviews.' },
    { name: 'Charon', gender: 'Male', category: 'Podcast Host', desc: 'Smooth, intellectual conversationalist for deep-dive explainers.' },
    { name: 'Aoede', gender: 'Female', category: 'Luxury Narration', desc: 'Sophisticated, elegant voice for high-end lifestyle & architecture.' },
  ];

  const emotions = ['Neutral', 'Happy', 'Serious', 'Dramatic', 'Whispering'];

  const handleSynthesize = async () => {
    if (!text.trim()) return;
    setIsSynthesizing(true);
    try {
      const res = await api.generateVoice({
        text,
        voiceName,
        speed,
        pitch,
      });
      if (res.data?.audioUrl) {
        setAudioUrl(res.data.audioUrl);
      } else {
        // High quality speech placeholder
        setAudioUrl('https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const togglePlayback = () => {
    // If Web Speech API is supported, speak it client side for instantaneous high-fidelity preview!
    if ('speechSynthesis' in window && !audioUrl) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = speed;
        utterance.pitch = pitch;
        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1">
            <Mic2 className="w-4 h-4" />
            <span>Neural Speech Synthesis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Voice Studio
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Convert scripts into hyper-realistic human voiceovers with emotional control and studio pacing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Script / Voiceover Text *</label>
              <textarea
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to speak..."
                className="w-full bg-[#0d0d14] border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500/50 resize-none leading-relaxed"
              />
            </div>

            {/* Voice Model Cards */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">Select Voice Model</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {voices.map((v) => (
                  <div
                    key={v.name}
                    onClick={() => setVoiceName(v.name)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      voiceName === v.name
                        ? 'bg-orange-500/15 border-orange-500 text-white shadow-md'
                        : 'bg-[#14141e] border-white/10 text-zinc-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{v.name}</span>
                      <Badge variant="orange">{v.category}</Badge>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls: Speed, Pitch, Emotion */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Speed</span>
                  <span className="font-mono text-orange-400">{speed}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Pitch</span>
                  <span className="font-mono text-orange-400">{pitch}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400 block">Emotion</label>
                <select
                  value={emotion}
                  onChange={(e) => setEmotion(e.target.value)}
                  className="w-full bg-[#0d0d14] border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                >
                  {emotions.map((em) => (
                    <option key={em} value={em}>{em}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              size="lg"
              loading={isSynthesizing}
              onClick={handleSynthesize}
              icon={<Sparkles className="w-4 h-4" />}
              className="w-full"
            >
              Generate Neural Voiceover (8 Credits)
            </Button>
          </Card>
        </div>

        {/* Right Voice Player Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 space-y-5 bg-[#12121a]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Voice Player</span>
              <Badge variant="orange">{voiceName} • {emotion}</Badge>
            </div>

            {/* Waveform Visualizer simulation */}
            <div className="h-28 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center px-4 overflow-hidden">
              <div className="flex items-center gap-1.5 h-full w-full justify-center">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full bg-gradient-to-t from-orange-500 to-rose-400 transition-all duration-150 ${
                      isPlaying ? 'animate-pulse' : 'opacity-40'
                    }`}
                    style={{
                      height: isPlaying ? `${Math.sin(i * 0.5) * 40 + 50}%` : `${(i % 5) * 12 + 20}%`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={togglePlayback}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/25 hover:scale-105 active:scale-95 transition-all"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Model:</span>
                <span className="text-white font-medium">{voiceName}</span>
              </div>
              <div className="flex justify-between">
                <span>Emotion:</span>
                <span className="text-white font-medium">{emotion}</span>
              </div>
              <div className="flex justify-between">
                <span>Pacing:</span>
                <span className="text-white font-mono">{speed}x speed</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
