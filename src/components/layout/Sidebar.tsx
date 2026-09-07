import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Zap,
  Film,
  Video,
  Image as ImageIcon,
  Palette,
  FileText,
  PenTool,
  Wand2,
  Mic2,
  Subtitles,
  ImagePlay,
  FolderKanban,
  Library,
  Layers,
  CreditCard,
  Settings,
  ShieldCheck,
  ChevronRight,
  Flame,
} from 'lucide-react';

export type NavItemKey =
  | 'dashboard'
  | 'create'
  | 'shorts'
  | 'long_video'
  | 'text_to_video'
  | 'image_to_video'
  | 'ai_image'
  | 'script_to_video'
  | 'script_writer'
  | 'prompt_enhancer'
  | 'ai_voice'
  | 'ai_captions'
  | 'thumbnail_generator'
  | 'editor'
  | 'projects'
  | 'media_library'
  | 'templates'
  | 'pricing'
  | 'admin'
  | 'settings';

interface SidebarProps {
  activeItem: NavItemKey;
  onSelect: (item: NavItemKey) => void;
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeItem,
  onSelect,
  isOpen,
  onCloseMobile,
}) => {
  const navSections = [
    {
      title: 'Core Studio',
      items: [
        { key: 'dashboard' as NavItemKey, label: 'Dashboard', icon: LayoutDashboard },
        { key: 'create' as NavItemKey, label: 'Universal Create', icon: Sparkles, highlight: true },
        { key: 'shorts' as NavItemKey, label: 'AI Shorts', icon: Zap, badge: 'Popular' },
        { key: 'long_video' as NavItemKey, label: 'Long Video', icon: Film },
      ],
    },
    {
      title: 'Generative Video & Media',
      items: [
        { key: 'text_to_video' as NavItemKey, label: 'Text to Video', icon: Video },
        { key: 'image_to_video' as NavItemKey, label: 'Image to Video', icon: ImageIcon },
        { key: 'ai_image' as NavItemKey, label: 'AI Image', icon: Palette },
        { key: 'thumbnail_generator' as NavItemKey, label: 'Thumbnail Generator', icon: ImagePlay },
      ],
    },
    {
      title: 'Scripting & Prompts',
      items: [
        { key: 'script_to_video' as NavItemKey, label: 'Script to Video', icon: FileText },
        { key: 'script_writer' as NavItemKey, label: 'Script Writer', icon: PenTool },
        { key: 'prompt_enhancer' as NavItemKey, label: 'Prompt Enhancer', icon: Wand2 },
      ],
    },
    {
      title: 'Audio & Captions',
      items: [
        { key: 'ai_voice' as NavItemKey, label: 'AI Voice', icon: Mic2 },
        { key: 'ai_captions' as NavItemKey, label: 'AI Captions', icon: Subtitles },
      ],
    },
    {
      title: 'Assets & Workspace',
      items: [
        { key: 'projects' as NavItemKey, label: 'Projects', icon: FolderKanban },
        { key: 'media_library' as NavItemKey, label: 'Media Library', icon: Library },
        { key: 'templates' as NavItemKey, label: 'Templates', icon: Layers },
        { key: 'pricing' as NavItemKey, label: '👑 Premium Plans', icon: CreditCard, badge: 'Upgrade' },
        { key: 'admin' as NavItemKey, label: 'Admin Console', icon: ShieldCheck, badge: 'Admin' },
        { key: 'settings' as NavItemKey, label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0a0a0f] border-r border-white/[0.08] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/[0.08]">
          <div
            onClick={() => onSelect('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 via-rose-500 to-amber-400 p-0.5 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0a0a0f] rounded-[10px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-400 fill-orange-500/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base tracking-tight text-white">fire<span className="text-orange-400">ai</span>tool</span>
              </div>
              <p className="text-[10px] text-zinc-500">AI Video & Content Studio</p>
            </div>
          </div>
        </div>

        {/* Navigation Links (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      onSelect(item.key);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500/15 to-transparent text-white font-semibold border-l-2 border-orange-500 pl-2.5'
                        : item.highlight
                        ? 'text-orange-400 hover:text-white hover:bg-orange-500/10'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-orange-400'
                            : item.highlight
                            ? 'text-orange-400'
                            : 'text-zinc-400 group-hover:text-zinc-200'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Fast Action */}
        <div className="p-3 border-t border-white/[0.08] bg-[#0d0d14]/70">
          <button
            onClick={() => {
              onSelect('create');
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold text-xs shadow-lg shadow-orange-500/25 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>+ Create Video</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>
      </aside>
    </>
  );
};
