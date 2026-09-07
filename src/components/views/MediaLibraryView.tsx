import React, { useState } from 'react';
import {
  Library,
  UploadCloud,
  Trash2,
  ExternalLink,
  Film,
  Image as ImageIcon,
  Music,
  Plus,
  Search,
} from 'lucide-react';
import type { MediaItem } from '../../types.js';
import { Button } from '../ui/Button.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Modal } from '../ui/Modal.js';
import { api } from '../../lib/api.js';

interface MediaLibraryViewProps {
  media?: MediaItem[];
  onRefreshMedia: () => void;
}

export const MediaLibraryView: React.FC<MediaLibraryViewProps> = ({
  media = [],
  onRefreshMedia,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const categories = ['All', 'Uploaded Files', 'Generated Assets', 'Audio Tracks'];

  const filteredMedia = (media || []).filter((m) => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Uploaded Files') return m.category === 'Uploaded Files';
    if (activeCategory === 'Generated Assets') return m.category === 'Generated Assets';
    if (activeCategory === 'Audio Tracks') return m.category === 'Audio Tracks';
    return true;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await api.uploadMedia({
          name: file.name,
          type: file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'image',
          url: reader.result as string,
          thumbnailUrl: reader.result as string,
          size: file.size,
          category: 'Uploaded Files',
        });
        onRefreshMedia();
      } catch (err: any) {
        alert(err.message);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this asset?')) return;
    try {
      await api.deleteMedia(id);
      onRefreshMedia();
      if (selectedItem?.id === id) setSelectedItem(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1">
            <Library className="w-4 h-4" />
            <span>Asset Storage & Media</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Media Library
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Store video clips, AI generated visuals, character portraits, and audio master tracks.
          </p>
        </div>

        <div>
          <input
            type="file"
            id="media-file-input"
            className="hidden"
            onChange={handleFileUpload}
          />
          <label htmlFor="media-file-input">
            <Button
              as="span"
              size="md"
              loading={isUploading}
              icon={<UploadCloud className="w-4 h-4" />}
              className="cursor-pointer shadow-lg shadow-orange-500/20"
            >
              Upload Assets
            </Button>
          </label>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
              activeCategory === c
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-[#14141e] text-zinc-400 border-white/10 hover:text-white'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMedia.map((item) => (
          <Card
            key={item.id}
            hoverable
            onClick={() => setSelectedItem(item)}
            className="overflow-hidden group cursor-pointer"
          >
            <div className="relative aspect-video bg-black/60 overflow-hidden">
              <img
                src={item.thumbnailUrl || item.url}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2">
                <Badge variant="zinc">
                  {item.type === 'video' ? <Film className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                  <span className="capitalize">{item.type}</span>
                </Badge>
              </div>
              <button
                onClick={(e) => handleDelete(item.id, e)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-rose-400 hover:text-rose-200 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <div className="p-3">
              <p className="text-xs font-medium text-white truncate">{item.name}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">{item.category}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Asset Preview Modal */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={selectedItem.name}
          description={selectedItem.category}
        >
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden bg-black/80 aspect-video flex items-center justify-center">
              {selectedItem.type === 'video' ? (
                <video src={selectedItem.url} controls className="w-full h-full object-contain" />
              ) : (
                <img src={selectedItem.url} alt={selectedItem.name} className="w-full h-full object-contain" />
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open(selectedItem.url, '_blank')}
                icon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Open Full Asset
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
