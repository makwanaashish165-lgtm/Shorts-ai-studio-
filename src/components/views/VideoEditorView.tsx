import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Download,
  Scissors,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Type,
  Subtitles,
  Music,
  Sliders,
  Send,
  Loader2,
  Check,
  ArrowLeft,
  Film,
  Volume2,
  Plus,
} from 'lucide-react';
import type { Project, Scene, AspectRatio } from '../../types.js';
import { Button } from '../ui/Button.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Modal } from '../ui/Modal.js';
import { api } from '../../lib/api.js';

interface VideoEditorViewProps {
  project: Project;
  onBack: () => void;
  onUpdateProject: (updated: Project) => void;
}

export const VideoEditorView: React.FC<VideoEditorViewProps> = ({
  project: initialProject,
  onBack,
  onUpdateProject,
}) => {
  const [project, setProject] = useState<Project>(initialProject);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // in seconds
  const [activeTab, setActiveTab] = useState<'media' | 'text' | 'captions' | 'audio' | 'ai'>('ai');

  // Properties panel state for active scene
  const [sceneFilter, setSceneFilter] = useState<'None' | 'Cinematic' | 'Noir' | 'Vintage' | 'Cyberpunk' | 'Warm'>('Cinematic');
  const [sceneVolume, setSceneVolume] = useState(100);
  const [sceneSpeed, setSceneSpeed] = useState(1.0);

  // In-Editor AI Assistant
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    {
      sender: 'assistant',
      text: `Hello! I am your in-editor Gemini Director. You can instruct me to modify this video, for example:\n• "Make scene 2 more dramatic"\n• "Shorten the video by 5 seconds"\n• "Change caption style to Hormozi"`,
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // Export / Render modal
  const [showExportModal, setShowExportModal] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);

  // Calculate total duration
  const totalDuration = project.scenes.reduce((acc, s) => acc + (s.duration || 5), 0) || 30;
  const activeScene = project.scenes[activeSceneIndex] || project.scenes[0];

  // Playback timer loop
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          const next = prev + 0.25;
          // Calculate which scene corresponds to next time
          let accumulated = 0;
          for (let i = 0; i < project.scenes.length; i++) {
            accumulated += project.scenes[i].duration;
            if (next <= accumulated) {
              setActiveSceneIndex(i);
              break;
            }
          }
          return Number(next.toFixed(2));
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration, project.scenes]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Timeline Operations
  const handleSplitScene = () => {
    if (!activeScene) return;
    const halfDuration = Math.max(2, Math.floor(activeScene.duration / 2));
    const newScene: Scene = {
      ...activeScene,
      id: `sc_${Date.now()}`,
      sceneNumber: activeScene.sceneNumber + 1,
      duration: halfDuration,
      narration: activeScene.narration + ' (Part 2)',
    };
    const updatedScenes = [...project.scenes];
    updatedScenes[activeSceneIndex].duration = halfDuration;
    updatedScenes.splice(activeSceneIndex + 1, 0, newScene);

    const updated = { ...project, scenes: updatedScenes };
    setProject(updated);
    onUpdateProject(updated);
  };

  const handleDuplicateScene = () => {
    if (!activeScene) return;
    const duplicated: Scene = {
      ...JSON.parse(JSON.stringify(activeScene)),
      id: `sc_${Date.now()}`,
      sceneNumber: activeScene.sceneNumber + 1,
    };
    const updatedScenes = [...project.scenes];
    updatedScenes.splice(activeSceneIndex + 1, 0, duplicated);

    const updated = { ...project, scenes: updatedScenes };
    setProject(updated);
    onUpdateProject(updated);
  };

  const handleDeleteScene = () => {
    if (project.scenes.length <= 1) {
      alert('A video must have at least one scene.');
      return;
    }
    const updatedScenes = project.scenes.filter((_, i) => i !== activeSceneIndex);
    const nextIndex = Math.max(0, activeSceneIndex - 1);
    const updated = { ...project, scenes: updatedScenes };
    setProject(updated);
    setActiveSceneIndex(nextIndex);
    onUpdateProject(updated);
  };

  const handleTrimScene = (delta: number) => {
    if (!activeScene) return;
    const newDuration = Math.max(2, activeScene.duration + delta);
    const updatedScenes = [...project.scenes];
    updatedScenes[activeSceneIndex].duration = newDuration;

    const updated = { ...project, scenes: updatedScenes };
    setProject(updated);
    onUpdateProject(updated);
  };

  const handleMoveScene = (direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? activeSceneIndex - 1 : activeSceneIndex + 1;
    if (targetIndex < 0 || targetIndex >= project.scenes.length) return;

    const updatedScenes = [...project.scenes];
    const temp = updatedScenes[activeSceneIndex];
    updatedScenes[activeSceneIndex] = updatedScenes[targetIndex];
    updatedScenes[targetIndex] = temp;

    const updated = { ...project, scenes: updatedScenes };
    setProject(updated);
    setActiveSceneIndex(targetIndex);
    onUpdateProject(updated);
  };

  // In-Editor AI Assistant interaction
  const handleSendAiMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setIsAiProcessing(true);

    try {
      const res = await api.chatAssistant(userMsg, {
        projectTitle: project.title,
        scenesCount: project.scenes.length,
        activeSceneNarration: activeScene?.narration,
        duration: totalDuration,
      });

      const reply = res.reply || 'Modifications executed on your timeline.';
      setChatMessages((prev) => [...prev, { sender: 'assistant', text: reply }]);

      // If user instructed shortening, shorten active scene
      if (userMsg.toLowerCase().includes('shorten')) {
        handleTrimScene(-2);
      }
      // If user instructed more dramatic, update visual prompt & filter
      if (userMsg.toLowerCase().includes('dramatic')) {
        setSceneFilter('Cinematic');
        if (activeScene) {
          const updatedScenes = [...project.scenes];
          updatedScenes[activeSceneIndex].cameraDirection = 'Dolly Zoom';
          const updated = { ...project, scenes: updatedScenes };
          setProject(updated);
          onUpdateProject(updated);
        }
      }
    } catch (e: any) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: 'Encountered an issue executing request: ' + e.message },
      ]);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleExportRender = async () => {
    setIsRendering(true);
    try {
      const res = await api.renderVideo(project.id, '1080p');
      setRenderedUrl(res.downloadUrl || activeScene?.mediaUrl || project.thumbnailUrl);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsRendering(false);
    }
  };

  const filterStyle = {
    None: '',
    Cinematic: 'contrast(115%) saturate(120%) brightness(95%)',
    Noir: 'grayscale(100%) contrast(140%) brightness(90%)',
    Vintage: 'sepia(45%) contrast(95%) brightness(105%)',
    Cyberpunk: 'hue-rotate(290deg) saturate(160%) contrast(120%)',
    Warm: 'sepia(20%) saturate(130%) brightness(105%)',
  }[sceneFilter];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-[100vw] overflow-hidden -m-4 sm:-m-8 bg-[#0b0b12]">
      {/* Top Bar */}
      <div className="h-14 px-4 bg-[#0f0f18] border-b border-white/[0.08] flex items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={project.title}
            onChange={(e) => {
              const updated = { ...project, title: e.target.value };
              setProject(updated);
              onUpdateProject(updated);
            }}
            className="bg-transparent text-sm sm:text-base font-bold text-white focus:outline-none border-b border-transparent focus:border-orange-500 max-w-xs sm:max-w-md"
          />
        </div>

        {/* Center: Aspect Ratio Toggle */}
        <div className="hidden sm:flex items-center gap-1 bg-[#161622] p-1 rounded-xl border border-white/10">
          {(['9:16', '16:9', '1:1'] as AspectRatio[]).map((ratio) => (
            <button
              key={ratio}
              onClick={() => {
                const updated = { ...project, aspectRatio: ratio };
                setProject(updated);
                onUpdateProject(updated);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                project.aspectRatio === ratio
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>

        {/* Right Action: Export Video */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowExportModal(true)}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export & Render
          </Button>
        </div>
      </div>

      {/* Main Studio Area (Left panel, Center canvas, Right properties) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side Tool Panel (Tabs) */}
        <div className="w-72 bg-[#0d0d16] border-r border-white/[0.08] flex flex-col">
          <div className="flex border-b border-white/[0.08] bg-[#0a0a10]">
            {[
              { id: 'ai', label: 'AI Director', icon: Sparkles },
              { id: 'media', label: 'Media', icon: Film },
              { id: 'captions', label: 'Captions', icon: Subtitles },
              { id: 'audio', label: 'Audio', icon: Music },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2.5 flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'text-orange-400 border-orange-500 bg-orange-500/5'
                      : 'text-zinc-500 border-transparent hover:text-zinc-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Left Panel Body */}
          <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
            {activeTab === 'ai' && (
              <div className="h-full flex flex-col justify-between space-y-3">
                <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
                  {chatMessages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl text-xs ${
                        m.sender === 'user'
                          ? 'bg-orange-500/15 border border-orange-500/30 text-white ml-4'
                          : 'bg-[#161622] border border-white/10 text-zinc-300 mr-2 whitespace-pre-line'
                      }`}
                    >
                      {m.text}
                    </div>
                  ))}
                  {isAiProcessing && (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-[#161622] text-xs text-orange-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Gemini Director thinking...</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-white/[0.08]">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendAiMessage()}
                      placeholder="Instruct AI director..."
                      className="flex-1 bg-[#14141e] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50"
                    />
                    <button
                      onClick={handleSendAiMessage}
                      disabled={isAiProcessing || !chatInput.trim()}
                      className="p-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'media' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Project Assets</span>
                <div className="grid grid-cols-2 gap-2">
                  {project.scenes.map((s, idx) => (
                    <div
                      key={s.id}
                      onClick={() => setActiveSceneIndex(idx)}
                      className={`relative aspect-video rounded-lg overflow-hidden border cursor-pointer ${
                        activeSceneIndex === idx ? 'border-orange-500 ring-1 ring-orange-500' : 'border-white/10'
                      }`}
                    >
                      <img src={s.mediaUrl} alt={`Scene ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute bottom-1 right-1 px-1 rounded bg-black/70 text-[9px] text-white">
                        {s.duration}s
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'captions' && (
              <div className="space-y-3 text-xs">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Subtitle Styling</span>
                <div className="p-3 rounded-xl bg-[#161622] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Preset:</span>
                    <span className="text-orange-400 font-bold">Viral Shorts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Word-by-word:</span>
                    <span className="text-emerald-400 font-semibold">Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Active Highlight:</span>
                    <span className="text-yellow-400 font-mono">#F59E0B</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-3 text-xs">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Voice & Audio Master</span>
                <div className="p-3 rounded-xl bg-[#161622] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">AI Voice:</span>
                    <span className="text-white font-bold">{project.voiceName || 'Zephyr'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Speech Rate:</span>
                    <span className="text-zinc-200">1.0x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">BGM Track:</span>
                    <span className="text-zinc-200">Cinematic Ambient Pad</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Video Preview Canvas */}
        <div className="flex-1 bg-[#07070c] flex flex-col justify-between p-4 overflow-hidden relative">
          <div className="flex-1 flex items-center justify-center min-h-0">
            {/* Canvas Frame Container matching Aspect Ratio */}
            <div
              className={`relative rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl flex items-center justify-center transition-all ${
                project.aspectRatio === '9:16'
                  ? 'h-full max-h-[500px] aspect-[9/16]'
                  : project.aspectRatio === '1:1'
                  ? 'h-full max-h-[480px] aspect-square'
                  : 'w-full max-w-2xl aspect-video'
              }`}
            >
              {activeScene ? (
                <img
                  src={activeScene.mediaUrl}
                  alt="Current Scene"
                  style={{ filter: filterStyle }}
                  className="w-full h-full object-cover transition-all duration-300"
                />
              ) : (
                <div className="text-zinc-500 text-xs">No media loaded</div>
              )}

              {/* Captions Overlay Center */}
              {activeScene?.narration && (
                <div className="absolute bottom-10 left-4 right-4 text-center z-10">
                  <span className="inline-block px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white font-black text-sm sm:text-base border border-white/10 shadow-2xl">
                    {activeScene.narration}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Transport Controls Bar */}
          <div className="h-12 flex items-center justify-between px-4 mt-2 bg-[#12121c] rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button
                onClick={() => setCurrentTime(0)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <div className="text-xs font-mono text-zinc-300">
                <span className="text-orange-400 font-bold">{formatTime(currentTime)}</span>
                <span className="text-zinc-500"> / {formatTime(totalDuration)}</span>
              </div>
            </div>

            <div className="text-[11px] text-zinc-400 hidden sm:block">
              Scene <span className="text-white font-bold">{activeSceneIndex + 1}</span> of{' '}
              <span className="text-white font-bold">{project.scenes.length}</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Properties Inspector */}
        <div className="w-64 bg-[#0d0d16] border-l border-white/[0.08] p-4 flex flex-col justify-between overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <div className="pb-2 border-b border-white/10">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Properties Inspector</h3>
              <p className="text-[11px] text-zinc-500">Scene {activeSceneIndex + 1} Settings</p>
            </div>

            {/* Duration adjuster */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-300">
                <span>Duration</span>
                <span className="font-mono font-bold text-orange-400">{activeScene?.duration || 5}s</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <Button size="sm" variant="secondary" onClick={() => handleTrimScene(-1)}>
                  -1s Trim
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleTrimScene(1)}>
                  +1s Trim
                </Button>
              </div>
            </div>

            {/* Color Filter Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Visual Filter</label>
              <select
                value={sceneFilter}
                onChange={(e) => setSceneFilter(e.target.value as any)}
                className="w-full bg-[#14141e] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50"
              >
                <option value="None">Normal (No Filter)</option>
                <option value="Cinematic">Cinematic 35mm</option>
                <option value="Noir">High Contrast Noir</option>
                <option value="Vintage">Vintage Film</option>
                <option value="Cyberpunk">Cyberpunk Neon</option>
                <option value="Warm">Golden Hour Warm</option>
              </select>
            </div>

            {/* Camera Direction */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Camera Movement</label>
              <select
                value={activeScene?.cameraDirection || 'Slow Zoom'}
                onChange={(e) => {
                  if (activeScene) {
                    const updatedScenes = [...project.scenes];
                    updatedScenes[activeSceneIndex].cameraDirection = e.target.value;
                    const updated = { ...project, scenes: updatedScenes };
                    setProject(updated);
                    onUpdateProject(updated);
                  }
                }}
                className="w-full bg-[#14141e] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50"
              >
                <option value="Slow Zoom">Slow Zoom In</option>
                <option value="Pan Left">Pan Left</option>
                <option value="Pan Right">Pan Right</option>
                <option value="Tilt Up">Tilt Up</option>
                <option value="Orbit">3D Orbit</option>
                <option value="Dolly Zoom">Dramatic Dolly Zoom</option>
              </select>
            </div>

            {/* Speed slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span>Speed</span>
                <span className="font-mono text-orange-400">{sceneSpeed}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={sceneSpeed}
                onChange={(e) => setSceneSpeed(parseFloat(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Quick Scene Operations */}
          <div className="space-y-2 pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleMoveScene('left')}
                disabled={activeSceneIndex === 0}
                className="p-1.5 rounded-lg bg-[#161622] text-xs text-zinc-300 hover:text-white disabled:opacity-30 border border-white/10 flex items-center justify-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Move Left
              </button>
              <button
                onClick={() => handleMoveScene('right')}
                disabled={activeSceneIndex === project.scenes.length - 1}
                className="p-1.5 rounded-lg bg-[#161622] text-xs text-zinc-300 hover:text-white disabled:opacity-30 border border-white/10 flex items-center justify-center gap-1"
              >
                Move Right <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleDeleteScene}
              className="w-full p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Active Scene
            </button>
          </div>
        </div>
      </div>

      {/* Bottom: Multi-Track Timeline */}
      <div className="h-44 bg-[#0a0a10] border-t border-white/[0.08] flex flex-col select-none">
        {/* Timeline Header Tools */}
        <div className="h-8 px-4 border-b border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 bg-[#0c0c14]">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSplitScene}
              className="hover:text-white flex items-center gap-1 transition-colors"
              title="Split active scene"
            >
              <Scissors className="w-3.5 h-3.5" /> Split
            </button>
            <button
              onClick={handleDuplicateScene}
              className="hover:text-white flex items-center gap-1 transition-colors"
              title="Duplicate active scene"
            >
              <Copy className="w-3.5 h-3.5" /> Duplicate
            </button>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span>TOTAL: {totalDuration}s</span>
          </div>
        </div>

        {/* Tracks Container */}
        <div className="flex-1 p-2 space-y-1.5 overflow-x-auto custom-scrollbar">
          {/* Track 1: Video Scenes Track */}
          <div className="h-12 flex items-center gap-1.5">
            <div className="w-20 text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex-shrink-0">
              Video Track
            </div>
            <div className="flex-1 flex gap-1.5 h-full">
              {project.scenes.map((scene, idx) => {
                const isActive = activeSceneIndex === idx;
                return (
                  <div
                    key={scene.id}
                    onClick={() => setActiveSceneIndex(idx)}
                    className={`relative rounded-xl overflow-hidden cursor-pointer border transition-all flex items-center justify-between p-2 flex-shrink-0 min-w-[120px] ${
                      isActive
                        ? 'bg-orange-500/20 border-orange-500 ring-2 ring-orange-500/40 shadow-lg'
                        : 'bg-[#151522] border-white/10 hover:border-white/20'
                    }`}
                    style={{ flex: scene.duration }}
                  >
                    <img
                      src={scene.mediaUrl}
                      alt="Thumbnail"
                      className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />
                    <div className="relative z-10 flex items-center gap-1 text-[11px] font-bold text-white truncate">
                      <span>Scene {scene.sceneNumber}</span>
                    </div>
                    <span className="relative z-10 text-[10px] font-mono font-semibold px-1 rounded bg-black/60 text-orange-400">
                      {scene.duration}s
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Track 2: Voiceover / Speech Track */}
          <div className="h-7 flex items-center gap-1.5">
            <div className="w-20 text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex-shrink-0">
              Voice Track
            </div>
            <div className="flex-1 h-full rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center px-3 text-[10px] font-medium text-emerald-300">
              <span>AI Neural Voiceover ({project.voiceName || 'Zephyr'}) — Master Audio</span>
            </div>
          </div>

          {/* Track 3: Captions Track */}
          <div className="h-7 flex items-center gap-1.5">
            <div className="w-20 text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex-shrink-0">
              Captions
            </div>
            <div className="flex-1 h-full rounded-lg bg-yellow-950/40 border border-yellow-500/30 flex items-center px-3 text-[10px] font-medium text-yellow-300">
              <span>Viral Word-by-Word Kinetic Subtitles Track</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export & Render Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Render & Export Video"
        description="Compile timeline, high-res visual frames, and synchronized audio tracks into an MP4 video."
      >
        <div className="space-y-4 pt-2">
          <div className="p-3.5 rounded-xl bg-[#0f0f18] border border-white/10 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Resolution:</span>
              <span className="text-white font-bold">1080p FHD (60fps)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Aspect Ratio:</span>
              <span className="text-white font-bold">{project.aspectRatio}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Total Length:</span>
              <span className="text-white font-bold">{totalDuration} seconds</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Render Cost:</span>
              <span className="text-orange-400 font-bold">25 Credits</span>
            </div>
          </div>

          {renderedUrl ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Video compiled successfully and ready for export!</span>
              </div>
              <Button
                size="lg"
                className="w-full"
                onClick={() => window.open(renderedUrl, '_blank')}
                icon={<Download className="w-4 h-4" />}
              >
                Download MP4 File
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              loading={isRendering}
              onClick={handleExportRender}
              icon={<Sparkles className="w-4 h-4" />}
              className="w-full shadow-xl shadow-orange-500/20"
            >
              {isRendering ? 'Encoding Frames and Mastering Audio...' : 'Start Render (25 Credits)'}
            </Button>
          )}
        </div>
      </Modal>
    </div>
  );
};
