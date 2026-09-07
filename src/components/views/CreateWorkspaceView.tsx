import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Film,
  Video,
  ImageIcon,
  FileText,
  Wand2,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Lightbulb,
  AlertCircle,
  Play,
  Download,
  Sliders,
  Camera,
} from 'lucide-react';
import type { NavItemKey } from '../layout/Sidebar.js';
import { Button } from '../ui/Button.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { api } from '../../lib/api.js';
import { ImageUploadZone, type ReferenceImageItem } from './ImageUploadZone.js';
import type { Project } from '../../types.js';

interface CreateWorkspaceViewProps {
  onNavigate: (item: NavItemKey) => void;
  onSelectPromptForShorts?: (prompt: string) => void;
  onProjectCreated?: (project: Project) => void;
}

export const CreateWorkspaceView: React.FC<CreateWorkspaceViewProps> = ({
  onNavigate,
  onSelectPromptForShorts,
  onProjectCreated,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedTool, setSelectedTool] = useState<NavItemKey>('shorts');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [enhancedData, setEnhancedData] = useState<any>(null);

  // Image to Video State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [referenceImages, setReferenceImages] = useState<ReferenceImageItem[]>([]);
  const [duration, setDuration] = useState<number>(10);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [motionStrength, setMotionStrength] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [camera, setCamera] = useState<string>('Auto');
  const [style, setStyle] = useState<string>('Cinematic');

  // Generation Results & Errors
  const [generationResult, setGenerationResult] = useState<any | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const isImageToVideoMode = selectedTool === 'image_to_video';

  const tools = [
    { key: 'shorts' as NavItemKey, label: 'AI Short', icon: Zap },
    { key: 'long_video' as NavItemKey, label: 'Long Video', icon: Film },
    { key: 'text_to_video' as NavItemKey, label: 'Text to Video', icon: Video },
    { key: 'image_to_video' as NavItemKey, label: 'Image to Video', icon: ImageIcon },
    { key: 'ai_image' as NavItemKey, label: 'AI Image', icon: Sparkles },
    { key: 'script_to_video' as NavItemKey, label: 'Script to Video', icon: FileText },
  ];

  const examplePrompts = [
    'Create a cinematic 30-second story about a lost dog finding its owner in the rain.',
    'A high-octane 45-second TikTok uncovering the secret psychology behind casino architecture.',
    'The mind-bending story of how ancient Romans built underwater concrete that lasted 2,000 years.',
    'A 20-second luxury commercial for a titanium mechanical chronograph watch.',
    '3 terrifying facts about the Mariana Trench that will make you fear deep water.',
  ];

  const motionExamplePrompt =
    'Create a cinematic camera push-in. The person slowly turns toward the camera while the background moves naturally. Golden-hour lighting, realistic motion.';

  const handleSelectPrimaryImage = (file: File) => {
    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);
    setGenerationError(null);
  };

  const handleRemovePrimaryImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setSelectedImage(null);
    setImagePreviewUrl(null);
  };

  const handleAddReferenceImage = (file: File) => {
    const url = URL.createObjectURL(file);
    setReferenceImages((prev) => [
      ...prev,
      {
        file,
        previewUrl: url,
        name: file.name,
        size: file.size,
      },
    ]);
  };

  const handleRemoveReferenceImage = (index: number) => {
    setReferenceImages((prev) => {
      const target = prev[index];
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleEnhance = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const res = await api.enhancePrompt(prompt);
      if (res.data?.enhanced) {
        setEnhancedData(res.data);
        setPrompt(res.data.enhanced);
      }
    } catch (e: any) {
      console.error(e);
      setGenerationError('Prompt enhancement notice: ' + (e.message || 'Unable to enhance prompt'));
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (isImageToVideoMode) {
      if (!selectedImage) {
        setGenerationError('Please upload an image first.');
        return;
      }

      setIsGenerating(true);
      setGenerationError(null);
      setGenerationResult(null);

      try {
        const formData = new FormData();
        formData.append('image', selectedImage);
        formData.append('prompt', prompt.trim() || motionExamplePrompt);
        formData.append('mode', 'image-to-video');
        formData.append('duration', String(duration));
        formData.append('aspectRatio', aspectRatio);
        formData.append('motionStrength', motionStrength);
        formData.append('camera', camera);
        formData.append('style', style);

        // Append optional reference images
        for (const ref of referenceImages) {
          if (ref.file) {
            formData.append('referenceImages', ref.file);
          }
        }

        const res = await api.generateImageToVideo(formData);

        if (res.data?.status === 'failed') {
          setGenerationError(
            res.data.message ||
              'Image-to-video provider is not configured or supported with the current API credentials. Please check Settings > API Keys.'
          );
        } else if (res.data?.videoUrl) {
          setGenerationResult(res.data);
        } else if (res.job) {
          setGenerationResult(res.job);
        }
      } catch (err: any) {
        console.error('Image-to-video error:', err);
        setGenerationError(err.message || 'Failed to process image to video.');
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // Default flow for text, short, or navigating to specialized views
    if (!prompt.trim()) return;
    if (onSelectPromptForShorts) {
      onSelectPromptForShorts(prompt);
    }
    onNavigate(selectedTool);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Universal Creation Studio</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          What video do you want to create?
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
          {isImageToVideoMode
            ? 'Upload any still photo or 3D render, specify camera motion and style, and transform it into dynamic high-definition video.'
            : 'Describe any concept in natural language. Our autonomous Gemini engine will script, plan scenes, and produce your multi-scene timeline.'}
        </p>
      </div>

      {/* Main Creation Card */}
      <Card className="p-4 sm:p-6 space-y-5 border-orange-500/20 shadow-2xl shadow-orange-500/5">
        {/* Pipeline Selection Pills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Select Video Pipeline:
            </label>
            {isImageToVideoMode && (
              <Badge variant="orange" className="text-[10px] py-0.5 px-2">
                Image to Video Mode Active
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isSelected = selectedTool === tool.key;
              return (
                <button
                  key={tool.key}
                  type="button"
                  id={`pipeline-${tool.key}`}
                  onClick={() => {
                    setSelectedTool(tool.key);
                    setGenerationError(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white border-transparent shadow-lg shadow-orange-500/20 scale-[1.02]'
                      : 'bg-[#14141e] hover:bg-[#1c1c28] text-zinc-300 border-white/10 hover:border-white/20'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tool.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dedicated Image Upload Area (Shown prominently when Image to Video is selected) */}
        {isImageToVideoMode && (
          <div className="pt-2 border-t border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-orange-400" />
                <span>Source Image Upload</span>
              </span>
              <span className="text-[11px] text-zinc-400">
                Supports Android Gallery &amp; Camera capture
              </span>
            </div>

            <ImageUploadZone
              selectedImage={selectedImage}
              imagePreviewUrl={imagePreviewUrl}
              onSelectImage={handleSelectPrimaryImage}
              onRemoveImage={handleRemovePrimaryImage}
              referenceImages={referenceImages}
              onAddReferenceImage={handleAddReferenceImage}
              onRemoveReferenceImage={handleRemoveReferenceImage}
            />

            {/* Image to Video Specific Settings */}
            <div className="p-4 rounded-xl bg-[#0d0d14] border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                <Sliders className="w-3.5 h-3.5 text-orange-400" />
                <span>Motion &amp; Camera Settings</span>
              </div>

              {/* Duration Pills */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-400">Duration:</label>
                <div className="flex flex-wrap gap-2">
                  {[5, 10, 15, 30].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        duration === d
                          ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                          : 'bg-[#161622] hover:bg-[#1e1e2d] text-zinc-300 border-white/10'
                      }`}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio Pills */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-400">Aspect Ratio:</label>
                <div className="flex flex-wrap gap-2">
                  {(['9:16', '16:9', '1:1'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        aspectRatio === ratio
                          ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                          : 'bg-[#161622] hover:bg-[#1e1e2d] text-zinc-300 border-white/10'
                      }`}
                    >
                      {ratio} {ratio === '9:16' ? '(Shorts / Reels)' : ratio === '16:9' ? '(Landscape)' : '(Square)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Motion Intensity Pills */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-400">Motion Strength:</label>
                <div className="flex flex-wrap gap-2">
                  {(['Low', 'Medium', 'High'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMotionStrength(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        motionStrength === m
                          ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                          : 'bg-[#161622] hover:bg-[#1e1e2d] text-zinc-300 border-white/10'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Camera Moves & Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-zinc-400">Camera Movement:</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['Auto', 'Zoom In', 'Zoom Out', 'Pan', 'Tilt', 'Orbit', 'Tracking', 'Dolly'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCamera(c)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs text-center truncate transition-all border ${
                          camera === c
                            ? 'bg-orange-500/20 text-orange-300 border-orange-500/50 font-semibold'
                            : 'bg-[#161622] text-zinc-400 hover:text-zinc-200 border-white/10'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-zinc-400">Style Aesthetic:</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['Cinematic', 'Realistic', 'Anime', '3D', 'Documentary'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStyle(s)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs text-center truncate transition-all border ${
                          style === s
                            ? 'bg-orange-500/20 text-orange-300 border-orange-500/50 font-semibold'
                            : 'bg-[#161622] text-zinc-400 hover:text-zinc-200 border-white/10'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prompt Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300">
              {isImageToVideoMode ? 'Motion & Animation Prompt:' : 'Video Concept Prompt:'}
            </label>
            {isImageToVideoMode && (
              <button
                type="button"
                onClick={() => setPrompt(motionExamplePrompt)}
                className="text-[11px] text-orange-400 hover:text-orange-300 flex items-center gap-1 underline underline-offset-2"
              >
                Insert Recommended Motion Prompt
              </button>
            )}
          </div>

          <div className="relative">
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                isImageToVideoMode
                  ? 'Describe how you want this image to move... (e.g. Create a cinematic camera push-in. The person slowly turns toward the camera while the background moves naturally. Golden-hour lighting, realistic motion.)'
                  : 'Describe the video you want to create in detail... (e.g. A cinematic 30-second story about a lost dog finding its owner in Tokyo at sunset)'
              }
              className="w-full bg-[#0d0d14] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all resize-none leading-relaxed"
            />

            {/* Enhance Button */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                loading={isEnhancing}
                onClick={handleEnhance}
                icon={<Wand2 className="w-3.5 h-3.5 text-orange-400" />}
                className="bg-[#14141f] text-xs shadow-md"
              >
                Enhance Prompt
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Parameters Breakdown if present */}
        {enhancedData && (
          <div className="p-3.5 rounded-xl bg-orange-500/5 border border-orange-500/20 text-xs space-y-2">
            <div className="flex items-center justify-between text-orange-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Prompt Enhanced with Hollywood Cinematography Parameters
              </span>
              <button
                type="button"
                onClick={() => setEnhancedData(null)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                Dismiss
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-zinc-300">
              <div className="bg-black/30 p-2 rounded-lg">
                <span className="text-zinc-500 block">Lighting</span>
                <span className="font-medium truncate block">{enhancedData.lighting}</span>
              </div>
              <div className="bg-black/30 p-2 rounded-lg">
                <span className="text-zinc-500 block">Camera</span>
                <span className="font-medium truncate block">{enhancedData.camera}</span>
              </div>
              <div className="bg-black/30 p-2 rounded-lg">
                <span className="text-zinc-500 block">Lens</span>
                <span className="font-medium truncate block">{enhancedData.lens}</span>
              </div>
              <div className="bg-black/30 p-2 rounded-lg">
                <span className="text-zinc-500 block">Atmosphere</span>
                <span className="font-medium truncate block">{enhancedData.atmosphere}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error / Notice Display */}
        {generationError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-2">
            <div className="flex items-start gap-2.5 text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-white block">Image to Video Notice</span>
                <p className="leading-relaxed">{generationError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Completed Generation Result View if videoUrl is available */}
        {generationResult?.videoUrl && (
          <div className="p-4 rounded-2xl bg-[#09090f] border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between text-emerald-400 text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Video Generated Successfully
              </span>
              <Badge variant="emerald">1080p Ultra-HD</Badge>
            </div>

            <div className="aspect-video rounded-xl overflow-hidden bg-black border border-white/10">
              <video
                src={generationResult.videoUrl}
                controls
                autoPlay
                loop
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={generationResult.videoUrl}
                download="animated_scene.mp4"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download MP4</span>
              </a>
              <Button
                size="sm"
                onClick={() => onNavigate('projects')}
                icon={<Play className="w-3.5 h-3.5 text-orange-400" />}
              >
                View in Projects
              </Button>
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-zinc-400">
            {isImageToVideoMode ? (
              !selectedImage ? (
                <span className="text-rose-400 font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Please upload an image first.
                </span>
              ) : (
                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Source image selected &bull; Cost: 50 AI Credits
                </span>
              )
            ) : (
              <span>Estimated generation time: ~15-30 seconds</span>
            )}
          </div>

          <Button
            id="btn-generate-main"
            size="lg"
            loading={isGenerating}
            disabled={isImageToVideoMode && !selectedImage}
            onClick={handleGenerate}
            icon={<Sparkles className="w-4 h-4" />}
            className="w-full sm:w-auto px-8 shadow-lg shadow-orange-500/20"
          >
            {isImageToVideoMode
              ? selectedImage
                ? 'Generate Image to Video'
                : 'Please upload an image first'
              : `Generate ${tools.find((t) => t.key === selectedTool)?.label}`}
          </Button>
        </div>
      </Card>

      {/* Example Prompts Grid (Contextually adapts) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          <Lightbulb className="w-4 h-4 text-orange-400" />
          <span>
            {isImageToVideoMode
              ? 'Motion & Camera Direction Ideas:'
              : 'Try an Example Prompt (Click to load):'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {(isImageToVideoMode
            ? [
                'Slow cinematic zoom-in with atmospheric mist and gentle lens flare across foreground.',
                'Dynamic orbit camera move around the subject with subtle hyper-realistic hair physics.',
                'Subtle cinematic tracking shot following character movement with realistic depth of field blur.',
                'Smooth drone tilt-down showing scenic horizon reveals with dramatic golden-hour sunlight.',
              ]
            : examplePrompts
          ).map((p, idx) => (
            <div
              key={idx}
              onClick={() => setPrompt(p)}
              className="p-3 rounded-xl bg-[#14141d]/70 hover:bg-[#1a1a24] border border-white/[0.06] hover:border-orange-500/30 text-xs text-zinc-300 hover:text-white cursor-pointer transition-all flex items-start justify-between gap-2 group"
            >
              <span className="line-clamp-2 leading-relaxed">{p}</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-orange-400 flex-shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

