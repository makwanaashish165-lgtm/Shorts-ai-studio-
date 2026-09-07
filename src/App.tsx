import React, { useState, useEffect } from 'react';
import type { NavItemKey } from './components/layout/Sidebar.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { Navbar } from './components/layout/Navbar.js';
import { LandingPageView } from './components/views/LandingPageView.js';
import { DashboardView } from './components/views/DashboardView.js';
import { CreateWorkspaceView } from './components/views/CreateWorkspaceView.js';
import { ShortsGeneratorView } from './components/views/ShortsGeneratorView.js';
import { LongVideoGeneratorView } from './components/views/LongVideoGeneratorView.js';
import { TextToVideoView } from './components/views/TextToVideoView.js';
import { ImageToVideoView } from './components/views/ImageToVideoView.js';
import { ImageGeneratorView } from './components/views/ImageGeneratorView.js';
import { ScriptToVideoView } from './components/views/ScriptToVideoView.js';
import { ScriptWriterView } from './components/views/ScriptWriterView.js';
import { PromptEnhancerView } from './components/views/PromptEnhancerView.js';
import { VoiceStudioView } from './components/views/VoiceStudioView.js';
import { CaptionsStudioView } from './components/views/CaptionsStudioView.js';
import { ThumbnailGeneratorView } from './components/views/ThumbnailGeneratorView.js';
import { VideoEditorView } from './components/views/VideoEditorView.js';
import { ProjectsView } from './components/views/ProjectsView.js';
import { MediaLibraryView } from './components/views/MediaLibraryView.js';
import { TemplatesView } from './components/views/TemplatesView.js';
import { PricingView } from './components/views/PricingView.js';
import { SettingsView } from './components/views/SettingsView.js';
import { AdminView } from './components/views/AdminView.js';
import { PremiumModal } from './components/modals/PremiumModal.js';
import { api } from './lib/api.js';
import type { Project, MediaItem, VideoTemplate, UserProfile } from './types.js';

export default function App() {
  const [activeNav, setActiveNav] = useState<NavItemKey>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');

  // Core Data State
  const [user, setUser] = useState<UserProfile>({
    id: 'usr_demo',
    email: 'creator@fireaitool.com',
    name: 'Alex Rivera',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    plan: 'Pro',
    credits: 2000,
    maxCredits: 2000,
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [templates, setTemplates] = useState<VideoTemplate[]>([]);

  // Fetch initial data
  const loadData = async () => {
    try {
      const [userRes, projRes, mediaRes, tplRes] = await Promise.all([
        api.getMe(),
        api.getProjects(),
        api.getMedia(),
        api.getTemplates(),
      ]);

      if (userRes.user) setUser(userRes.user);
      if (projRes.projects) setProjects(projRes.projects);
      if (mediaRes.media) setMedia(mediaRes.media);
      if (tplRes.templates) setTemplates(tplRes.templates);
    } catch (e) {
      console.warn('Initial data load completed with local fallbacks', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleOpenProjectInEditor = (project: Project) => {
    setEditingProject(project);
  };

  const handleUpdateProject = async (updated: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditingProject(updated);
    try {
      await api.updateProject(updated.id, updated);
    } catch (err) {
      console.error('Failed to sync project update', err);
    }
  };

  const handleSelectTemplate = (template: VideoTemplate) => {
    // Navigate to shorts or long-video generator
    if (template.aspectRatio === '9:16') {
      setActiveNav('shorts');
    } else {
      setActiveNav('long-video');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b12] text-zinc-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* If user is actively inside the Full-Screen Video Editor */}
      {editingProject ? (
        <div className="p-4 sm:p-8">
          <VideoEditorView
            project={editingProject}
            onBack={() => setEditingProject(null)}
            onUpdateProject={handleUpdateProject}
          />
        </div>
      ) : activeNav === 'landing' ? (
        /* Landing Page Mode with Top Brand Header */
        <div className="min-h-screen flex flex-col">
          <div className="h-16 border-b border-white/10 px-6 flex items-center justify-between bg-[#0e0e17]/80 backdrop-blur-md sticky top-0 z-50">
            <div
              onClick={() => setActiveNav('dashboard')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 via-rose-500 to-amber-400 flex items-center justify-center text-white font-black text-sm shadow-md shadow-orange-500/25">
                🔥
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                fire<span className="text-orange-400">ai</span>tool
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPremiumModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white font-bold text-xs shadow-md shadow-orange-500/25 hover:brightness-110 active:scale-95 transition-all"
              >
                <span>👑</span>
                <span>Premium</span>
              </button>
              <button
                onClick={() => setActiveNav('pricing')}
                className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => setActiveNav('templates')}
                className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Templates
              </button>
              <button
                onClick={() => setActiveNav('dashboard')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-xs shadow-lg shadow-orange-500/25 hover:brightness-110 active:scale-95 transition-all"
              >
                Open Studio App →
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 sm:p-12">
            <LandingPageView
              onStartCreating={() => setActiveNav('dashboard')}
              onNavigate={(item) => setActiveNav(item)}
            />
          </div>
        </div>
      ) : (
        /* Studio App Shell (Sidebar + Navbar + Main Content) */
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <Sidebar
            activeItem={activeNav}
            onSelect={(key) => {
              setActiveNav(key);
              setIsSidebarOpen(false);
            }}
            credits={user.credits}
            maxCredits={user.maxCredits}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          {/* Main Application Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Navbar
              user={user}
              activeItem={activeNav}
              onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
              onOpenSidebar={() => setIsSidebarOpen(true)}
              onNavigate={(item) => setActiveNav(item)}
              onOpenPremium={() => setIsPremiumModalOpen(true)}
              isLandingMode={activeNav === 'landing'}
              onToggleLandingMode={() => setActiveNav(activeNav === 'landing' ? 'dashboard' : 'landing')}
            />

            {/* Dynamic View Content Scroll Container */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
              {activeNav === 'dashboard' && (
                <DashboardView
                  user={user}
                  projects={projects}
                  templates={templates}
                  onNavigate={(item) => setActiveNav(item)}
                  onOpenProject={handleOpenProjectInEditor}
                />
              )}

              {activeNav === 'create' && (
                <CreateWorkspaceView
                  onNavigate={(item) => setActiveNav(item)}
                  onSelectPromptForShorts={(prompt) => {
                    setCustomPrompt(prompt);
                    setActiveNav('shorts');
                  }}
                  onProjectCreated={(newProj) => {
                    setProjects((prev) => [newProj, ...prev]);
                    handleOpenProjectInEditor(newProj);
                  }}
                />
              )}

              {activeNav === 'shorts' && (
                <ShortsGeneratorView
                  initialPrompt={customPrompt}
                  onOpenInEditor={handleOpenProjectInEditor}
                  onProjectCreated={(newProj) => {
                    setProjects((prev) => [newProj, ...prev]);
                    handleOpenProjectInEditor(newProj);
                  }}
                />
              )}

              {(activeNav === 'long_video' || activeNav === 'long-video') && (
                <LongVideoGeneratorView
                  onOpenInEditor={handleOpenProjectInEditor}
                  onProjectCreated={(newProj) => {
                    setProjects((prev) => [newProj, ...prev]);
                    handleOpenProjectInEditor(newProj);
                  }}
                />
              )}

              {(activeNav === 'text_to_video' || activeNav === 'text-to-video') && (
                <TextToVideoView
                  onVideoCreated={(mediaItem) => {
                    setMedia((prev) => [mediaItem, ...prev]);
                  }}
                />
              )}

              {(activeNav === 'image_to_video' || activeNav === 'image-to-video') && (
                <ImageToVideoView
                  onOpenInEditor={handleOpenProjectInEditor}
                  onProjectCreated={(newProj) => {
                    setProjects((prev) => [newProj, ...prev]);
                    handleOpenProjectInEditor(newProj);
                  }}
                  onVideoCreated={(mediaItem) => {
                    setMedia((prev) => [mediaItem, ...prev]);
                  }}
                />
              )}

              {(activeNav === 'ai_image' || activeNav === 'images') && (
                <ImageGeneratorView
                  onImageCreated={(mediaItem) => {
                    setMedia((prev) => [mediaItem, ...prev]);
                  }}
                />
              )}

              {(activeNav === 'script_to_video' || activeNav === 'script-to-video') && (
                <ScriptToVideoView
                  onOpenInEditor={handleOpenProjectInEditor}
                  onProjectCreated={(newProj) => {
                    setProjects((prev) => [newProj, ...prev]);
                    handleOpenProjectInEditor(newProj);
                  }}
                />
              )}

              {(activeNav === 'script_writer' || activeNav === 'script-writer') && <ScriptWriterView />}

              {(activeNav === 'prompt_enhancer' || activeNav === 'prompt-enhancer') && <PromptEnhancerView />}

              {(activeNav === 'ai_voice' || activeNav === 'voice-studio') && <VoiceStudioView />}

              {(activeNav === 'ai_captions' || activeNav === 'captions-studio') && <CaptionsStudioView />}

              {(activeNav === 'thumbnail_generator' || activeNav === 'thumbnails') && <ThumbnailGeneratorView />}

              {activeNav === 'projects' && (
                <ProjectsView
                  projects={projects}
                  onOpenProject={handleOpenProjectInEditor}
                  onNavigate={(item) => setActiveNav(item)}
                  onRefreshProjects={loadData}
                />
              )}

              {(activeNav === 'media_library' || activeNav === 'media') && (
                <MediaLibraryView
                  media={media}
                  onRefreshMedia={loadData}
                />
              )}

              {activeNav === 'templates' && (
                <TemplatesView
                  templates={templates}
                  onSelectTemplate={handleSelectTemplate}
                />
              )}

              {activeNav === 'pricing' && <PricingView />}

              {activeNav === 'admin' && <AdminView />}

              {activeNav === 'settings' && <SettingsView user={user} />}

              {activeNav === 'editor' && (
                <div className="text-center py-16 space-y-4">
                  <p className="text-sm text-zinc-400">Select a project to open in the full timeline editor.</p>
                  {projects.length > 0 ? (
                    <button
                      onClick={() => handleOpenProjectInEditor(projects[0])}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-medium text-sm transition-colors"
                    >
                      Open Recent Project: {projects[0].title}
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveNav('create')}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-medium text-sm transition-colors"
                    >
                      Create Your First Project
                    </button>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      )}

      {/* 👑 Premium Pricing Modal with Exact Plans */}
      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        onSuccessPlan={loadData}
      />
    </div>
  );
}
