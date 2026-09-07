import React from 'react';
import { Zap, AlertTriangle, ArrowRight, X, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button.js';

interface InsufficientPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredPoints: number;
  balance: number;
  onUpgrade: () => void;
}

export const InsufficientPointsModal: React.FC<InsufficientPointsModalProps> = ({
  isOpen,
  onClose,
  requiredPoints,
  balance,
  onUpgrade,
}) => {
  if (!isOpen) return null;

  const deficit = Math.max(0, requiredPoints - balance);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#12121a] border border-orange-500/30 p-6 shadow-2xl shadow-orange-500/10 text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br from-orange-500/20 to-pink-500/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Zap className="w-6 h-6 fill-amber-400/20 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              <span>⚡ Not Enough Points</span>
            </h3>
            <p className="text-xs text-zinc-400">Generation cannot start without sufficient points balance</p>
          </div>
        </div>

        {/* Cost & Balance Cards */}
        <div className="my-5 p-4 rounded-xl bg-[#181824] border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">This video requires:</span>
            <span className="font-bold text-orange-400 text-sm">
              {requiredPoints.toLocaleString()} Points
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Your balance:</span>
            <span className="font-semibold text-zinc-200">
              {balance.toLocaleString()} Points
            </span>
          </div>

          <div className="h-px bg-white/10" />

          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-rose-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Points needed:
            </span>
            <span className="text-rose-400 font-bold">
              +{deficit.toLocaleString()} Points
            </span>
          </div>
        </div>

        {/* Explanatory notice */}
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          Free accounts receive <strong className="text-zinc-200">1,000 points daily</strong> (resets at 12:00 AM IST).
          Upgrade to Premium for <strong className="text-zinc-200">10,000 points/day</strong> or <strong className="text-amber-300 font-bold">Unlimited video generation</strong>!
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onClose();
              onUpgrade();
            }}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:brightness-110 shadow-lg shadow-orange-500/25 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <span>View Premium Plans</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
