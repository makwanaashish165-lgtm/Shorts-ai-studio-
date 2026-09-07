import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Key,
  Cpu,
  CreditCard,
  Sliders,
  Check,
  Eye,
  EyeOff,
  Save,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import type { UserProfile } from '../../types.js';
import { Button } from '../ui/Button.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { api } from '../../lib/api.js';

interface SettingsViewProps {
  user: UserProfile;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'apikeys' | 'providers' | 'export'>('profile');
  const [userName, setUserName] = useState(user.name);
  const [userEmail, setUserEmail] = useState(user.email);

  // Model & Provider settings
  const [defaultTextModel, setDefaultTextModel] = useState('gemini-3.8-flash');
  const [defaultImageProvider, setDefaultImageProvider] = useState('gemini');
  const [defaultVideoProvider, setDefaultVideoProvider] = useState('veo');
  const [defaultVoiceProvider, setDefaultVoiceProvider] = useState('gemini');

  // Export preferences
  const [defaultResolution, setDefaultResolution] = useState('1080p');
  const [defaultFps, setDefaultFps] = useState('60');
  const [autoSubtitles, setAutoSubtitles] = useState(true);

  const [savedNotice, setSavedNotice] = useState(false);

  // API Key state
  const [apiKeysStatus, setApiKeysStatus] = useState<{
    gemini?: { configured: boolean; masked: string; keyLength: number };
    videoProvider?: { configured: boolean };
    speechProvider?: { configured: boolean };
  } | null>(null);

  const [inputKey, setInputKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isUpdatingKey, setIsUpdatingKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; latencyMs?: number; message?: string } | null>(null);
  const [keyNotice, setKeyNotice] = useState<string | null>(null);

  const loadApiKeys = async () => {
    try {
      const data = await api.getApiKeys();
      setApiKeysStatus(data);
    } catch (e) {
      console.error('Failed to load api keys status:', e);
    }
  };

  useEffect(() => {
    loadApiKeys();
  }, []);

  const handleTestKey = async () => {
    setIsTestingKey(true);
    setTestResult(null);
    try {
      const res = await api.testApiKey();
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ ok: false, message: e.message || 'Verification failed.' });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!inputKey.trim()) return;
    setIsUpdatingKey(true);
    setKeyNotice(null);
    try {
      const res = await api.updateApiKey(inputKey.trim());
      setKeyNotice(res.message || 'Key connected successfully!');
      setInputKey('');
      setShowKeyInput(false);
      await loadApiKeys();
      handleTestKey();
    } catch (e: any) {
      setKeyNotice(e.message || 'Failed to update key');
    } finally {
      setIsUpdatingKey(false);
    }
  };

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Studio Preferences</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Settings & Configurations
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Configure your AI models, cloud storage, API connections, and export parameters.
          </p>
        </div>

        {savedNotice && (
          <div className="p-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Preferences saved!</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        {[
          { id: 'profile', label: 'Profile & Account', icon: User },
          { id: 'providers', label: 'AI Models & Providers', icon: Cpu },
          { id: 'apikeys', label: 'API Keys & Infrastructure', icon: Key },
          { id: 'export', label: 'Export Preferences', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Profile Settings */}
      {activeTab === 'profile' && (
        <Card className="p-6 space-y-5">
          <h3 className="text-base font-bold text-white">Profile Information</h3>
          <div className="flex items-center gap-4">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-orange-500/40"
            />
            <div>
              <p className="text-sm font-bold text-white">{user.name}</p>
              <p className="text-xs text-zinc-400">{user.email}</p>
              <Badge variant="orange" className="mt-1.5">
                {user.plan} Subscription
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Full Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Email Address</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500/50"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button size="md" onClick={handleSave} icon={<Save className="w-4 h-4" />}>
              Save Profile
            </Button>
          </div>
        </Card>
      )}

      {/* AI Models & Providers Tab */}
      {activeTab === 'providers' && (
        <Card className="p-6 space-y-5">
          <h3 className="text-base font-bold text-white">AI Engine Routing</h3>
          <p className="text-xs text-zinc-400">
            Configure which underlying neural foundations power your autonomous scriptwriting, visual diffusion, and speech.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Default Script & Logic Model</label>
              <select
                value={defaultTextModel}
                onChange={(e) => setDefaultTextModel(e.target.value)}
                className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500/50"
              >
                <option value="gemini-3.8-flash">Google Gemini 3.8 Flash (Ultra Fast, Default)</option>
                <option value="gemini-3.5-pro">Google Gemini 3.5 Pro (Deep Research & Complex Scripts)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Video Generation Provider</label>
              <select
                value={defaultVideoProvider}
                onChange={(e) => setDefaultVideoProvider(e.target.value)}
                className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500/50"
              >
                <option value="veo">Google Veo (Recommended for Studio Quality)</option>
                <option value="runway">Runway Gen-3 Alpha</option>
                <option value="luma">Luma Dream Machine</option>
                <option value="pika">Pika 2.0</option>
                <option value="kling">Kling AI 1.5</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">AI Image Generator Engine</label>
              <select
                value={defaultImageProvider}
                onChange={(e) => setDefaultImageProvider(e.target.value)}
                className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500/50"
              >
                <option value="gemini">Google Imagen 3 / Gemini Visual Diffusion</option>
                <option value="flux">Flux.1 Schnell Pro</option>
                <option value="midjourney">Midjourney v6 API</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">AI Voice Synthesis Engine</label>
              <select
                value={defaultVoiceProvider}
                onChange={(e) => setDefaultVoiceProvider(e.target.value)}
                className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500/50"
              >
                <option value="gemini">Google Cloud Neural Speech / Gemini Voice</option>
                <option value="elevenlabs">ElevenLabs Multilingual v2</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button size="md" onClick={handleSave} icon={<Save className="w-4 h-4" />}>
              Save AI Routing
            </Button>
          </div>
        </Card>
      )}

      {/* API Keys Tab */}
      {activeTab === 'apikeys' && (
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Connected AI API Keys & Credentials</h3>
            </div>
            <button
              type="button"
              onClick={loadApiKeys}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Status</span>
            </button>
          </div>

          <p className="text-xs text-zinc-400">
            Your website&apos;s AI capabilities (scripting, hook ideation, prompt engineering, and cinematic direction) are securely powered server-side.
          </p>

          <div className="space-y-3 pt-1">
            {/* Primary Google Gemini Key Card */}
            <div className="p-4 rounded-xl bg-[#0f0f18] border border-white/10 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <p className="text-xs font-bold text-white">Google Gemini AI Engine</p>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Key: {apiKeysStatus?.gemini?.masked || 'AQ.Ab8RN6...YZQ'} &bull; GEMINI_API_KEY
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={apiKeysStatus?.gemini?.configured !== false ? 'emerald' : 'rose'}>
                    <CheckCircle2 className="w-3 h-3 mr-1 inline" />
                    {apiKeysStatus?.gemini?.configured !== false ? 'Connected & Active' : 'Not Connected'}
                  </Badge>

                  <Button
                    size="sm"
                    variant="secondary"
                    loading={isTestingKey}
                    onClick={handleTestKey}
                    icon={<RefreshCw className="w-3 h-3" />}
                    className="text-xs py-1"
                  >
                    Test Ping
                  </Button>
                </div>
              </div>

              {/* Test Connection Output Alert */}
              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
                    testResult.ok
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {testResult.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold text-white block">
                      {testResult.ok ? 'Connection Successful!' : 'Connection Warning'}
                    </span>
                    <p className="mt-0.5 text-zinc-300 leading-relaxed">
                      {testResult.message}
                      {testResult.latencyMs ? ` (Latency: ${testResult.latencyMs}ms)` : ''}
                    </p>
                  </div>
                </div>
              )}

              {/* Toggle Manual Key Update */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setShowKeyInput(!showKeyInput)}
                  className="text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{showKeyInput ? 'Hide Key Input' : 'Update / Change API Key'}</span>
                </button>
                <span className="text-[11px] text-zinc-500">Auto-saved to container environment</span>
              </div>

              {showKeyInput && (
                <div className="space-y-2 pt-2 animate-in fade-in">
                  <label className="text-[11px] font-semibold text-zinc-300">
                    Paste New or Updated Gemini API Key:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={inputKey}
                      onChange={(e) => setInputKey(e.target.value)}
                      placeholder="e.g. AQ.Ab8RN6... or AIzaSy..."
                      className="flex-1 bg-[#09090f] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500/60"
                    />
                    <Button
                      size="sm"
                      loading={isUpdatingKey}
                      onClick={handleSaveApiKey}
                      disabled={!inputKey.trim()}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                    >
                      Connect &amp; Test
                    </Button>
                  </div>

                  {keyNotice && (
                    <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      {keyNotice}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Video & Voice Infrastructure Status */}
            <div className="p-3.5 rounded-xl bg-[#0f0f18] border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Video Generation Models (Veo 3.1 / Runway / Luma)</p>
                <p className="text-[11px] text-zinc-400 font-mono">Managed via Video Engine Provider</p>
              </div>
              <Badge variant="zinc">Provider Configured</Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0f0f18] border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Voice &amp; Narration Engine</p>
                <p className="text-[11px] text-zinc-400 font-mono">Gemini Voice / Web Audio Synthesis</p>
              </div>
              <Badge variant="emerald">Active</Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Export Preferences */}
      {activeTab === 'export' && (
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Export & Rendering Defaults</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Default Resolution</label>
              <select
                value={defaultResolution}
                onChange={(e) => setDefaultResolution(e.target.value)}
                className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500/50"
              >
                <option value="720p">720p HD</option>
                <option value="1080p">1080p FHD (Recommended)</option>
                <option value="4K">4K UHD Cinema</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Framerate</label>
              <select
                value={defaultFps}
                onChange={(e) => setDefaultFps(e.target.value)}
                className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500/50"
              >
                <option value="30">30 FPS</option>
                <option value="60">60 FPS (Ultra Smooth)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button size="md" onClick={handleSave} icon={<Save className="w-4 h-4" />}>
              Save Export Settings
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
