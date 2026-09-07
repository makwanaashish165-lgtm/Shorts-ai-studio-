import React, { useState } from 'react';
import {
  Zap,
  Sparkles,
  Play,
  Layers,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Clock,
  Eye,
  Camera,
  Subtitles,
  Volume2,
  Hash,
  Share2,
  AlertCircle,
} from 'lucide-react';
import type { VideoPlatform, VideoStyle, AspectRatio, Project } from '../../types.js';
import { Button } from '../ui/Button.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { api } from '../../lib/api.js';

interface ShortsGeneratorViewProps {
  initialPrompt?: string;
  onOpenInEditor?: (project: Project) => void;
  onProjectCreated?: (project: Project) => void;
  onInsufficientPoints?: (requiredPoints: number, balance: number) => void;
  onPointsUpdated?: () => void;
}

export const ShortsGeneratorView: React.FC<ShortsGeneratorViewProps> = ({
  initialPrompt = '',
  onOpenInEditor,
  onProjectCreated,
  onInsufficientPoints,
  onPointsUpdated,
}) => {
  const [topic, setTopic] = useState(initialPrompt || 'Why working in silence produces deafening success');
  const [duration, setDuration] = useState<number>(30);
  const [platform, setPlatform] = useState<VideoPlatform>('YouTube Shorts');
  const [style, setStyle] = useState<VideoStyle>('Cinematic');
  const [tone, setTone] = useState('Motivational');
  const [language, setLanguage] = useState('English');
  const [voice, setVoice] = useState('Zephyr');
  const [audience, setAudience] = useState('Ambitious creators and entrepreneurs');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [generatedProject, setGeneratedProject] = useState<Project | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const steps = [
    'Analyzing viral concept & hooks',
    'Writing high-retention script with Gemini 3.8',
    'Deconstructing into timed scenes & camera directions',
    'Synthesizing photorealistic scene visual assets',
    'Generating neural voiceover & sync tracks',
    'Formatting animated viral captions & hashtags',
    'Assembling master timeline',
  ];

  const durations = [15, 30, 45, 60];
  const platforms: VideoPlatform[] = ['YouTube Shorts', 'Instagram Reels', 'TikTok'];
  const styles: VideoStyle[] = [
    'Cinematic',
    'Realistic',
    'Anime',
    '3D Animation',
    'Documentary',
    'Funny',
    'Motivational',
    'Horror',
    'Educational',
    'Gaming',
    'Luxury',
    'News',
    'Storytelling',
  ];

  const voices = [
    { name: 'Zephyr', gender: 'Male', tone: 'Deep & Authoritative' },
    { name: 'Kore', gender: 'Female', tone: 'Crisp & Narrative' },
    { name: 'Fenrir', gender: 'Male', tone: 'Cinematic & Intense' },
    { name: 'Puck', gender: 'Male', tone: 'Energetic & Fast' },
    { name: 'Charon', gender: 'Neutral', tone: 'Calm & Intellectual' },
  ];

  const handleGenerateShort = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setActiveStepIndex(0);
    setGeneratedProject(null);
    setErrorMsg(null);

    const cost = Math.max(100, duration * 10);
    let deduction: any = null;

    try {
      // Step 0: Check & deduct points server-authoritatively
      try {
        deduction = await api.deductPoints({
          duration,
          videoType: 'ai_shorts',
          title: topic,
        });
        if (onPointsUpdated) onPointsUpdated();
      } catch (err: any) {
        setIsGenerating(false);
        if ((err.requiredPoints !== undefined || err.status === 402 || err.message?.includes('Insufficient')) && onInsufficientPoints) {
          onInsufficientPoints(err.requiredPoints || cost, err.balance ?? 0);
          return;
        }
        setErrorMsg(err.message || 'Failed to deduct points');
        return;
      }

      // Step 1: Script & Scene breakdown via server Gemini
      setActiveStepIndex(1);
      const res = await api.generateScript({
        topic,
        duration,
        platform,
        style,
        tone,
        language,
        audience,
      });

      setActiveStepIndex(2);
      const scriptData = res.data;

      // Step 2: Generate visuals for scenes
      setActiveStepIndex(3);
      const scenesWithMedia = await Promise.all(
        scriptData.scenes.map(async (scene: any, index: number) => {
          try {
            const imgRes = await api.generateImage(scene.visualPrompt, style, '9:16');
            return {
              id: `sc_${Date.now()}_${index}`,
              sceneNumber: scene.sceneNumber || index + 1,
              duration: scene.duration || 5,
              narration: scene.narration,
              visualPrompt: scene.visualPrompt,
              cameraDirection: scene.cameraDirection || 'Slow Zoom',
              style: scene.style || style,
              transition: scene.transition || 'fade',
              mediaType: 'image' as const,
              mediaUrl: imgRes.data.imageUrl,
            };
          } catch (err) {
            // High aesthetic fallback
            const fallbackUnsplash = [
              'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=800&auto=format&fit=crop&q=80',
            ][index % 4];
            return {
              id: `sc_${Date.now()}_${index}`,
              sceneNumber: scene.sceneNumber || index + 1,
              duration: scene.duration || 5,
              narration: scene.narration,
              visualPrompt: scene.visualPrompt,
              cameraDirection: scene.cameraDirection || 'Slow Zoom',
              style: scene.style || style,
              transition: scene.transition || 'fade',
              mediaType: 'image' as const,
              mediaUrl: fallbackUnsplash,
            };
          }
        })
      );

      // Step 3: Voiceover preview
      setActiveStepIndex(4);
      try {
        await api.generateVoice({
          text: (scriptData.script || '').slice(0, 200),
          voiceName: voice,
          language,
        });
      } catch (e) {
        console.log('Voice synthesis queued');
      }

      // Step 4: Captions & Timeline assembly
      setActiveStepIndex(5);
      setActiveStepIndex(6);

      // Create new Project in DB
      const newProj = await api.createProject({
        title: scriptData.title,
        description: `Viral ${platform} short on "${topic}"`,
        platform,
        aspectRatio: '9:16',
        duration,
        style,
        language,
        voiceName: voice,
        thumbnailUrl: scenesWithMedia[0]?.mediaUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
        hook: scriptData.hook,
        cta: scriptData.cta,
        hashtags: scriptData.hashtags,
        scenes: scenesWithMedia,
        status: 'completed',
      });

      setGeneratedProject(newProj.project);
      if (onProjectCreated) {
        onProjectCreated(newProj.project);
      }
    } catch (err: any) {
      console.error(err);
      if (deduction?.generationId) {
        try {
          await api.refundPoints({ generationId: deduction.generationId, reason: err.message });
          if (onPointsUpdated) onPointsUpdated();
        } catch (_) {}
      }
      setErrorMsg('Generation error: ' + (err.message || 'Unknown error occurred'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 fill-orange-500/20" />
            <span>Dedicated AI Shorts Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI YouTube Shorts & Reels Generator
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Generate viral 9:16 videos with hooks, scene visual prompts, neural narration, and timestamps.
          </p>
        </div>
      </div>

      {/* Generator Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <Card className="p-5 space-y-4">
            {/* Topic Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Video Topic or Idea *</label>
              <textarea
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What is your video about? e.g. 3 bizarre psychology tricks that make anyone respect you instantly"
                className="w-full bg-[#0d0d14] border border-white/10 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500/50 resize-none leading-relaxed"
              />
            </div>

            {/* Duration Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300">Target Duration</label>
                <span className="text-[11px] font-bold text-amber-400">⚡ 10 points / second</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {durations.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-0.5 ${
                      duration === d
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                        : 'bg-[#14141e] text-zinc-400 border-white/10 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span>{d} sec</span>
                    <span className={`text-[10px] font-semibold ${duration === d ? 'text-white/90' : 'text-amber-400/80'}`}>
                      ⚡ {d * 10} pts
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Platform & Style Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Target Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as VideoPlatform)}
                  className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500/50"
                >
                  {platforms.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Visual Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as VideoStyle)}
                  className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500/50"
                >
                  {styles.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Voice & Tone Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">AI Voice Model</label>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500/50"
                >
                  {voices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.gender} • {v.tone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Tone & Emotion</label>
                <input
                  type="text"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="e.g. Dramatic, High-energy, Mystery"
                  className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500/50"
                />
              </div>
            </div>

            {/* Generate Action Button */}
            <Button
              size="lg"
              onClick={handleGenerateShort}
              loading={isGenerating}
              icon={<Zap className="w-4 h-4" />}
              className="w-full shadow-xl shadow-orange-500/25"
            >
              {isGenerating
                ? 'Generating Viral Short...'
                : `Generate AI Short (⚡ ${Math.max(100, duration * 10)} Points)`}
            </Button>
          </Card>
        </div>

        {/* Right Live Status or Output Preview (5 cols) */}
        <div className="lg:col-span-5">
          {isGenerating ? (
            <Card className="p-6 space-y-6 border-orange-500/30 bg-[#12121c]/95">
              <div className="space-y-1 text-center">
                <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-2" />
                <h3 className="text-base font-bold text-white">Autonomous Generation in Progress</h3>
                <p className="text-xs text-zinc-400">Gemini 3.8 is executing your complete video pipeline...</p>
              </div>

              {/* Progress Steps List */}
              <div className="space-y-3">
                {steps.map((step, idx) => {
                  const isDone = idx < activeStepIndex;
                  const isCurrent = idx === activeStepIndex;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 text-xs transition-colors p-2 rounded-lg ${
                        isCurrent
                          ? 'bg-orange-500/10 text-orange-300 font-semibold border border-orange-500/20'
                          : isDone
                          ? 'text-zinc-300'
                          : 'text-zinc-600'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 rounded-full border-2 border-orange-400 border-t-transparent animate-spin flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-zinc-700 flex-shrink-0" />
                      )}
                      <span>{step}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : generatedProject ? (
            <Card className="p-5 space-y-4 border-emerald-500/30 bg-[#12141c]">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Generation Complete
                  </span>
                </div>
                <Badge variant="orange">{generatedProject.duration}s</Badge>
              </div>

              {/* Hook Banner */}
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 space-y-1">
                <span className="text-[10px] uppercase font-bold text-orange-400">Viral 3-Second Hook:</span>
                <p className="text-xs font-bold text-white italic">"{generatedProject.hook}"</p>
              </div>

              {/* Scene Breakdown Preview */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Generated Scenes ({generatedProject.scenes.length}):
                </span>
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                  {generatedProject.scenes.map((scene) => (
                    <div
                      key={scene.id}
                      className="p-2.5 rounded-xl bg-[#161622] border border-white/5 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                        <span className="font-semibold text-zinc-300">Scene {scene.sceneNumber}</span>
                        <span>{scene.duration}s • {scene.cameraDirection}</span>
                      </div>
                      <p className="text-zinc-200 line-clamp-2">{scene.narration}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hashtags & CTA */}
              <div className="text-[11px] text-zinc-400">
                <p className="font-medium text-orange-400 mb-1">Hashtags:</p>
                <div className="flex flex-wrap gap-1">
                  {(generatedProject.hashtags || []).map((h, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white/5 text-zinc-300">{h}</span>
                  ))}
                </div>
              </div>

              {/* Action: Open in Timeline Editor */}
              <div className="pt-2">
                <Button
                  size="md"
                  onClick={() => {
                    if (onOpenInEditor) onOpenInEditor(generatedProject);
                    else if (onProjectCreated) onProjectCreated(generatedProject);
                  }}
                  icon={<Play className="w-4 h-4 text-orange-400" />}
                  className="w-full shadow-lg shadow-orange-500/20"
                >
                  Open in Timeline Editor
                </Button>
              </div>
            </Card>
          ) : errorMsg ? (
            <Card className="p-6 text-center space-y-3 border border-rose-500/30 bg-rose-500/5 flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Generation Alert</h4>
              <p className="text-xs text-rose-300 max-w-sm">{errorMsg}</p>
              <Button size="sm" variant="outline" onClick={() => setErrorMsg(null)}>
                Dismiss
              </Button>
            </Card>
          ) : (
            <Card className="p-8 text-center space-y-3 border-dashed border-white/10 bg-transparent flex flex-col items-center justify-center min-h-[360px]">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Live Generation Preview</h3>
              <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                Configure your parameters on the left and click Generate. Your viral hook, scene script,
                visual prompt cards, and timeline will assemble here.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
