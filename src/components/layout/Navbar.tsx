import React, { useState } from 'react';
import {
  Menu,
  Search,
  Coins,
  Bell,
  User as UserIcon,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import type { UserProfile } from '../../types.js';
import type { NavItemKey } from './Sidebar.js';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenSidebar?: () => void;
  user: UserProfile;
  activeItem?: NavItemKey;
  onNavigate: (item: NavItemKey) => void;
  onOpenPremium?: () => void;
  isLandingMode?: boolean;
  onToggleLandingMode?: () => void;
  onSearchQuery?: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenSidebar,
  user,
  activeItem = 'dashboard',
  onNavigate,
  onOpenPremium,
  isLandingMode = false,
  onToggleLandingMode,
  onSearchQuery,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggleSidebar = () => {
    if (onToggleSidebar) onToggleSidebar();
    else if (onOpenSidebar) onOpenSidebar();
  };

  const notifications = [
    { id: 1, title: 'Render Complete', desc: 'The 1% Morning Routine is ready for export.', time: '5m ago', unread: true },
    { id: 2, title: 'AI Credits Restocked', desc: 'Your 1,250 monthly credits have renewed.', time: '1h ago', unread: false },
    { id: 3, title: 'New Template Added', desc: 'Viral Luxury Motivation template is live.', time: '2h ago', unread: false },
  ];

  const displayTitle = (activeItem || 'dashboard').toString().replace(/[-_]/g, ' ');

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggleSidebar}
          className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-extrabold text-orange-400">FIRE AI TOOL</span>
          <span className="text-zinc-600">/</span>
          <span className="text-sm font-semibold text-zinc-200 capitalize">
            {displayTitle}
          </span>
        </div>
      </div>

      {/* Middle: Universal Search Bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search projects, prompts, audio, templates..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (onSearchQuery) onSearchQuery(e.target.value);
            }}
            className="w-full bg-[#14141d] border border-white/10 rounded-xl pl-10 pr-4 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Landing Page Switcher */}
        <button
          onClick={() => onToggleLandingMode?.()}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
            isLandingMode
              ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
              : 'bg-white/[0.04] text-zinc-300 border-white/10 hover:bg-white/[0.08] hover:text-white'
          }`}
        >
          <span>{isLandingMode ? 'Return to Studio' : 'View Landing Page'}</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </button>

        {/* AI Points Balance Badge */}
        <button
          onClick={() => (onOpenPremium ? onOpenPremium() : onNavigate('pricing'))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-pink-500/10 border border-orange-500/25 hover:border-orange-500/50 text-amber-300 hover:text-amber-200 transition-all text-xs font-bold group shadow-sm shadow-orange-500/10"
          title="Daily Points Balance (Resets 12:00 AM IST) — Click to Upgrade"
        >
          <span className="text-amber-400 font-black">⚡</span>
          <span>{user.isUnlimited ? '∞ Unlimited' : `${(user.credits ?? 1000).toLocaleString()} Points`}</span>
        </button>

        {/* 👑 Premium Button */}
        <button
          onClick={() => (onOpenPremium ? onOpenPremium() : onNavigate('pricing'))}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-400 hover:via-orange-400 hover:to-pink-400 text-white font-bold text-xs shadow-md shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all"
          title="View Premium Plans"
        >
          <span>👑</span>
          <span>Premium</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#14141d] border border-white/10 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 px-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                <span className="text-[10px] text-orange-400 font-semibold cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="space-y-1.5 mt-2 max-h-64 overflow-y-auto custom-scrollbar">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer text-xs"
                  >
                    <div className="flex items-center justify-between font-medium text-white">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-zinc-500">{n.time}</span>
                    </div>
                    <p className="text-zinc-400 text-[11px] mt-0.5">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all text-xs text-zinc-200"
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-6 h-6 rounded-lg object-cover ring-1 ring-orange-500/50"
            />
            <span className="font-semibold text-xs hidden lg:inline max-w-[90px] truncate">{user.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#14141d] border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-white/10 mb-1">
                <p className="text-xs font-bold text-white">{user.name}</p>
                <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                <div className="mt-1.5 inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  {user.plan} Plan
                </div>
              </div>

              <button
                onClick={() => {
                  onNavigate('settings');
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Account Settings
              </button>
              <button
                onClick={() => {
                  onNavigate('pricing');
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Upgrade & Billing
              </button>
              <div className="border-t border-white/10 my-1" />
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  alert('You are securely logged into FIRE AI TOOL.');
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
