import React, { useState } from 'react';
import {
  FolderKanban,
  Search,
  Plus,
  Play,
  Copy,
  Trash2,
  Clock,
  ExternalLink,
  Download,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { Project } from '../../types.js';
import type { NavItemKey } from '../layout/Sidebar.js';
import { Button } from '../ui/Button.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { api } from '../../lib/api.js';

interface ProjectsViewProps {
  projects?: Project[];
  onOpenProject: (project: Project) => void;
  onNavigate: (item: NavItemKey) => void;
  onRefreshProjects: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects = [],
  onOpenProject,
  onNavigate,
  onRefreshProjects,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = (projects || []).filter((p) =>
    (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.platform || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.duplicateProject(id);
      onRefreshProjects();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.deleteProject(id);
      onRefreshProjects();
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
            <FolderKanban className="w-4 h-4" />
            <span>Project Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Your Video Projects
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            All your AI Shorts, long-form documentaries, and custom timeline edits in one place.
          </p>
        </div>

        <Button
          size="md"
          onClick={() => onNavigate('create')}
          icon={<Plus className="w-4 h-4" />}
          className="shadow-lg shadow-orange-500/20"
        >
          New Project
        </Button>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search projects by title, platform, style..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#14141d] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500/50"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="p-12 text-center space-y-3 border-dashed border-white/10 bg-transparent">
          <FolderKanban className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No projects found</h3>
          <p className="text-xs text-zinc-500">Create your first video with the autonomous AI Shorts engine.</p>
          <Button size="sm" onClick={() => onNavigate('create')}>
            + Create Video
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              hoverable
              onClick={() => onOpenProject(project)}
              className="overflow-hidden group flex flex-col justify-between cursor-pointer"
            >
              {/* Thumbnail Header */}
              <div className="relative aspect-video w-full bg-black/60 overflow-hidden">
                <img
                  src={project.thumbnailUrl}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <Badge variant="orange">{project.platform}</Badge>
                  <Badge variant="zinc">{project.aspectRatio}</Badge>
                </div>
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-mono font-semibold text-white">
                  {project.duration}s
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {project.description || 'AI Video Project'}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleDuplicate(project.id, e)}
                      title="Duplicate project"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(project.id, e)}
                      title="Delete project"
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onOpenProject(project)}
                      icon={<Play className="w-3 h-3 text-orange-400" />}
                    >
                      Open
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
