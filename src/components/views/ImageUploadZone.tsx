import React, { useRef, useState } from 'react';
import {
  ImageIcon,
  Camera,
  FolderOpen,
  RefreshCw,
  Trash2,
  Plus,
  X,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';

export interface ReferenceImageItem {
  file?: File;
  previewUrl: string;
  name: string;
  size: number;
}

interface ImageUploadZoneProps {
  selectedImage: File | null;
  imagePreviewUrl: string | null;
  onSelectImage: (file: File) => void;
  onRemoveImage: () => void;
  referenceImages?: ReferenceImageItem[];
  onAddReferenceImage?: (file: File) => void;
  onRemoveReferenceImage?: (index: number) => void;
  className?: string;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const ImageUploadZone: React.FC<ImageUploadZoneProps> = ({
  selectedImage,
  imagePreviewUrl,
  onSelectImage,
  onRemoveImage,
  referenceImages = [],
  onAddReferenceImage,
  onRemoveReferenceImage,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isRefDragging, setIsRefDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const refFileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined | null) => {
    if (!file) return;
    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/i)) {
      alert('Please select a valid JPG, PNG, or WEBP image.');
      return;
    }
    onSelectImage(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRefFile = (file: File | undefined | null) => {
    if (!file) return;
    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/i)) {
      alert('Please select a valid JPG, PNG, or WEBP image.');
      return;
    }
    if (onAddReferenceImage) {
      onAddReferenceImage(file);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Real HTML inputs for Android File Picker and Camera */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        id="html-image-file-input"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        id="html-camera-file-input"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
      <input
        ref={refFileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        id="html-ref-image-file-input"
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
              handleRefFile(files[i]);
            }
          }
          e.target.value = '';
        }}
      />

      {/* Main Upload / Preview Area */}
      {!imagePreviewUrl ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
            isDragging
              ? 'border-orange-500 bg-orange-500/10 scale-[0.99]'
              : 'border-white/15 hover:border-orange-500/40 bg-[#0d0d14]/70 hover:bg-[#11111c]'
          }`}
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-3 shadow-inner">
            <ImageIcon className="w-7 h-7" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white mb-1 flex items-center justify-center gap-1.5">
            <span>🖼️</span>
            <span>Upload Image</span>
          </h3>

          <p className="text-xs sm:text-sm text-zinc-400 mb-4">
            Drag &amp; drop an image here
            <span className="block text-zinc-500 text-xs mt-0.5">or</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-3">
            <button
              type="button"
              id="btn-choose-image"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white text-xs font-semibold shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Choose Image</span>
            </button>

            <button
              type="button"
              id="btn-camera-upload"
              onClick={() => cameraInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 hover:text-white border border-white/15 text-xs font-medium active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4 text-orange-400" />
              <span>📷 Upload Image</span>
            </button>
          </div>

          <p className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
            JPG • PNG • WEBP
          </p>
        </div>
      ) : (
        /* Image Preview Selected State (Do NOT hide upload capability) */
        <div className="space-y-3">
          <div className="relative rounded-2xl border border-white/15 bg-[#0d0d14] overflow-hidden p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Preview Box */}
              <div className="relative w-full sm:w-48 aspect-video sm:aspect-square rounded-xl overflow-hidden bg-black/60 border border-white/10 flex-shrink-0 flex items-center justify-center">
                <img
                  src={imagePreviewUrl}
                  alt={selectedImage?.name || 'Selected source'}
                  className="w-full h-full object-contain"
                />
                <Badge
                  variant="orange"
                  className="absolute top-2 left-2 text-[10px] py-0.5 px-2 font-bold shadow-md"
                >
                  Source Image
                </Badge>
              </div>

              {/* Meta & Actions */}
              <div className="flex-1 w-full space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Image Loaded &amp; Ready
                  </span>
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-zinc-200 truncate max-w-md">
                    {selectedImage?.name || 'Uploaded Source Image'}
                  </h4>
                  <p className="text-xs text-zinc-400">
                    {selectedImage ? formatBytes(selectedImage.size) : 'Ready for animation'}
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 hover:text-white border border-white/15 text-xs font-medium transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
                    <span>Replace Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 hover:text-white border border-white/15 text-xs font-medium transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5 text-orange-400" />
                    <span>📷 Retake</span>
                  </button>

                  <button
                    type="button"
                    onClick={onRemoveImage}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/20 text-xs font-medium transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Drag & Drop Bar to easily replace */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-500 transition-colors ${
                isDragging ? 'text-orange-400 font-semibold' : ''
              }`}
            >
              <span>Tip: Drop any image here to instantly replace.</span>
              <span className="uppercase text-[10px] text-zinc-600 font-mono">JPG • PNG • WEBP</span>
            </div>
          </div>
        </div>
      )}

      {/* Reference Image Section */}
      <div className="p-4 rounded-xl bg-[#0f0f18] border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <span>Reference Image (Optional)</span>
              <span className="text-[10px] text-zinc-500 font-normal">
                Additional lighting, style, or character references
              </span>
            </label>
          </div>

          <button
            type="button"
            onClick={() => refFileInputRef.current?.click()}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-300 hover:text-white border border-white/15 text-xs font-medium transition-all flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5 text-orange-400" />
            <span>Add Reference</span>
          </button>
        </div>

        {referenceImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {referenceImages.map((ref, idx) => (
              <div
                key={idx}
                className="relative rounded-lg overflow-hidden border border-white/10 bg-black/40 group aspect-video flex items-center justify-center"
              >
                <img src={ref.previewUrl} alt={ref.name} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => onRemoveReferenceImage && onRemoveReferenceImage(idx)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/80 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow"
                  title="Remove reference"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-black/70 p-1 text-[10px] text-zinc-300 truncate font-mono">
                  {ref.name}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-zinc-500 italic">
            No reference images added yet. Click &ldquo;Add Reference&rdquo; to supply optional style or angle frames.
          </p>
        )}
      </div>
    </div>
  );
};
