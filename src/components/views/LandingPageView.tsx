import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Play,
  ArrowRight,
  CheckCircle2,
  Film,
  Video,
  ImageIcon,
  Mic2,
  Subtitles,
  Star,
  ChevronDown,
  Layers,
  Flame,
  ShieldCheck,
  Award,
} from 'lucide-react';
import type { NavItemKey } from '../layout/Sidebar.js';
import { Button } from '../ui/Button.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';

interface LandingPageViewProps {
  onStartCreating: () => void;
  onNavigate: (item: NavItemKey) => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onStartCreating,
  onNavigate,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const features = [
    {
      title: 'AI Shorts & Reels Creator',
      desc: 'Generate viral 9:16 videos with hooks, scene visual prompts, neural narration, and timestamps automatically.',
      icon: Zap,
    },
    {
      title: 'Long Video Planner (16:9)',
      desc: 'Autonomous chapter breakdown, deep narrative research, and timed multi-scene documentary timelines.',
      icon: Film,
    },
    {
      title: 'Text to Video Diffusion',
      desc: 'Synthesize fluid 60fps cinematic motion sequences directly from natural language prompts.',
      icon: Video,
    },
    {
      title: 'Image to Video Animation',
      desc: 'Animate portraits, 3D renders, and historical photographs with realistic camera zooms and orbits.',
      icon: ImageIcon,
    },
    {
      title: 'Neural AI Voice Studio',
      desc: 'Studio-grade voiceovers with emotional modulation, dramatic pauses, and multilingual synthesis.',
      icon: Mic2,
    },
    {
      title: 'Kinetic Word-by-Word Captions',
      desc: 'Alex Hormozi & TikTok viral subtitle presets with live color pop and karaoke highlighting.',
      icon: Subtitles,
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Enter Idea or Prompt',
      desc: 'Type a simple topic or paste a full article. Our Gemini 3.8 prompt enhancer automatically structures cinematic parameters.',
    },
    {
      number: '02',
      title: 'AI Generates Complete Video',
      desc: 'Autonomous multi-track synthesis: viral script hooks, photorealistic 4K visual frames, neural voiceover, and captions.',
    },
    {
      number: '03',
      title: 'Edit in Timeline & Export in 4K',
      desc: 'Trim, split, or direct changes with our in-editor Gemini assistant. Download watermark-free MP4 files ready to monetize.',
    },
  ];

  const faqs = [
    {
      q: 'Can I monetize videos created with FireAITool on YouTube and TikTok?',
      a: 'Yes, absolutely! On Creator and Pro plans, you receive 100% commercial ownership with royalty-free licensing for YouTube Partner Program, TikTok Creator Rewards, and brand sponsorships.',
    },
    {
      q: 'How does the in-editor Gemini AI Director work?',
      a: 'Inside the timeline video editor, you have an interactive conversational assistant. You can type instructions like "Make scene 2 more dramatic" or "Shorten the intro", and Gemini will autonomously modify scenes and prompts.',
    },
    {
      q: 'Do I need my own API keys to get started?',
      a: 'No, our SaaS comes fully pre-configured out-of-the-box. We also allow power creators to connect their custom Gemini or cloud video endpoints in Settings if desired.',
    },
    {
      q: 'What resolution are the exported videos?',
      a: 'Free plan exports in 720p HD, Creator plan exports in 1080p FHD 60fps, and Pro tier supports up to 4K Ultra-HD cinema resolution.',
    },
  ];

  return (
    <div className="space-y-24 pb-16 max-w-7xl mx-auto">
      {/* 1. Hero Section */}
      <section className="text-center space-y-6 pt-6 sm:pt-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-orange-500/15 via-rose-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs sm:text-sm font-semibold animate-in fade-in">
          <Sparkles className="w-4 h-4" />
          <span>Next-Generation Autonomous Video Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Create Viral AI Videos{' '}
          <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-amber-300 bg-clip-text text-transparent">
            in Seconds.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Generate YouTube Shorts, Reels, TikToks, and full documentary videos with automated scripts,
          photorealistic visuals, neural voices, and browser-based timeline editing.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Button
            size="lg"
            onClick={onStartCreating}
            icon={<Sparkles className="w-5 h-5" />}
            className="px-8 py-3.5 text-base shadow-2xl shadow-orange-500/30"
          >
            Start Creating Free
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => onNavigate('templates')}
            icon={<Layers className="w-5 h-5" />}
            className="px-6 py-3.5 text-base"
          >
            Explore Templates
          </Button>
        </div>

        {/* Hero Video Preview Mockup */}
        <div className="relative pt-8 max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-[#12121c] shadow-2xl p-2 sm:p-4 group">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1400&auto=format&fit=crop&q=80"
                alt="Demo"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={onStartCreating}
                  className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-rose-500 text-white flex items-center justify-center shadow-2xl shadow-orange-500/50 hover:scale-110 active:scale-95 transition-all group-hover:brightness-110"
                >
                  <Play className="w-7 h-7 fill-current ml-1" />
                </button>
              </div>

              {/* Mock Timeline Overlay */}
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-white">4K Multi-Track Autonomous Pipeline</span>
                </div>
                <span className="font-mono text-orange-400">00:30 • 60 FPS • 9:16 Vertical</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. How It Works Section */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <Badge variant="orange">Streamlined Workflow</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            From Idea to Viral Video in 3 Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <Card key={step.number} className="p-6 space-y-3 relative overflow-hidden">
              <span className="text-4xl font-black text-orange-500/20 font-mono block">
                {step.number}
              </span>
              <h3 className="text-lg font-bold text-white">{step.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{step.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Features Grid */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <Badge variant="cyan">Studio Capabilities</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Complete Suite for Modern Creators
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            Everything you need to run high-growth YouTube, TikTok, and Instagram accounts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <Card key={idx} hoverable className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">{f.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{f.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 4. Creator Testimonials */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <Badge variant="emerald">Creator Reviews</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Trusted by 45,000+ Video Creators
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: 'ShortsAI cut our faceless channel production time from 4 hours per video down to 6 minutes. We grew to 280k subscribers in 90 days.',
              author: 'Alex Vance',
              channel: '@DailyStoicMind (280k subs)',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            },
            {
              quote: 'The in-editor Gemini AI assistant is a gamechanger. I just tell it to change pacing or hook intensity, and the scenes instantly adjust.',
              author: 'Marcus Brody',
              channel: 'Shorts Media Agency',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            },
            {
              quote: 'The kinetic animated captions and voice synthesis sound shockingly human. Retention on our TikTok shorts increased by 44%.',
              author: 'Elena Rostova',
              channel: 'TechVibe Daily (1.2M TikTok)',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            },
          ].map((t, idx) => (
            <Card key={idx} className="p-6 space-y-4">
              <div className="flex text-amber-400 gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 italic leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                <img src={t.avatar} alt={t.author} className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <h4 className="text-xs font-bold text-white">{t.author}</h4>
                  <p className="text-[11px] text-zinc-500">{t.channel}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section className="space-y-8 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <Badge variant="purple">Got Questions?</Badge>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <Card
                key={idx}
                className="overflow-hidden cursor-pointer"
                onClick={() => setOpenFaq(isOpen ? null : idx)}
              >
                <div className="p-4 flex items-center justify-between text-sm font-semibold text-white">
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </div>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* 6. Call To Action Footer Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-rose-600 to-amber-500 p-8 sm:p-14 text-center space-y-4 text-white shadow-2xl">
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
          Ready to automate your video channel?
        </h2>
        <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto">
          Join 45,000+ creators producing viral YouTube Shorts, Reels, and TikToks with FireAITool.
        </p>
        <div className="pt-2">
          <button
            onClick={onStartCreating}
            className="px-8 py-3.5 rounded-xl bg-black text-white font-bold text-sm hover:bg-zinc-900 transition-all shadow-2xl active:scale-95"
          >
            Launch Studio Workspace Now →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-12 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="font-bold text-zinc-300">FireAITool</span>
          <span>© 2026 Autonomous Generative Video SaaS.</span>
        </div>
        <div className="flex gap-4">
          <span className="hover:text-zinc-300 cursor-pointer">Terms of Service</span>
          <span className="hover:text-zinc-300 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-zinc-300 cursor-pointer">API Docs</span>
        </div>
      </footer>
    </div>
  );
};
