import React, { useState } from 'react';
import {
  ImageIcon,
  Sparkles,
  Play,
  Download,
  Loader2,
  AlertCircle,
  Sliders,
  CheckCircle2,
  Video,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../ui/Button.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { api } from '../../lib/api.js';
import { ImageUploadZone, type ReferenceImageItem } from './ImageUploadZone.js';
import type { Project } from '../../types.js';

interface ImageToVideoViewProps {
  onOpenInEditor?: (project: Project) => void;
  onProjectCreated?: (project: Project) => void;
  onVideoCreated?: (mediaItem: any) => void;
  onInsufficientPoints?: (requiredPoints: number, balance: number) => void;
  onPointsUpdated?: () => void;
}

export const ImageToVideoView: React.FC<ImageToVideoViewProps> = ({
  onOpenInEditor,
  onProjectCreated,
  onVideoCreated,
  onInsufficientPoints,
  onPointsUpdated,
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [referenceImages, setReferenceImages] = useState<ReferenceImageItem[]>([]);

  const [motionPrompt, setMotionPrompt] = useState(
    'Create a cinematic camera push-in. The person slowly turns toward the camera while the background moves naturally. Golden-hour lighting, realistic motion.'
  );

  // Settings
  const [duration, setDuration] = useState<number>(10);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [motionStrength, setMotionStrength] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [camera, setCamera] = useState<string>('Auto');
  const [style, setStyle] = useState<string>('Cinematic');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [generationJob, setGenerationJob] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectPrimaryImage = (file: File) => {
    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);
    setErrorMessage(null);
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

  const handleGenerate = async () => {
    if (!selectedImage) {
      setErrorMessage('Please upload an image first.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setGeneratedVideoUrl(null);
    setGenerationJob(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('prompt', motionPrompt.trim());
      formData.append('mode', 'image-to-video');
      formData.append('duration', String(duration));
      formData.append('aspectRatio', aspectRatio);
      formData.append('motionStrength', motionStrength);
      formData.append('camera', camera);
      formData.append('style', style);

      for (const ref of referenceImages) {
        if (ref.file) {
          formData.append('referenceImages', ref.file);
        }
      }

      const res = await api.generateImageToVideo(formData);

      if (res.data?.status === 'failed') {
        // Authentically report status without faking
        setErrorMessage(
          res.data.message ||
            'Image-to-video provider is not configured/supported with the current API credentials. Please configure a supported video model or API key in Settings.'
        );
        if (res.job) setGenerationJob(res.job);
      } else if (res.data?.videoUrl) {
        setGeneratedVideoUrl(res.data.videoUrl);
        if (res.job) setGenerationJob(res.job);
        if (res.mediaItem && onVideoCreated) onVideoCreated(res.mediaItem);
      } else if (res.job) {
        setGenerationJob(res.job);
        if (res.mediaItem && onVideoCreated) onVideoCreated(res.mediaItem);
      }
      if (onPointsUpdated) onPointsUpdated();
    } catch (err: any) {
      if ((err.requiredPoints !== undefined || err.status === 402 || err.message?.includes('Insufficient')) && onInsufficientPoints) {
        onInsufficientPoints(err.requiredPoints || Math.max(100, duration * 10), err.balance ?? 0);
        return;
      }
      console.error('Image to video error:', err);
      setErrorMessage(err.message || 'Failed to generate video from image.');
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
            <ImageIcon className="w-4 h-4" />
            <span>Image Animation Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Image to Video Studio
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Upload any still photo, character portrait, or concept render to animate into cinematic video with real camera physics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="orange" className="text-xs py-1 px-3">
            50 Credits per Video
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Studio Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <Card className="p-5 space-y-5 border-white/10">
            {/* Step 1: Upload Image (Required) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-orange-400" />
                  <span>1. Source Image (Required)</span>
                </label>
                <span className="text-[11px] text-zinc-400">
                  Android Gallery &amp; Camera supported
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
            </div>

            {/* Step 2: Motion Description */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white uppercase tracking-wider">
                  2. Motion &amp; Animation Prompt
                </label>
                <span className="text-[11px] text-zinc-500">
                  Describes motion, camera, &amp; lighting
                </span>
              </div>

              <textarea
                rows={3}
                value={motionPrompt}
                onChange={(e) => setMotionPrompt(e.target.value)}
                placeholder="Describe how you want this image to move... (e.g. Create a cinematic camera push-in. The person slowly turns toward the camera while the background moves naturally. Golden-hour lighting, realistic motion.)"
                className="w-full bg-[#0d0d14] border border-white/10 rounded-xl p-3.5 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500/50 resize-none leading-relaxed placeholder-zinc-500"
              />
            </div>

            {/* Step 3: Settings Grid */}
            <div className="p-4 rounded-xl bg-[#0d0d14] border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                <Sliders className="w-3.5 h-3.5 text-orange-400" />
                <span>3. Generation Settings</span>
              </div>

              {/* Duration: 10s, 15s, 30s, 60s */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-zinc-400">Duration:</label>
                  <span className="text-[10px] text-amber-400 font-bold">⚡ 10 pts/sec (min 100)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[10, 15, 30, 60].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                        duration === d
                          ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                          : 'bg-[#161622] hover:bg-[#1e1e2d] text-zinc-300 border-white/10'
                      }`}
                    >
                      <span>{d}s</span>
                      <span className={`text-[10px] ${duration === d ? 'text-white/90' : 'text-amber-400'}`}>⚡{d * 10}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio: 9:16, 16:9, 1:1 */}
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
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Motion Strength: Low, Medium, High */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-400">Motion:</label>
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

              {/* Camera Moves */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-400">Camera Movement:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
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

              {/* Style Aesthetic */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-400">Style Aesthetic:</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {['Cinematic', 'Realistic', 'Anime', '3D', 'Documentary'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStyle(s)}
                      className={`px-2 py-1.5 rounded-lg text-xs text-center truncate transition-all border ${
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

            {/* Error or Provider Notice */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-1.5">
                <div className="flex items-start gap-2.5 text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-white block">Image-to-Video Engine Notice</span>
                    <p className="leading-relaxed">{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Generate Action Button */}
            <div className="pt-2 space-y-2">
              <Button
                id="btn-generate-image-to-video"
                size="lg"
                loading={isGenerating}
                disabled={!selectedImage}
                onClick={handleGenerate}
                icon={<Sparkles className="w-4 h-4" />}
                className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 shadow-lg shadow-orange-500/20 text-white font-bold"
              >
                {isGenerating
                  ? 'Synthesizing Temporal Motion...'
                  : selectedImage
                  ? `Generate Image to Video (⚡ ${Math.max(100, duration * 10)} Points)`
                  : 'Please upload an image first'}
              </Button>

              {!selectedImage && (
                <p className="text-center text-xs text-rose-400 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Please upload an image first.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Right Output & History (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-4 space-y-3 border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Video Motion Result
              </span>
              <Badge variant={generatedVideoUrl ? 'emerald' : 'orange'}>
                {duration}s &bull; {aspectRatio}
              </Badge>
            </div>

            <div className="relative aspect-[9/16] sm:aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center border border-white/10">
              {generatedVideoUrl ? (
                <video
                  src={generatedVideoUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : isGenerating ? (
                <div className="text-center space-y-3 p-6">
                  <Loader2 className="w-10 h-10 text-orange-400 animate-spin mx-auto" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">Synthesizing Optical Flow</p>
                    <p className="text-xs text-zinc-400">Computing camera movement &amp; latents...</p>
                  </div>
                </div>
              ) : selectedImage && imagePreviewUrl ? (
                <div className="relative w-full h-full flex items-center justify-center bg-zinc-950">
                  <img
                    src={imagePreviewUrl}
                    alt="Source preview"
                    className="w-full h-full object-contain opacity-50"
                  />
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-4 text-center">
                    <Video className="w-8 h-8 text-orange-400 mb-2" />
                    <p className="text-xs font-semibold text-white">Source Image Ready</p>
                    <p className="text-[11px] text-zinc-400 mt-1 max-w-xs">
                      Click &ldquo;Generate Image to Video&rdquo; to begin temporal animation
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-2 p-6">
                  <ImageIcon className="w-10 h-10 text-zinc-700 mx-auto" />
                  <p className="text-xs font-semibold text-zinc-400">No Image Uploaded Yet</p>
                  <p className="text-[11px] text-zinc-500">
                    Upload an image on the left to configure motion and preview animation.
                  </p>
                </div>
              )}
            </div>

            {generatedVideoUrl && (
              <div className="space-y-2 pt-1">
                <a
                  href={generatedVideoUrl}
                  download="animated_scene.mp4"
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-white/10 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download MP4 Video</span>
                </a>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
