import React from 'react';
import {
  Sparkles,
  Zap,
  Film,
  Video,
  ImageIcon,
  FileText,
  Clock,
  Play,
  MoreVertical,
  ArrowRight,
  TrendingUp,
  Layers,
  Coins,
  CheckCircle2,
} from 'lucide-react';
import type { Project, VideoTemplate, UserProfile } from '../../types.js';
import type { NavItemKey } from '../layout/Sidebar.js';
import { Card } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';

interface DashboardViewProps {
  user?: UserProfile;
  projects?: Project[];
  templates?: VideoTemplate[];
  onNavigate: (item: NavItemKey) => void;
  onOpenProject: (project: Project) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects = [],
  templates = [],
  onNavigate,
  onOpenProject,
}) => {
  const quickAITools = [
    {
      key: 'shorts' as NavItemKey,
      title: 'AI Short',
      desc: 'Viral 9:16 YouTube Shorts & Reels with automated hook & scenes',
      icon: Zap,
      accent: 'from-orange-500 to-amber-500',
      tag: 'Most Popular',
    },
    {
      key: 'long_video' as NavItemKey,
      title: 'Long Video',
      desc: 'Chapter-structured 16:9 documentaries & explainers',
      icon: Film,
      accent: 'from-blue-500 to-indigo-500',
      tag: 'New',
    },
    {
      key: 'text_to_video' as NavItemKey,
      title: 'Text to Video',
      desc: 'Generate cinematic motion sequences directly from prompts',
      icon: Video,
      accent: 'from-purple-500 to-pink-500',
      tag: 'Generative',
    },
    {
      key: 'image_to_video' as NavItemKey,
      title: 'Image to Video',
      desc: 'Animate still images with dynamic camera orbits & zooms',
      icon: ImageIcon,
      accent: 'from-emerald-500 to-teal-500',
      tag: 'Motion',
    },
    {
      key: 'ai_image' as NavItemKey,
      title: 'AI Image',
      desc: 'Ultra-photorealistic 4K visual assets & backgrounds',
      icon: Sparkles,
      accent: 'from-rose-500 to-orange-500',
      tag: 'Visuals',
    },
    {
      key: 'script_to_video' as NavItemKey,
      title: 'Script to Video',
      desc: 'Paste a script and auto-split into timed scenes',
      icon: FileText,
      accent: 'from-cyan-500 to-blue-500',
      tag: 'Instant',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#181824] via-[#151520] to-[#12121a] border border-white/10 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Autonomous Video Creation</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Create something amazing with AI.
            </h1>
            <p className="text-sm sm:text-base text-zinc-400">
              Transform ideas into viral YouTube Shorts, TikToks, and long-form videos with automated scripts,
              photorealistic visuals, studio voiceovers, and timeline editing.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => onNavigate('create')}
              icon={<Sparkles className="w-5 h-5" />}
              className="shadow-xl shadow-orange-500/20"
            >
              + Create New Video
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => onNavigate('templates')}
              icon={<Layers className="w-5 h-5" />}
            >
              Browse Templates
            </Button>
          </div>
        </div>
      </div>

      {/* Quick AI Tools Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Quick AI Tools</h2>
            <p className="text-xs text-zinc-400">Launch specialized AI creation pipelines instantly</p>
          </div>
          <button
            onClick={() => onNavigate('create')}
            className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>Universal Prompt View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickAITools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.key}
                hoverable
                onClick={() => onNavigate(tool.key)}
                className="p-5 cursor-pointer group relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${tool.accent} p-0.5 shadow-lg`}>
                    <div className="w-full h-full bg-[#13131c] rounded-[10px] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  <Badge variant="zinc">{tool.tag}</Badge>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {tool.desc}
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Recent Projects</h2>
            <p className="text-xs text-zinc-400">Continue editing your timeline or export finished videos</p>
          </div>
          <button
            onClick={() => onNavigate('projects')}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>View all ({(projects || []).length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(projects || []).slice(0, 3).map((project) => (
            <Card
              key={project.id}
              hoverable
              className="overflow-hidden group flex flex-col justify-between"
            >
              {/* Project Preview Header */}
              <div className="relative aspect-[16/9] w-full bg-black/50 overflow-hidden">
                <img
                  src={project.thumbnailUrl}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <Badge variant="orange">{project.platform}</Badge>
                  <Badge variant="zinc">{project.aspectRatio}</Badge>
                </div>
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-mono font-semibold text-white">
                  {project.duration}s
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                    {project.title}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {project.description || 'Custom autonomous video generated with FireAITool.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-zinc-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onOpenProject(project)}
                    icon={<Play className="w-3.5 h-3.5 text-orange-400" />}
                  >
                    Open Editor
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Featured Templates Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Viral Video Templates</h2>
            <p className="text-xs text-zinc-400">Pre-tuned prompts, pacing, and visual styles ready in 1 click</p>
          </div>
          <button
            onClick={() => onNavigate('templates')}
            className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>Explore All Templates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(templates || []).slice(0, 3).map((tpl) => (
            <Card
              key={tpl.id}
              hoverable
              className="overflow-hidden group"
            >
              <div className="relative aspect-video bg-black/40 overflow-hidden">
                <img
                  src={tpl.thumbnailUrl}
                  alt={tpl.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14141d] via-transparent to-transparent" />
                <div className="absolute top-2.5 left-2.5">
                  <Badge variant="cyan">{tpl.category}</Badge>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                  {tpl.title}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2">{tpl.description}</p>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 font-mono">{tpl.duration}s • {tpl.scenesCount} scenes</span>
                  <button
                    onClick={() => onNavigate('shorts')}
                    className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    Use Template →
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
