import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Play,
  Clock,
  Camera,
  Layers,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import type { Scene, Project } from '../../types.js';
import { Button } from '../ui/Button.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { api } from '../../lib/api.js';

interface ScriptToVideoViewProps {
  onOpenInEditor?: (project: Project) => void;
  onProjectCreated?: (project: Project) => void;
}

export const ScriptToVideoView: React.FC<ScriptToVideoViewProps> = ({
  onOpenInEditor,
  onProjectCreated,
}) => {
  const [scriptText, setScriptText] = useState(
    `Every morning at 4:30 AM, while the entire city sleeps in absolute darkness, a small group of people are already rewriting their destinies.
They don't have superior genetics. They don't have miraculous luck. What they possess is an unbreakable routine forged through iron discipline.
Notice how the distractions of the modern world disappear when you master the first hour of daylight.
If you want results the 99% will never achieve, you must be willing to endure the habits the 99% will never start.`
  );
  const [style, setStyle] = useState('Cinematic');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedScenes, setParsedScenes] = useState<Scene[]>([]);

  const handleParseScript = async () => {
    if (!scriptText.trim()) return;
    setIsParsing(true);
    try {
      const res = await api.parseScriptToScenes(scriptText, style);
      if (res.data?.scenes) {
        setParsedScenes(
          res.data.scenes.map((s: any, idx: number) => ({
            id: `sc_p_${idx}`,
            sceneNumber: s.sceneNumber || idx + 1,
            duration: s.duration || 5,
            narration: s.narration,
            visualPrompt: s.visualPrompt,
            cameraDirection: s.cameraDirection || 'Slow Zoom',
            style: style,
            transition: 'fade' as const,
            mediaType: 'image' as const,
            mediaUrl: [
              'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=800&auto=format&fit=crop&q=80',
            ][idx % 4],
          }))
        );
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (parsedScenes.length === 0) return;
    const totalDuration = parsedScenes.reduce((acc, curr) => acc + curr.duration, 0);

    const newProject = await api.createProject({
      title: 'Script to Video Project',
      description: (scriptText || '').slice(0, 100) + '...',
      platform: 'YouTube Shorts',
      aspectRatio: '9:16',
      duration: totalDuration,
      style,
      scenes: parsedScenes,
      thumbnailUrl: parsedScenes[0]?.mediaUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
      status: 'completed',
    });

    if (onProjectCreated) {
      onProjectCreated(newProject.project);
    }
    if (onOpenInEditor) {
      onOpenInEditor(newProject.project);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Automated Timeline Deconstruction</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Script to Video Studio
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Paste any script, voiceover transcript, or article. AI extracts timing, camera directions, and visual prompts.
          </p>
        </div>
      </div>

      {/* Script Input Card */}
      <Card className="p-5 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-300">Paste Full Script *</label>
          <textarea
            rows={5}
            value={scriptText}
            onChange={(e) => setScriptText(e.target.value)}
            placeholder="Paste your narration or video script here..."
            className="w-full bg-[#0d0d14] border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/50 resize-none leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Style:</span>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="bg-[#0d0d14] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
            >
              <option value="Cinematic">Cinematic</option>
              <option value="Realistic">Realistic</option>
              <option value="Anime">Anime</option>
              <option value="Documentary">Documentary</option>
            </select>
          </div>

          <Button
            size="md"
            loading={isParsing}
            onClick={handleParseScript}
            icon={<Sparkles className="w-4 h-4" />}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 shadow-cyan-500/20"
          >
            {isParsing ? 'Deconstructing into Scenes...' : 'Split Script into Scenes (10 Credits)'}
          </Button>
        </div>
      </Card>

      {/* Parsed Scene Cards */}
      {parsedScenes.length > 0 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Deconstructed Scene Breakdown ({parsedScenes.length} Scenes)
              </h3>
              <p className="text-xs text-zinc-400">
                Total runtime: {parsedScenes.reduce((a, b) => a + b.duration, 0)} seconds
              </p>
            </div>

            <Button
              size="md"
              onClick={handleGenerateVideo}
              icon={<Play className="w-4 h-4 text-orange-400" />}
            >
              Generate Video from Script
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parsedScenes.map((scene, idx) => (
              <Card key={scene.id} className="p-4 space-y-3 border-white/10">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-bold text-cyan-400">Scene {scene.sceneNumber}</span>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {scene.duration}s
                    </span>
                    <span className="flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5" />
                      {scene.cameraDirection}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-zinc-500 font-semibold block text-[11px]">Narration:</span>
                    <p className="text-zinc-200 leading-relaxed font-medium">"{scene.narration}"</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-orange-400 font-semibold block text-[10px] uppercase">Visual Prompt:</span>
                    <p className="text-zinc-400 text-[11px] leading-relaxed mt-0.5">{scene.visualPrompt}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
